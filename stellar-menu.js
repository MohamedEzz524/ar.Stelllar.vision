/* ============================================================================
   Stelllar Vision — mobile menu. Replaces the hamburger toggle that Framer's
   React runtime used to power (removed during de-Framerize). Reuses Framer's
   existing hamburger button so position/breakpoint stay identical, and opens
   our own overlay wired to window.__go (defined by stellar-spa-nav).
   ============================================================================ */
(function () {
  'use strict';
  var LINKS = [['top','الرئيسية'],['svc','خدماتنا'],['work','أعمالنا'],['magnet','الدليل المجاني'],['cta','تواصل معنا']];
  var ov;

  function injectCss(){
    if(document.getElementById('sv-mmenu-style')) return;
    var s=document.createElement('style'); s.id='sv-mmenu-style';
    s.textContent='#sv-mmenu{position:fixed;inset:0;z-index:2147483600;display:none;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(8,8,10,.98);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);direction:rtl;font-family:Cairo,system-ui,sans-serif}'
      +'#sv-mmenu.open{display:flex}'
      +'#sv-mmenu .sv-mm-item{color:#fff;font-size:1.5rem;font-weight:600;padding:14px 34px;cursor:pointer;border-radius:12px;transition:color .2s}'
      +'#sv-mmenu .sv-mm-item:active{color:#c0c0c0}'
      +'#sv-mmenu-x{position:absolute;top:20px;left:18px;width:44px;height:44px;background:none;border:none;color:#fff;font-size:1.9rem;line-height:1;cursor:pointer}';
    document.head.appendChild(s);
  }
  function open(){ if(ov){ ov.classList.add('open'); document.documentElement.style.overflow='hidden'; } }
  function close(){ if(ov){ ov.classList.remove('open'); document.documentElement.style.overflow=''; } }

  function build(){
    if(document.getElementById('sv-mmenu')) return;
    injectCss();
    ov=document.createElement('div'); ov.id='sv-mmenu';
    var x=document.createElement('button'); x.id='sv-mmenu-x'; x.setAttribute('aria-label','إغلاق'); x.textContent='✕';
    x.addEventListener('click',close); ov.appendChild(x);
    LINKS.forEach(function(l){
      var d=document.createElement('div'); d.className='sv-mm-item'; d.setAttribute('role','link'); d.textContent=l[1];
      d.addEventListener('click',function(){ close(); if(window.__go) window.__go(l[0]); });
      ov.appendChild(d);
    });
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); }); // tap backdrop closes
    document.body.appendChild(ov);
  }

  function wireHam(){
    var h=document.querySelector('[data-framer-name="Hamburger/Close"]'); if(!h||h.__svWired) return;
    h.__svWired=1;
    var a=h.closest('a'); if(a) a.setAttribute('href','#'); // neutralize so spa-nav/calendar don't hijack the click
    var t=a||h; t.style.cursor='pointer';
    t.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); open(); });
  }

  function init(){
    build(); wireHam();
    var n=0, iv=setInterval(function(){ wireHam(); if(++n>=10) clearInterval(iv); }, 500);
    var lw=window.innerWidth;
    window.addEventListener('resize',function(){ if(window.innerWidth!==lw){ lw=window.innerWidth; close(); } });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
