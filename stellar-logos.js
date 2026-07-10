/* ============================================================================
   Stelllar Vision — brand-logos marquee. The client-logos section is a set of
   Framer Ticker <ul> rows the removed React runtime used to scroll. Each row
   ships one <li> whose logos are spread with space-between, so simply looping it
   leaves gaps. This FLATTENS the individual logo cells into one flex track with
   uniform margins (identical repeating unit) and duplicates it into two halves,
   so a plain CSS translateX(0 -> -50%) loops seamlessly on every engine (incl.
   iOS Safari). Rows alternate direction; the section's edge mask is kept.
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
      +'ul.sv-logos-track>*{flex:0 0 auto!important;margin:0 34px!important}'
      +'ul.sv-logos-track:hover{animation-play-state:paused}';
    document.head.appendChild(s);
  }

  function tickers(){
    return [].slice.call(document.querySelectorAll('ul')).filter(function(ul){
      return ul.querySelector('[data-framer-name^="Logos-"]');
    });
  }

  function setup(ul, idx){
    var vw=Math.max(window.innerWidth||0, 360);
    if(!ul.__cells){ // capture the individual logo cells (once) from the original set
      var firstLi=ul.querySelector('li')||ul;
      var cells=[].slice.call(firstLi.querySelectorAll('[data-framer-name^="Logos-"]'));
      ul.__cells = cells.map(function(c){ return c.outerHTML; }).join('');
    }
    if(!ul.__cells) return;
    ul.classList.remove('sv-logos-track'); ul.style.animation='';
    ul.innerHTML = ul.__cells;                 // one set -> measure it
    ul.classList.add('sv-logos-track');
    var setW = ul.scrollWidth || (vw*0.9);
    var k=1; while(k*setW < vw*1.4 && k<24) k++; // copies so one HALF exceeds the viewport
    var html=''; for(var j=0;j<k*2;j++) html += ul.__cells; // two identical halves
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

  function reflow(){ tickers().forEach(function(ul){ setup(ul, ul.__logoIdx||0); }); }

  function init(){
    var n=0, iv=setInterval(function(){ if(build() || ++n>=16) clearInterval(iv); }, 600);
    window.addEventListener('load', reflow); // re-measure once images have their final size
    var lastW=window.innerWidth;
    window.addEventListener('resize', function(){ if(window.innerWidth===lastW) return; lastW=window.innerWidth; reflow(); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
