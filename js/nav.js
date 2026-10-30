/* ===========================================================
   DRY navigation
   -----------------------------------------------------------
   Problem: with 4 pages, copying the same <header> into every
   file means fixing a typo 4 times and forgetting one of them.

   Solution: the nav lives here, once. Every page only has

       <header class="nav" id="siteNav"></header>

   and this script fills it in, marks the current page with
   aria-current="page", and wires up the mobile drawer.

   This file must load BEFORE js/main.js (both are deferred,
   so document order is enough): main.js looks for the theme
   button that this script creates.
   =========================================================== */

(function () {
  'use strict';

  /* ---------- the only place the navigation is defined ---------- */
  var BRAND = 'Chuai Zhuoyang';
  var BRAND_HREF = 'index.html';

  var NAV_ITEMS = [
    { href: 'index.html',    label: 'Home' },
    { href: 'quotes.html',   label: 'Quotes' },
    { href: 'projects.html', label: 'Projects' },
    { href: 'machine.html',  label: 'Machine' }
  ];

  /* ---------- which file is open right now? ---------- */
  function currentFile() {
    var path = window.location.pathname.split('/').pop();
    return path === '' ? 'index.html' : path;
  }

  var mount = document.getElementById('siteNav');
  if (!mount) return;                        /* page opted out: nothing to do */

  var here = currentFile();

  /* ---------- build the markup ---------- */
  var links = NAV_ITEMS.map(function (item) {
    var active = (item.href === here);
    return '<a href="' + item.href + '"' +
           (active ? ' aria-current="page"' : '') + '>' + item.label + '</a>';
  }).join('');

  mount.innerHTML =
    '<a class="nav__brand" href="' + BRAND_HREF + '">' + BRAND + '</a>' +

    '<div class="nav__right">' +
      '<button type="button" class="theme-toggle" id="themeToggle"' +
      ' aria-pressed="false" aria-label="Switch to light mode">' +
        '<svg class="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none">' +
          '<circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.7"/>' +
          '<path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"' +
          ' stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
        '</svg>' +
        '<svg class="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none">' +
          '<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>' +
        '</svg>' +
      '</button>' +

      '<button type="button" class="nav__toggle" id="navToggle"' +
      ' aria-expanded="false" aria-controls="navMenu" aria-label="Open menu">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
    '</div>' +

    '<nav class="nav__links" id="navMenu" aria-label="Main navigation">' + links + '</nav>';

  /* ---------- mobile drawer ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- scroll-spy: highlight the section in view ----------
     Only runs on pages that actually have those sections. */
  var sections = ['work', 'about', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var anchors = menu.querySelectorAll('a');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var target = '#' + entry.target.id;
        Array.prototype.forEach.call(anchors, function (a) {
          a.style.background = (a.getAttribute('href') === target)
            ? 'var(--btn-ghost-hover)' : '';
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(function (el) { observer.observe(el); });
  }
})();
