/* ============================================================================
   Stelllar Vision — real agency stats. Replaces the template's animated-counter
   block (التسليم/سنوات خبرة/عميل سعيد/مشروع منجز) with the agency's real numbers.
   Self-contained grid injected at runtime (avoids fighting the Framer counter).
   ============================================================================ */
(function () {
  'use strict';
  var STATS = [
    { pfx: '+', num: '100', lbl: 'متجر' },
    { pfx: '+', num: '80',  lbl: 'عميل سعيد' },
    { pfx: '+', num: '5',   lbl: 'سنوات خبرة' }
  ];
  // the four original labels used to locate the stats container
  var MARKERS = ['التسليم', 'سنوات خبرة', 'عميل سعيد', 'مُنجَز'];

  var css = '\
  .sv-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;direction:rtl;font-family:Cairo,sans-serif;width:100%;box-sizing:border-box}\
  @media(max-width:640px){.sv-stats{grid-template-columns:1fr}}\
  .sv-stat{background:#0e0e10;border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:38px 20px;text-align:center}\
  .sv-stat .num{font-family:"Space Grotesk",Cairo,sans-serif;font-weight:700;font-size:clamp(2.6rem,5vw,3.6rem);color:#fff;line-height:1;letter-spacing:-.02em;direction:ltr;display:inline-block}\
  .sv-stat .num .pfx{color:#c0c0c0;margin-inline-end:2px}\
  .sv-stat .lbl{color:#9a9a9f;font-size:1.02rem;margin-top:14px}\
  ';

  function findContainer() {
    var leaf = [].slice.call(document.querySelectorAll('p,div,span')).filter(function (e) {
      return (e.textContent || '').trim() === 'عميل سعيد' && e.getClientRects().length;
    })[0];
    if (!leaf) return null;
    var sec = leaf;
    for (var i = 0; i < 10 && sec.parentElement; i++) {
      sec = sec.parentElement;
      var t = sec.textContent || '';
      if (MARKERS.every(function (m) { return t.indexOf(m) >= 0; })) return sec;
    }
    return null;
  }

  function build() {
    var c = findContainer();
    if (!c) return false;
    if (c.__svStats) return true;
    // sanity: container should be the stats row, not a giant section
    if ((c.textContent || '').replace(/\s+/g, '').length > 120) {
      // walked too far or extra content — still proceed only if it's clearly the stats grid
    }
    c.__svStats = true;
    var cards = STATS.map(function (s) {
      return '<div class="sv-stat"><div class="num"><span class="pfx">' + s.pfx + '</span>' + s.num + '</div>' +
             '<div class="lbl">' + s.lbl + '</div></div>';
    }).join('');
    var wrap = document.createElement('div'); wrap.className = 'sv-stats';
    wrap.innerHTML = cards;
    c.innerHTML = '';
    c.style.display = 'block';
    c.appendChild(wrap);
    return true;
  }

  function init() {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    var tries = 0;
    var iv = setInterval(function () { if (build() || ++tries >= 16) clearInterval(iv); }, 700);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
