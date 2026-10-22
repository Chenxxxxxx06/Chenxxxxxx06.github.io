# <i class="fas fa-newspaper section-icon"></i> News

{% capture news_items %}
- *2025 - Now:* Deep in the trenches with multi-modal anomaly detection, embodied AI, and agent frameworks. Always open to chat if our interests overlap!

- *2025.12:* 🏆 Received the **National Scholarship** — still can't quite believe it.

- *2026.09:* 🎓 Grad school admissions: wrapped! Next stop, **Peking University**. Beijing, see you soon.

- *2026.10:* 🏆 Received the **National Scholarship** again. Still feels a little unreal.
{% endcapture %}

<div class="news-wrapper">
  <div class="news-content" id="newsContent">
    {{ news_items | markdownify }}
  </div>
</div>
