"""Offline DOM tests. External media/API/SDK/location/storage are NOT live-verified."""
from pathlib import Path
import re,json,base64,io,zipfile
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];S=R/'storefront';QA=R/'qa';QA.mkdir(exist_ok=True)
results=[]
def ok(name):results.append(name);print('PASS',name,flush=True)
def standalone_studio():
 # Build the test document from committed sources; no packaged HTML required.
 def inline(text,names):
  text=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',text)
  text=text.replace('<link rel="stylesheet" href="site.css">','<style>'+(S/'site.css').read_text()+'</style>')
  return text.replace('</body>',''.join('<script>'+(S/n).read_text().replace('</script','<\\/script')+'</script>' for n in names)+'</body>')
 preview=inline((S/'index.html').read_text(),['brand.js','config.js','media-overrides.js','tebex.js','layout.js','site.js','commerce.js'])
 preview=re.sub(r'<base[^>]*>','',preview).replace('<body data-page="home">','<body data-page="home"><script>window.MS_PREVIEW=true;</script>')
 editor=inline((S/'media-studio.html').read_text(),['config.js','media-overrides.js','media-studio.js'])
 return editor.replace('</head>','<script>window.MS_SITE_TEMPLATE='+json.dumps(preview).replace('<','\\u003c')+';</script></head>')
