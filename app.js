const pages=['home','flight','police','fire'];

const flightMedia=[
  {src:'assets/flight/cockpit.svg',label:'GLASS COCKPIT',note:'Replace with a 6–10 second real cockpit clip.'},
  {src:'assets/flight/hero.svg',label:'AUTOPILOT + AUTOLAND',note:'Replace with your clean final approach / touchdown footage.'},
  {src:'assets/flight/hero.svg',label:'AI TRAFFIC',note:'Replace with a busy airport shot showing AI aircraft moving.'},
  {src:'assets/flight/company.svg',label:'PRIVATE COMPANIES',note:'Replace with company UI, fleet ownership and hangar footage.'},
  {src:'assets/flight/hero.svg',label:'AIRPORT BUILDER',note:'Replace with before → configure → operational airport footage.'},
  {src:'assets/flight/atc.svg',label:'ATC + RADAR',note:'Replace with your real ATC radar and controller view.'},
  {src:'assets/flight/hero.svg',label:'GROUND SERVICES',note:'Replace with pushback, fuel, catering, baggage and turnaround footage.'}
];

function installFlightMediaStyles(){
  if(document.getElementById('flight-media-styles'))return;
  const s=document.createElement('style');
  s.id='flight-media-styles';
  s.textContent=`
    #page-flight .hero{background-size:cover!important;background-position:center!important;background-attachment:fixed!important}
    #page-flight .hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,7,8,.86) 0%,rgba(5,7,8,.54) 42%,rgba(5,7,8,.30) 72%,rgba(5,7,8,.55) 100%);z-index:1;pointer-events:none}
    #page-flight .hero .grid,#page-flight .hero .hero-orb,#page-flight .hero .ghost,#page-flight .hero .hero-copy,#page-flight .hero .scrollcue{z-index:2}
    #page-flight .flight-media-visual{background-size:cover!important;background-position:center!important;border-color:rgba(85,245,157,.20)!important}
    #page-flight .flight-media-visual:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.06) 38%,rgba(0,0,0,.78) 100%);z-index:1}
    #page-flight .media-caption{position:absolute;z-index:2;left:24px;right:24px;bottom:22px;padding-top:16px;border-top:1px solid rgba(255,255,255,.16)}
    #page-flight .media-caption b{display:block;font-size:12px;letter-spacing:.20em;color:#55f59d;margin-bottom:7px}
    #page-flight .media-caption span{font-size:13px;color:#d5dee2;line-height:1.5}
    #page-flight .flight-showcase{padding:13vh 4.5vw;background:#070a0c;border-top:1px solid var(--line)}
    #page-flight .flight-showcase .intro{max-width:960px}
    #page-flight .flight-showcase h2{font-size:clamp(54px,8vw,122px);line-height:.88;letter-spacing:-.06em;margin:14px 0}
    #page-flight .flight-showcase .lead{max-width:780px;color:#98a5ad;font-size:18px;line-height:1.75}
    #page-flight .flight-media-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:54px}
    #page-flight .flight-media-card{position:relative;min-height:460px;border:1px solid var(--line);border-radius:28px;overflow:hidden;background:#0b0f12}
    #page-flight .flight-media-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease}
    #page-flight .flight-media-card:hover img{transform:scale(1.035)}
    #page-flight .flight-media-card:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02) 25%,rgba(4,7,8,.88) 100%)}
    #page-flight .flight-card-copy{position:absolute;z-index:2;left:26px;right:26px;bottom:24px}
    #page-flight .flight-card-copy small{color:#55f59d;font-size:10px;font-weight:900;letter-spacing:.20em}
    #page-flight .flight-card-copy h3{font-size:clamp(30px,3.3vw,54px);line-height:.94;letter-spacing:-.045em;margin:10px 0}
    #page-flight .flight-card-copy p{color:#c0cbd0;line-height:1.6;margin:0;max-width:650px}
    #page-flight .placeholder-note{margin-top:14px;color:#fff;font-size:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.14)}
    @media(max-width:900px){#page-flight .hero{background-attachment:scroll!important}#page-flight .flight-media-grid{grid-template-columns:1fr}#page-flight .flight-media-card{min-height:360px}}
  `;
  document.head.appendChild(s);
}

