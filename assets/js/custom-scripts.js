/**
 * Custom scripts for news toggle, publication filtering, sidebar pin, and nav close
 */

// ── Background wave-mosaic grid ──────────────────────────────────────────────
// Fixed grid of tiles; each tile's opacity is driven by overlapping sine waves
// → looks like ocean surface viewed from above (gentle rise-and-fall ripple)
(function () {
  var canvas, ctx, t = 0;
  var TILE = 26, GAP = 1;
  var rafId = null;
  var cachedRgb = '10,10,10';
  var lastDraw = 0;
  var FRAME_MS = 1000 / 24; // ~24 fps — smooth enough, half the CPU of 60 fps

  function rgb() {
    var th = document.documentElement.getAttribute('data-theme') || 'white';
    if (th === 'dark')   return '220,210,175';
    if (th === 'yellow') return '120,85,20';
    if (th === 'blue')   return '38,88,155';
    return '10,10,10';
  }

  function frame(ts) {
    rafId = requestAnimationFrame(frame);
    if (ts - lastDraw < FRAME_MS) return; // skip frame — throttle to 24 fps
    lastDraw = ts;

    var w = canvas.width, h = canvas.height;
    var cols = Math.ceil(w / TILE) + 1;
    var rows = Math.ceil(h / TILE) + 1;
    var pre  = 'rgba(' + cachedRgb + ',';

    ctx.clearRect(0, 0, w, h);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        // Two crossing wave trains + a slow diagonal swell
        var wave = 0.6 * Math.sin(c * 0.21 + t * 0.36) * Math.sin(r * 0.17 + t * 0.28)
                 + 0.4 * Math.sin(c * 0.11 - r * 0.13 + t * 0.19);
        // Cubic bias: crests ~19%, troughs ~0.4% — visible 2:1 light:dark ratio
        var norm = (wave + 1) * 0.5;
        var v    = norm * norm * norm;
        var a    = Math.round((0.004 + v * 0.186) * 100) / 100; // 2dp — browser caches fillStyle
        if (a < 0.02) continue;    // skip near-invisible tiles for speed
        ctx.fillStyle = pre + a + ')';
        ctx.fillRect(c * TILE + GAP, r * TILE + GAP, TILE - GAP, TILE - GAP);
      }
    }

    t += 0.007; // slow, calm wave speed
  }

  var resizeTimer;
  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var newW = window.innerWidth;
      var newH = window.innerHeight;
      // Skip height-only changes ≤ 90px — those are caused by the mobile
      // address bar appearing/disappearing, not a real layout change.
      // Resetting canvas.height in that case blanks the canvas for one frame,
      // producing the visible "shake" on iOS Safari.
      if (newW === canvas.width && Math.abs(newH - canvas.height) <= 90) return;
      canvas.width  = newW;
      canvas.height = newH;
    }, 120);
  }

  // Pause animation when tab is hidden to save CPU/battery
  function onVisibilityChange() {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else {
      if (!rafId) rafId = requestAnimationFrame(frame);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
                           'z-index:0;pointer-events:none;will-change:transform;' +
                           '-webkit-backface-visibility:hidden;backface-visibility:hidden;';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    rafId = requestAnimationFrame(frame);
  });

  // Watch for data-theme changes with MutationObserver — avoids patching Element.prototype
  new MutationObserver(function () { cachedRgb = rgb(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

// ── Theme Switcher ──────────────────────────────────────────────────────────
(function () {
  var THEMES = ['white', 'yellow', 'blue', 'dark'];
  var LABELS = { white: 'Pure White', yellow: 'Warm Yellow', blue: 'Cool Blue', dark: 'Dark' };

  function applyTheme(theme) {
    if (theme === 'white') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    try { localStorage.setItem('site-theme', theme); } catch(e) {}
    document.querySelectorAll('.theme-dot').forEach(function (dot) {
      dot.classList.toggle('active', dot.dataset.theme === theme);
    });
  }

  // Apply saved theme immediately (before DOMContentLoaded to avoid flash)
  var saved = 'white';
  try { saved = localStorage.getItem('site-theme') || 'white'; } catch(e) {}
  applyTheme(saved);

  document.addEventListener('DOMContentLoaded', function () {
    var switcher = document.createElement('div');
    switcher.id = 'theme-switcher';
    switcher.setAttribute('aria-label', 'Choose colour theme');
    THEMES.forEach(function (t) {
      var btn = document.createElement('button');
      btn.className = 'theme-dot';
      btn.dataset.theme = t;
      btn.title = LABELS[t];
      btn.setAttribute('aria-label', LABELS[t]);
      btn.addEventListener('click', function () { applyTheme(t); });
      switcher.appendChild(btn);
    });
    document.body.appendChild(switcher);
    // Re-apply to mark active dot after DOM is ready
    applyTheme(saved);
  });
})();

// ── Visitor Map ─────────────────────────────────────────────────────────────
// Statable's "auto" theme follows the operating system, while this site has
// its own theme switcher. Recreate the widget when the site theme changes so
// the map and the page always speak the same visual language.
(function () {
  var MAP_PALETTES = {
    white:  { theme: 'light', primary: '#6f927f', ocean: '#f1f4f2', text: '#60736a' },
    yellow: { theme: 'light', primary: '#9a7d4e', ocean: '#f4ebdd', text: '#735d38' },
    blue:   { theme: 'light', primary: '#668bb4', ocean: '#e8eef5', text: '#536c88' },
    dark:   { theme: 'dark',  primary: '#8caf9d', ocean: '#1b1d1b', text: '#c8d5ce' }
  };
  var renderedTheme = null;
  var rerenderTimer = null;

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'white';
  }

  function renderVisitorMap() {
    var host = document.getElementById('visitorMapWidget');
    if (!host) return;

    var theme = currentTheme();
    if (theme === renderedTheme && host.querySelector('svg')) return;
    var palette = MAP_PALETTES[theme] || MAP_PALETTES.white;
    renderedTheme = theme;
    host.replaceChildren();

    var script = document.createElement('script');
    script.src = host.dataset.widgetSrc;
    script.dataset.id = host.dataset.widgetId;
    script.dataset.period = '30d';
    script.dataset.displayMode = 'heatmap';
    script.dataset.theme = palette.theme;
    script.dataset.width = '264';
    script.dataset.height = '165';
    script.dataset.primaryColor = palette.primary;
    script.dataset.oceanColor = palette.ocean;
    script.dataset.statsTextColor = palette.text;
    script.dataset.outerRadius = '12';
    script.dataset.showStats = 'false';
    host.appendChild(script);
  }

  function scheduleRender() {
    window.clearTimeout(rerenderTimer);
    rerenderTimer = window.setTimeout(renderVisitorMap, 80);
  }

  document.addEventListener('DOMContentLoaded', renderVisitorMap);
  new MutationObserver(scheduleRender).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
})();

// ── Scroll-spy — highlight the active section's nav link ─────────────────────
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('.site-nav__link[href*="#"]');
    if (!links.length) return;

    // Build list of { el, link } pairs for anchors that exist on the page
    var anchors = [];
    links.forEach(function (link) {
      var hash = (link.getAttribute('href') || '').split('#')[1];
      if (!hash) return;
      var el = document.getElementById(hash);
      if (el) anchors.push({ el: el, link: link });
    });
    if (!anchors.length) return;

    var current = null;
    var suppressUntil = 0;
    var nav = document.querySelector('.site-nav');

    // Scroll the nav strip so the active link is always visible
    function scrollNavToLink(link) {
      if (!nav) return;
      var navRect  = nav.getBoundingClientRect();
      var linkRect = link.getBoundingClientRect();
      var pad = 12;
      var visLeft  = linkRect.left  - navRect.left;
      var visRight = linkRect.right - navRect.left;
      if (visLeft < pad) {
        nav.scrollLeft += visLeft - pad;
      } else if (visRight > navRect.width - pad) {
        nav.scrollLeft += visRight - navRect.width + pad;
      }
    }

    function setActive(link) {
      if (current === link) return;
      links.forEach(function (l) { l.classList.remove('nav-active'); });
      current = link;
      if (current) {
        current.classList.add('nav-active');
        scrollNavToLink(current);
      }
    }

    // Click: lock highlight + suppress scroll-spy for 1 s
    // About Me: always scroll to top instead of jumping to anchor.
    // Use capture phase so we fire before jQuery's bubble-phase smoothScroll handler.
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        setActive(link);
        suppressUntil = Date.now() + 1000;
        if ((link.getAttribute('href') || '').indexOf('about-me') !== -1) {
          e.preventDefault();
          e.stopImmediatePropagation(); // block jQuery smoothScroll which fires in bubble phase
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, { capture: true });
    });

    var scrollPending = false;
    function onScroll() {
      if (Date.now() < suppressUntil) return;
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(function () {
        scrollPending = false;
        if (Date.now() < suppressUntil) return;
        var offset = 80;
        var scrollY = window.scrollY + offset;
        var active = anchors[0].link;
        for (var i = anchors.length - 1; i >= 0; i--) {
          if (anchors[i].el.getBoundingClientRect().top + window.scrollY <= scrollY) {
            active = anchors[i].link;
            break;
          }
        }
        setActive(active);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
})();

// Segmented control — move indicator to the active segment
function moveSegIndicator(control, activeBtn) {
  var indicator = control.querySelector('.seg-indicator');
  if (!indicator) return;
  indicator.style.left = activeBtn.offsetLeft + 'px';
  indicator.style.width = activeBtn.offsetWidth + 'px';
}

// News Toggle — smooth animation using exact scrollHeight
function toggleNews() {
  var content = document.getElementById('newsContent');
  var btn = document.getElementById('newsToggleBtn');
  if (!content || !btn) return;

  var btnText = btn.querySelector('span');
  var isExpanded = content.classList.contains('expanded');

  if (isExpanded) {
    content.style.maxHeight = content.scrollHeight + 'px';
    content.classList.remove('expanded');
    requestAnimationFrame(function() { requestAnimationFrame(function() {
      content.style.maxHeight = '300px';
    }); });
    if (btnText) btnText.textContent = 'Show More';
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
    content.classList.add('expanded');
    content.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'max-height') content.style.maxHeight = 'none';
    }, { once: true });
    if (btnText) btnText.textContent = 'Show Less';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Detach sidebar from Stickyfill
  var sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.remove('sticky');
    if (window.Stickyfill) Stickyfill.remove(sidebar);
  }

  // Init all seg-controls: position indicator over the active button
  requestAnimationFrame(function() {
    document.querySelectorAll('.seg-control').forEach(function(control) {
      var activeBtn = control.querySelector('.seg-btn.active');
      if (activeBtn) moveSegIndicator(control, activeBtn);
    });
  });

  // Publication filter
  var pubFilter = document.getElementById('pubFilter');
  var boxes = document.querySelectorAll('.paper-box');
  if (pubFilter) {
    pubFilter.querySelectorAll('.seg-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        pubFilter.querySelectorAll('.seg-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        moveSegIndicator(pubFilter, btn);
        var filter = btn.dataset.filter;
        boxes.forEach(function(box) {
          var isCore = box.dataset.core === 'true';
          box.style.display = (filter === 'all' || (filter === 'core' && isCore)) ? '' : 'none';
        });
      });
    });
  }

  // News toggle
  var newsToggle = document.getElementById('newsToggleBtn');
  if (newsToggle) newsToggle.addEventListener('click', toggleNews);
});

