/* ===========================================================
   Quotes — banner rotation + quotes wall
   -----------------------------------------------------------
   Two independent jobs, each guarded by the element it needs:

     #heroQuote  → one random line in the hero banner. It rotates
                   by itself every few seconds, and pauses while
                   the visitor hovers, focuses inside, or switches
                   tab. The ↻ button draws a new one immediately.

     #quotesList → the full wall. Tag chips filter it, the counter
                   follows the filter, and each card can be copied.

   Both read from js/quotes-data.js so there is only one list.
   =========================================================== */

(function () {
  'use strict';

  if (typeof QUOTES === 'undefined') return;      /* data file missing: do nothing */

  var reduceMotion = window.matchMedia &&
                     window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  function quoteText(q) {
    return '“' + q.en + '”';
  }

  function plainText(q) {
    return quoteText(q) + '\n— ' + q.author + '\n' + q.zh;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (e) { reject(e); }
    });
  }

  /* =========================================================
     1. Hero banner: a random quote that rotates on its own
     ========================================================= */
  var banner = document.getElementById('heroQuote');
  var bannerText = document.getElementById('heroQuoteText');
  var bannerAuthor = document.getElementById('heroQuoteAuthor');
  var bannerNext = document.getElementById('heroQuoteNext');
  var ROTATE_MS = 9000;
  var lastIndex = -1;
  var rotateTimer = null;

  function drawBanner() {
    var i = Math.floor(Math.random() * QUOTES.length);
    if (QUOTES.length > 1 && i === lastIndex) i = (i + 1) % QUOTES.length;
    lastIndex = i;

    var q = QUOTES[i];
    bannerText.textContent = quoteText(q);
    bannerAuthor.textContent = '— ' + q.author + ' · ' + q.tag;
    banner.setAttribute('data-tag', q.tag);

    /* retrigger the fade-in without a library */
    if (!reduceMotion) {
      banner.classList.remove('is-fresh');
      void banner.offsetWidth;
      banner.classList.add('is-fresh');
    }
  }

  function startRotate() {
    if (reduceMotion || !banner) return;
    stopRotate();
    rotateTimer = setInterval(drawBanner, ROTATE_MS);
  }

  function stopRotate() {
    if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
  }

  if (banner && bannerText) {
    drawBanner();
    startRotate();

    /* pause while the visitor is reading it */
    banner.addEventListener('mouseenter', stopRotate);
    banner.addEventListener('mouseleave', startRotate);
    banner.addEventListener('focusin', stopRotate);
    banner.addEventListener('focusout', startRotate);

    /* and while the tab is in the background */
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stopRotate() : startRotate();
    });

    if (bannerNext) {
      bannerNext.addEventListener('click', function () {
        drawBanner();
        startRotate();                 /* restart the countdown after a manual draw */
      });
    }
  }

  /* =========================================================
     2. The wall of quotes + tag filter
     ========================================================= */
  var list = document.getElementById('quotesList');
  var counter = document.getElementById('quoteCount');
  var status = document.getElementById('quoteStatus');
  var filters = document.getElementById('quoteFilters');

  if (!list) return;

  function cardHTML(q) {
    var i = QUOTES.indexOf(q);       /* 过滤后仍要指向原数组，否则复制会拿错条目 */
    return '' +
      '<li class="quote-card" data-tag="' + q.tag + '">' +
        '<figure>' +
          '<p class="quote-card__tag">' + q.tag + '</p>' +
          '<blockquote class="quote-card__text">' + quoteText(q) + '</blockquote>' +
          '<figcaption class="quote-card__author">— ' + q.author + '</figcaption>' +
          '<p class="quote-card__zh" lang="zh-CN">' + q.zh + '</p>' +
          '<button type="button" class="quote-copy" data-index="' + i + '">' +
            '<span aria-hidden="true">⧉</span> Copy' +
          '</button>' +
        '</figure>' +
      '</li>';
  }

  function render(list_) {
    list.innerHTML = list_.map(function (q) { return cardHTML(q); }).join('');

    if (counter) {
      counter.textContent = (list_.length === QUOTES.length)
        ? QUOTES.length + ' quotes'
        : list_.length + ' of ' + QUOTES.length + ' quotes';
    }
  }

  /* ---------- tag chips ---------- */
  var tags = [];
  QUOTES.forEach(function (q) {
    if (tags.indexOf(q.tag) === -1) tags.push(q.tag);
  });

  if (filters) {
    var chips = ['<button type="button" class="qfilter" data-tag="*" aria-pressed="true">All</button>'];
    tags.forEach(function (t) {
      chips.push('<button type="button" class="qfilter" data-tag="' + t + '" aria-pressed="false">' + t + '</button>');
    });
    filters.innerHTML = chips.join('');

    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.qfilter');
      if (!btn) return;

      var tag = btn.getAttribute('data-tag');
      Array.prototype.forEach.call(filters.querySelectorAll('.qfilter'), function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });

      render(tag === '*' ? QUOTES.slice() : QUOTES.filter(function (q) { return q.tag === tag; }));
      if (status) status.textContent = tag === '*' ? 'Showing all quotes.' : 'Filtered by ' + tag + '.';
    });
  }

  render(QUOTES);

  /* ---------- copy buttons (one listener, delegated) ---------- */
  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.quote-copy');
    if (!btn) return;

    var q = QUOTES[Number(btn.getAttribute('data-index'))];
    if (!q) return;

    copyText(plainText(q)).then(function () {
      if (status) status.textContent = 'Copied — ' + q.author;
      btn.innerHTML = 'Copied';
      btn.classList.add('is-done');
      setTimeout(function () {
        btn.innerHTML = '<span aria-hidden="true">⧉</span> Copy';
        btn.classList.remove('is-done');
      }, 1600);
    }, function () {
      if (status) status.textContent = 'Copy failed — select the text manually.';
    });
  });
})();
