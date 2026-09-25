/* Plain JavaScript storefront: no build process, no private keys, no client-side fulfillment. */
(() => {
  'use strict';
  const cfg = window.MS_CONFIG;
  const {TebexClient, secureURL} = window.MSTebex;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const escape = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const catalogue = [...cfg.products, ...cfg.aircraft];
  const productBySlug = new Map(catalogue.map(p => [p.slug, p]));
  const variants = new Map(catalogue.flatMap(p => p.variants.map(v => [String(v.id), {product: p, variant: v}])));
  const names = {aviation:'AVIATION', police:'POLICE', fire:'FIRE & RESCUE', vehicles:'VEHICLES', aircraft:'CUSTOM AIRCRAFT'};
  const store = secureURL(cfg.storeUrl, ['tebex.io']);
  const discord = secureURL(cfg.discordUrl, ['discord.gg','discord.com']);
  if (!store || !discord) throw new Error('Configure valid official store and support URLs.');
  const packageURL = id => store.replace(/\/$/,'') + '/package/' + encodeURIComponent(id);
  const storageKey = 'ms-storefront-v1';
  function load() { try { return JSON.parse(sessionStorage.getItem(storageKey) || '{}') || {}; } catch { return {}; } }
  const saved = load();
  const state = {filter:'all', query:'', cart:[], live:new Map(), session:null, ready:null, busy:false, product:null, lastFocus:null};
  for (const id of Array.isArray(saved.cart) ? saved.cart : []) {
    const item = variants.get(String(id));
    if (item && !state.cart.some(other => variants.get(other).product.slug === item.product.slug)) state.cart.push(String(id));
  }
  if (saved.session && saved.session.token === cfg.publicToken && typeof saved.session.ident === 'string' && Array.isArray(saved.session.ids) && saved.session.ids.every(id => variants.has(id)) && Date.now() - saved.session.created < 30 * 60 * 1000 && saved.session.created <= Date.now()) state.session = saved.session;
  function persist(required = false) {
    try { sessionStorage.setItem(storageKey, JSON.stringify({cart:state.cart, session:state.session})); return true; }
    catch { if (required) throw new Error('Your browser blocked the temporary checkout session. Use the hosted Tebex store.'); return false; }
  }
  let client;
  try { client = new TebexClient(cfg.publicToken); }
  catch (e) { client = new TebexClient(''); console.warn(e.message); }
  let toastTimer;
  function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4000); }
  function openDialog(dialog) { if (!dialog.open) { state.lastFocus = document.activeElement; dialog.showModal(); } }
  function mediaURL(value) {
    if (!value) return '';
    if (/^https:\/\//i.test(value)) return secureURL(value);
    if (/^(?!\/|\\|.*\.\.)[a-z0-9_\-./]+\.(png|jpe?g|webp|gif|avif|mp4|webm)$/i.test(value)) return value;
    return '';
  }
  function youtubeID(value) {
    try { const u = new URL(value); if (!['youtu.be','youtube.com','www.youtube.com'].includes(u.hostname) || u.protocol !== 'https:') return ''; const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v') || u.pathname.split('/').pop(); return /^[a-z0-9_-]{11}$/i.test(id || '') ? id : ''; } catch { return ''; }
  }
  function priceText(id) {
    const data = state.live.get(String(id));
    const raw = data?.total_price ?? data?.base_price;
    if ((typeof raw !== 'number' && typeof raw !== 'string') || String(raw).trim() === '') return null;
    const number = Number(raw);
    if (!Number.isFinite(number) || number < 0 || !/^[A-Z]{3}$/.test(data.currency || '')) return null;
    try { return new Intl.NumberFormat('en-US', {style:'currency', currency:data.currency, currencyDisplay:'code'}).format(number); } catch { return null; }
  }
  function priceHTML(id) {
    const item = variants.get(String(id));
    const price = priceText(id);
    return `<span class="price">${escape(price || 'View on Tebex')}<small>${escape(price ? item?.variant.label : 'Current price & availability')}</small></span>`;
  }
  function coverFor(p) { const live = p.variants.map(v => state.live.get(v.id)?.image).find(Boolean); return mediaURL(p.cover) || mediaURL(live); }
  function card(p) {
    const src = coverFor(p);
    return `<article class="product-card"><button class="product-art" data-product="${escape(p.slug)}" aria-label="Explore ${escape(p.name)}"><span class="art-fallback" aria-hidden="true">${escape(p.code)}</span>${src ? `<img src="${escape(src)}" alt="${escape(p.name)} official product artwork" loading="lazy" width="1000" height="563">` : ''}<span class="card-category">${escape(names[p.category])}</span></button><div class="card-content"><div class="card-code"><span>${escape(p.code)}</span><span>${p.variants.length > 1 ? 'ONE-TIME / MONTHLY' : 'ONE-TIME PURCHASE'}</span></div><h3>${escape(p.name)}</h3><p>${escape(p.summary)}</p><div class="card-bottom">${priceHTML(p.variants[0].id)}<button class="detail-link" data-product="${escape(p.slug)}">Explore product ↗</button></div></div></article>`;
  }
  function renderProducts() {
    const list = cfg.products.filter(p => (state.filter === 'all' || p.category === state.filter) && `${p.name} ${p.code} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(state.query));
    $('#product-grid').innerHTML = list.map(card).join(''); $('#empty-state').hidden = Boolean(list.length);
    $$('.filters button').forEach(b => { const active = b.dataset.filter === state.filter; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
  }
  function renderAircraft() {
    $('#aircraft-grid').innerHTML = cfg.aircraft.map((p,i) => `<article class="aircraft-card">${mediaURL(p.cover) ? `<img class="aircraft-thumb" src="${escape(mediaURL(p.cover))}" alt="${escape(p.name)}" loading="lazy">` : ''}<span class="serial">AIRFRAME / 0${i+1} — CUSTOM AIRCRAFT</span><div><h3>${escape(p.name)}</h3><p>${escape(p.summary)}</p></div><button class="circle-link" data-product="${escape(p.slug)}" aria-label="Explore ${escape(p.name)}">↗</button></article>`).join('');
  }
  function openProduct(slug) {
    const p = productBySlug.get(slug); if (!p) return;
    state.product = p;
    const src = coverFor(p);
    $('#product-content').innerHTML = `<div class="product-detail-layout"><div class="detail-media">${src ? `<button class="product-art" data-cover="${escape(p.slug)}" aria-label="Enlarge ${escape(p.name)} artwork"><img class="detail-cover" src="${escape(src)}" alt="${escape(p.name)} official product artwork"></button>` : `<div class="detail-title-art">${escape(p.name)}</div>`}<div class="media-thumbs">${p.media.map((m,i) => `<button data-media="${i}" data-media-product="${escape(slug)}">${m.type === 'youtube' || m.type === 'video' ? '▶' : '↗'} ${escape(m.label)}</button>`).join('')}</div>${p.category === 'aircraft' && !p.media.length ? '<p class="catalog-note">Contact MikeScripts for current aircraft media and availability.</p>' : '<p class="catalog-note">Official MikeScripts product media. Artwork is illustrative; refer to the package contents.</p>'}</div><div class="detail-copy"><span class="eyebrow accent">${escape(p.code)} / ${escape(names[p.category])}</span><h2 id="product-title">${escape(p.headline)}</h2><p>${escape(p.description)}</p><div class="detail-tags">${p.tags.map(t => `<span>${escape(t)}</span>`).join('')}</div><ul class="features">${p.features.map(f => `<li>${escape(f)}</li>`).join('')}</ul><div class="requirements"><strong>Before you install</strong><br>${escape(p.requirements)}</div>${p.variants.length ? `<label class="variant-label" for="purchase-variant">PURCHASE OPTION</label><select class="variant-select" id="purchase-variant">${p.variants.map(v => `<option value="${escape(v.id)}">${escape(v.label)}</option>`).join('')}</select><div class="detail-buy"><div id="detail-price">${priceHTML(p.variants[0].id)}</div><button id="add-to-bag" class="button primary">Add to bag ↗</button></div><a id="listing-link" class="detail-source" href="${escape(packageURL(p.variants[0].id))}" target="_blank" rel="noopener noreferrer">Current listing, price and terms on Tebex ↗</a>` : `<a class="button primary" href="${escape(discord)}" target="_blank" rel="noopener noreferrer">Ask about this aircraft ↗</a><p class="detail-source">Showcase only — not currently connected to a purchase package.</p>`}</div></div>`;
    openDialog($('#product-dialog'));
  }
  function showMedia(m) {
    let content = '';
    if (m.type === 'youtube') { const id = youtubeID(m.url); if (!id) return toast('This video link is not configured correctly.'); content = `<iframe title="${escape(m.label || 'Product showcase')}" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`; }
    else if (m.type === 'video' && mediaURL(m.url)) { content = `<video controls autoplay playsinline style="width:100%;max-height:80dvh" src="${escape(mediaURL(m.url))}"></video>`; }
    else if (mediaURL(m.url)) content = `<img src="${escape(mediaURL(m.url))}" alt="${escape(m.label || 'Product media')}">`;
    else return toast('Media is unavailable. Please check the product listing.');
    $('#media-content').innerHTML = content + `<div class="media-caption">${escape(m.label || 'MikeScripts showcase')}</div>`;
    openDialog($('#media-dialog'));
  }
  function invalidateCheckout() { state.ready = null; state.session = null; $('#checkout-stage').replaceChildren(); persist(); }
  function addToBag(id) {
    const item = variants.get(String(id)); if (!item) return;
    if (state.busy) return toast('Please wait for the checkout request to finish.');
    state.cart = state.cart.filter(other => variants.get(other).product.slug !== item.product.slug);
    state.cart.push(String(id)); invalidateCheckout(); renderCart(); $('#product-dialog').close(); openDialog($('#cart-dialog')); toast('Added to your bag.');
  }
  function renderCart() {
    $$('.cart-count').forEach(e => e.textContent = state.cart.length);
    $('#cart-items').innerHTML = state.cart.length ? state.cart.map(id => {const {product:p,variant:v} = variants.get(id); return `<div class="cart-item"><div><h3>${escape(p.name)}</h3><p>${escape(v.label)}<br>${escape(priceText(id) || 'Price confirmed on Tebex')}</p></div><button class="remove-item" data-remove="${escape(id)}" aria-label="Remove ${escape(p.name)}" ${state.busy ? 'disabled' : ''}>×</button></div>`;}).join('') : '<p class="cart-empty">Your bag is waiting for its next upgrade.<br>Explore the collection to get started.</p>';
    $('#prepare-checkout').disabled = !state.cart.length || state.busy;
    $('#prepare-checkout').textContent = state.busy ? 'Preparing secure checkout…' : client.enabled ? 'Continue to checkout ↗' : 'Continue on Tebex ↗';
  }
  function stageMessage(text, kind='notice') { $('#checkout-stage').innerHTML = `<p class="${escape(kind)}">${escape(text)}</p>`; }
  function fallbackLinks() {
    stageMessage('Purchases currently finish on the hosted Tebex store. Open the product below to review its price and buy it. This local bag is not automatically transferred without the store connection.');
    state.cart.forEach(id => { const a = document.createElement('a'); a.className='button'; a.href=packageURL(id); a.target='_blank'; a.rel='noopener noreferrer'; a.textContent=variants.get(id).product.name + ' ↗'; $('#checkout-stage').append(a); });
  }
  const sameIDs = (a,b) => [...a].sort().join(',') === [...b].sort().join(',');
  function validateBasket(basket, requested, exact=false) {
    if (!Array.isArray(basket.packages)) throw new Error('Tebex returned an invalid basket. Please use the hosted store.');
    const seen = new Set();
    for (const p of basket.packages) {
      const id=String(p.id);
      if (!requested.includes(id) || seen.has(id) || Number(p.in_basket?.quantity) !== 1) throw new Error('The Tebex basket no longer matches your selection. Change your bag to start a fresh checkout.');
      seen.add(id);
    }
    if (exact && !sameIDs([...seen],requested)) throw new Error('Some products could not be added. No checkout was opened. Please retry or use Tebex.');
    return seen;
  }
  async function prepareCheckout() {
    if (state.busy || !state.cart.length) return;
    if (!client.enabled) { fallbackLinks(); return; }
    state.busy=true; state.ready=null; renderCart(); stageMessage('Connecting to Tebex. No payment is taken until you complete its checkout.');
    try {
      const ids=[...state.cart];
      let basket;
      if (state.session && sameIDs(state.session.ids,ids) && Date.now()-state.session.created < 1800000) basket=await client.basket(state.session.ident);
      else {
        basket=await client.createBasket(location.href);
        state.session={ident:basket.ident,ids,created:Date.now(),token:cfg.publicToken}; persist(true);
      }
      if (basket.complete === true) { state.session=null; persist(); throw new Error('This basket is already complete. Click again to create a new checkout.'); }
      if (!basket.username_id && !basket.username) {
        const back=new URL(location.href);back.search='';back.hash='checkout-auth';
        const providers=await client.auth(state.session.ident,back.href);
        if (providers.length) {
          persist(true); stageMessage('Sign in through the official provider to associate your purchase with the right account. You will return here to continue.');
          for (const provider of providers) { const a=document.createElement('a');a.className='button primary';a.href=provider.url;a.textContent='Continue with '+provider.name+' ↗';$('#checkout-stage').append(a); }
          return;
        }
      }
      const existing=validateBasket(basket,ids);
      for (const id of ids) if (!existing.has(id)) await client.addPackage(state.session.ident,id);
      basket=await client.basket(state.session.ident);
      validateBasket(basket,ids,true);
      const checkout=secureURL(basket.links?.checkout,['tebex.io']);
      if (!checkout) throw new Error('Tebex did not return a trusted checkout link. Please use the hosted store.');
      state.ready={ident:state.session.ident,url:checkout};
      stageMessage('Your Tebex basket is ready. Review the purchase options below, then open the secure payment window.');
      if (Number.isFinite(Number(basket.total_price)) && /^[A-Z]{3}$/.test(basket.currency || '')) {
        const total=new Intl.NumberFormat('en-US',{style:'currency',currency:basket.currency,currencyDisplay:'code'}).format(Number(basket.total_price));
        const box=document.createElement('div');box.className='basket-total';box.innerHTML='Tebex total due now<strong>'+escape(total)+'</strong>Confirm tax, discounts and recurring terms at checkout.';$('#checkout-stage').append(box);
      }
      const button=document.createElement('button');button.className='button primary';button.id='launch-checkout';button.textContent='Loading secure payment window…';button.disabled=true;$('#checkout-stage').append(button);
      const a=document.createElement('a');a.href=checkout;a.target='_blank';a.rel='noopener noreferrer';a.className='checkout-ready-link';a.textContent='Or open this basket directly on Tebex ↗';$('#checkout-stage').append(a);
      // Load the payment SDK only after an explicit checkout action. A second click
      // launches it synchronously, retaining the browser's popup permission.
      loadCheckoutSDK().then(() => { if (state.ready?.ident === basket.ident && button.isConnected) {button.disabled=false;button.textContent='Open secure payment ↗';} }).catch(() => {if (button.isConnected) button.remove();});
    } catch(e) {
      if ([404,410].includes(e.status)) {state.session=null;persist();}
      stageMessage(e.message || 'Checkout could not be prepared. Please use the Tebex store.', 'error');
    } finally { state.busy=false;renderCart(); }
  }
  let sdkPromise;
  function loadCheckoutSDK() {
    if (window.Tebex?.checkout) return Promise.resolve();
    if (sdkPromise) return sdkPromise;
    sdkPromise=new Promise((resolve,reject) => {
      const script=document.createElement('script');script.src='https://js.tebex.io/v/1.js';script.async=true;
      const timeout=setTimeout(() => {script.remove();sdkPromise=null;reject(new Error('Checkout SDK unavailable.'));},12000);
      script.onload=() => {clearTimeout(timeout);if(window.Tebex?.checkout) resolve();else {sdkPromise=null;reject(new Error('Checkout SDK unavailable.'));}};
      script.onerror=() => {clearTimeout(timeout);script.remove();sdkPromise=null;reject(new Error('Checkout SDK unavailable.'));};
      document.head.append(script);
    });
    return sdkPromise;
  }
  async function handleReturn() {
    if (location.hash === '#checkout-auth') {
      openDialog($('#cart-dialog'));
      if (!state.session) return stageMessage('The temporary checkout session is missing or expired. Start checkout again.');
      await prepareCheckout(); // API response, never the URL, establishes authentication.
    } else if (location.hash === '#checkout-cancel') {
      openDialog($('#cart-dialog'));stageMessage('You returned from checkout. Your selection is still in your bag; review your Tebex receipt before trying again.');
    } else if (location.hash === '#checkout-complete') {
      openDialog($('#cart-dialog'));
      if (!client.enabled || !state.session) return stageMessage('Check your Tebex receipt for payment and delivery confirmation. This page cannot verify an order without its original basket.');
      stageMessage('Checking your basket status with Tebex…');
      try {
        const basket=await client.basket(state.session.ident);
        if (basket.complete === true) { state.cart=[];state.session=null;state.ready=null;persist();renderCart();stageMessage('Tebex reports this checkout is complete. Check your Tebex receipt and account for delivery details.'); }
        else stageMessage('Payment has not been confirmed for this basket. Check Tebex before attempting another purchase.');
      } catch {stageMessage('Payment status could not be verified. Check your Tebex receipt before trying again.');}
    }
  }
  document.addEventListener('click',e => {
    const el=e.target.closest('button,a');if(!el)return;
    if (el.hasAttribute('data-product')) openProduct(el.dataset.product);
    else if(el.hasAttribute('data-cart')) {renderCart();openDialog($('#cart-dialog'));}
    else if(el.hasAttribute('data-close')) el.closest('dialog').close();
    else if(el.hasAttribute('data-filter')) {state.filter=el.dataset.filter;renderProducts();}
    else if(el.hasAttribute('data-watch-hero')) showMedia({type:youtubeID(cfg.heroVideo)?'youtube':'video',url:cfg.heroVideo,label:'MikeScripts aviation showcase'});
    else if(el.hasAttribute('data-cover')) {const p=productBySlug.get(el.dataset.cover);showMedia({type:'image',url:coverFor(p),label:p.name+' — official artwork'});}
    else if(el.hasAttribute('data-media')) {const p=productBySlug.get(el.dataset.mediaProduct);if(p?.media[Number(el.dataset.media)])showMedia(p.media[Number(el.dataset.media)]);}
    else if(el.id==='add-to-bag') addToBag($('#purchase-variant').value);
    else if(el.hasAttribute('data-remove') && !state.busy) {state.cart=state.cart.filter(id=>id!==el.dataset.remove);invalidateCheckout();renderCart();}
    else if(el.id==='prepare-checkout') prepareCheckout();
    else if(el.id==='launch-checkout' && state.ready && window.Tebex?.checkout) {
      try {window.Tebex.checkout.init({ident:state.ready.ident,theme:'dark',locale:'en_US',colors:[{name:'primary',color:'#97e6fc'}]});window.Tebex.checkout.launch();}
      catch {toast('Use the direct Tebex basket link below to continue.');}
    } else if(el.classList.contains('menu-toggle')) {const open=el.getAttribute('aria-expanded')!=='true';el.setAttribute('aria-expanded',String(open));$('#mobile-menu').hidden=!open;}
    if(el.closest('#mobile-menu') && el.tagName==='A') {$('#mobile-menu').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');}
  });
  document.addEventListener('change',e=>{if(e.target.id==='purchase-variant'){const id=e.target.value;$('#detail-price').innerHTML=priceHTML(id);$('#listing-link').href=packageURL(id);}});
  $('#search').addEventListener('input',e=>{state.query=e.target.value.trim().toLowerCase();renderProducts();});
  $$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{if(d.id==='media-dialog')$('#media-content').replaceChildren();});});
  document.addEventListener('error',e=>{if(e.target.tagName==='IMG'){e.target.hidden=true;if(e.target.closest('#media-content'))$('#media-content').innerHTML='<p class="media-caption">This media could not load. Please view the current Tebex listing or contact MikeScripts.</p>'; }},true);
  $$('[data-discord]').forEach(a=>a.href=discord);$$('[data-store]').forEach(a=>a.href=store);$$('.brand-logo').forEach(i=>{if(window.MS_LOGO)i.src=window.MS_LOGO;else i.hidden=true;});
  $('#year').textContent=new Date().getFullYear();$('#hero-image').src=coverFor(cfg.products[0]);
  renderProducts();renderAircraft();renderCart();persist();
  if(client.enabled)client.catalogue().then(data=>{for(const p of data)if(variants.has(String(p.id)))state.live.set(String(p.id),p);renderProducts();renderCart();if($('#purchase-variant'))$('#detail-price').innerHTML=priceHTML($('#purchase-variant').value);$('#catalog-note').textContent='Displayed prices are returned by Tebex. Final availability, taxes, discounts and purchase terms are confirmed at checkout.';}).catch(()=>{$('#catalog-note').textContent='Live prices are temporarily unavailable. Check the current price and availability on Tebex.';});
  addEventListener('hashchange',handleReturn);handleReturn();
})();
