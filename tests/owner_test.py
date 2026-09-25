"""Owner experience tests. External fonts/media and payments are intentionally offline.
Real DOM, CSS, keyboard events, dialogs and Web Animations are exercised in Chromium.
Location/session storage/clipboard are explicit adapters for the isolated test origin.
"""
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]; S=R/'storefront';Q=R/'qa';Q.mkdir(exist_ok=True)
passed=[]
def ok(name):passed.append(name);print('PASS',name,flush=True)
html=(S/'index.html').read_text()
html=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',html)
html=re.sub(r'<link[^>]*>','',html)
html=re.sub(r'<base[^>]*>','<base href="https://test.example/storefront/">',html)
html=html.replace('</head>','<style>'+(S/'site.css').read_text()+'\n'+(S/'experience.css').read_text()+'</style></head>')
scripts=['brand.js','config.js','media-overrides.js','owner-data.js','tebex.js','layout.js','site.js','commerce.js','experience.js']
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='no-preference');c.route('**/*',lambda r:r.abort())
 def mount(saved=None,hash='#/'):
  p=c.new_page();p.set_default_timeout(7000);err=[];p.on('pageerror',lambda e:err.append(str(e)));p.set_content(html,wait_until='domcontentloaded')
  p.evaluate('''o=>{window.MS_PREVIEW=true;window.__saved=o.saved;window.__storage={getItem:k=>__saved[k]||null,setItem:(k,v)=>{__saved[k]=v}};window.__hash=o.hash;window.__location={href:'https://test.example/storefront/'};Object.defineProperty(__location,'hash',{get:()=>__hash,set:v=>{__hash=v;queueMicrotask(()=>dispatchEvent(new Event('hashchange')))}});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{window.__copied=t;}}});}''',{'saved':saved or {},'hash':hash})
  for f in scripts:
   code=(S/f).read_text()
   if f in ['site.js','commerce.js','experience.js']:code='((location,sessionStorage)=>{'+code+'})(__location,__storage);'
   p.add_script_tag(content=code)
  p.wait_for_selector('.owner-toolbar' if hash=='#/' else '.owner-product-tools');return p,err
 p,errors=mount()
 assert p.evaluate("getComputedStyle(document.body).fontFamily.includes('DM Sans')")
 assert p.evaluate("getComputedStyle(document.querySelector('.hero h1')).fontFamily.includes('Barlow Condensed')")
 assert 'fonts.googleapis.com' in (S/'index.html').read_text() and 'display=swap' in (S/'index.html').read_text()
 ok('Custom font families wired with remote CSS and fallback stacks; no font binaries')
 p.locator('#server-framework').select_option('standalone');assert p.locator('.product-card').count()==2
 assert {'police','wrecker'}==set(p.locator('.product-card').evaluate_all('(els)=>els.map(e=>e.dataset.productCard)'))
 p.locator('#server-framework').select_option('qbox');assert p.locator('.product-card').count()==4
 assert 'Qbox' in p.locator('#owner-result-count').inner_text();ok('Framework filter shows only listing-declared matches')
 p.locator('[data-filter="fire"]').click();p.locator('#server-framework').select_option('standalone');assert p.locator('#empty-state').is_visible()
 p.locator('[data-reset-filters]').click();assert p.locator('.product-card').count()==4 and p.locator('#server-framework').input_value()=='all';ok('Framework/category intersections and reset filters')
 for slug in ['flight','police','fire']:p.locator(f'.product-card [data-compare="{slug}"]').click()
 assert p.locator('#compare-tray').is_visible();assert p.locator('[data-compare-count]').inner_text()=='3'
 p.locator('.product-card [data-compare="wrecker"]').click();assert p.locator('[data-compare-count]').inner_text()=='3'
 p.locator('[data-open-compare]').click();assert p.locator('.compare-table thead th').count()==4
 assert 'ox_inventory' in p.locator('.compare-table').inner_text();ok('Three-resource comparison cap and source-backed requirements table')
 p.set_viewport_size({'width':390,'height':844});assert not p.evaluate('document.documentElement.scrollWidth>innerWidth');p.screenshot(path=str(Q/'compare-mobile-v3-offline.png'))
 p.keyboard.press('Escape');p.locator('#compare-tray [data-clear-compare]').click();assert p.locator('#compare-tray').is_hidden();p.set_viewport_size({'width':1440,'height':1000});ok('Comparison scrolling contained on mobile and clear selection works')
 p.keyboard.press('Control+k');assert p.locator('#owner-search').is_visible();p.locator('#command-query').fill('aircraft');assert p.locator('#command-results a').count()==2
 p.keyboard.press('ArrowDown');assert p.evaluate("document.activeElement.matches('.command-result')")
 p.keyboard.press('Enter');p.wait_for_selector('.aircraft-empty');assert p.locator('#owner-search').is_hidden();ok('Control-K search, arrow navigation and full product routing')
 p.evaluate("__location.hash='#/product/flight'");p.wait_for_selector('#detail-framework');p.locator('#detail-framework').select_option('standalone')
 assert 'not listed' in p.locator('#detail-support').inner_text();assert p.locator('#buy-now').is_visible();ok('Unlisted framework is labelled honestly, not falsely certified or blocked')
 p.locator('[data-install-check="0"]').check();p.locator('[data-install-check="2"]').check();assert p.locator('#checklist-count').inner_text()=='2/4 noted'
 p.locator('[data-copy-brief="flight"]').first.click();p.wait_for_function('!!window.__copied');text=p.evaluate('__copied');assert 'oxmysql' in text and 'Standalone' in text and '[x]' in text and 'not a server diagnostic' in text
 ok('Personal checklist state and accurate clipboard setup brief')
 saved=p.evaluate('__saved');p.close();p,err2=mount(saved,hash='#/product/flight');errors+=err2
 assert p.locator('#detail-framework').input_value()=='standalone' and p.locator('#checklist-count').inner_text()=='2/4 noted';ok('Framework and checklist restore through storage adapter')
 p.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}})")
 p.locator('[data-copy-brief="flight"]').first.click();p.wait_for_selector('#owner-copy[open]');assert 'ox_inventory' in p.locator('#copy-content').input_value();p.keyboard.press('Escape');ok('Blocked clipboard offers selectable text without false success')
 p.locator('#requirements').scroll_into_view_if_needed();p.wait_for_function("!document.querySelector('#owner-buy-dock').hidden");assert p.locator('#owner-buy-dock a').get_attribute('href').endswith('/7324328');ok('Sticky purchase shortcut uses the actual selected package')
 p.locator('[data-motion-toggle]').click();assert p.evaluate('MSMotion.reduced()') and p.evaluate('document.getAnimations().filter(a=>a.playState==="running").length')==0
 p.locator('[data-motion-toggle]').click();assert not p.evaluate('MSMotion.reduced()')
 p.emulate_media(reduced_motion='reduce');p.wait_for_function("document.documentElement.dataset.motion==='reduce'");assert p.evaluate('MSMotion.reduced()');ok('Manual motion control and device reduced-motion preference stop animation')
 p.emulate_media(reduced_motion='no-preference');p.wait_for_function("document.documentElement.dataset.motion==='full'")
 p.evaluate("__location.hash='#/'");p.wait_for_selector('.hero');p.locator('[data-feature="fire"]').click();assert 'Fire' in p.locator('.hero h1').inner_text();assert p.evaluate('document.getAnimations().length')>0
 p.wait_for_timeout(650);assert p.evaluate('document.getAnimations().filter(a=>a.playState==="running").length')==0;ok('Featured transition runs briefly with no permanent animation loop')
 p.locator('.demo-trigger').click();assert '107.155.80.34:50986' in p.locator('.demo-command').inner_text();assert 'not checked' in p.locator('#owner-demo').inner_text();p.keyboard.press('Escape');ok('Demo instructions use published address without an invented online status')
 # Font/media retrieval is blocked. Verify real layout, then label screenshots accordingly.
 for w in [320,390,768,1024,1440]:
  p.set_viewport_size({'width':w,'height':1000});assert not p.evaluate('document.documentElement.scrollWidth>innerWidth'),w
 p.locator('#server-framework').select_option('all')
 p.set_viewport_size({'width':1440,'height':1000});p.locator('#catalog').scroll_into_view_if_needed();p.wait_for_timeout(500);p.screenshot(path=str(Q/'owner-catalog-v3-offline.png'))
 p.locator('.product-card [data-compare="flight"]').click();p.locator('.product-card [data-compare="wrecker"]').click();p.locator('[data-open-compare]').click();p.wait_for_timeout(350);p.screenshot(path=str(Q/'comparison-v3-offline.png'));p.keyboard.press('Escape')
 assert not errors,errors;ok('Owner features fit 320–1440px with no uncaught errors')
 p.close();c.close();b.close()
(Q/'owner-results.json').write_text(json.dumps({'passed':len(passed),'checks':passed,'limits':['Remote font files and actual public media were blocked; typography CSS and system fallbacks were tested, not successful font delivery.','Real keyboard/DOM/animation functionality tested in isolated Chromium; location, clipboard and session storage use explicit adapters.','Published demo server address not connected to; payments and native cross-site auth not tested.']},indent=2))
