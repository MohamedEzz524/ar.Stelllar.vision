/* ============================================================================
   Stelllar Vision — brand-logos marquee. The client-logos section is a set of
   Framer Ticker <ul> rows that the (removed) React runtime used to scroll; each
   <ul> ships with a single <li> set, so without the runtime they sit static.
   This duplicates each row and animates it with a plain CSS translateX marquee
   (works on every engine incl. iOS Safari), alternating direction per row.
   ============================================================================ */
(function () {
  'use strict';

  function ensureStyle(){
    if(document.getElementById('sv-logos-style')) return;
    var s=document.createElement('style'); s.id='sv-logos-style';
    s.textContent='@keyframes svLogoL{from{transform:translateX(0)}to{transform:translateX(-50%)}}'
      +'@keyframes svLogoR{from{transform:translateX(-50%)}to{transform:translateX(0)}}'
      +'ul.sv-logos-track{display:flex!important;flex-wrap:nowrap!important;width:max-content!important;max-width:none!important;margin:0!important;padding:0!important;list-style:none!important;direction:ltr!important;will-change:transform}'
      +'ul.sv-logos-track>li{flex:0 0 auto!important}'
      +'ul.sv-logos-track:hover{animation-play-state:paused}';
    document.head.appendChild(s);
  }

  function setup(ul, idx){
    var vw=Math.max(window.innerWidth||0, 360);
    if(!ul.__logoOrig) ul.__logoOrig = (ul.children[0]||{}).outerHTML || ul.innerHTML;
    if(!ul.__logoOrig) return;
    // reset to the single original set, measure it
    ul.classList.remove('sv-logos-track');
    ul.style.animation='';
    ul.innerHTML = ul.__logoOrig;
    var li=ul.children[0]; if(!li) return;
    var setW = li.getBoundingClientRect().width || (vw*0.9);
    // copies so ONE half exceeds the viewport, then mirror for a seamless -50% loop
    var k=1; while(k*setW < vw*1.35 && k<16) k++;
    ul.innerHTML = ul.__logoOrig.repeat(k*2);
    ul.classList.add('sv-logos-track');
    var halfW = k*setW;
    var dur = Math.max(22, Math.round(halfW/55));
    ul.style.animation = (idx%2===0 ? 'svLogoL' : 'svLogoR') + ' ' + dur + 's linear infinite';
    ul.__logoIdx = idx;
  }

  function tickers(){
    return [].slice.call(document.querySelectorAll('ul')).filter(function(ul){
      return ul.querySelector('[data-framer-name^="Logos-"]');
    });
  }

  function build(){
    var uls=tickers();
    if(!uls.length) return false;
    ensureStyle();
    uls.forEach(function(ul,i){ if(ul.__logoBuilt) return; ul.__logoBuilt=1; setup(ul,i); });
    return true;
  }

  function init(){
    var n=0, iv=setInterval(function(){ if(build() || ++n>=16) clearInterval(iv); }, 600);
    var lastW=window.innerWidth;
    window.addEventListener('resize', function(){
      if(window.innerWidth===lastW) return; lastW=window.innerWidth;   // ignore mobile URL-bar (height-only) resizes
      tickers().forEach(function(ul){ setup(ul, ul.__logoIdx||0); });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
