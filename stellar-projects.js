/* ============================================================================
   Stelllar Vision — projects showcase. Replaces the old creative gallery with a
   card grid (image + title + subtitle + icon + tag), using the agency's real
   projects. RTL, black/white/silver, matches stelllar.vision project data.
   ============================================================================ */
(function () {
  'use strict';
  var P = [
    {t:'Two Fashion', s:'متجر إلكتروني', tag:'أزياء', img:'/projects/two.webp', href:'https://two.stelllar.vision'},
    {t:'Laundor', s:'متجر إلكتروني', tag:'أحذية', img:'/projects/laundor.webp', href:'https://laundor.stelllar.vision'},
    {t:'Crown Natural Care', s:'متجر إلكتروني', tag:'عناية طبيعية', img:'/projects/crown.webp', href:'https://crownnaturalcare.stelllar.vision'},
    {t:'Goga Toys', s:'متجر وهوية بصرية', tag:'ألعاب', img:'/projects/goga.webp', href:'https://gogatoys.stelllar.vision'},
    {t:'Steelixe', s:'متجر ونمذجة ثلاثية', tag:'3D · تجارة', img:'/projects/steelixe.webp', href:'https://steelixe.com'},
    {t:'Performance LP', s:'موقع منتج رقمي', tag:'تسويق', img:'/projects/performance.webp', href:'https://performancemarketerlp.stelllar.vision'},
    {t:'Greennest', s:'أثاث · متجر إلكتروني', tag:'أثاث', img:'/projects/greennest.webp', href:'https://greennest.stelllar.vision'},
    {t:'Ultraman Trimmer', s:'تطوير موقع', tag:'منتج', img:'/projects/ultraman.webp', href:'https://ultraman.stelllar.vision'},
    {t:'Smilemakers', s:'توليد عملاء وهوية', tag:'عيادات', img:'/projects/smile.webp', href:'https://smilywhite.stelllar.vision'},
    {t:'Maroof Optics', s:'متجر إلكتروني', tag:'نظارات', img:'/projects/maroof.webp', href:'https://maroofoptics.stelllar.vision'},
    {t:'Fohosat Lab', s:'موقع توليد عملاء', tag:'معامل', img:'/projects/fohosat.webp', href:'https://fohosatlab.stelllar.vision'},
    {t:'Nafas', s:'تطوير موقع', tag:'صحة', img:'/projects/nafas.webp', href:'https://nafas.stelllar.vision'},
    {t:'Cozy Fragrances', s:'متجر إلكتروني', tag:'عطور', img:'/projects/cozy.webp', href:'https://cozyfragrance.stelllar.vision'},
    {t:'Mahla Cosmetics', s:'متجر إلكتروني', tag:'تجميل', img:'/projects/mahla.webp', href:'https://mahlacosmetics.stelllar.vision'},
    {t:'Flexieve', s:'متجر إلكتروني', tag:'أزياء', img:'/projects/flexieve.webp', href:'https://flexieve.stelllar.vision'}
  ];

  var css='\
  .pj-section{direction:rtl;font-family:Cairo,system-ui,sans-serif;width:100%;max-width:1240px;margin:0 auto;padding:20px 20px 10px;box-sizing:border-box}\
  .pj-head{text-align:center;margin-bottom:36px}\
  .pj-head h2{font-family:"Space Grotesk",Cairo,sans-serif;font-weight:700;font-size:clamp(2rem,4vw,3.1rem);color:#fff;margin:0 0 10px;letter-spacing:-.01em}\
  .pj-head h2 .g{color:#c0c0c0}\
  .pj-head p{color:#9a9a9f;font-size:.98rem;margin:0}\
  .pj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}\
  @media(max-width:980px){.pj-grid{grid-template-columns:repeat(2,1fr)}}\
  @media(max-width:620px){.pj-grid{grid-template-columns:1fr}}\
  .pj-card{position:relative;display:block;aspect-ratio:5/4;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,.10);text-decoration:none;isolation:isolate;background:#0c0c0d;box-shadow:0 22px 48px -18px rgba(0,0,0,.9),0 4px 14px -6px rgba(0,0,0,.7);transition:transform .5s ease,box-shadow .5s ease,border-color .5s ease}\
  .pj-card .pj-img{position:absolute;inset:0;background-size:cover;background-position:center;filter:none;transition:transform .6s ease;z-index:0}\
  .pj-card::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.9) 0%,rgba(0,0,0,.42) 46%,rgba(0,0,0,.24) 100%);z-index:1}\
  .pj-card:hover .pj-img{transform:scale(1.06)}\
  .pj-card:hover{border-color:rgba(192,192,192,.55);transform:translateY(-6px);box-shadow:0 34px 70px -20px rgba(0,0,0,.95),0 0 42px -12px rgba(192,192,192,.28)}\
  .pj-body{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;padding:24px;text-align:right}\
  .pj-title{font-family:"Space Grotesk",Cairo,sans-serif;font-weight:700;font-size:1.55rem;line-height:1.1;color:#fff;margin:0;text-shadow:0 2px 16px rgba(0,0,0,.6)}\
  .pj-sub{color:#eaeaec;font-size:.9rem;margin:8px 0 0;text-shadow:0 1px 12px rgba(0,0,0,.55)}\
  .pj-foot{display:flex;align-items:center;justify-content:space-between;gap:10px}\
  .pj-icon{width:40px;height:40px;border-radius:50%;background:#c0c0c0;color:#000;display:flex;align-items:center;justify-content:center;font-size:18px;flex:none;box-shadow:0 0 18px -4px rgba(192,192,192,.5)}\
  .pj-tag{background:rgba(20,20,22,.75);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(6px);color:#e5e5e8;font-size:.78rem;padding:7px 14px;border-radius:999px;white-space:nowrap}\
  .framer-d8kaby,[data-framer-name="Portfolio"]{display:none !important}\
  ';

  function killGallery(){
    // The old "Creative" section keeps its ad-creatives marquee (Portfolio) as a
    // sibling of the heading we replace — remove it so only the new grid remains.
    [].slice.call(document.querySelectorAll('[data-framer-name="Portfolio"],.framer-d8kaby')).forEach(function(e){
      if(e.parentElement) e.parentElement.removeChild(e);
    });
  }

  function fixCreative(){
    // The old "Creative Built for Conversion" heading survives above the hidden
    // gallery. Reword it clearly (drop the jargon "التحويل") and center it.
    var h=[].slice.call(document.querySelectorAll('h1,h2,h3,h4,p,div,span')).filter(function(e){
      var t=e.textContent||''; return t.indexOf('التحويل')>=0 && t.indexOf('إبداع')>=0 && t.length<60 && e.getClientRects().length;
    }).sort(function(a,b){ return (a.textContent||'').length-(b.textContent||'').length; })[0];
    if(!h) return;
    if((h.textContent||'').indexOf('مبيعاتك')<0){
      h.innerHTML='<span style="color:#fff;font-family:\'Space Grotesk\',Cairo,sans-serif;font-weight:700;font-size:clamp(1.9rem,3.6vw,2.9rem);line-height:1.15;letter-spacing:-.01em">إبداعٌ يصنع <span style="color:#c0c0c0">مبيعاتك</span></span>';
      h.style.textAlign='center'; h.style.fontSize='clamp(1.9rem,3.6vw,2.9rem)';
    }
    var sec=h;
    for(var i=0;i<5&&sec.parentElement;i++){ sec=sec.parentElement;
      if(sec.tagName==='SECTION'||(sec.getAttribute&&sec.getAttribute('data-framer-name')==='portfolio')) break; }
    if(sec && !sec.__svCenter){ sec.__svCenter=true;
      sec.style.display='flex'; sec.style.flexDirection='column';
      sec.style.alignItems='center'; sec.style.justifyContent='center';
      sec.style.minHeight='240px'; sec.style.textAlign='center';
    }
  }

  function build(){
    killGallery();
    if(document.getElementById('work')) return true;   // idempotent: grid already built
    var h=[].slice.call(document.querySelectorAll('h1,h2,h3,h4,p,span')).filter(function(e){ return e.textContent&&e.textContent.indexOf('إبداع')>=0&&e.getClientRects().length&&e.children.length<=2; })[0];
    if(!h) return false;
    var sec=h; for(var i=0;i<12&&sec.parentElement;i++){ sec=sec.parentElement; if(sec.offsetHeight>460&&sec.offsetHeight<1600) break; }
    if(!sec||sec.offsetHeight>1600||sec===document.body) return false;  // safety: never replace a page-sized container
    if(sec.__pjDone) return true; sec.__pjDone=true;
    var wrap=document.createElement('div'); wrap.className='pj-section';
    var ARR='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M9 7h8v8"/></svg>';
    var cards=P.map(function(p){
      return '<a class="pj-card" href="'+p.href+'" target="_blank" rel="noreferrer">'+
        '<div class="pj-img" style="background-image:url('+p.img+')"></div>'+
        '<div class="pj-body">'+
          '<div><h3 class="pj-title">'+p.t+'</h3></div>'+
          '<div class="pj-foot"><span class="pj-icon">'+ARR+'</span><span class="pj-tag">'+p.tag+'</span></div>'+
        '</div></a>';
    }).join('');
    wrap.innerHTML='<div class="pj-head"><h2>أعمالنا <span class="g">المميزة</span></h2><p>مجموعة من العلامات التي صمّمناها وبنيناها وساعدناها على النمو.</p></div><div class="pj-grid">'+cards+'</div>';
    sec.innerHTML=''; sec.style.background='transparent'; sec.style.padding='70px 0'; sec.style.overflow='visible';
    sec.appendChild(wrap);
    sec.setAttribute('id','work');
    return true;
  }

  function init(){
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
    var tries=0; var iv=setInterval(function(){ build(); fixCreative(); if(++tries>=18) clearInterval(iv); }, 700);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