// Sidebar Pin — JS-based because CSS position:sticky is unreliable with the
// Susy float-based grid layout used by this theme.
(function () {
  var BREAKPOINT = 925;

  function pin() {
    if (window.innerWidth < BREAKPOINT) return;
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar || sidebar.classList.contains('sidebar--pinned')) return;

    var masthead = document.querySelector('.masthead');
    var top = masthead ? Math.round(masthead.getBoundingClientRect().bottom) : 0;
    var rect = sidebar.getBoundingClientRect();

    // Spacer keeps the layout width occupied
    var spacer = document.createElement('div');
    spacer.className = 'sidebar-spacer';
    spacer.style.width = Math.round(rect.width) + 'px';
    spacer.style.flexShrink = '0';
    sidebar.parentNode.insertBefore(spacer, sidebar);

    sidebar.style.top = top + 'px';
    sidebar.style.left = Math.round(rect.left) + 'px';
    sidebar.style.width = Math.round(rect.width) + 'px';
    sidebar.classList.add('sidebar--pinned');
  }

  function unpin() {
    var sidebar = document.querySelector('.sidebar');
    var spacer = document.querySelector('.sidebar-spacer');
    if (sidebar) {
      sidebar.classList.remove('sidebar--pinned');
      sidebar.style.top = sidebar.style.left = sidebar.style.width = '';
    }
    if (spacer && spacer.parentNode) spacer.parentNode.removeChild(spacer);
  }

  document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(pin);
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    unpin();
    resizeTimer = setTimeout(function () { requestAnimationFrame(pin); }, 150);
  });
})();

