/* Server-owner UX, V3. No analytics, build dependency, credential input or network writes.
 * Progressive enhancement: the core catalog and Tebex links work without this module.
 */
(() => {
  'use strict';
  const ui = window.MS_UI, data = window.MS_OWNER_DATA;
  if (!ui || !data) return;
  const $ = (s,r=document) => r.querySelector(s), $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const esc=ui.esc, icon=ui.icon, names={all:'All frameworks',esx:'ESX Legacy',qbcore:'QBCore',qbox:'Qbox',standalone:'Standalone'};
  const key='ms-owner-v3';
  let saved={}; try { saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{}; } catch {}
  const state={framework:Object.hasOwn(names,saved.framework)?saved.framework:'all',compare:[],checks:{},reduced:saved.reduced===true};
  state.compare=(Array.isArray(saved.compare)?saved.compare:[]).filter((s,i,a)=>Object.hasOwn(data.products,s)&&ui.bySlug.has(s)&&a.indexOf(s)===i).slice(0,3);
  for (const slug of Object.keys(data.products)) state.checks[slug]=(Array.isArray(saved.checks?.[slug])?saved.checks[slug]:[]).filter((v,i,a)=>Number.isInteger(v)&&v>=0&&v<4&&a.indexOf(v)===i);
  const persist=()=>{try{sessionStorage.setItem(key,JSON.stringify(state));}catch{/* In-memory functionality stays available. */}};
  const osMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const reduced=()=>state.reduced||osMotion.matches;
  const effects=new WeakMap();
  function animate(el,kind='enter',delay=0){
    if(!el||reduced()||typeof el.animate!=='function')return;
    effects.get(el)?.cancel();
    const frame=kind==='drawer'?[{opacity:.7,transform:'translateX(22px)'},{opacity:1,transform:'none'}]:kind==='press'?[{transform:'scale(.96)'},{transform:'scale(1)'}]:[{opacity:.6,transform:'translateY(10px)'},{opacity:1,transform:'none'}];
    const a=el.animate(frame,{duration:kind==='press'?170:kind==='enter'?360:240,easing:'cubic-bezier(.2,.75,.25,1)',delay:Math.min(delay,140)});effects.set(el,a);
  }
  let revealObserver;
  const revealed=new WeakSet();
  function observeReveals(){
    if(reduced()||!('IntersectionObserver' in window))return;
    if(!revealObserver)revealObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){revealObserver.unobserve(e.target);if(!revealed.has(e.target)){revealed.add(e.target);animate(e.target);}}});},{threshold:.12});
    $$('.section-head,.showcase-item,.aircraft-row,.product-content-row').forEach(el=>{if(!revealed.has(el))revealObserver.observe(el);});
  }
  function syncMotion(){
    document.documentElement.dataset.motion=reduced()?'reduce':'full';
    $$('[data-motion-toggle]').forEach(b=>{b.setAttribute('aria-pressed',String(state.reduced));b.textContent=reduced()?'Motion reduced':'Motion on';b.title=osMotion.matches?'Your device requests reduced motion.':'Toggle reduced interface motion';});
    if(reduced()){
      document.getAnimations?.().forEach(a=>a.cancel());revealObserver?.disconnect();
      $$('video').forEach(v=>v.pause());$$('.media-frame.playing').forEach(f=>f.classList.remove('playing'));
      $$('[data-hero-motion],#viewer-motion').forEach(b=>{b.setAttribute('aria-pressed','false');b.innerHTML=icon('play')+' Play preview';});
    }else observeReveals();
  }
  window.MSMotion={reduced};
  window.MSOwner={matches:p=>state.framework==='all'||data.products[p.slug]?.frameworks.includes(state.framework),resetFramework:()=>{state.framework='all';persist();syncFrameworkControls();}};
  function options(value){return Object.entries(names).map(([k,v])=>`<option value="${k}" ${k===value?'selected':''}>${esc(v)}</option>`).join('');}
  function support(p){const spec=data.products[p.slug];if(!spec)return {text:'Check aircraft compatibility',kind:'unknown'};if(state.framework==='all')return {text:spec.kind,kind:'neutral'};return spec.frameworks.includes(state.framework)?{text:state.framework==='standalone'?'Standalone listed':`${names[state.framework]} listed`,kind:'match'}:{text:`${names[state.framework]} not listed`,kind:'unknown'};}
  const productURL=slug=>`products/${slug}/`;
  function sourceLink(p){return p.source?`<a href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">Original listing ↗</a>`:'';}
  function compareButton(p){return `<button class="compare-toggle" data-compare="${p.slug}" aria-pressed="${state.compare.includes(p.slug)}" aria-label="${state.compare.includes(p.slug)?'Remove':'Add'} ${esc(p.name)} ${state.compare.includes(p.slug)?'from':'to'} comparison"><span class="compare-check" aria-hidden="true">${state.compare.includes(p.slug)?'✓':'+'}</span> Compare</button>`;}
  document.body.insertAdjacentHTML('beforeend',`
    <dialog id="owner-search" class="owner-dialog command-dialog" aria-labelledby="command-title">
      <div class="owner-dialog-head"><div><span class="kicker">Find a resource</span><h2 id="command-title">Search MikeScripts</h2></div><button class="icon-button" data-owner-close aria-label="Close search">×</button></div>
      <label class="command-input">${icon('search')}<input id="command-query" type="search" placeholder="Aircraft, police, OneSync…" aria-label="Search product names and requirements" autocomplete="off"></label>
      <p class="command-count" id="command-count" aria-live="polite"></p><nav id="command-results" aria-label="Product search results"></nav>
      <div class="command-foot"><span>↑ ↓ navigate · Enter opens a product</span><kbd>Esc</kbd></div>
    </dialog>
    <dialog id="owner-compare" class="owner-dialog compare-dialog" aria-labelledby="compare-title"><div class="owner-dialog-head"><div><span class="kicker">Server planning</span><h2 id="compare-title">Compare resources</h2></div><button class="icon-button" data-owner-close aria-label="Close comparison">×</button></div><div id="compare-content"></div></dialog>
    <dialog id="owner-demo" class="owner-dialog demo-dialog" aria-labelledby="demo-title"><div class="owner-dialog-head"><div><span class="kicker">Advertised on the MikeScripts store</span><h2 id="demo-title">Try the demo server.</h2></div><button class="icon-button" data-owner-close aria-label="Close demo instructions">×</button></div><div class="owner-dialog-body"><p>Open FiveM’s console and paste the connection command below.</p><code class="demo-command"></code><button class="button primary" data-copy-demo>Copy connection command ${icon('arrow')}</button><p class="owner-fine">The address is taken from the official store. Server availability and installed demos are not checked here. Confirm the aircraft or script you want to try with MikeScripts.</p><a class="text-link" href="${esc(data.demo.source)}" target="_blank" rel="noopener noreferrer">Check the store’s current demo link ↗</a></div></dialog>
    <dialog id="owner-copy" class="owner-dialog copy-dialog" aria-labelledby="copy-title"><div class="owner-dialog-head"><div><span class="kicker">Copy manually</span><h2 id="copy-title">Your setup brief.</h2></div><button class="icon-button" data-owner-close aria-label="Close setup brief">×</button></div><div class="owner-dialog-body"><p>Automatic copying is unavailable in this browser. Select the text below and copy it.</p><textarea id="copy-content" readonly aria-label="Text to copy"></textarea><button class="button" data-select-copy>Select text</button></div></dialog>
    <aside id="compare-tray" class="compare-tray" aria-label="Comparison selection" hidden><span class="tray-label">Your shortlist</span><span id="compare-tray-items"></span><button class="button primary" data-open-compare>Compare <span data-compare-count>0</span> ${icon('arrow')}</button><button class="tray-clear" data-clear-compare aria-label="Clear comparison">×</button></aside>
    <aside id="owner-buy-dock" class="owner-buy-dock" aria-label="Product purchase shortcut" hidden></aside>
  `);
  $('.demo-command').textContent=data.demo.command;
  const head=$('.header-actions');head?.insertAdjacentHTML('afterbegin',`<button class="quick-search" data-open-search aria-label="Search products (Control or Command K)">${icon('search')}<kbd>Ctrl K</kbd></button>`);
  $('.site-header')?.insertAdjacentHTML('beforeend','<div class="reading-progress" aria-hidden="true"><i></i></div>');
  $('.footer-links')?.insertAdjacentHTML('beforeend','<button class="motion-toggle" data-motion-toggle aria-pressed="false">Motion on</button>');
  $('#mobile-nav')?.insertAdjacentHTML('beforeend','<button data-open-demo class="mobile-demo">Demo server instructions ↗</button>');
  let lastOpener=null;
  function openDialog(d,focus){lastOpener=document.activeElement;if(!d.open)d.showModal();animate(d,'dialog');focus?.focus();}
  function closeDialog(d){if(d?.open)d.close();}
  $$('.owner-dialog').forEach(d=>{d.addEventListener('close',()=>{if(lastOpener?.isConnected&&lastOpener instanceof HTMLElement)lastOpener.focus({preventScroll:true});});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
  function renderSearch(){
    const q=$('#command-query').value.trim().toLowerCase();
    const found=ui.products.filter(p=>`${p.name} ${p.code} ${p.summary} ${p.category} ${(data.products[p.slug]?.required||[]).join(' ')} ${p.tags.join(' ')}`.toLowerCase().includes(q));
    $('#command-count').textContent=`${found.length} ${found.length===1?'result':'results'} · Search includes all frameworks`;
    $('#command-results').innerHTML=found.length?found.map(p=>`<a href="${productURL(p.slug)}" data-route="${p.slug}" class="command-result"><span class="command-type">${esc(p.code)}</span><span><strong>${esc(p.name)}</strong><small>${esc(p.summary)}</small></span>${icon('arrow')}</a>`).join(''):'<p class="command-empty">No matching resource. Try “flight”, “fire” or “aircraft”.</p>';
  }
  function syncFrameworkControls(){
    $$('[data-server-framework]').forEach(s=>s.value=state.framework);
    $$('[data-framework-label]').forEach(e=>e.textContent=names[state.framework]);
  }
  function decorateGrid(){
    const cards=$$('.product-card');
    cards.forEach((el,i)=>{
      const p=ui.bySlug.get(el.dataset.productCard);if(!p)return;
      const match=support(p);
      let strip=$('.owner-card-strip',el);if(!strip){strip=document.createElement('div');strip.className='owner-card-strip';$('.product-info',el)?.append(strip);}
      strip.innerHTML=`<span class="support-status ${match.kind}">${match.kind==='match'?'<span aria-hidden="true">✓</span> ':''}${esc(match.text)}</span>${compareButton(p)}`;
      animate(el,'enter',i*35);
    });
    const count=$('#owner-result-count');if(count)count.textContent=`${cards.length} ${cards.length===1?'resource':'resources'} shown${state.framework==='all'?'':` · ${names[state.framework]}`}`;
    syncFrameworkControls();renderTray();
  }
  function ownerbar(){return `<div class="owner-toolbar"><div class="owner-profile"><span class="owner-profile-icon" aria-hidden="true">≡</span><div><label for="server-framework">YOUR SERVER</label><select id="server-framework" data-server-framework>${options(state.framework)}</select></div></div><span class="owner-toolbar-note">Filter by declared framework support.<small>This does not scan or verify your server.</small></span><button data-open-demo class="demo-trigger">Try the demo ${icon('arrow')}</button></div><div class="owner-results-line"><span id="owner-result-count" aria-live="polite"></span><button data-open-search class="text-link">Quick find <kbd>Ctrl K</kbd></button></div>`;}
  const checkLabels=['Review the framework and required dependencies.','Confirm the package contents and editable files.','Plan a backup and a staging-server test.','Read the bundled installation and permission setup.'];
  function productTools(p){
    const spec=data.products[p.slug];
    if(!spec)return;
    const match=support(p);
    if(!$('.owner-product-tools')){
      $('.compat')?.insertAdjacentHTML('afterend',`<div class="owner-product-tools"><label for="detail-framework">Your framework</label><select id="detail-framework" data-server-framework>${options(state.framework)}</select><p class="support-status ${match.kind}" id="detail-support">${esc(match.text)}</p><small>Based on the listing, not a server diagnostic.</small></div><div class="owner-detail-actions">${compareButton(p)}<button class="text-link" data-copy-brief="${p.slug}">Copy setup brief ↗</button></div>`);
    }else{const s=$('#detail-support');s.className=`support-status ${match.kind}`;s.textContent=match.text;}
    let tech=$('#owner-technical');
    if(!tech){
      $('#requirements')?.insertAdjacentHTML('beforeend',`<div id="owner-technical"><dl class="owner-specs"><div><dt>Required resources</dt><dd>${spec.required.length?spec.required.map(v=>`<code>${esc(v)}</code>`).join(' '):'No separate mandatory resource listed; check the original listing.'}</dd></div><div><dt>Optional / recommended</dt><dd>${esc(spec.optional.join(' · ')||'Not listed')}</dd></div><div><dt>Editable files</dt><dd>${esc(spec.editable)}</dd></div><div><dt>Protection</dt><dd>${esc(spec.protection)}</dd></div><div><dt>Setup notes</dt><dd>${esc(spec.setup)}</dd></div></dl><p class="owner-fine">Declared by MikeScripts · checked ${data.checked}. ${sourceLink(p)}. No compatibility with GTA V single-player is implied.</p></div><div class="install-checklist"><div class="checklist-heading"><h3>Before installing</h3><span id="checklist-count"></span></div><progress id="checklist-progress" max="4" value="0" aria-label="Personal pre-install checklist progress"></progress><div>${checkLabels.map((text,i)=>`<label class="checklist-item"><input type="checkbox" data-install-check="${i}" data-check-product="${p.slug}" ${state.checks[p.slug].includes(i)?'checked':''}><span>${esc(text)}</span></label>`).join('')}</div><p class="owner-fine">Personal planning checklist only. Ticking a box does not validate your server, install a resource or confirm a purchase.</p><button class="text-link" data-copy-brief="${p.slug}">Copy these setup notes ↗</button></div>`);
    }
    updateChecklist(p.slug);syncFrameworkControls();
    const select=$('#purchase-variant');if(select?.options.length===1){select.classList.add('sr-only');$('label[for="purchase-variant"]')?.classList.add('sr-only');}
    updateDock();
  }
  function updateChecklist(slug){const count=state.checks[slug].length;if($('#checklist-count'))$('#checklist-count').textContent=`${count}/4 noted`;if($('#checklist-progress'))$('#checklist-progress').value=count;}
  function setupBrief(slug){const p=ui.bySlug.get(slug),s=data.products[slug];if(!p||!s)return '';return [
    `MIKESCRIPTS — ${p.name}`,`My framework: ${names[state.framework]}`,`Declared support: ${s.frameworks.map(f=>names[f]).join(', ')}`,
    `Required: ${s.required.join(', ')||'No separate mandatory resource listed; confirm in the listing.'}`,`Optional / recommended: ${s.optional.join(', ')}`,`Editable: ${s.editable}`,`Protection: ${s.protection}`,`Setup: ${s.setup}`,
    '',...checkLabels.map((v,i)=>`[${state.checks[slug].includes(i)?'x':' '}] ${v}`),'',`Source: ${p.source}`,`Listing checked: ${data.checked}`,'Personal planning notes, not a server diagnostic or purchase confirmation.'
  ].join('\n');}
  async function copy(text,label='Copied.'){
    try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);ui.toast(label);}
    catch{$('#copy-title').textContent=text.startsWith('connect ')?'Connection command.':'Your setup brief.';$('#copy-content').value=text;openDialog($('#owner-copy'),$('#copy-content'));$('#copy-content').select();}
  }
  function renderTray(){
    const tray=$('#compare-tray');tray.hidden=!state.compare.length;
    $('#compare-tray-items').textContent=state.compare.map(s=>ui.bySlug.get(s).code).join(' · ');
    $('[data-compare-count]').textContent=state.compare.length;
    $$('[data-compare]').forEach(b=>{const yes=state.compare.includes(b.dataset.compare),p=ui.bySlug.get(b.dataset.compare);b.setAttribute('aria-pressed',String(yes));b.setAttribute('aria-label',`${yes?'Remove':'Add'} ${p.name} ${yes?'from':'to'} comparison`);const sign=$('.compare-check',b);if(sign)sign.textContent=yes?'✓':'+';});
    document.body.classList.toggle('has-owner-tray',!!state.compare.length);updateDockVisibility();
  }
  function renderComparison(){
    const selected=state.compare.map(s=>ui.bySlug.get(s));
    if(!selected.length){$('#compare-content').innerHTML='<div class="owner-dialog-body"><p>No resources selected. Use Compare on a product card to build a shortlist.</p></div>';return;}
    const row=(label,fn)=>`<tr><th scope="row">${label}</th>${selected.map(p=>`<td>${fn(p,data.products[p.slug])}</td>`).join('')}</tr>`;
    $('#compare-content').innerHTML=`<p class="compare-note">Technical information from the product listings. “Not listed” is not a tested incompatibility. Your framework: <strong>${esc(names[state.framework])}</strong>.</p><div class="compare-scroll" tabindex="0" role="region" aria-label="Scrollable resource comparison"><table class="compare-table"><caption class="sr-only">MikeScripts resource requirements and package contents comparison</caption><thead><tr><th scope="col">Server requirements</th>${selected.map(p=>`<th scope="col"><small>${esc(p.code)}</small><strong>${esc(p.name)}</strong><button data-compare="${p.slug}" class="comparison-remove" aria-label="Remove ${esc(p.name)} from comparison">Remove ×</button></th>`).join('')}</tr></thead><tbody>${row('Package',(p,s)=>esc(s.kind))}${row('Frameworks',(p,s)=>esc(s.frameworks.map(f=>names[f]).join(' · ')))}${row('Your framework',(p,s)=>esc(state.framework==='all'?'Choose a framework to check the listing.':s.frameworks.includes(state.framework)?'Listed — review dependencies below.':'Not listed — ask MikeScripts.'))}${row('Required',(p,s)=>esc(s.required.join(', ')||'No separate mandatory resource listed.'))}${row('Optional / recommended',(p,s)=>esc(s.optional.join(', ')))}${row('Editable files',(p,s)=>esc(s.editable))}${row('Protection',(p,s)=>esc(s.protection))}${row('Price',(p)=>esc(ui.price(ui.variantsFor(p)[0]?.id)||'Check current price on Tebex'))}${row('Details',(p)=>`<a class="text-link" data-route="${p.slug}" href="${productURL(p.slug)}">View product ${icon('arrow')}</a>`)}${row('Source',(p)=>sourceLink(p))}</tbody></table></div><div class="compare-bottom"><span>Listing check: ${data.checked} · No private server access required.</span><button class="text-link" data-clear-compare>Clear selection</button></div>`;
  }
  function updateDock(){
    const p=ui.active(),dock=$('#owner-buy-dock');if(!dock)return;
    const id=$('#purchase-variant')?.value,v=p&&ui.variantsFor(p).find(v=>v.id===id);
    if(!p||!v){dock.hidden=true;dock.replaceChildren();return;}
    dock.innerHTML=`<div><strong>${esc(p.name)}</strong><small>${esc(ui.price(v.id)||v.label)}</small></div><a class="button primary" data-buy="${v.id}" href="${ui.packageURL(v.id)}" target="_blank" rel="noopener noreferrer">${window.MSCommerce?.enabled?'Checkout':'View on Tebex'} ${icon('arrow')}</a>`;
    updateDockVisibility();
  }
  function updateDockVisibility(){const d=$('#owner-buy-dock'),block=$('.purchase-block');if(!d)return;d.hidden=!d.children.length||!!state.compare.length||!block||block.getBoundingClientRect().bottom>85;}
  function refresh(){
    if($('#catalog')&&!$('.owner-toolbar'))$('.catalog-tools')?.insertAdjacentHTML('beforebegin',ownerbar());
    const p=ui.active();if(p)productTools(p);else{$('#owner-buy-dock').hidden=true;$('#owner-buy-dock').replaceChildren();}
    decorateGrid();observeReveals();animate($('.hero .wrap'),'enter');
  }
  function selectFramework(value){state.framework=Object.hasOwn(names,value)?value:'all';persist();syncFrameworkControls();ui.refreshCatalog();if(ui.active())productTools(ui.active());if($('#owner-compare').open)renderComparison();}
  let scrollPending=false;
  function scrollTick(){if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;const total=document.documentElement.scrollHeight-innerHeight;const value=total>0?Math.max(0,Math.min(1,scrollY/total)):0;const line=$('.reading-progress i');if(line)line.style.transform=`scaleX(${value})`;$('.site-header')?.classList.toggle('is-scrolled',scrollY>30);updateDockVisibility();});}
  addEventListener('scroll',scrollTick,{passive:true});addEventListener('resize',scrollTick,{passive:true});
  document.addEventListener('click',e=>{
    const b=e.target.closest('button,a');if(!b)return;
    if(b.hasAttribute('data-open-search')){renderSearch();openDialog($('#owner-search'),$('#command-query'));}
    else if(b.hasAttribute('data-open-demo'))openDialog($('#owner-demo'));
    else if(b.hasAttribute('data-owner-close'))closeDialog(b.closest('dialog'));
    else if(b.hasAttribute('data-motion-toggle')){state.reduced=!state.reduced;persist();syncMotion();}
    else if(b.hasAttribute('data-copy-demo'))copy(data.demo.command,'Connection command copied.');
    else if(b.hasAttribute('data-copy-brief'))copy(setupBrief(b.dataset.copyBrief),'Setup brief copied.');
    else if(b.hasAttribute('data-select-copy')){$('#copy-content').focus();$('#copy-content').select();}
    else if(b.hasAttribute('data-compare')){
      const slug=b.dataset.compare;if(!data.products[slug])return;
      if(state.compare.includes(slug))state.compare=state.compare.filter(s=>s!==slug);else{if(state.compare.length>=3)return ui.toast('Compare up to three resources. Remove one to add another.');state.compare.push(slug);}
      persist();renderTray();animate(b,'press');if($('#owner-compare').open)renderComparison();
    }else if(b.hasAttribute('data-open-compare')){renderComparison();openDialog($('#owner-compare'));}
    else if(b.hasAttribute('data-clear-compare')){state.compare=[];persist();renderTray();if($('#owner-compare').open)renderComparison();}
    if(b.hasAttribute('data-route')){$$('.owner-dialog[open]').forEach(closeDialog);}
    if(b.hasAttribute('data-feature')){animate($('.hero .wrap'),'enter');animate($('#hero .hero-media'),'dialog');}
  });
  document.addEventListener('change',e=>{
    if(e.target.hasAttribute('data-server-framework'))selectFramework(e.target.value);
    if(e.target.hasAttribute('data-install-check')){const slug=e.target.dataset.checkProduct,index=Number(e.target.dataset.installCheck);if(!data.products[slug]||!Number.isInteger(index)||index<0||index>3)return;state.checks[slug]=state.checks[slug].filter(i=>i!==index);if(e.target.checked)state.checks[slug].push(index);persist();updateChecklist(slug);}
    if(e.target.id==='purchase-variant')updateDock();
  });
  $('#command-query').addEventListener('input',renderSearch);
  document.addEventListener('keydown',e=>{
    const typing=e.target instanceof HTMLElement&&(e.target.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
    if((e.key.toLowerCase()==='k'&&(e.ctrlKey||e.metaKey))||(e.key==='/'&&!typing&&!e.altKey&&!e.ctrlKey&&!e.metaKey)){
      if(document.querySelector('dialog[open]')&&!$('#owner-search').open)return;
      e.preventDefault();renderSearch();openDialog($('#owner-search'),$('#command-query'));return;
    }
    if($('#owner-search').open&&['ArrowDown','ArrowUp'].includes(e.key)){
      e.preventDefault();const links=$$('#command-results a');if(!links.length)return;const i=links.indexOf(document.activeElement),next=i<0?(e.key==='ArrowDown'?0:links.length-1):(i+(e.key==='ArrowDown'?1:-1)+links.length)%links.length;links[next].focus();
    }
    if($('#owner-search').open&&e.key==='Enter'&&e.target.id==='command-query'){e.preventDefault();$('#command-results a')?.click();}
  });
  // Keyboard focus and native dialogs remain immediate; animation never delays actions.
  const dialogs=new MutationObserver(entries=>entries.forEach(({target,attributeName})=>{if(attributeName==='open'&&target.open)animate(target,target.id==='cart-dialog'?'drawer':'dialog');}));
  $$('#cart-dialog,#media-dialog').forEach(d=>dialogs.observe(d,{attributes:true,attributeFilter:['open']}));
  document.addEventListener('ms:render',refresh);document.addEventListener('ms:grid',decorateGrid);
  document.addEventListener('ms:gallery',()=>animate($('.gallery-stage'),'dialog'));
  document.addEventListener('ms:prices',()=>{updateDock();if($('#owner-compare').open)renderComparison();});
  osMotion.addEventListener?.('change',syncMotion);
  syncMotion();refresh();if(state.framework!=='all')ui.refreshCatalog();scrollTick();
})();
