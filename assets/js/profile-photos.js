(function () {
  'use strict';

  function setup(button) {
    var image = button.querySelector('img');
    var source = button.parentNode.querySelector('[data-profile-photo-list]');
    var photos;
    try { photos = JSON.parse(source.textContent); } catch (_) { return; }
    if (!image || !Array.isArray(photos) || photos.length < 2) return;

    var index = 0;
    var loading = false;
    function updateLabel() {
      button.setAttribute('aria-label', 'Next photo (' + (index + 1) + ' of ' + photos.length + ')');
    }
    updateLabel();

    // Native button behavior handles click, Enter and Space without scrolling.
    button.addEventListener('click', function () {
      if (loading) return;
      loading = true;
      button.setAttribute('aria-busy', 'true');
      var next = (index + 1) % photos.length;
      var candidate = new Image();
      function done() {
        loading = false;
        button.setAttribute('aria-busy', 'false');
      }
      candidate.onload = function () {
        image.src = photos[next];
        index = next;
        updateLabel();
        done();
      };
      candidate.onerror = done;
      candidate.src = photos[next];
    });
  }

  function init() {
    document.querySelectorAll('[data-profile-photos]').forEach(setup);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
