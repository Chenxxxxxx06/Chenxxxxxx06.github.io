/* Connecting the dots: a bounded canvas opening with a fail-open lifecycle. */
(function () {
  'use strict';
  var overlay = document.getElementById('arrival');
  if (!overlay) return;
  var replay = document.getElementById('arrival-replay');
  var skip = overlay.querySelector('.arrival__skip');
  var canvas = overlay.querySelector('canvas');
  var progress = overlay.querySelector('.arrival__track span');
  var status = overlay.querySelector('.arrival__status');
  var sculpture = overlay.querySelector('.arrival__sculpture');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var KEY = 'chen-arrival-v2', DURATION = 3000, EXIT = 900;
  var ctx, width, height, ratio, centerX, centerY, points, stars;
  var active = false, leaving = false, raf = 0, deadline = 0, cleanupTimer = 0;
  var started = 0, savedFocus, locked = [], savedOverflow, savedPadding;
  var revealAnimations = [], randomSeed = 6;
  var ambient, unit, palette, pointerX = 0, pointerY = 0, pointerTargetX = 0, pointerTargetY = 0;

  function random() {
    randomSeed = (randomSeed * 16807) % 2147483647;
    return (randomSeed - 1) / 2147483646;
  }
  function clamp(value) { return Math.max(0, Math.min(1, value)); }
  function smooth(value) { var x = clamp(value); return x * x * (3 - 2 * x); }
  function easeOut(value) { return 1 - Math.pow(1 - clamp(value), 3); }
  function remember() { try { sessionStorage.setItem(KEY, '1'); } catch (_) {} }
  function visited() { try { return sessionStorage.getItem(KEY) === '1'; } catch (_) { return false; } }

  function unlock() {
    locked.forEach(function (entry) { entry.node.inert = entry.inert; });
    locked = [];
    if (savedOverflow !== undefined) {
      document.body.style.overflow = savedOverflow;
      document.body.style.paddingRight = savedPadding;
      savedOverflow = undefined;
    }
  }
  function restoreFocus() {
    if (!overlay.contains(document.activeElement)) return;
    if (savedFocus && savedFocus !== document.body && savedFocus.isConnected) {
      savedFocus.focus({ preventScroll: true });
    } else {
      var tabIndex = document.body.getAttribute('tabindex');
      document.body.setAttribute('tabindex', '-1');
      document.body.focus({ preventScroll: true });
      if (tabIndex === null) document.body.removeAttribute('tabindex');
      else document.body.setAttribute('tabindex', tabIndex);
    }
  }
  function dispose() {
    clearTimeout(deadline);
    clearTimeout(cleanupTimer);
    cancelAnimationFrame(raf);
    raf = 0; active = false; leaving = false;
    unlock();
    restoreFocus();
    overlay.hidden = true;
    overlay.classList.remove('arrival--running', 'arrival--leaving');
    document.documentElement.removeAttribute('data-arrival');
    unlock();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVisibility);
    revealAnimations.forEach(function (animation) { animation.cancel(); });
    revealAnimations = [];
    canvas.width = canvas.height = 1;
    points = stars = [];
    replay.hidden = reduced.matches;
  }
  function reveal() {
    if (reduced.matches) return;
    var nodes = document.querySelectorAll('.masthead__inner-wrap, .author__avatar > button, .author__content, .author__direction, .author__social-icons, .page__content');
    nodes.forEach(function (node, index) {
      if (!node.animate) return;
      revealAnimations.push(node.animate([
        { opacity: 0, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 760, delay: Math.min(index * 40, 160), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
    });
  }
  function finish(immediate) {
    if (!active) return;
    if (immediate || reduced.matches) { dispose(); return; }
    if (leaving) return;
    leaving = true;
    unlock();
    restoreFocus();
    overlay.classList.add('arrival--leaving');
    reveal();
    cleanupTimer = window.setTimeout(dispose, EXIT + 160);
  }
  function onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); finish(true); }
    if (event.key === 'Tab' && !leaving) { event.preventDefault(); skip.focus({ preventScroll: true }); }
  }
  function onVisibility() { if (document.hidden) finish(true); }
  function onResize() { finish(true); }

  function mixColor(first, second, amount) {
    function rgb(hex) {
      var value = hex.trim().replace('#', '');
      if (value.length === 3) value = value.split('').map(function (x) { return x + x; }).join('');
      return [0, 2, 4].map(function (i) { return parseInt(value.slice(i, i + 2), 16); });
    }
    var a = rgb(first), b = rgb(second);
    return 'rgb(' + a.map(function (value, i) { return Math.round(value + (b[i] - value) * amount); }).join(',') + ')';
  }
  function onPointer(event) {
    pointerTargetX = (event.clientX / width - .5) * 2;
    pointerTargetY = (event.clientY / height - .5) * 2;
  }
  function prepare() {
    randomSeed = 6;
    width = window.innerWidth; height = window.innerHeight;
    ratio = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.5 : 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    var box = sculpture.getBoundingClientRect();
    centerX = box.left + box.width / 2;
    centerY = box.top + box.height / 2 - 4;
    unit = Math.min(box.width / 11, box.height / 13, 31);
    var style = getComputedStyle(document.documentElement);
    var bg = style.getPropertyValue('--bg').trim() || '#ffffff';
    var ink = style.getPropertyValue('--c-text').trim() || '#1a1a1a';
    palette = {
      front: mixColor(bg, ink, .91), top: mixColor(bg, ink, .61),
      side: mixColor(bg, ink, .43), edge: mixColor(bg, ink, .2),
      dot: mixColor(bg, ink, .3), shadow: mixColor(bg, ink, .08)
    };
    var pattern = [
      '00111100', '01111110', '11100111', '11000011',
      '00000111', '00001110', '00011100', '00011000',
      '00000000', '00011000', '00011000'
    ];
    points = [];
    pattern.forEach(function (row, y) {
      row.split('').forEach(function (cell, x) {
        if (cell !== '1') return;
        var angle = random() * Math.PI * 2;
        points.push({
          x: (x - 3.5) * unit, y: (y - 5) * unit, z: 0,
          fromX: Math.cos(angle) * unit * (5 + random() * 5),
          fromY: Math.sin(angle) * unit * (5 + random() * 5),
          fromZ: (random() - .5) * unit * 12,
          delay: random() * 260,
          spreadX: (random() - .5) * width * .35,
          spreadY: (random() - .5) * height * .35
        });
      });
    });
    stars = Array.from({ length: 14 }, function () {
      return { x: (random() - .5) * box.width * 1.1, y: (random() - .5) * box.height * 1.1, phase: random() * 6.28 };
    });
    pointerX = pointerY = pointerTargetX = pointerTargetY = 0;
    ambient = document.getElementById('ambient-grid');
  }
  function project(x, y, z, turn, tilt) {
    var rx = x * Math.cos(turn) + z * Math.sin(turn);
    var rz = -x * Math.sin(turn) + z * Math.cos(turn);
    var ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
    var depth = y * Math.sin(tilt) + rz * Math.cos(tilt);
    var perspective = 900 / (900 + depth);
    return { x: centerX + rx * perspective, y: centerY + ry * perspective, depth: depth };
  }
  function polygon(vertices, color, opacity) {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    vertices.forEach(function (v, index) { if (index) ctx.lineTo(v.x, v.y); else ctx.moveTo(v.x, v.y); });
    ctx.closePath(); ctx.fill();
  }
  function cube(point, elapsed, departure, turn, tilt) {
    var gather = easeOut((elapsed - 80 - point.delay) / 1150);
    var bob = Math.sin(elapsed * .0015) * unit * .13;
    var x = point.fromX + (point.x - point.fromX) * gather;
    var y = point.fromY + (point.y - point.fromY) * gather + bob;
    var z = point.fromZ * (1 - gather);
    var middle = project(x, y, z, turn, tilt);
    var scatterX = Math.round((centerX + point.x * 3 + point.spreadX) / 26) * 26 + 13;
    var scatterY = Math.round((centerY + point.y * 2.6 + point.spreadY) / 26) * 26 + 13;
    var size = unit * .47 * (.55 + .45 * gather);
    var thickness = size * (1 - departure);
    function corner(dx, dy, dz) {
      var v = project(x + dx * size, y + dy * size, z + dz * thickness, turn, tilt);
      return {
        x: v.x + (scatterX - middle.x) * departure,
        y: v.y + (scatterY - middle.y) * departure
      };
    }
    var a = corner(-1, -1, -1), b = corner(1, -1, -1);
    var c = corner(1, 1, -1), d = corner(-1, 1, -1);
    var e = corner(-1, -1, 1), f = corner(1, -1, 1), g = corner(1, 1, 1);
    var opacity = smooth(elapsed / 450) * (1 - departure * .94);
    polygon([a, e, f, b], palette.top, opacity);
    polygon([b, f, g, c], palette.side, opacity);
    polygon([a, b, c, d], palette.front, opacity);
  }
  function draw(now) {
    if (!active) return;
    try {
      var elapsed = now - started, departure = easeOut((elapsed - DURATION) / EXIT);
      ctx.clearRect(0, 0, width, height);
      // Sample the existing background, so its wave phase never resets at exit.
      if (!ambient) ambient = document.getElementById('ambient-grid');
      if (ambient && ambient.width > 0 && ambient.height > 0) {
        ctx.globalAlpha = .58 + departure * .42;
        ctx.drawImage(ambient, 0, 0, width, height);
      }
      pointerX += (pointerTargetX - pointerX) * .06;
      pointerY += (pointerTargetY - pointerY) * .06;
      var turn = .36 + Math.sin(elapsed * .0007) * .09 + pointerX * .11;
      var tilt = .13 + pointerY * .055;
      ctx.globalAlpha = .55 * (1 - departure) * smooth(elapsed / 1100);
      ctx.fillStyle = palette.shadow;
      ctx.beginPath();
      ctx.ellipse(centerX + 5, centerY + unit * 6.4, unit * 3.3, unit * .32, 0, 0, Math.PI * 2);
      ctx.fill();
      stars.forEach(function (star) {
        ctx.globalAlpha = .48 * smooth(elapsed / 800) * (1 - departure);
        ctx.fillStyle = palette.dot;
        var x = centerX + star.x, y = centerY + star.y + Math.sin(elapsed * .001 + star.phase) * 5;
        ctx.fillRect(x, y, 3, 3);
      });
      // Painter order prevents the rear blocks from drawing over the front faces.
      points.slice().sort(function (a, b) {
        function depth(point) {
          var gather = easeOut((elapsed - 80 - point.delay) / 1150);
          return project(
            point.fromX + (point.x - point.fromX) * gather,
            point.fromY + (point.y - point.fromY) * gather,
            point.fromZ * (1 - gather), turn, tilt
          ).depth;
        }
        return depth(b) - depth(a);
      }).forEach(function (point) { cube(point, elapsed, departure, turn, tilt); });
      ctx.globalAlpha = 1;
      progress.style.transform = 'scaleX(' + clamp(elapsed / DURATION) + ')';
      status.textContent = elapsed < 1600 ? 'CONNECTING THE DOTS' : 'STAY CURIOUS.';
      if (elapsed >= DURATION) finish(false);
      if (elapsed < DURATION + EXIT) raf = requestAnimationFrame(draw);
    } catch (_) { finish(true); }
  }

  function start() {
    if (active) return;
    if (reduced.matches || document.hidden) {
      document.documentElement.removeAttribute('data-arrival');
      return;
    }
    try {
      ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) { document.documentElement.removeAttribute('data-arrival'); return; }
      active = true; savedFocus = document.activeElement;
      savedOverflow = document.body.style.overflow; savedPadding = document.body.style.paddingRight;
      var gutter = window.innerWidth - document.documentElement.clientWidth;
      if (gutter > 0) document.body.style.paddingRight = (parseFloat(getComputedStyle(document.body).paddingRight) + gutter) + 'px';
      document.body.style.overflow = 'hidden';
      Array.from(document.body.children).forEach(function (node) {
        if (node === overlay || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
        locked.push({ node: node, inert: node.inert }); node.inert = true;
      });
      overlay.hidden = false; overlay.classList.add('arrival--running');
      document.documentElement.setAttribute('data-arrival', 'active');
      prepare(); overlay.focus({ preventScroll: true });
      document.addEventListener('keydown', onKey);
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('resize', onResize);
      window.addEventListener('pointermove', onPointer, { passive: true });
      deadline = window.setTimeout(function () { finish(true); }, 5000);
      remember(); started = performance.now(); raf = requestAnimationFrame(draw);
    } catch (_) { dispose(); }
  }
  skip.addEventListener('click', function () { finish(true); });
  replay.addEventListener('click', start);
  window.addEventListener('pagehide', function () { finish(true); });
  if (reduced.addEventListener) reduced.addEventListener('change', function () {
    if (reduced.matches) finish(true);
    replay.hidden = reduced.matches;
  });
  function boot() {
    replay.hidden = reduced.matches;
    if (window.chenArrivalExpired) return;
    var navigation = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
    var force = new URLSearchParams(window.location.search).get('intro') === 'replay';
    if (window.location.hash || (navigation && navigation.type === 'back_forward')) return;
    if (force || !visited()) start();
  }
  // This head-deferred script runs while readyState is interactive, before the
  // homepage's DOMContentLoaded listeners create its grid and theme controls.
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
