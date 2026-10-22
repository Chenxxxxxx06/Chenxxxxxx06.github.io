# <i class="fas fa-folder-open section-icon"></i> Portfolio

<div class="portfolio-showcase" data-portfolio>
  <div class="portfolio-showcase__header">
    <p class="portfolio-showcase__intro">A few things I’ve helped build, benchmark, and occasionally keep alive past midnight.</p>

    <div class="portfolio-controls" aria-label="Portfolio navigation">
      <span class="portfolio-counter" aria-live="polite">
        <span data-portfolio-current>01</span><span class="portfolio-counter__divider">/</span><span>05</span>
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
        <div class="portfolio-card__media portfolio-card__media--generated">
          <img class="portfolio-card__image" src="{{ '/assets/portfolio/generated/argus.webp' | relative_url }}" alt="Conceptual illustration of a persistent agent workflow" width="1672" height="941" loading="lazy">
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

    <article class="portfolio-card portfolio-card--labvla">
      <a class="portfolio-card__link" href="https://github.com/zjunlp/LabVLA" target="_blank" rel="noopener noreferrer" aria-label="Open the LabVLA repository on GitHub">
        <div class="portfolio-card__media portfolio-card__media--generated">
          <img class="portfolio-card__image" src="{{ '/assets/portfolio/generated/labvla.webp' | relative_url }}" alt="A laboratory robot working with scientific equipment" width="1672" height="941" loading="lazy">
        </div>
        <div class="portfolio-card__body">
          <div class="portfolio-card__topline">
            <span class="portfolio-card__number">02</span>
            <span class="portfolio-card__role">Research · Vision-Language-Action</span>
          </div>
          <h3 class="portfolio-card__title">LabVLA</h3>
          <p class="portfolio-card__desc">A project I worked on for grounding vision-language-action models in scientific laboratories—pairing a Qwen3-VL backbone with a DiT action expert for protocol-aware robot control.</p>
          <ul class="portfolio-card__tags" aria-label="LabVLA topics">
            <li>Vision-Language-Action</li>
            <li>Scientific Robotics</li>
          </ul>
          <div class="portfolio-card__footer">
            <span>Protocols into robot actions</span>
            <span class="portfolio-card__open">View repo&nbsp; ↗</span>
          </div>
        </div>
      </a>
    </article>

    <article class="portfolio-card portfolio-card--h3">
      <a class="portfolio-card__link" href="https://github.com/Argus-AiTeam/minimax-h3-desktop" target="_blank" rel="noopener noreferrer" aria-label="Open the MiniMax-H3 desktop optimization repository on GitHub">
        <div class="portfolio-card__media portfolio-card__media--generated">
          <img class="portfolio-card__image" src="{{ '/assets/portfolio/generated/minimax-h3.webp' | relative_url }}" alt="A single GPU generating video and audio" width="1672" height="941" loading="lazy">
        </div>
        <div class="portfolio-card__body">
          <div class="portfolio-card__topline">
            <span class="portfolio-card__number">03</span>
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
        <div class="portfolio-card__media portfolio-card__media--generated">
          <img class="portfolio-card__image" src="{{ '/assets/portfolio/generated/ironrock.webp' | relative_url }}" alt="A desktop companion organizing a local lab knowledge base" width="1672" height="941" loading="lazy">
        </div>
        <div class="portfolio-card__body">
          <div class="portfolio-card__topline">
            <span class="portfolio-card__number">04</span>
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
        <div class="portfolio-card__media portfolio-card__media--generated">
          <img class="portfolio-card__image" src="{{ '/assets/portfolio/generated/feng.webp' | relative_url }}" alt="Wind turbines with health monitoring and diagnostic signals" width="1672" height="941" loading="lazy">
        </div>
        <div class="portfolio-card__body">
          <div class="portfolio-card__topline">
            <span class="portfolio-card__number">05</span>
            <span class="portfolio-card__role">Course Project · Full-stack PHM</span>
          </div>
          <h3 class="portfolio-card__title">Feng · Wind-Turbine Predictive Maintenance</h3>
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

</div>
