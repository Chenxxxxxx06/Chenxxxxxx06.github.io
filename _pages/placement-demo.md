---
permalink: /placement-demo.html
title: ""
excerpt: ""
author_profile: true
sitemap: false
---

<link rel="stylesheet" href="{{ '/assets/placement-demo/placement-demo.css?v=20260827-1' | relative_url }}">

<aside class="placement-preview-bar" aria-label="Widget placement preview">
  <div class="placement-preview-bar__copy">
    <span>PLACEMENT PREVIEW</span>
    <strong>3 proposed inserts · homepage unchanged</strong>
  </div>
  <nav class="placement-preview-bar__nav" aria-label="Jump to proposed widgets">
    <a href="#placement-terminal" target="_self"><span>01</span> Terminal</a>
    <a href="#placement-route" target="_self"><span>02</span> Route</a>
    <a href="#placement-atlas" target="_self"><span>03</span> Atlas</a>
  </nav>
</aside>

<span class='anchor' id='about-me'></span>
{% include_relative includes/intro.md %}

{% include_relative includes/activity.md %}

{% include_relative includes/news.md %}

{% include_relative includes/pub.md %}

{% include_relative includes/portfolio.md %}

{% include_relative includes/placement-demo-terminal.html %}

{% include_relative includes/placement-demo-route.html %}

{% include_relative includes/experience.md %}

{% include_relative includes/honors.md %}

{% include_relative includes/placement-demo-atlas.html %}

<span class='anchor' id='end-page'></span>

<script src="{{ '/assets/placement-demo/placement-demo.js?v=20260827-1' | relative_url }}" defer></script>