// (scroll-spy and nav click handling moved above)

// ── Portfolio video autoplay on visible ────────────────────────────────────
(function () {
  function setupPortfolioVideos() {
    var videos = document.querySelectorAll('.portfolio-video[data-autoplay]');
    if (!videos.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          var card = video.closest('.portfolio-card');
          var playBtn = card ? card.querySelector('.portfolio-card__play') : null;

          if (entry.isIntersecting) {
            video.play().then(function () {
              if (card) card.classList.add('is-playing');
            }).catch(function () {
              // autoplay blocked — user needs to interact first
            });
          } else {
            video.pause();
            if (card) card.classList.remove('is-playing');
          }
        });
      }, { threshold: 0.6 });

      videos.forEach(function (v) { observer.observe(v); });
    }

    // Click-to-toggle play/pause on video cards
    document.querySelectorAll('.portfolio-card--video').forEach(function (card) {
      card.addEventListener('click', function (e) {
        var video = card.querySelector('video');
        if (!video) return;
        if (video.paused) {
          video.play();
          card.classList.add('is-playing');
        } else {
          video.pause();
          card.classList.remove('is-playing');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', setupPortfolioVideos);
})();

// ── Portfolio carousel controls ────────────────────────────────────────────
(function () {
  function setupPortfolioCarousel(root) {
    var track = root.querySelector('[data-portfolio-track]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.portfolio-card'));
    var prev = root.querySelector('[data-portfolio-prev]');
    var next = root.querySelector('[data-portfolio-next]');
    var currentLabel = root.querySelector('[data-portfolio-current]');
    var progress = root.querySelector('[data-portfolio-progress]');
    var currentIndex = 0;
    var ticking = false;

    if (!track || !cards.length || !prev || !next) return;

    function cardScrollLeft(card) {
      return card.offsetLeft - cards[0].offsetLeft;
    }

    function indexFromScroll() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll > 0 && track.scrollLeft >= maxScroll - 2) return cards.length - 1;

      var target = track.scrollLeft;
      var nearest = 0;
      var nearestDistance = Infinity;
      cards.forEach(function (card, index) {
        var distance = Math.abs(cardScrollLeft(card) - target);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });
      return nearest;
    }

    function update(index) {
      currentIndex = Math.max(0, Math.min(index, cards.length - 1));
      prev.disabled = currentIndex === 0;
      next.disabled = currentIndex === cards.length - 1;

      if (currentLabel) {
        currentLabel.textContent = String(currentIndex + 1).padStart(2, '0');
      }
      if (progress) {
        progress.style.width = (((currentIndex + 1) / cards.length) * 100) + '%';
      }
      cards.forEach(function (card, index) {
        card.classList.toggle('is-current', index === currentIndex);
      });
    }

    function goTo(index) {
      var targetIndex = Math.max(0, Math.min(index, cards.length - 1));
      // Direct assignment is deliberate: Chromium can cancel a smooth programmatic
      // scroll when mandatory snap points are active, leaving the carousel at zero.
      track.scrollLeft = cardScrollLeft(cards[targetIndex]);
      update(targetIndex);
    }

    prev.addEventListener('click', function () { goTo(currentIndex - 1); });
    next.addEventListener('click', function () { goTo(currentIndex + 1); });

    track.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(currentIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(currentIndex + 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        goTo(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goTo(cards.length - 1);
      }
    });

    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        update(indexFromScroll());
        ticking = false;
      });
    }, { passive: true });

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { update(indexFromScroll()); }).observe(track);
    } else {
      window.addEventListener('resize', function () { update(indexFromScroll()); });
    }

    update(0);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-portfolio]').forEach(setupPortfolioCarousel);
  });
})();

