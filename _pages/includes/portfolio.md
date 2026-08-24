# <i class="fas fa-folder-open section-icon"></i> Portfolio

<div class="portfolio-showcase" data-portfolio>
  <div class="portfolio-showcase__header">
    <p class="portfolio-showcase__intro">A few things I’ve helped build, benchmark, and occasionally keep alive past midnight.</p>

    <div class="portfolio-controls" aria-label="Portfolio navigation">
      <span class="portfolio-counter" aria-live="polite">
        <span data-portfolio-current>01</span><span class="portfolio-counter__divider">/</span><span>04</span>
      </span>
      <button class="portfolio-arrow" type="button" data-portfolio-prev aria-label="Previous project">
        <span aria-hidden="true">←</span>
      </button>
      <button class="portfolio-arrow" type="button" data-portfolio-next aria-label="Next project">
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </div>

  <div class="portfolio-progress" aria-hidden="true">
    <span data-portfolio-progress></span>
  </div>

  <div class="portfolio-track" data-portfolio-track tabindex="0" aria-label="Selected projects">
    <article class="portfolio-card portfolio-card--argus">
      <a class="portfolio-card__link" href="https://github.com/lbx154/Argus" target="_blank" rel="noopener noreferrer" aria-label="Open the Argus repository on GitHub">
        <div class="portfolio-card__media portfolio-card__media--argus">
          <span class="portfolio-media-badge portfolio-media-badge--dark">classified-ish</span>
          <span class="portfolio-orbit portfolio-orbit--one" aria-hidden="true"></span>
          <span class="portfolio-orbit portfolio-orbit--two" aria-hidden="true"></span>
          <img class="portfolio-card__argus-logo" src="{{ '/assets/portfolio/argus-logo.svg' | relative_url }}" alt="Argus" width="280" height="96">
          <div class="portfolio-role-chain" aria-hidden="true">
            <span>Manager</span><b>→</b><span>Planner</span><b>→</b><span>Engineer</span><b>⇄</b><span>Reviewer</span>
          </div>
        </div>
        <div class="portfolio-card__body">
          <div class="portfolio-card__topline">
            <span class="portfolio-card__number">01</span>
            <span class="portfolio-card__role">Participant · Agent Systems</span>
          </div>
          <h3 class="portfolio-card__title">Argus</h3>
          <p class="portfolio-card__desc">Pulled into a tiny “black room” to help with the fun questions: how can long-running agents plan, execute, review, and resume without losing the plot? I contribute across research and engineering.</p>
          <ul class="portfolio-card__tags" aria-label="Argus topics">
            <li>Autonomous Agents</li>
            <li>Research</li>
          </ul>
          <div class="portfolio-card__footer">
            <span>Persistent, reviewed autonomy</span>
            <span class="portfolio-card__open">View repo&nbsp; ↗</span>
          </div>
        </div>
      </a>
    </article>

    <article class="portfolio-card portfolio-card--h3">
      <a class="portfolio-card__link" href="https://github.com/Argus-AiTeam/minimax-h3-desktop" target="_blank" rel="noopener noreferrer" aria-label="Open the MiniMax-H3 desktop optimization repository on GitHub">
        <div class="portfolio-card__media portfolio-card__media--h3">
          <img class="portfolio-card__image" src="{{ '/assets/portfolio/minimax-h3-orbital.webp' | relative_url }}" alt="A generated spacecraft launching through an orbital shipyard" width="896" height="486" loading="lazy">
          <span class="portfolio-media-badge portfolio-media-badge--live"><i aria-hidden="true"></i> optimizing</span>
          <div class="portfolio-metrics" aria-hidden="true">
            <span><b>1×</b> RTX A6000</span>
            <span><b>1344×768</b> + audio</span>
          </div>
        </div>
        <div class="portfolio-card__body">
          <div class="portfolio-card__topline">
            <span class="portfolio-card__number">02</span>
            <span class="portfolio-card__role portfolio-card__role--live">Work in progress · GPU Systems</span>
          </div>
          <h3 class="portfolio-card__title">MiniMax-H3, Desktop Edition</h3>
          <p class="portfolio-card__desc">Making full audio-video generation fit—and move faster—on a single 48 GB RTX A6000. Currently deep in the optimize → benchmark → doubt → optimize loop.</p>
          <ul class="portfolio-card__tags" aria-label="MiniMax-H3 desktop topics">
            <li>Inference</li>
            <li>Optimization</li>
          </ul>
          <div class="portfolio-card__footer">
            <span>Single-GPU A/V generation</span>
            <span class="portfolio-card__open">View repo&nbsp; ↗</span>
          </div>
        </div>
      </a>
    </article>

    <article class="portfolio-card portfolio-card--ironrock">
      <a class="portfolio-card__link" href="https://github.com/bclz19/IronRock" target="_blank" rel="noopener noreferrer" aria-label="Open the IronRock desktop pet repository on GitHub">
        <div class="portfolio-card__media portfolio-card__media--ironrock">
          <span class="portfolio-media-badge">hackathon build</span>
          <span class="portfolio-file-chip portfolio-file-chip--pdf" aria-hidden="true">PDF</span>
          <span class="portfolio-file-chip portfolio-file-chip--md" aria-hidden="true">MD</span>
          <span class="portfolio-file-chip portfolio-file-chip--csv" aria-hidden="true">CSV</span>
          <img class="portfolio-card__pet" src="{{ '/assets/portfolio/ironrock-pet.webp' | relative_url }}" alt="The IronRock lab desktop pet holding a notebook" width="512" height="512" loading="lazy">
          <span class="portfolio-pet-bubble" aria-hidden="true">Knowledge filed. ✓</span>
        </div>
        <div class="portfolio-card__body">
          <div class="portfolio-card__topline">
            <span class="portfolio-card__number">03</span>
            <span class="portfolio-card__role">Hackathon · Desktop AI</span>
          </div>
          <h3 class="portfolio-card__title">IronRock Desktop Pet</h3>
          <p class="portfolio-card__desc">A hackathon detour turned PyQt6 desktop companion: feed it PDFs, notes, or logs; it organizes a local lab knowledge base and chats back. Surprisingly useful. Mildly distracting.</p>
          <ul class="portfolio-card__tags" aria-label="IronRock topics">
            <li>PyQt6</li>
            <li>Local Knowledge Base</li>
          </ul>
          <div class="portfolio-card__footer">
            <span>Files in, lab memory out</span>
            <span class="portfolio-card__open">View repo&nbsp; ↗</span>
          </div>
        </div>
      </a>
    </article>

    <article class="portfolio-card portfolio-card--feng">
      <a class="portfolio-card__link" href="https://github.com/Chenxxxxxx06/feng" target="_blank" rel="noopener noreferrer" aria-label="Open the Feng wind-turbine PHM repository on GitHub">
        <div class="portfolio-card__media portfolio-card__media--feng">
          <img class="portfolio-card__image" src="{{ '/assets/portfolio/feng-phm.webp' | relative_url }}" alt="Dark wind-farm monitoring dashboard with three sites on a map" width="1200" height="787" loading="lazy">
          <span class="portfolio-media-badge portfolio-media-badge--blue">coursework</span>
          <div class="portfolio-dashboard-strip" aria-hidden="true">
            <span><i></i> Monitor</span>
            <span><i></i> Diagnose</span>
            <span><i></i> Predict</span>
          </div>
        </div>
        <div class="portfolio-card__body">
          <div class="portfolio-card__topline">
            <span class="portfolio-card__number">04</span>
            <span class="portfolio-card__role">Course Project · Full-stack PHM</span>
          </div>
          <h3 class="portfolio-card__title">风调预顺</h3>
          <p class="portfolio-card__desc">A course project for wind-turbine predictive maintenance: monitoring, fault diagnosis, remaining-useful-life prediction, and work-order flows in one full-stack dashboard.</p>
          <ul class="portfolio-card__tags" aria-label="Feng project technologies">
            <li>React</li>
            <li>FastAPI</li>
          </ul>
          <div class="portfolio-card__footer">
            <span>Wind-energy health management</span>
            <span class="portfolio-card__open">View repo&nbsp; ↗</span>
          </div>
        </div>
      </a>
    </article>
  </div>

  <p class="portfolio-scroll-hint"><i class="fas fa-arrows-alt-h" aria-hidden="true"></i> Swipe or use the arrows — each card opens its repository.</p>
</div>
