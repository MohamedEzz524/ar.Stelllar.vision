/* ============================================================================
   Stelllar Vision — brand-logos marquee. The client-logos section is a set of
   Framer Ticker <ul> rows the removed React runtime used to scroll. We rebuild
   each row cleanly from its logo image sources into FIXED-SIZE cells (explicit
   dimensions -> reliable measurement, no dependency on Framer's flex sizing or
   image-load timing) laid out with uniform margins as two identical halves, so
   a plain CSS translateX(0 -> -50%) loops seamlessly on every engine incl. iOS.
   ============================================================================ */
(function () {
  'use strict';

  function ensureStyle(){
    if(document.getElementById('sv-logos-style')) return;
    var s=document.createElement('style'); s.id='sv-logos-style';
    s.textContent='@keyframes svLogoL{from{transform:translateX(0)}to{transform:translateX(-50%)}}'
      +'@keyframes svLogoR{from{transform:translateX(-50%)}to{transform:translateX(0)}}'
      +'ul.sv-logos-track{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;'
      +'width:max-content!important;max-width:none!important;margin:0!important;padding:0!important;'
      +'list-style:none!important;direction:ltr!important;will-change:transform}'
      +'ul.sv-logos-track:hover{animation-play-state:paused}'
      +'.sv-logo{flex:0 0 auto;width:164px;height:74px;margin:0 16px;display:flex;align-items:center;justify-content:center}'
      +'.sv-logo img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;display:block;opacity:.92}'
      +'@media(max-width:620px){.sv-logo{width:116px;height:52px;margin:0 12px}}';
    document.head.appendChild(s);
  }

  function tickers(){
    return [].slice.call(document.querySelectorAll('ul')).filter(function(ul){
      return ul.querySelector('[data-framer-name^="Logos-"]');
    });
  }

  function collect(ul){
    var imgs=[].slice.call((ul.querySelector('li')||ul).querySelectorAll('img'));
    var seen={}, out=[];
    imgs.forEach(function(im){
      var src=im.getAttribute('src'); if(!src || seen[src]) return; seen[src]=1;
      out.push('<span class="sv-logo"><img src="'+src+'"'
        +(im.getAttribute('srcset')?' srcset="'+im.getAttribute('srcset').replace(/"/g,'&quot;')+'" sizes="150px"':'')
        +' alt="" decoding="async" loading="eager"></span>');
    });
    return out.join('');
  }

  function setup(ul, idx){
    var vw=Math.max(window.innerWidth||0, 360);
    if(!ul.__logos){ ul.__logos = collect(ul); }
    if(!ul.__logos) return;
    ul.classList.remove('sv-logos-track'); ul.style.animation='';
    ul.innerHTML = ul.__logos;                 // one set -> measure (cells are fixed-width, so reliable)
    ul.classList.add('sv-logos-track');
    var setW = ul.scrollWidth || (vw*0.9);
    var k=1; while(k*setW < vw*1.4 && k<24) k++; // copies so one HALF exceeds the viewport
    var html=''; for(var j=0;j<k*2;j++) html += ul.__logos; // two identical halves
    ul.innerHTML = html;
    var halfW = k*setW;
    var dur = Math.max(18, Math.round(halfW/60)); // ~60px/s
    ul.style.animation = (idx%2===0 ? 'svLogoL' : 'svLogoR') + ' ' + dur + 's linear infinite';
    ul.__logoIdx = idx;
  }

  function build(){
    var uls=tickers();
    if(!uls.length) return false;
    ensureStyle();
    uls.forEach(function(ul,i){ if(ul.__logoBuilt) return; ul.__logoBuilt=1; setup(ul,i); });
    return true;
  }
  function reflow(){ tickers().forEach(function(ul){ if(ul.__logoBuilt) setup(ul, ul.__logoIdx||0); }); }

  function init(){
    var n=0, iv=setInterval(function(){ if(build() || ++n>=16) clearInterval(iv); }, 600);
    window.addEventListener('load', reflow);
    var lastW=window.innerWidth;
    window.addEventListener('resize', function(){ if(window.innerWidth===lastW) return; lastW=window.innerWidth; reflow(); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
