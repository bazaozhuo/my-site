/* ===========================================================
   Useless machine — a boat on a night lake
   -----------------------------------------------------------
   Click the water: the boat rows toward that point.
   Arrow keys work too, so it is usable without a mouse.

   Everything is one SVG; this file only moves three things:
     - the boat (x position, small bobbing)
     - the two oars (swing while moving)
     - ripples (a few circles that grow and fade)
   =========================================================== */

(function () {
  'use strict';

  var stage = document.getElementById('umStage');
  if (!stage) return;

  var boat = document.getElementById('umBoat');
  var rippleLayer = document.getElementById('umRipples');
  var distEl = document.getElementById('umDist');
  var statusEl = document.getElementById('umStatus');
  var caption = document.getElementById('umCaption');
  var treesFar = document.querySelector('.um-trees-far');
  var treesNear = document.querySelector('.um-trees-near');

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var MIN_X = 150, MAX_X = 1050;     /* scene coordinates, adjusted to the visible slice */
  var x = 430;                       /* current boat position */
  var target = x;
  var t = 0;                         /* time, for the bob */
  var moved = false;
  var raf = null;

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /* Headless screenshots never advance rAF, so tests can flip
     <html data-fx-timer> and drive the same loop with setTimeout. */
  function nextFrame(cb) {
    if (document.documentElement.hasAttribute('data-fx-timer')) return setTimeout(cb, 16);
    return requestAnimationFrame(cb);
  }

  /* ---------- how much of the 1200×700 scene is actually on screen? ----------
     The SVG is sliced to fill the stage, so on a portrait phone the sides
     get cropped. Keep the boat inside the part people can see. */
  function visibleRange() {
    var box = stage.getBoundingClientRect();
    if (!box.width || !box.height) return { left: 0, right: 1200 };
    var scale = Math.max(box.width / 1200, box.height / 700);
    var visW = box.width / scale;
    var left = (1200 - visW) / 2;
    return { left: left, right: left + visW };
  }

  function fitToViewport() {
    var r = visibleRange();
    MIN_X = r.left + 78;
    MAX_X = Math.max(MIN_X + 10, r.right - 78);
    if (x < MIN_X || x > MAX_X) {
      x = target = clamp((MIN_X + MAX_X) / 2, MIN_X, MAX_X);
    }
  }

  /* ---------- ripples ---------- */
  function ripple(sx, sy, strength) {
    if (reduce) return;
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    c.setAttribute('cx', sx);
    c.setAttribute('cy', sy);
    c.setAttribute('rx', '10');
    c.setAttribute('ry', '3');
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', '#bcd6d8');
    c.setAttribute('stroke-width', '1.2');
    c.setAttribute('opacity', String(0.34 * (strength || 1)));
    rippleLayer.appendChild(c);

    var start = performance.now();
    var life = 1500;

    function grow(now) {
      var k = (now - start) / life;
      if (k >= 1) { c.remove(); return; }
      var r = 10 + k * 80 * (strength || 1);
      c.setAttribute('rx', r);
      c.setAttribute('ry', r * 0.30);
      c.setAttribute('opacity', String(0.34 * (strength || 1) * (1 - k)));
      nextFrame(grow);
    }
    nextFrame(grow);
  }

  /* ---------- one frame ---------- */
  function frame(now) {
    t += 0.016;

    /* ease toward the target */
    var dx = target - x;
    if (Math.abs(dx) < 0.6) { x = target; dx = 0; }
    else { x += dx * 0.06; }

    var rowing = Math.abs(dx) > 2;

    /* bob: only while idle-ish, tiny */
    var bob = reduce ? 0 : Math.sin(t * 1.7) * 2.4;
    var tilt = reduce ? 0 : Math.sin(t * 1.7 + 1) * 0.8;

    boat.setAttribute('transform',
      'translate(' + x.toFixed(2) + ' ' + (468 + bob).toFixed(2) + ') rotate(' + tilt.toFixed(2) + ')');

    /* oars swing when rowing, rest when not */
    var swing = rowing ? Math.sin(t * 6) * 16 : 0;
    var l = document.querySelector('.um-oar--l');
    var r = document.querySelector('.um-oar--r');
    if (l) l.setAttribute('transform', 'rotate(' + swing.toFixed(2) + ' -8 -6)');
    if (r) r.setAttribute('transform', 'rotate(' + (-swing).toFixed(2) + ' 8 -6)');

    /* far scenery drifts a little: cheap parallax */
    if (!reduce) {
      var shift = (x - 430) * 0.05;
      if (treesFar) treesFar.setAttribute('transform', 'translate(' + (-shift * 0.6).toFixed(2) + ' 0)');
      if (treesNear) treesNear.setAttribute('transform', 'translate(' + (-shift).toFixed(2) + ' 0)');
    }

    /* wake */
    if (rowing && Math.random() < 0.18) ripple(x - Math.sign(dx) * 60, 468 + 24, 0.7);

    if (distEl) distEl.textContent = String(Math.round((x - MIN_X) / 9));

    raf = nextFrame(frame);
  }

  function start() { if (!raf) raf = nextFrame(frame); }

  /* ---------- move the boat ---------- */
  function goTo(nextX, announce) {
    target = clamp(nextX, MIN_X, MAX_X);
    if (!moved) {
      moved = true;
      if (caption) caption.classList.add('is-gone');
    }
    if (announce && statusEl) {
      statusEl.textContent = announce;
    }
    start();
  }

  function sceneX(clientX) {
    var box = stage.getBoundingClientRect();
    /* the SVG is sliced to cover the stage, so map through the viewBox */
    var vw = 1200, vh = 700;
    var scale = Math.max(box.width / vw, box.height / vh);
    var offsetX = (box.width - vw * scale) / 2;
    return (clientX - box.left - offsetX) / scale;
  }

  stage.addEventListener('click', function (e) {
    var sx = sceneX(e.clientX);
    goTo(sx, 'Rowing to ' + Math.round(clamp((sx - MIN_X) / 9, 0, 100)) + ' metres from shore.');
    ripple(sx, 470, 1.2);
  });

  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(target + 90, 'Rowing forward.'); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(target - 90, 'Rowing back.'); }
  });

  /* 先按当前视口纠正范围，再放初始涟漪（否则竖屏会画在画面外） */
  fitToViewport();

  ripple(x, 492, 0.8);
  setTimeout(function () { ripple(x, 492, 0.6); }, 900);

  /* 调试用：无头浏览器里量一下内部状态 */
  window.__umDebug = function () {
    return { x: x, target: target, raf: raf !== null, moved: moved, min: MIN_X, max: MAX_X };
  };

  window.addEventListener('resize', function () { fitToViewport(); });

  start();
})();