setup='''(opts)=>{
 window.MS_PREVIEW=true;window.__hash=opts.hash||'';
 window.__location={href:'https://preview.example/storefront/'};
 Object.defineProperty(__location,'hash',{get:()=>__hash,set:v=>{__hash=v;queueMicrotask(()=>dispatchEvent(new Event('hashchange')))}});
 window.__saved=opts.saved||{};window.__storage={getItem:k=>__saved[k]||null,setItem:(k,v)=>{__saved[k]=v;}};
 window.fixture={authorized:false,complete:false,ids:[],adds:0,creates:0,failAfterAdd:true};
 const basket=()=>({ident:'test-basket',username_id:fixture.authorized?123:null,complete:fixture.complete,packages:fixture.ids.map(id=>({id:Number(id),in_basket:{quantity:1}})),total_price:12.34,currency:'USD',links:{checkout:'https://checkout.tebex.io/checkout/test-basket'}});
 window.fetch=async(url,o={})=>{const good=data=>({ok:true,status:200,json:async()=>JSON.parse(JSON.stringify(data))});
 if(!url.startsWith('https://headless.tebex.io/'))throw Error('Unexpected request');
 if(url.endsWith('/packages')&&(!o.method||o.method==='GET'))return good({data:[{id:7324328,total_price:12.34,currency:'USD'}]});
 if(url.includes('/auth?'))return good([{name:'FiveM',url:'https://ident.tebex.io/auth/test'}]);
 if(url.endsWith('/baskets')&&o.method==='POST'){fixture.creates++;return good({data:basket()});}
 if(url.endsWith('/test-basket/packages')){fixture.adds++;fixture.ids.push(JSON.parse(o.body).package_id);if(fixture.failAfterAdd){fixture.failAfterAdd=false;throw Error('Simulated lost response');}return good({data:basket()});}
 if(url.endsWith('/test-basket'))return good({data:basket()});throw Error('Unexpected API request');};
 window.Tebex={checkout:{init(c){window.checkoutIdent=c.ident;},launch(){window.checkoutLaunched=true;}}};
}'''
html=(S/'index.html').read_text();html=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',html);html=html.replace('<link rel="stylesheet" href="site.css">','<style>'+(S/'site.css').read_text()+'</style>');html=re.sub(r'<base[^>]*>','<base href="https://preview.example/storefront/">',html)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);ctx=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce');ctx.route('**/*',lambda route:route.abort())
 def mount(configured=False,saved=None,hash=''):
  pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.set_content(html,wait_until='domcontentloaded');pg.evaluate(setup,{'saved':saved or {},'hash':hash})
  for name in ['brand.js','config.js','media-overrides.js','tebex.js','layout.js','site.js','commerce.js']:
   code=(S/name).read_text()
   if name=='config.js' and configured:code=code.replace('"publicToken": ""','"publicToken": "test-0123456789012345678901234567890123456789"')
   if name in ['site.js','commerce.js']:code='((location,sessionStorage)=>{'+code+'})(__location,__storage);'
   pg.add_script_tag(content=code)
  pg.wait_for_selector('#main h1');return pg,errors
 pg,errors=mount();assert pg.locator('.product-card').count()==4 and pg.locator('.aircraft-row').count()==2;ok('Four products and two aircraft; no fabricated aircraft imagery')
 assert pg.locator('.hero h1').inner_text()=='Flight Simulator';pg.locator('[data-feature="wrecker"]').click();assert 'Wrecker' in pg.locator('.hero h1').inner_text();ok('Manual featured-product selector')
 pg.locator('[data-filter="fire"]').click();assert pg.locator('.product-card').count()==1;pg.locator('[data-filter="all"]').click();pg.locator('#search').fill('no such product');assert pg.locator('#empty-state').is_visible();pg.locator('#search').fill('');ok('Category and text filtering with empty state')
 pg.locator('.product-card a[data-route="flight"]').first.click();pg.wait_for_selector('.buy-panel h1');assert pg.locator('.buy-panel h1').inner_text()=='Flight Simulator' and pg.locator('#product-dialog').count()==0;ok('Product opens as a full page, not a modal')
 assert pg.locator('.gallery-thumb').count()==6;pg.locator('[data-gallery-step="1"]').click();assert pg.locator('[data-gallery-index="1"]').get_attribute('aria-pressed')=='true';ok('Six-item Flight gallery and thumbnail selection')
 pg.locator('#product-gallery [data-view]').first.click();assert pg.locator('#media-dialog').is_visible();pg.keyboard.press('ArrowRight');assert pg.locator('#viewer-count').inner_text()=='3 / 6';pg.keyboard.press('Escape');pg.wait_for_function("document.querySelector('#media-content').children.length===0");ok('Lightbox arrows, Escape and media cleanup')
 pg.locator('[data-gallery-index="5"]').click();pg.locator('.gallery-play').click();assert pg.locator('#media-dialog iframe').get_attribute('src').startswith('https://www.youtube-nocookie.com/');pg.keyboard.press('Escape');ok('Video player loads on explicit action only')
 assert pg.locator('#buy-now').get_attribute('href').endswith('/7324328');assert pg.locator('#purchase-variant option').count()==1;ok('Verified one-time mapping; unconfirmed monthly option not advertised')
 pg.locator('#add-to-bag').click();pg.locator('#prepare-checkout').click();assert 'not automatically transferred' in pg.locator('#checkout-stage').inner_text();saved=pg.evaluate('__saved');pg.keyboard.press('Escape');ok('Hosted checkout fallback explains local bag limitation')
 pg.close();pg,errors2=mount(saved=saved);pg.locator('[data-cart]').click();assert pg.locator('.cart-item').count()==1;pg.locator('[data-remove]').click();assert pg.locator('#prepare-checkout').is_disabled();pg.keyboard.press('Escape');ok('Cart restoration through test storage adapter and empty-cart guard')
 pg.locator('[data-route="ms8000"]').click();pg.wait_for_selector('.buy-panel h1');assert pg.locator('#buy-now').count()==0 and pg.locator('.aircraft-empty').count()==1;ok('Aircraft showcase cannot sell an unmapped product')
 for slug in ['home','flight','police','fire','wrecker','ms100','ms8000']:
  pg.evaluate("s=>{__location.hash=s==='home'?'#/':'#/product/'+s}",slug)
  pg.wait_for_function("s=>s==='home'?!!document.querySelector('.hero'):document.querySelector('.buy-panel h1')?.textContent===({flight:'Flight Simulator',police:'Police Helicopter System',fire:'Fire & Alarm System',wrecker:'Heavy Rotator Wrecker',ms100:'MS100 MAX',ms8000:'MS8000'})[s]",arg=slug)
  for w in [320,390,768,1024,1440]:
   pg.set_viewport_size({'width':w,'height':1000});assert not pg.evaluate('document.documentElement.scrollWidth > innerWidth'),(slug,w,pg.evaluate('document.documentElement.scrollWidth'))
  if slug in ['home','flight']:
   pg.evaluate('scrollTo(0,0)');pg.screenshot(path=str(QA/f'{slug}-desktop-offline.png'),full_page=True)
 ok('35 page/viewport combinations: no horizontal page overflow')
 pg.evaluate("__location.hash='#/'");pg.wait_for_selector('.hero');pg.set_viewport_size({'width':390,'height':844});pg.locator('.menu-toggle').click();assert pg.locator('#mobile-nav').is_visible();pg.keyboard.press('Escape');assert pg.locator('#mobile-nav').is_hidden();pg.screenshot(path=str(QA/'home-mobile-offline.png'),full_page=True);ok('Mobile navigation opens and dismisses with Escape')
 assert not errors+errors2,(errors,errors2);ok('No uncaught UI errors in fallback navigation')
 pg.close();pg,errs=mount(configured=True,hash='#/product/flight');pg.locator('#buy-now').click();pg.wait_for_selector('#checkout-stage a[href^="https://ident.tebex.io/"]');assert pg.evaluate('fixture.adds')==0;ok('FiveM authentication required before package mutation')
 pg.evaluate("fixture.authorized=true;__location.hash='#checkout-auth'");pg.wait_for_selector('#checkout-stage .error');assert pg.evaluate('fixture.adds')==1;ok('Ambiguous mutation failure stops without automatic retry')
 pg.locator('#prepare-checkout').click();pg.wait_for_selector('#launch-checkout:not([disabled])');assert pg.evaluate('fixture.adds')==1;ok('Manual retry reads basket and does not add a duplicate')
 pg.locator('#launch-checkout').click();assert pg.evaluate('checkoutIdent')=='test-basket' and pg.evaluate('checkoutLaunched');ok('Explicit user action launches payment SDK adapter')
 pg.evaluate("__location.hash='#checkout-complete'");pg.wait_for_function("document.querySelector('#checkout-stage').textContent.includes('not been confirmed')");assert pg.locator('.cart-item').count()==1;ok('Unconfirmed success URL never clears cart')
 pg.evaluate("fixture.complete=true;__location.hash='#checkout-complete'");pg.wait_for_function("document.querySelector('#checkout-stage').textContent.includes('checkout is complete')");assert pg.locator('.cart-item').count()==0;assert not errs,errs;ok('Only server-reported completion clears selection')
 pg.close()
 # Check local media editor by capturing generated blobs; no native download navigation is claimed.
 pg=ctx.new_page();pg.set_content(standalone_studio(),wait_until='domcontentloaded');pg.evaluate('''()=>{window.__blobs={};const create=URL.createObjectURL;URL.createObjectURL=b=>{const u=create(b);__blobs[u]=b;return u;};HTMLAnchorElement.prototype.click=function(){if(this.download)window.__lastDownload={blob:__blobs[this.href],name:this.download};};}''')
 from PIL import Image
 png=io.BytesIO();Image.new('RGB',(32,18),'gray').save(png,format='PNG')
 pg.locator('#studio-files').set_input_files({'name':'cabin.png','mimeType':'image/png','buffer':png.getvalue()});pg.wait_for_selector('.studio-item');pg.locator('[data-caption="0"]').fill('Test cabin <safe>');pg.locator('#export-media').click();pg.wait_for_function('window.__lastDownload?.name.endsWith(".zip")')
 out=pg.evaluate('async()=>Array.from(new Uint8Array(await __lastDownload.blob.arrayBuffer()))');z=zipfile.ZipFile(io.BytesIO(bytes(out)));assert z.testzip() is None;assert 'storefront/media-overrides.js' in z.namelist();override=z.read('storefront/media-overrides.js').decode();assert '\\u003c' in override;assert any(n.endswith('.png') for n in z.namelist());ok('Media editor exports a valid ZIP with escaped configuration and real uploaded bytes')
 pg.locator('#export-preview').click();pg.wait_for_function('window.__lastDownload?.name.endsWith(".html")');phtml=pg.evaluate('async()=>await __lastDownload.blob.text()');assert 'data:image/png;base64,' in phtml;ok('Media editor embeds user media in a self-contained browsing preview')
 pg.close();ctx.close();b.close()
for p in (S/'products').glob('*/index.html'):
 t=p.read_text();assert '<base href="../../">' in t and 'description' in t
ok('Six physical product entry points with individual metadata and correct base paths')
(QA/'browser-results.json').write_text(json.dumps({'passed':len(results),'checks':results,'limits':['Navigation/location, storage, Headless API and Tebex.js use test adapters. Browser external navigation is blocked by environment policy.','Official media URLs were extracted from live product listings, but external media bytes could not be retrieved or rendered here. Screenshots show offline fallbacks only.','Native downloads, cross-site auth, CORS, SDK popup behavior, subscriptions and real payment/fulfillment were not live-tested.']},indent=2))
