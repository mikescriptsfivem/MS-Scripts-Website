/* Basket/auth/checkout kept separate from the presentation. Never grants entitlements. */
(() => {
  'use strict';
  const cfg=window.MS_CONFIG,ui=window.MS_UI;
  const {TebexClient,secureURL}=window.MSTebex;
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const escape=ui.esc,priceText=id=>ui.price(id)||null,packageURL=ui.packageURL,toast=ui.toast;
  const variants=new Map(ui.products.flatMap(p=>ui.variantsFor(p).map(v=>[String(v.id),{product:p,variant:v}])));
  const storageKey='ms-storefront-v2';
  const openDialog=d=>{if(!d.open)d.showModal();};
  let saved={};try{saved=JSON.parse(sessionStorage.getItem(storageKey)||'{}')||{};}catch{}
  const state={cart:[],session:null,ready:null,busy:false};
  for(const raw of Array.isArray(saved.cart)?saved.cart:[]){const id=String(raw),item=variants.get(id);if(item&&!state.cart.some(x=>variants.get(x).product.slug===item.product.slug))state.cart.push(id);}
  const s=saved.session;
  if(s&&s.token===cfg.publicToken&&typeof s.ident==='string'&&Array.isArray(s.ids)&&s.ids.every(id=>variants.has(id))&&Number.isFinite(s.created)&&s.created<=Date.now()&&Date.now()-s.created<1800000)state.session=s;
  function persist(required=false){try{sessionStorage.setItem(storageKey,JSON.stringify({cart:state.cart,session:state.session}));return true;}catch{if(required)throw new Error('Your browser blocked the temporary checkout session. Use the hosted Tebex store.');return false;}}
  let client;try{client=new TebexClient(cfg.publicToken);}catch(e){console.warn(e.message);client=new TebexClient('');}
  function invalidateCheckout() { state.ready = null; state.session = null; $('#checkout-stage').replaceChildren(); persist(); }
  function addToBag(id) {
    const item = variants.get(String(id)); if (!item) return;
    if (state.busy) return toast('Please wait for the checkout request to finish.');
    state.cart = state.cart.filter(other => variants.get(other).product.slug !== item.product.slug);
    state.cart.push(String(id)); invalidateCheckout(); renderCart(); openDialog($('#cart-dialog')); toast('Added to your bag.');
  }
  function renderCart() {
    $$('.bag-count').forEach(e => e.textContent = state.cart.length);
    $('#cart-items').innerHTML = state.cart.length ? state.cart.map(id => {const {product:p,variant:v} = variants.get(id); return `<div class="cart-item"><div><h3>${escape(p.name)}</h3><p>${escape(v.label)}<br>${escape(priceText(id) || 'Price confirmed on Tebex')}</p></div><button class="remove-item" data-remove="${escape(id)}" aria-label="Remove ${escape(p.name)}" ${state.busy ? 'disabled' : ''}>×</button></div>`;}).join('') : '<p class="cart-empty">Your bag is empty.<br>Browse the collection to add a product.</p>';
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

  document.addEventListener('click',e=>{
    const b=e.target.closest('button,a');if(!b)return;
    if(b.hasAttribute('data-cart')){renderCart();openDialog($('#cart-dialog'));}
    else if(b.hasAttribute('data-add'))addToBag(b.dataset.add);
    else if(b.hasAttribute('data-buy')&&client.enabled){e.preventDefault();addToBag(b.dataset.buy);prepareCheckout();}
    else if(b.hasAttribute('data-remove')&&!state.busy){state.cart=state.cart.filter(id=>id!==b.dataset.remove);invalidateCheckout();renderCart();}
    else if(b.id==='prepare-checkout')prepareCheckout();
    else if(b.id==='launch-checkout'&&state.ready&&window.Tebex?.checkout){try{window.Tebex.checkout.init({ident:state.ready.ident,theme:'dark',locale:'en_US',colors:[{name:'primary',color:'#d9efaa'}]});window.Tebex.checkout.launch();}catch{toast('Use the direct Tebex basket link below to continue.');}}
  });
  window.MSCommerce={enabled:client.enabled};
  renderCart();persist();ui.refreshPrices();
  if(client.enabled)client.catalogue().then(rows=>{for(const row of rows)if(variants.has(String(row.id)))ui.live.set(String(row.id),row);document.dispatchEvent(new CustomEvent('ms:prices'));renderCart();}).catch(()=>toast('Live prices are unavailable. The Tebex listings remain available.'));
  addEventListener('hashchange',handleReturn);handleReturn();
})();
