/* ===========================================================
   Second site · main.js
   -----------------------------------------------------------
   1. Day / night theme (remembered in localStorage)
   2. Click anywhere → a rocket climbs, then bursts into fireworks
   3. Interactive greeting: time-of-day word + typed name + "Say hi"
   4. Mobile menu, footer year, scroll-spy

   No framework, no dependencies. Everything animated checks
   prefers-reduced-motion and switches to the final state instead.
   =========================================================== */

(function () {
  'use strict';

  var NAME = 'Chuai Zhuoyang';       /* ← the name that types itself out */
  var TYPE_SPEED = 85;               /* ms per letter */

  var reduceMotion = window.matchMedia &&
                     window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1. Day / night theme
     ========================================================= */
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      var toLight = theme === 'dark';
      themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
      themeBtn.setAttribute('aria-label', toLight ? 'Switch to light mode' : 'Switch to dark mode');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1421' : '#f4f7fb');
  }

  function initialTheme() {
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) { /* private mode */ }
    /* no saved choice: the design is built dark, so start dark */
    return 'dark';
  }

  applyTheme(initialTheme());

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    });
  }

  /* =========================================================
     2. Fireworks: click anywhere → rocket → burst
     ---------------------------------------------------------
     One canvas, one requestAnimationFrame loop. The loop stops
     itself when the screen is empty, so an idle page costs 0% CPU.

     Canvas is pointer-events:none and sits behind the content,
     so links and buttons keep working normally.
     ========================================================= */
  var canvas = document.getElementById('fx');
  var tip = document.getElementById('fxTip');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var W = 0, H = 0, dpr = 1;

  var rockets = [];
  var sparks = [];
  var running = false;
  var palette = ['#f3c99a', '#ffd479', '#ff8a5c', '#7ee0a6', '#8fb8ff', '#ff9ad5'];

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);   /* cap at 2: sharp enough, cheaper */
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  /* In a normal browser rAF drives the animation. Headless screenshot tools
     freeze rAF, so <html data-fx-timer> switches to setTimeout — that lets the
     automated checks capture a real frame. No effect for visitors. */
  function nextFrame(cb) {
    if (document.documentElement.hasAttribute('data-fx-timer')) return setTimeout(cb, 16);
    return requestAnimationFrame(cb);
  }

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function isLightTheme() { return root.getAttribute('data-theme') === 'light'; }

  /* a rocket starts at the bottom edge under the pointer and flies up */
  function launch(x, y) {
    var g = 0.5;                          /* 大一点 = 升空更快（约 0.6–0.8 秒到位） */
    var dist = Math.max((H - 4) - y, 60);          /* how far it has to climb */
    /* v = sqrt(2·g·h): 刚好把火箭送到点击高度，屏幕越高初速越大 */
    var v = Math.sqrt(2 * g * dist) * 1.03;
    rockets.push({
      x: x,
      y: H - 4,
      targetY: y,
      vy: -v,
      g: g,
      hue: pick(palette),
      trail: []
    });
  }

  function burst(x, y, color) {
    var count = 64 + Math.floor(Math.random() * 26);
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + rand(-0.08, 0.08);
      var speed = rand(2.0, 6.2);
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: rand(0.005, 0.011),
        color: Math.random() < 0.72 ? color : pick(palette),
        size: rand(1.5, 3.2)
      });
    }
  }

  function frame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    /* on dark backgrounds additive blending gives a glow; on light it goes muddy,
       so only use it in dark mode */
    ctx.globalCompositeOperation = isLightTheme() ? 'source-over' : 'lighter';

    /* rockets */
    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i];
      r.y += r.vy;
      r.vy += r.g;                        /* gravity: it slows down on the way up */

      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 14) r.trail.shift();

      ctx.beginPath();
      ctx.strokeStyle = r.hue;
      ctx.lineWidth = 2.4;
      if (!isLightTheme()) { ctx.shadowColor = r.hue; ctx.shadowBlur = 10; }
      ctx.moveTo(r.trail[0].x, r.trail[0].y);
      for (var t = 1; t < r.trail.length; t++) ctx.lineTo(r.trail[t].x, r.trail[t].y);
      ctx.stroke();

      if (r.y <= r.targetY || r.vy >= 0) {
        burst(r.x, r.y, r.hue);
        rockets.splice(i, 1);
      }
    }

    /* sparks */
    for (var j = sparks.length - 1; j >= 0; j--) {
      var s = sparks[j];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.985;                      /* air drag */
      s.vy = s.vy * 0.985 + 0.045;        /* drag + gravity */
      s.life -= s.decay;

      if (s.life <= 0) { sparks.splice(j, 1); continue; }

      ctx.globalAlpha = Math.max(s.life, 0);
      ctx.fillStyle = s.color;
      if (!isLightTheme()) { ctx.shadowColor = s.color; ctx.shadowBlur = 9; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (0.55 + s.life * 0.65), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    if (rockets.length || sparks.length) {
      nextFrame(frame);
    } else {
      running = false;
      ctx.clearRect(0, 0, W, H);
    }
  }

  function start() {
    if (running || !ctx) return;
    running = true;
    nextFrame(frame);
  }

  if (canvas) {
    document.addEventListener('click', function (e) {
      if (reduceMotion) return;           /* respect the system setting */
      /* ignore clicks on the theme toggle so the UI does not feel noisy */
      if (e.target.closest && e.target.closest('.theme-toggle')) return;
      launch(e.clientX, e.clientY);
      start();
      if (tip) tip.classList.add('is-hidden');
    });

    /* touch devices: a tap is a click, but this makes it feel instant */
    document.addEventListener('touchstart', function (e) {
      if (reduceMotion || !e.touches.length) return;
      if (e.target.closest && e.target.closest('.theme-toggle')) return;
      launch(e.touches[0].clientX, e.touches[0].clientY);
      start();
      if (tip) tip.classList.add('is-hidden');
    }, { passive: true });

    /* one small burst on load, so visitors see the effect exists */
    if (!reduceMotion) {
      window.addEventListener('load', function () {
        setTimeout(function () {
          launch(window.innerWidth * 0.68, window.innerHeight * 0.34);
          start();
        }, 700);
      });
    }
  }

  /* debug hook (used in automated tests; harmless in production) */
  window.__fxDebug = function () {
    return { rockets: rockets.length, sparks: sparks.length, running: running,
             reduced: reduceMotion, w: W, h: H };
  };

  /* =========================================================
     3. Greeting: time of day + typewriter + "Say hi"
     ========================================================= */
  var greetEl = document.getElementById('greetWord');
  if (greetEl) {
    var hour = new Date().getHours();
    var word = 'Hello';
    if (hour < 5)       word = 'Still up';
    else if (hour < 12) word = 'Good morning';
    else if (hour < 18) word = 'Good afternoon';
    else                word = 'Good evening';
    greetEl.textContent = word;
  }

  var typedEl = document.getElementById('typedName');
  var caret = document.getElementById('caret');

  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = NAME;
      if (caret) caret.classList.add('is-done');
    } else {
      var n = 0;
      var timer = setInterval(function () {
        n++;
        typedEl.textContent = NAME.slice(0, n);
        if (n >= NAME.length) {
          clearInterval(timer);
          if (caret) caret.classList.add('is-done');
        }
      }, TYPE_SPEED);
    }
  }

  var waveBtn = document.getElementById('waveBtn');
  var hand = document.getElementById('waveHand');
  var reply = document.getElementById('waveMsg');

  var greetings = [
    'Hi! Thanks for stopping by.',
    'Hallo! (that is German — I study it)',
    '你好! (and that is Chinese, my first language)'
  ];
  var greetIndex = 0;

  if (waveBtn && reply) {
    waveBtn.addEventListener('click', function () {
      if (hand && !reduceMotion) {
        hand.classList.remove('is-waving');
        void hand.offsetWidth;            /* restart the animation on repeat clicks */
        hand.classList.add('is-waving');
      }
      reply.textContent = greetings[greetIndex % greetings.length];
      greetIndex++;
      reply.classList.add('is-on');
    });
  }

  /* =========================================================
     4. Mobile menu, footer year, scroll-spy
     ========================================================= */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && menu) {
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
  }

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  if ('IntersectionObserver' in window && menu) {
    var links = menu.querySelectorAll('a');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var target = '#' + entry.target.id;
        Array.prototype.forEach.call(links, function (a) {
          a.style.background = (a.getAttribute('href') === target)
            ? 'var(--btn-ghost-hover)' : '';
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    ['work', 'about', 'contact'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
})();
