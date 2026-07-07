# <i class="fas fa-folder-open section-icon"></i> Portfolio

<style>
.portfolio-carousel { position: relative; width: 100%; padding: 0; }
.portfolio-track {
  display: flex; gap: 20px; overflow-x: auto;
  scroll-snap-type: x mandatory; scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding: 10px 0 18px 0; scrollbar-width: none;
}
.portfolio-track::-webkit-scrollbar { display: none; }
.portfolio-card {
  flex: 0 0 min(calc(100vw - 80px), 380px); scroll-snap-align: start;
  border-radius: 16px; overflow: hidden;
  background: var(--bg, #fff);
  border: 1px solid var(--masthead-border, #e8e8e8);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
  cursor: pointer; position: relative;
}
.portfolio-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.12); transform: translateY(-2px);
}
.portfolio-card.active {
  border-color: var(--c-text, #333);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}
.portfolio-media {
  width: 100%; height: 220px; background: var(--masthead-bg, #f5f5f5);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; position: relative;
}
.portfolio-media video, .portfolio-media img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.portfolio-media .media-placeholder {
  font-size: 52px; opacity: 0.25;
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%;
}
.portfolio-info { padding: 18px 22px; }
.portfolio-info h3 {
  font-size: 1.1em; margin: 0 0 6px 0; color: var(--c-text, #333);
}
.portfolio-info .tag {
  display: inline-block;
  background: rgba(var(--glow-rgb, 0,0,0), 0.08);
  color: var(--c-text, #333);
  font-size: 0.72em; font-weight: 600;
  padding: 3px 12px; border-radius: 20px; margin-bottom: 8px;
  letter-spacing: 0.04em;
}
.portfolio-info p {
  font-size: 0.88em; color: var(--c-text, #555);
  opacity: 0.65; margin: 0; line-height: 1.55;
}
.portfolio-arrows {
  display: flex; gap: 12px; justify-content: center;
  margin-top: 4px; margin-bottom: 10px;
}
.portfolio-arrow {
  width: 42px; height: 42px; border-radius: 50%;
  border: 1px solid var(--masthead-border, #ddd);
  background: var(--bg, #fff); cursor: pointer;
  font-size: 18px; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; color: var(--c-text, #555);
}
.portfolio-arrow:hover { background: var(--c-text, #333); color: var(--bg, #fff); }
@media (max-width: 768px) {
  .portfolio-card { flex: 0 0 min(calc(100vw - 60px), 320px); }
  .portfolio-media { height: 190px; }
}
</style>

<div class="portfolio-carousel">
  <div class="portfolio-track" id="portfolioTrack"></div>
</div>

<div class="portfolio-arrows">
  <button class="portfolio-arrow" id="portfolioPrev" aria-label="Previous">&#8249;</button>
  <button class="portfolio-arrow" id="portfolioNext" aria-label="Next">&#8250;</button>
</div>

<div class="portfolio-note">
  <p><em>More projects coming. Drop me a line if you want a sneak peek!</em></p>
</div>

<script>
(function() {
  var portfolioData = [
    {
      type: "placeholder",
      emoji: "🤖",
      title: "Embodied AI — Robot Arm Demo",
      tag: "VLA · Robotics",
      desc: "My gloriously awkward robotic arm! It wobbles, it learns, it picks things up (most of the time). Making embodied agents useful — one experiment at a time."
    },
    {
      type: "placeholder",
      emoji: "👁️",
      title: "Multi-modal Anomaly Detection",
      tag: "VLM · Vision",
      desc: "Spotting the weird stuff — fast and slow anomalies across video, text, and audio. Because why watch one modality when you can watch three?"
    },
    {
      type: "placeholder",
      emoji: "🧠",
      title: "Data Analysis Agent",
      tag: "Agent · LLM",
      desc: "Your friendly neighborhood prompt whisperer at work. A smarter framework for automated data analysis — the right prompt changes everything."
    }
  ];

  var track = document.getElementById('portfolioTrack');
  var prevBtn = document.getElementById('portfolioPrev');
  var nextBtn = document.getElementById('portfolioNext');

  function createCard(item) {
    var card = document.createElement('div');
    card.className = 'portfolio-card';
    var mediaDiv = document.createElement('div');
    mediaDiv.className = 'portfolio-media';

    if (item.type === 'video') {
      var video = document.createElement('video');
      video.src = item.src;
      video.muted = true; video.loop = true; video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('preload', 'auto');
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.display = 'block';
      if (item.poster) video.poster = item.poster;
      // Show first frame on load
      video.addEventListener('loadeddata', function() {
        video.currentTime = 0.1;
      });
      mediaDiv.appendChild(video);
      card._video = video;
    } else if (item.type === 'placeholder') {
      var ph = document.createElement('span');
      ph.className = 'media-placeholder';
      ph.textContent = item.emoji || '🚀';
      mediaDiv.appendChild(ph);
    } else {
      var img = document.createElement('img');
      img.src = item.src; img.alt = item.title; img.loading = 'lazy';
      img.onerror = function() {
        img.style.display = 'none';
        var ph = document.createElement('span');
        ph.className = 'media-placeholder'; ph.textContent = '🚀';
        mediaDiv.appendChild(ph);
      };
      mediaDiv.appendChild(img);
    }

    var infoDiv = document.createElement('div');
    infoDiv.className = 'portfolio-info';
    infoDiv.innerHTML = '<span class="tag">' + item.tag + '</span>' +
      '<h3>' + item.title + '</h3>' + '<p>' + item.desc + '</p>';
    card.appendChild(mediaDiv); card.appendChild(infoDiv);
    return card;
  }

  portfolioData.forEach(function(item) { track.appendChild(createCard(item)); });
  if (portfolioData.length === 0) {
    track.innerHTML = '<p style="color:var(--c-text);opacity:0.5;text-align:center;width:100%;padding:2em 0;">Projects coming soon — stay tuned!</p>';
  }

  var currentIndex = 0;
  function getCardWidth() {
    var card = track.querySelector('.portfolio-card');
    return card ? card.offsetWidth + 20 : 400;
  }
  function scrollToCard(index) {
    var cards = track.querySelectorAll('.portfolio-card');
    if (cards.length === 0) return;
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    track.scrollTo({ left: currentIndex * getCardWidth(), behavior: 'smooth' });
    updateActiveCard();
  }
  function updateActiveCard() {
    var cards = track.querySelectorAll('.portfolio-card');
    if (!cards.length) return;
    var scrollCenter = track.scrollLeft + track.offsetWidth / 2;
    cards.forEach(function(card) {
      var cardCenter = card.offsetLeft + card.offsetWidth / 2;
      if (Math.abs(scrollCenter - cardCenter) < card.offsetWidth / 2) {
        card.classList.add('active');
        if (card._video && card._video.paused) {
          card._video.play().catch(function(){});
        }
      } else {
        card.classList.remove('active');
        if (card._video && !card._video.paused) card._video.pause();
      }
    });
  }
  track.addEventListener('click', function(e) {
    var card = e.target.closest('.portfolio-card');
    if (!card || !card._video) return;
    if (card._video.paused) { card._video.play(); card.classList.add('active'); }
    else { card._video.pause(); card.classList.remove('active'); }
  });
  prevBtn.addEventListener('click', function() { scrollToCard(currentIndex - 1); });
  nextBtn.addEventListener('click', function() { scrollToCard(currentIndex + 1); });
  track.addEventListener('scroll', updateActiveCard);
  track.setAttribute('tabindex', '0');
  var touchStartX = 0;
  track.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; });
  track.addEventListener('touchend', function(e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) scrollToCard(currentIndex + (diff > 0 ? 1 : -1));
  });
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.target._video) {
          if (entry.isIntersecting) entry.target._video.play().catch(function(){});
          else entry.target._video.pause();
        }
      });
    }, { threshold: 0.5 });
    setTimeout(function() {
      track.querySelectorAll('.portfolio-card').forEach(function(c) { observer.observe(c); });
    }, 150);
  }
  setTimeout(updateActiveCard, 300);
})();
</script>
