/* ============================================================================
   Stelllar Vision — site behaviour. Clean, dependency-free.
   Marquees (seamless CSS loops), mobile menu, smooth-scroll, scroll-reveal.
   ============================================================================ */
(function () {
  'use strict';
  var HEADER = 72;

  /* ---------- marquees: turn one set of items into two seamless halves ---------- */
  function buildMarquee(track) {
    var vw = Math.max(window.innerWidth || 0, 360);
    if (!track.__set) track.__set = track.innerHTML;   // remember the authored set
    track.style.animation = '';
    track.innerHTML = track.__set;                     // one set -> measure it
    var setW = track.scrollWidth || vw;
    var k = 1; while (k * setW < vw * 1.4 && k < 24) k++; // one half must exceed the viewport
    var half = ''; for (var i = 0; i < k; i++) half += track.__set;
    track.innerHTML = half + half;                     // two identical halves -> -50% is seamless
    var halfW = k * setW;
    var speed = parseFloat(track.getAttribute('data-speed')) || 50; // px/sec
    var dur = Math.max(14, Math.round(halfW / speed));
    var dir = track.getAttribute('data-dir') === 'right' ? 'marq-right' : 'marq-left';
    track.style.animation = dir + ' ' + dur + 's linear infinite';
  }
  function allMarquees() { return [].slice.call(document.querySelectorAll('[data-marquee]')); }
  function buildAll() { allMarquees().forEach(buildMarquee); }

  /* ---------- mobile menu ---------- */
  function menu() {
    var burger = document.querySelector('.burger');
    var m = document.querySelector('.m-menu');
    if (!burger || !m) return;
    function open() { m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true'); document.documentElement.style.overflow = 'hidden'; }
    function close() { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false'); document.documentElement.style.overflow = ''; }
    burger.addEventListener('click', open);
    m.querySelector('.m-close').addEventListener('click', close);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    [].slice.call(m.querySelectorAll('a')).forEach(function (a) {
      a.addEventListener('click', function (e) { close(); smoothTo(a.getAttribute('href'), e); });
    });
  }

  /* ---------- smooth scroll with sticky-header offset ---------- */
  function smoothTo(hash, e) {
    if (!hash || hash.charAt(0) !== '#') return;
    var el = document.getElementById(hash.slice(1));
    if (!el) return;
    if (e) e.preventDefault();
    var y = el.getBoundingClientRect().top + window.pageYOffset - HEADER - 8;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', hash);
  }
  function wireAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var h = a.getAttribute('href');
      if (h && h.length > 1 && document.getElementById(h.slice(1))) smoothTo(h, e);
    });
  }

  /* ---------- scroll reveal ---------- */
  function reveal() {
    var els = [].slice.call(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- init ---------- */
  function init() {
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    buildAll();
    menu();
    wireAnchors();
    reveal();
    // re-fit marquees on real width change (ignore mobile URL-bar height changes)
    var lastW = window.innerWidth;
    window.addEventListener('resize', function () { if (window.innerWidth === lastW) return; lastW = window.innerWidth; buildAll(); });
    // images loading can change pill width slightly; refit once everything settles
    window.addEventListener('load', buildAll);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
