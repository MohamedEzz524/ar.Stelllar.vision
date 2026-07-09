/* ============================================================================
   Stelllar Vision — projects showcase. Full-width TWO-ROW marquee: the rows
   scroll in opposite directions with faded side masks. Cards take each image's
   natural aspect ratio (fixed height, auto width) so screenshots aren't clipped.
   RTL page, but tracks are LTR to avoid the RTL overflow bug; pills stay RTL.
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
  .pj-section{direction:rtl;font-family:Cairo,system-ui,sans-serif;width:100%;padding:64px 0;box-sizing:border-box;overflow:hidden}\
  .pj-head{text-align:center;margin-bottom:40px;padding:0 20px}\
  .pj-head h2{font-family:"Space Grotesk",Cairo,sans-serif;font-weight:700;font-size:clamp(2rem,4vw,3.1rem);color:#fff;margin:0 0 10px;letter-spacing:-.01em}\
  .pj-head h2 .g{color:#c0c0c0}\
  .pj-head p{color:#9a9a9f;font-size:.98rem;margin:0}\
  .pj-rows{position:relative;left:50%;transform:translateX(-50%);width:100vw;max-width:100vw;display:flex;flex-direction:column;gap:22px}\
  .pj-row{overflow:hidden;width:100%;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}\
  .pj-track{display:flex;flex-wrap:nowrap;width:max-content;direction:ltr;gap:20px;padding:6px 0;will-change:transform}\
  .pj-track.pjL{animation:pjLmove linear infinite}\
  .pj-track.pjR{animation:pjRmove linear infinite}\
  .pj-track:hover{animation-play-state:paused}\
  @keyframes pjLmove{from{transform:translateX(0)}to{transform:translateX(-50%)}}\
  @keyframes pjRmove{from{transform:translateX(-50%)}to{transform:translateX(0)}}\
  .pj-card{flex:0 0 auto;position:relative;height:230px;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.10);text-decoration:none;background:#0c0c0d;box-shadow:0 20px 44px -20px rgba(0,0,0,.9);transition:transform .4s ease,border-color .4s ease}\
  .pj-card img{display:block;height:100%;width:auto;max-width:none;object-fit:contain}\
  .pj-card:hover{transform:translateY(-5px);border-color:rgba(192,192,192,.55)}\
  .pj-ov{position:absolute;inset:0;direction:rtl;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:8px;padding:16px;background:linear-gradient(to top,rgba(0,0,0,.86),rgba(0,0,0,.12) 55%,transparent);pointer-events:none}\
  .pj-title{font-family:"Space Grotesk",Cairo,sans-serif;font-weight:700;font-size:1.12rem;color:#fff;margin:0;text-shadow:0 2px 12px rgba(0,0,0,.6)}\
  .pj-tag{background:rgba(20,20,22,.72);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(6px);color:#e5e5e8;font-size:.72rem;padding:5px 12px;border-radius:999px}\
  @media(max-width:620px){.pj-card{height:176px}.pj-title{font-size:.98rem}.pj-rows{gap:16px}}\
  .framer-d8kaby,[data-framer-name="Portfolio"]{display:none !important}\
  ';

  function killGallery(){
    [].slice.call(document.querySelectorAll('[data-framer-name="Portfolio"],.framer-d8kaby')).forEach(function(e){
      if(e.parentElement) e.parentElement.removeChild(e);
    });
  }

  function fixCreative(){
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

  function card(p){
    return '<a class="pj-card" href="'+p.href+'" target="_blank" rel="noreferrer">'+
      '<img src="'+p.img+'" alt="'+p.t+'" loading="lazy">'+
      '<span class="pj-ov"><span class="pj-title">'+p.t+'</span><span class="pj-tag">'+p.tag+'</span></span>'+
    '</a>';
  }
  function row(items, dir){
    var doubled=items.concat(items); // duplicate for a seamless -50% loop
    return '<div class="pj-row"><div class="pj-track '+dir+'">'+doubled.map(card).join('')+'</div></div>';
  }

  function build(){
    killGallery();
    if(document.getElementById('work')) return true;
    var h=[].slice.call(document.querySelectorAll('h1,h2,h3,h4,p,span')).filter(function(e){ return e.textContent&&e.textContent.indexOf('إبداع')>=0&&e.getClientRects().length&&e.children.length<=2; })[0];
    if(!h) return false;
    var sec=h; for(var i=0;i<12&&sec.parentElement;i++){ sec=sec.parentElement; if(sec.offsetHeight>460&&sec.offsetHeight<1600) break; }
    if(!sec||sec.offsetHeight>1600||sec===document.body) return false;
    if(sec.__pjDone) return true; sec.__pjDone=true;

    var half=Math.ceil(P.length/2);
    var wrap=document.createElement('div'); wrap.className='pj-section';
    wrap.innerHTML='<div class="pj-head"><h2>أعمالنا <span class="g">المميزة</span></h2>'+
      '<p>مجموعة من العلامات التي صمّمناها وبنيناها وساعدناها على النمو.</p></div>'+
      '<div class="pj-rows">'+row(P.slice(0,half),'pjL')+row(P.slice(half),'pjR')+'</div>';
    sec.innerHTML=''; sec.style.background='transparent'; sec.style.padding='0'; sec.style.overflow='hidden'; sec.style.maxWidth='none'; sec.style.width='100%';
    sec.appendChild(wrap);
    sec.setAttribute('id','work');

    // constant speed + seamless: duration from measured half-width (~45px/s)
    [].slice.call(wrap.querySelectorAll('.pj-track')).forEach(function(tr){
      var halfW=(tr.scrollWidth/2)||1400;
      tr.style.animationDuration=Math.max(30, Math.round(halfW/45))+'s';
    });
    return true;
  }

  function init(){
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
    var tries=0; var iv=setInterval(function(){ build(); fixCreative(); if(++tries>=18) clearInterval(iv); }, 700);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
