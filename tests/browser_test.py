"""DOM/browser tests with a deliberately isolated origin and mocked external services.
No live payments, public-host CORS, persistent browser storage, or external media tested.
"""
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'storefront'
(ROOT/'qa').mkdir(exist_ok=True)
results=[]
def ok(name):results.append(name);print('PASS:',name,flush=True)
html=(SOURCE/'index.html').read_text()
html=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',html,flags=re.I)
html=re.sub(r'<link\b[^>]*>','',html,flags=re.I)
html=html.replace('</head>','<style>'+(SOURCE/'styles.css').read_text()+'</style></head>')
config=(SOURCE/'config.js').read_text()
setup="""(saved) => {
 window.__saved = saved;
 window.__storage = {getItem:k => window.__saved[k] || null, setItem:(k,v) => {window.__saved[k] = String(v)}};
 window.__hash = '';
 window.__location = {href:'https://preview.example/storefront/'};
 Object.defineProperty(window.__location,'hash',{get:()=>window.__hash,set:v=>{window.__hash=v;window.dispatchEvent(new Event('hashchange'))}});
 window.fixture={authorized:false,complete:false,ids:[],adds:0,creates:0,failAfterAdd:true};
 const basket=()=>({ident:'test-basket',username_id:fixture.authorized?123:null,complete:fixture.complete,packages:fixture.ids.map(id=>({id:Number(id),in_basket:{quantity:1}})),total_price:12.34,currency:'USD',links:{checkout:'https://checkout.tebex.io/checkout/test-basket'}});
 window.fetch=async (url,options={})=>{
   const good=data=>Promise.resolve({ok:true,status:200,json:async()=>JSON.parse(JSON.stringify(data))});
   if(!url.startsWith('https://headless.tebex.io/'))throw Error('Unexpected request');
   if(url.endsWith('/packages') && (!options.method||options.method==='GET'))return good({data:[{id:7324328,total_price:12.34,currency:'USD'}]});
   if(url.includes('/auth?'))return good([{name:'FiveM',url:'https://ident.tebex.io/auth/test'}]);
   if(url.endsWith('/baskets') && options.method==='POST'){fixture.creates++;return good({data:basket()})}
   if(url.endsWith('/test-basket/packages')){fixture.adds++;fixture.ids.push(JSON.parse(options.body).package_id);if(fixture.failAfterAdd){fixture.failAfterAdd=false;throw Error('Simulated lost response')}return good({data:basket()})}
   if(url.endsWith('/test-basket'))return good({data:basket()});
   throw Error('Unexpected API request '+url);
 };
 window.Tebex={checkout:{init(c){window.testCheckoutIdent=c.ident},launch(){window.testCheckoutLaunched=true}}};
}"""
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 ctx=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 def mount(saved=None,configured=False,width=1440):
  pg=ctx.new_page();pg.set_viewport_size({'width':width,'height':1000});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.set_content(html,wait_until='domcontentloaded');pg.evaluate(setup,saved or {})
  pg.add_script_tag(content=config.replace("publicToken: ''","publicToken: 'test-0123456789012345678901234567890123456789'") if configured else config)
  for f in ['brand.js','tebex.js']:pg.add_script_tag(content=(SOURCE/f).read_text())
  pg.add_script_tag(content='((location,sessionStorage)=>{'+(SOURCE/'app.js').read_text()+'})(window.__location,window.__storage);')
  pg.wait_for_selector('.product-card');return pg,errs
 page,errors=mount()
 assert page.locator('.product-card').count()==4 and page.locator('.aircraft-card').count()==2
 ok('Four script products and exactly two aircraft render')
 page.locator('[data-filter="fire"]').click();assert page.locator('.product-card').count()==1;assert 'Advanced Fire' in page.locator('.product-card').inner_text()
 page.locator('[data-filter="all"]').click();page.locator('#search').fill('nothing-here');assert page.locator('#empty-state').is_visible()
 page.locator('#search').fill('');ok('Category filters and search empty state')
 page.locator('.product-card [data-product="flight"]').first.click();assert page.locator('#product-dialog').is_visible()
 page.locator('#purchase-variant').select_option('7472845');page.locator('#add-to-bag').click()
 assert 'Monthly subscription' in page.locator('#cart-items').inner_text()
 page.locator('#prepare-checkout').click();assert 'not automatically transferred' in page.locator('#checkout-stage').inner_text()
 assert page.locator('#checkout-stage a').get_attribute('href').endswith('/7472845')
 ok('Correct monthly package and honest hosted-store fallback')
 saved=page.evaluate('window.__saved');page.close();page,errors=mount(saved)
 page.locator('[data-cart]').click();assert page.locator('.cart-item').count()==1
 page.keyboard.press('Escape');page.locator('.product-card [data-product="flight"]').first.click();page.locator('#add-to-bag').click();assert page.locator('.cart-item').count()==1;assert 'One-time purchase' in page.locator('#cart-items').inner_text()
 ok('Storage adapter restores selection; purchase options are mutually exclusive')
 page.locator('[data-remove]').click();assert page.locator('#prepare-checkout').is_disabled();page.keyboard.press('Escape')
 page.locator('[data-watch-hero]').click();assert page.locator('#media-dialog iframe').get_attribute('src').startswith('https://www.youtube-nocookie.com/')
 page.keyboard.press('Escape');page.wait_for_function("document.querySelectorAll('#media-dialog iframe').length===0")
 ok('Empty basket and video destroyed on close')
 page.locator('.aircraft-card [data-product="ms8000"]').click();assert page.locator('#add-to-bag').count()==0;assert 'Ask about this aircraft' in page.locator('#product-dialog').inner_text();page.keyboard.press('Escape')
 ok('Aircraft cannot be purchased without a mapped Tebex package')
 for w in [320,390,768,1024,1440]:
  page.set_viewport_size({'width':w,'height':950});page.evaluate('scrollTo(0,0)')
  if page.evaluate('document.documentElement.scrollWidth > window.innerWidth'):
   print(page.evaluate("[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1 && getComputedStyle(e).position!=='fixed').map(e=>[e.tagName,e.className,e.getBoundingClientRect().width,e.getBoundingClientRect().right]).slice(0,25)"),flush=True)
   raise AssertionError(f'horizontal overflow at {w}')
  if w in [390,1440]:page.screenshot(path=str(ROOT/'qa'/f'layout-{w}-offline.png'),full_page=True)
 ok('No horizontal overflow at 320, 390, 768, 1024 and 1440 pixels')
 assert not errors,errors;ok('No uncaught browser errors in fallback flow')
 page.close()
 pg,errs=mount(configured=True)
 pg.wait_for_function("document.querySelector('.product-card').textContent.includes('12.34')")
 pg.locator('.product-card [data-product="flight"]').first.click();pg.locator('#add-to-bag').click();pg.locator('#prepare-checkout').click()
 pg.wait_for_selector('#checkout-stage a[href^="https://ident.tebex.io/"]');assert pg.evaluate('fixture.adds')==0
 ok('Unauthenticated basket waits for official FiveM authentication')
 pg.evaluate("fixture.authorized=true;__location.hash='#checkout-auth'");pg.wait_for_selector('#checkout-stage .error');assert pg.evaluate('fixture.adds')==1
 ok('Ambiguous add failure is surfaced, not automatically retried')
 pg.locator('#prepare-checkout').click();pg.wait_for_selector('#launch-checkout:not([disabled])');assert pg.evaluate('fixture.adds')==1 and pg.evaluate('fixture.creates')==1
 ok('Retry reads authoritative basket and does not duplicate packages')
 pg.locator('#launch-checkout').click();assert pg.evaluate('window.testCheckoutIdent')=='test-basket';assert pg.evaluate('window.testCheckoutLaunched') is True
 ok('Explicit second click initializes SDK adapter with basket identity')
 pg.evaluate("__location.hash='#checkout-complete'");pg.wait_for_function("document.querySelector('#checkout-stage').textContent.includes('not been confirmed')");assert pg.locator('.cart-item').count()==1
 ok('Forged success hash never clears cart or grants a product')
 pg.evaluate("fixture.complete=true;__location.hash='#checkout-complete'");pg.wait_for_function("document.querySelector('#checkout-stage').textContent.includes('checkout is complete')");assert pg.locator('.cart-item').count()==0
 ok('Only authoritative complete status clears the local basket')
 assert not errs,errs;ok('No uncaught browser errors in mocked integration flow')
 ctx.close();browser.close()
(ROOT/'qa/browser-results.json').write_text(json.dumps({'passed':len(results),'tests':results,'limits':['Tebex API, payment SDK, location and storage adapters were mocked. No live authentication, payment, CORS, native persistence or fulfillment test was possible without the store public token and public host.','Browser tests used inline source on an isolated origin because this runtime blocks browser navigation. Product media could not be loaded. Layout screenshots show offline fallback artwork, not the real product images.']},indent=2))
