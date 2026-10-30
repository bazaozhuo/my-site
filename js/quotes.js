/* ===========================================================
   Quotes
   -----------------------------------------------------------
   One file, two jobs — each guarded so it only runs where it
   is needed:

     #quotesList exists  → render the whole wall of quotes
     #heroQuote  exists  → show one random line in the hero,
                           with a button to draw another

   Data lives in js/quotes-data.js, so both places stay in sync.
   =========================================================== */

(function () {
  'use strict';

  if (typeof QUOTES === 'undefined') return;   /* data file missing: bail quietly */

  /* =========================================================
     1. Copy helper (clipboard with a fallback for old browsers)
     ========================================================= */
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
      } catch (e) {
        reject(e);
      }
    });
  }

  function plainText(q) {
    return '“' + q.en + '”\n— ' + q.author + '\n' + q.zh;
  }

  /* =========================================================
     2. The wall of quotes (#quotesList)
     ========================================================= */
  var list = document.getElementById('quotesList');
  var count = document.getElementById('quoteCount');
  var status = document.getElementById('quoteStatus');

  if (list) {
    var html = QUOTES.map(function (q, i) {
      return '' +
        '<li class="quote-card">' +
          '<figure>' +
            '<p class="quote-card__tag">' + q.tag + '</p>' +
            '<blockquote class="quote-card__text" cite="">' +
              '“' + q.en + '”' +
            '</blockquote>' +
            '<figcaption class="quote-card__author">— ' + q.author + '</figcaption>' +
            '<p class="quote-card__zh" lang="zh-CN">' + q.zh + '</p>' +
            '<button type="button" class="quote-copy" data-index="' + i + '">' +
              '<span aria-hidden="true">⧉</span> Copy' +
            '</button>' +
          '</figure>' +
        '</li>';
    }).join('');

    list.innerHTML = html;

    if (count) count.textContent = QUOTES.length + ' quotes';

    /* copy buttons — one listener on the list, not 15 on the buttons */
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.quote-copy');
      if (!btn) return;
      var q = QUOTES[Number(btn.getAttribute('data-index'))];
      if (!q) return;

      copyText(plainText(q)).then(function () {
        if (status) status.textContent = 'Copied — ' + q.author;
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        setTimeout(function () {
          btn.innerHTML = '<span aria-hidden="true">⧉</span> Copy';
          btn.classList.remove('is-done');
        }, 1600);
      }, function () {
        if (status) status.textContent = 'Copy failed — select the text manually.';
      });
    });
  }

  /* =========================================================
     3. Random quote in the hero (#heroQuote)
     ========================================================= */
  var heroQuote = document.getElementById('heroQuote');
  var heroText = document.getElementById('heroQuoteText');
  var heroAuthor = document.getElementById('heroQuoteAuthor');
  var heroNext = document.getElementById('heroQuoteNext');

  if (heroQuote && heroText) {
    var last = -1;

    function draw() {
      var i = Math.floor(Math.random() * QUOTES.length);
      if (QUOTES.length > 1 && i === last) i = (i + 1) % QUOTES.length;   /* never repeat twice */
      last = i;
      var q = QUOTES[i];
      heroText.textContent = '“' + q.en + '”';
      if (heroAuthor) heroAuthor.textContent = '— ' + q.author;
    }

    draw();

    if (heroNext) {
      heroNext.addEventListener('click', function () {
        draw();
        heroQuote.classList.remove('is-flash');
        void heroQuote.offsetWidth;              /* restart the highlight */
        heroQuote.classList.add('is-flash');
      });
    }
  }
})();