// Activity heatmaps. The JSON contains aggregate counts only. A local scheduled
// task runs scripts/refresh_activity.ps1 every six hours and publishes the snapshot.
(function () {
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var DAY_MS = 24 * 60 * 60 * 1000;
  var REFRESH_MS = 6 * 60 * 60 * 1000;

  function compact(value) {
    var number = Number(value || 0);
    var units = [
      { value: 1e12, suffix: 'T' },
      { value: 1e9, suffix: 'B' },
      { value: 1e6, suffix: 'M' },
      { value: 1e3, suffix: 'K' }
    ];
    for (var i = 0; i < units.length; i++) {
      if (number >= units[i].value) {
        var scaled = number / units[i].value;
        return (scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1).replace(/\.0$/, '')) + units[i].suffix;
      }
    }
    return number.toLocaleString('en-US');
  }

  function quantiles(days, valueKey) {
    var values = days.map(function (item) { return Number(item[valueKey] || 0); })
      .filter(function (value) { return value > 0; })
      .sort(function (a, b) { return a - b; });
    if (!values.length) return [1, 2, 3, 4];
    function at(percent) { return values[Math.min(values.length - 1, Math.floor((values.length - 1) * percent))]; }
    return [at(0.2), at(0.48), at(0.73), at(0.9)];
  }

  function levelFor(value, breaks) {
    if (!value) return 0;
    if (value <= breaks[0]) return 1;
    if (value <= breaks[1]) return 2;
    if (value <= breaks[2]) return 3;
    return 4;
  }

  function svgNode(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    return node;
  }

  function renderHeatmap(element, days, valueKey, unitLabel) {
    if (!element || !days || !days.length) return;
    var sorted = days.slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
    var first = new Date(sorted[0].date + 'T00:00:00Z');
    var firstSunday = new Date(first.getTime() - first.getUTCDay() * DAY_MS);
    var last = new Date(sorted[sorted.length - 1].date + 'T00:00:00Z');
    var weekCount = Math.floor((last - firstSunday) / (7 * DAY_MS)) + 1;
    var step = 13;
    var size = 11;
    var left = 24;
    var top = 18;
    var width = left + weekCount * step + 3;
    var height = top + 7 * step + 4;
    var breaks = quantiles(sorted, valueKey);
    var svg = svgNode('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': element.getAttribute('aria-label') || 'Activity heatmap',
      preserveAspectRatio: 'xMinYMin meet'
    });

    [['Mon', 1], ['Wed', 3], ['Fri', 5]].forEach(function (item) {
      var text = svgNode('text', { x: 0, y: top + item[1] * step + 6 });
      text.textContent = item[0];
      svg.appendChild(text);
    });

    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var lastMonth = -1;
    var lastMonthColumn = -6;

    sorted.forEach(function (item) {
      var date = new Date(item.date + 'T00:00:00Z');
      var column = Math.floor((date - firstSunday) / (7 * DAY_MS));
      var weekday = date.getUTCDay();
      var month = date.getUTCMonth();
      if (month !== lastMonth && column - lastMonthColumn >= 4) {
        var label = svgNode('text', { x: left + column * step, y: 8 });
        label.textContent = monthNames[month];
        svg.appendChild(label);
        lastMonthColumn = column;
      }
      lastMonth = month;

      var value = Number(item[valueKey] || 0);
      var rect = svgNode('rect', {
        x: left + column * step,
        y: top + weekday * step,
        width: size,
        height: size,
        class: 'activity-cell level-' + levelFor(value, breaks),
        tabindex: '-1'
      });
      var title = svgNode('title');
      title.textContent = item.date + ': ' + value.toLocaleString('en-US') + ' ' + unitLabel;
      rect.appendChild(title);
      svg.appendChild(rect);
    });

    element.replaceChildren(svg);
    window.requestAnimationFrame(function () {
      element.scrollLeft = element.scrollWidth;
    });
  }

  function updateActivity(payload) {
    var githubMetric = document.getElementById('githubActivityMetric');
    var tokenMetric = document.getElementById('tokenActivityMetric');
    var requestCount = document.getElementById('tokenRequestCount');
    var updated = document.getElementById('activityUpdated');
    if (!githubMetric || !tokenMetric) return;

    githubMetric.textContent = Number(payload.github.total_contributions || 0).toLocaleString('en-US');
    githubMetric.title = githubMetric.textContent + ' contributions';
    var periodTokens = Number(payload.ai.period_tokens || payload.ai.total_tokens || 0);
    var periodRequests = Number(payload.ai.period_requests || payload.ai.total_requests || 0);
    tokenMetric.textContent = compact(periodTokens);
    tokenMetric.title = periodTokens.toLocaleString('en-US') + ' tokens in the last 6 months';
    requestCount.textContent = compact(periodRequests) + ' requests · last 6 months';

    renderHeatmap(document.getElementById('githubHeatmap'), payload.github.days, 'count', 'contributions');
    renderHeatmap(document.getElementById('tokenHeatmap'), payload.ai.days, 'tokens', 'tokens');

    var generated = new Date(payload.generated_at);
    updated.textContent = 'Local aggregates updated ' + generated.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + '. Next refresh within 6 hours.';
  }

  function loadActivity() {
    var grid = document.getElementById('activityGrid');
    if (!grid) return;
    var source = grid.getAttribute('data-source');
    fetch(source + '?v=' + Date.now(), { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Activity data unavailable');
        return response.json();
      })
      .then(updateActivity)
      .catch(function () {
        var updated = document.getElementById('activityUpdated');
        if (updated) updated.textContent = 'Showing the built-in activity snapshot. The next 6-hour refresh will retry.';
      });
  }

  function loadFallbackActivity() {
    var fallback = document.getElementById('activityFallbackData');
    if (!fallback) return false;
    try {
      var payload = JSON.parse(fallback.textContent || '{}');
      if (!payload.github || !payload.ai) return false;
      updateActivity(payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('activityGrid')) return;
    loadFallbackActivity();
    loadActivity();
    window.setInterval(loadActivity, REFRESH_MS);
  });
})();

