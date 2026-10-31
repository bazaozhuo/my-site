/* ===========================================================
   Quotes — four small views, one data file
   -----------------------------------------------------------
     .js-quote-banner  rotating banner (home hero)
     #qText            full-screen banner (quotes-banner.html)
     #authorList       everything one author said (author.html?name=…)
     #quotesList       the whole wall with tag filters (quotes-all.html)

   Each block looks for its own element and returns early if it is
   not on the page, so one file can serve all of them.
   =========================================================== */

(function () {
  'use strict';

  if (typeof QUOTES === 'undefined') return;

  var reduceMotion = window.matchMedia &&
                     window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  function quoted(q) { return '“' + q.en + '”'; }
  function plainText(q) { return quoted(q) + '\n— ' + q.author + '\n' + q.zh; }
  function authorHref(name) { return 'author.html?name=' + encodeURIComponent(name); }

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

  function byAuthor(name) {
    var lower = String(name).toLowerCase();
    return QUOTES.filter(function (q) { return q.author.toLowerCase() === lower; });
  }

  /* one card, used by both the wall and the author page */
  function cardHTML(q) {
    var i = QUOTES.indexOf(q);
    return '' +
      '<li class="quote-card" data-tag="' + q.tag + '">' +
        '<figure>' +
          '<p class="quote-card__tag">' + q.tag + '</p>' +
          '<blockquote class="quote-card__text">' + quoted(q) + '</blockquote>' +
          '<figcaption class="quote-card__author">— ' +
            '<a class="quote-card__author-link" href="' + authorHref(q.author) + '">' + q.author + '</a>' +
          '</figcaption>' +
          '<p class="quote-card__zh" lang="zh-CN">' + q.zh + '</p>' +
          '<button type="button" class="quote-copy" data-index="' + i + '">' +
            '<span aria-hidden="true">⧉</span> Copy' +
          '</button>' +
        '</figure>' +
      '</li>';
  }

  /* copy buttons work on any list of cards */
  function wireCopy(list, status) {
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
  }

  /* =========================================================
     1. Small rotating banners (home hero)
     ========================================================= */
  var ROTATE_MS = 9000;

  function setupBanner(banner) {
    var textEl = banner.querySelector('[data-role="text"]');
    var authorEl = banner.querySelector('[data-role="author"]');
    var nextBtn = banner.querySelector('[data-role="next"]');
    if (!textEl) return;

    var lastIndex = -1, timer = null;

    function draw() {
      var i = Math.floor(Math.random() * QUOTES.length);
      if (QUOTES.length > 1 && i === lastIndex) i = (i + 1) % QUOTES.length;
      lastIndex = i;
      var q = QUOTES[i];
      textEl.textContent = quoted(q);
      if (authorEl) authorEl.textContent = '— ' + q.author + ' · ' + q.tag;
      banner.setAttribute('data-tag', q.tag);
      if (!reduceMotion) {
        banner.classList.remove('is-fresh');
        void banner.offsetWidth;
        banner.classList.add('is-fresh');
      }
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { if (reduceMotion) return; stop(); timer = setInterval(draw, ROTATE_MS); }

    draw(); start();
    banner.addEventListener('mouseenter', stop);
    banner.addEventListener('mouseleave', start);
    banner.addEventListener('focusin', stop);
    banner.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () { draw(); start(); });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.js-quote-banner'), setupBanner);

  /* =========================================================
     2. Full-screen banner (quotes-banner.html)
     ---------------------------------------------------------
     Keeps a running order so ‹ › walk through the collection
     instead of jumping at random, and ↻ draws anything else.
     ========================================================= */
  var stage = document.getElementById('qText');

  if (stage) {
    var elText = stage;
    var elZh = document.getElementById('qZh');
    var elAuthor = document.getElementById('qAuthor');
    var elTag = document.getElementById('qTag');
    var elIndex = document.getElementById('qIndex');
    var btnPrev = document.getElementById('qPrev');
    var btnNext = document.getElementById('qNext');
    var btnShuffle = document.getElementById('qShuffle');

    /* shuffled starting order: same 15 lines, different route each visit */
    var order = QUOTES.map(function (q, i) { return i; });
    if (!reduceMotion) {
      for (var k = order.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var tmp = order[k]; order[k] = order[j]; order[j] = tmp;
      }
    }
    var pos = 0;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function show(i) {
      pos = (i + order.length) % order.length;
      var q = QUOTES[order[pos]];

      elText.textContent = quoted(q);
      if (elZh) elZh.textContent = q.zh;
      if (elAuthor) {
        elAuthor.textContent = q.author;
        elAuthor.setAttribute('href', authorHref(q.author));
        elAuthor.setAttribute('title', 'Everything ' + q.author + ' said');
      }
      if (elTag) elTag.textContent = q.tag;
      if (elIndex) elIndex.textContent = pad(pos + 1) + ' / ' + pad(order.length);

      if (!reduceMotion) {
        stage.classList.remove('is-fresh');
        void stage.offsetWidth;
        stage.classList.add('is-fresh');
      }
    }

    if (btnPrev) btnPrev.addEventListener('click', function () { show(pos - 1); });
    if (btnNext) btnNext.addEventListener('click', function () { show(pos + 1); });
    if (btnShuffle) btnShuffle.addEventListener('click', function () {
      var next = pos;
      while (order.length > 1 && next === pos) next = Math.floor(Math.random() * order.length);
      show(next);
    });

    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'ArrowLeft') { show(pos - 1); }
      if (e.key === 'ArrowRight') { show(pos + 1); }
    });

    show(0);
  }

  /* =========================================================
     3. One author (author.html?name=…)
     ========================================================= */
  var authorList = document.getElementById('authorList');

  if (authorList) {
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get('name') || '';
    var nameEl = document.getElementById('authorName');
    var countEl = document.getElementById('authorCount');
    var statusEl = document.getElementById('quoteStatus');

    var found = wanted ? byAuthor(wanted) : [];

    if (found.length) {
      var person = found[0].author;
      if (nameEl) nameEl.textContent = person;
      document.title = person + ' — Chuai Zhuoyang';

      var tags = found.map(function (q) { return q.tag; })
                       .filter(function (t, i, a) { return a.indexOf(t) === i; });
      if (countEl) {
        countEl.textContent = found.length +
          (found.length === 1 ? ' quote' : ' quotes') + ' · ' + tags.join(' · ');
      }
      authorList.innerHTML = found.map(cardHTML).join('');
    } else {
      /* unknown name: say so plainly instead of showing an empty page */
      if (nameEl) nameEl.textContent = 'Nobody here';
      if (countEl) {
        countEl.textContent = 'No quotes by that name in this collection. ';
        var link = document.createElement('a');
        link.href = 'quotes-all.html';
        link.textContent = 'See all fifteen →';
        countEl.appendChild(link);
      }
    }

    wireCopy(authorList, statusEl);
  }

  /* =========================================================
     4. The wall (quotes-all.html)
     ========================================================= */
  var list = document.getElementById('quotesList');

  if (list) {
    var counter = document.getElementById('quoteCount');
    var wallStatus = document.getElementById('quoteStatus');
    var filters = document.getElementById('quoteFilters');

    function render(items) {
      list.innerHTML = items.map(cardHTML).join('');
      if (counter) {
        counter.textContent = (items.length === QUOTES.length)
          ? QUOTES.length + ' quotes'
          : items.length + ' of ' + QUOTES.length + ' quotes';
      }
    }

    var tags = [];
    QUOTES.forEach(function (q) { if (tags.indexOf(q.tag) === -1) tags.push(q.tag); });

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
        if (wallStatus) {
          wallStatus.textContent = tag === '*' ? 'Showing all quotes.' : 'Filtered by ' + tag + '.';
        }
      });
    }

    render(QUOTES);
    wireCopy(list, wallStatus);
  }
})();
