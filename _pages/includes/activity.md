# <i class="fas fa-chart-area section-icon"></i> Activity

<div class="activity-grid" id="activityGrid" data-source="{{ '/assets/data/activity.json' | relative_url }}">
  <section class="activity-card activity-card--github" aria-labelledby="githubActivityTitle">
    <header class="activity-card__header">
      <div>
        <p class="activity-card__eyebrow"><i class="fab fa-github" aria-hidden="true"></i> GitHub</p>
        <p class="activity-card__metric" id="githubActivityMetric">{{ site.data.activity.github.total_contributions | default: 'Loading' }}</p>
        <p class="activity-card__label" id="githubActivityTitle">contributions in the last 6 months</p>
      </div>
      <span class="activity-card__spark" aria-hidden="true">⌁</span>
    </header>
    <div class="activity-heatmap" id="githubHeatmap" aria-label="GitHub contribution heatmap"></div>
    <footer class="activity-card__footer">
      <span>Last 6 months</span>
      <span class="activity-legend" aria-label="Less to more activity"><small>Less</small><i></i><i></i><i></i><i></i><i></i><small>More</small></span>
    </footer>
  </section>

  <section class="activity-card activity-card--tokens" aria-labelledby="tokenActivityTitle">
    <header class="activity-card__header">
      <div>
        <p class="activity-card__eyebrow"><i class="fas fa-bolt" aria-hidden="true"></i> AI Tools</p>
        <p class="activity-card__metric" id="tokenActivityMetric" data-exact-tokens="{{ site.data.activity.ai.period_tokens }}">{{ site.data.activity.ai.period_tokens | default: 'Loading' }}</p>
        <p class="activity-card__label" id="tokenActivityTitle" title="{{ site.data.activity.ai.period.start }} to {{ site.data.activity.ai.period.end }}">tokens tracked</p>
      </div>
      <span class="activity-card__spark" aria-hidden="true">∿</span>
    </header>
    <div class="activity-heatmap" id="tokenHeatmap" aria-label="AI token usage heatmap"></div>
    <footer class="activity-card__footer">
      <span id="tokenRequestCount">All AI tools</span>
      <span class="activity-legend" aria-label="Less to more activity"><small>Less</small><i></i><i></i><i></i><i></i><i></i><small>More</small></span>
    </footer>
  </section>
</div>

<p class="activity-updated" id="activityUpdated" aria-live="polite" hidden></p>

<script type="application/json" id="activityFallbackData">{{ site.data.activity | jsonify }}</script>