// Time-aware mascot. Schedule is calculated in Asia/Shanghai regardless of the
// visitor's local timezone, then images cross-fade at natural daily boundaries.
(function () {
  var states = {
    working:  { file: 'mascot-working.webp',  label: 'WORKING',  alt: 'Chen Xi is working' },
    sleeping: { file: 'mascot-sleeping.webp', label: 'SLEEPING', alt: 'Chen Xi is sleeping' },
    eating:   { file: 'mascot-eating.webp',   label: 'EATING',   alt: 'Chen Xi is eating' },
    drinking: { file: 'mascot-drinking.webp', label: 'OFF DUTY', alt: 'Chen Xi is relaxing with a drink' }
  };

  function shanghaiMinutes() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    var values = {};
    parts.forEach(function (part) { values[part.type] = part.value; });
    return (Number(values.hour) % 24) * 60 + Number(values.minute);
  }

  function scheduledState(minutes) {
    if (minutes < 390) return 'sleeping';       // 00:00 to 06:30
    if (minutes < 480) return 'eating';         // breakfast
    if (minutes < 705) return 'working';        // morning work
    if (minutes < 810) return 'eating';         // lunch
    if (minutes < 1080) return 'working';       // afternoon work
    if (minutes < 1170) return 'eating';        // dinner
    if (minutes < 1350) return 'drinking';      // evening break
    return 'sleeping';                          // 22:30 to midnight
  }

  document.addEventListener('DOMContentLoaded', function () {
    var widget = document.getElementById('mascotWidget');
    var button = document.getElementById('mascotButton');
    var image = document.getElementById('mascotImage');
    var status = document.getElementById('mascotStatus');
    var bubble = document.getElementById('mascotBubble');
    var contact = document.getElementById('mascotContact');
    var contactClose = document.getElementById('mascotContactClose');
    var emailSend = document.getElementById('mascotEmailSend');
    if (!widget || !button || !image || !status || !bubble || !contact) return;

    var baseUrl = image.getAttribute('data-base-url') || '/assets/images/mascot/';
    var currentState = '';
    var interactionStep = 0;
    var contactOpen = false;
    var bubbleTimer = null;

    Object.keys(states).forEach(function (name) {
      var preload = new Image();
      preload.src = baseUrl + states[name].file;
    });

    function closeBubble(resetStep) {
      bubble.classList.remove('is-visible');
      if (resetStep !== false && !contactOpen) interactionStep = 0;
    }

    function closeContact() {
      contact.classList.remove('is-visible');
      contact.setAttribute('aria-hidden', 'true');
      contactOpen = false;
      interactionStep = 0;
    }

    function openContact() {
      window.clearTimeout(bubbleTimer);
      closeBubble(false);
      contact.classList.add('is-visible');
      contact.setAttribute('aria-hidden', 'false');
      contactOpen = true;
      interactionStep = 2;
      if (emailSend) emailSend.focus({ preventScroll: true });
    }

    function setState(nextState, immediate) {
      if (nextState === currentState) return;
      var details = states[nextState];
      currentState = nextState;
      widget.setAttribute('data-state', nextState);
      status.textContent = details.label;
      status.title = 'Automatically follows Beijing time';
      button.setAttribute('aria-label', details.alt + '. Click to talk.');
      closeBubble();
      closeContact();

      if (immediate) {
        image.src = baseUrl + details.file;
        image.alt = details.alt;
        return;
      }

      image.classList.add('is-changing');
      window.setTimeout(function () {
        image.src = baseUrl + details.file;
        image.alt = details.alt;
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () { image.classList.remove('is-changing'); });
        });
      }, 230);
    }

    function syncState(immediate) {
      var preview = new URLSearchParams(window.location.search).get('mascot');
      setState(states[preview] ? preview : scheduledState(shanghaiMinutes()), immediate);
    }

    button.addEventListener('click', function () {
      if (contactOpen) {
        if (emailSend) emailSend.click();
        closeBubble();
        return;
      }

      if (interactionStep === 1) {
        openContact();
        return;
      }

      bubble.textContent = currentState === 'working'
        ? '\u60f3\u8ddf\u6211\u804a\u804a\u561b\uff1f'
        : '\u6211\u5728\u73a9\uff0c\u624d\u4e0d\u4f1a\u7406\u4f60\u5462\u3002';
      bubble.classList.add('is-visible');
      interactionStep = 1;
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(function () { closeBubble(true); }, 7000);
    });

    if (contactClose) contactClose.addEventListener('click', closeContact);

    syncState(true);
    window.setInterval(function () { syncState(false); }, 60 * 1000);
  });
})();