function setupFlightMedia(){
  installFlightMediaStyles();
  const page=document.getElementById('page-flight');
  if(!page)return;
  const hero=page.querySelector('.hero');
  if(hero)hero.style.backgroundImage="linear-gradient(180deg,rgba(4,8,10,.08),rgba(4,7,8,.46)),url('assets/flight/hero.svg')";

  const visuals=[...page.querySelectorAll('.visuals .visual')];
  visuals.forEach((v,i)=>{
    const m=flightMedia[i];if(!m)return;
    v.classList.add('flight-media-visual');
    v.style.backgroundImage=`url('${m.src}')`;
    if(!v.dataset.mediaReady){
      v.innerHTML=`<div class="media-caption"><b>${m.label}</b><span>${m.note}</span></div>`;
      v.dataset.mediaReady='1';
    }
  });

  if(!page.querySelector('.flight-showcase')){
    const subs=page.querySelector('.subscriptions');
    if(subs){
      const sec=document.createElement('section');
      sec.className='flight-showcase';
      sec.innerHTML=`
        <div class="intro reveal">
          <div class="kicker">TEMPORARY VISUAL DIRECTION</div>
          <h2>See what the final<br>Flight page can become.</h2>
          <p class="lead">These generated images are intentionally being used as placeholders. When you record the real MS Flight systems, we can replace each file one-for-one without changing the layout.</p>
        </div>
        <div class="flight-media-grid">
          ${flightMedia.map((m,i)=>`<article class="flight-media-card reveal"><img src="${m.src}" alt="${m.label} placeholder"><div class="flight-card-copy"><small>0${i+1} / ${m.label}</small><h3>${['Cockpit systems.','Automated flight.','Living airspace.','Own the operation.','Build the airport.','Control the sky.','Work the ramp.'][i]}</h3><p>${m.note}</p><div class="placeholder-note">GENERATED PLACEHOLDER — SWAP THIS WITH YOUR REAL GAMEPLAY LATER</div></div></article>`).join('')}
        </div>`;
      subs.before(sec);
    }
  }
}

function go(n){
  if(!pages.includes(n))n='home';
  pages.forEach(p=>document.getElementById('page-'+p).classList.toggle('active',p===n));
  document.documentElement.style.setProperty('--accent',document.getElementById('page-'+n).dataset.accent||'#f4f6f7');
  location.hash=n;
  window.scrollTo(0,0);
  init();
}

document.querySelectorAll('[data-page]').forEach(e=>e.onclick=()=>go(e.dataset.page));
document.getElementById('plansBtn').onclick=()=>document.querySelector('.page.active .subscriptions')?.scrollIntoView({behavior:'smooth'});
document.getElementById('topBtn').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});

let io;
function init(){
  setupFlightMedia();
  io?.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')),{threshold:.15});
  document.querySelectorAll('.page.active .reveal').forEach(e=>io.observe(e));

  document.querySelectorAll('.page.active [data-story]').forEach(w=>{
    w.u=()=>{
      const r=w.getBoundingClientRect();
      const p=Math.max(0,Math.min(1,-r.top/Math.max(1,w.offsetHeight-innerHeight)));
      const t=[...w.querySelectorAll('.story-text')];
      const s=[...w.querySelectorAll('.story-bg')];
      const v=[...w.querySelectorAll('.visual')];
      const i=Math.min(t.length-1,Math.floor(p*t.length));
      t.forEach((e,x)=>e.classList.toggle('active',x===i));
      s.forEach((e,x)=>e.classList.toggle('active',x===i));
      v.forEach((e,x)=>e.classList.toggle('active',x===i));
      const b=w.querySelector('.progress i');if(b)b.style.width=p*100+'%';
    };
    w.u();
  });

  document.querySelectorAll('.page.active .horizontal').forEach(w=>{
    const t=w.querySelector('.reel-track');
    w.u=()=>{
      const r=w.getBoundingClientRect();
      const p=Math.max(0,Math.min(1,-r.top/Math.max(1,w.offsetHeight-innerHeight)));
      const m=Math.max(0,t.scrollWidth-innerWidth+innerWidth*.08);
      t.style.transform='translateX('+(-m*p)+'px)';
    };
    w.u();
  });
}

function tick(){document.querySelectorAll('.page.active [data-story],.page.active .horizontal').forEach(e=>e.u&&e.u())}
addEventListener('scroll',tick,{passive:true});
addEventListener('resize',tick);
addEventListener('load',()=>go(pages.includes(location.hash.slice(1))?location.hash.slice(1):'home'));