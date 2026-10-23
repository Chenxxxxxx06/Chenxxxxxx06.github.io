(function () {
  'use strict';

  const ASK_TIMEOUT_MS = 20000;
  const knowledgeCache = new WeakMap();
  const STATUS_COPY = {
    answered: { state: 'answered', status: 'From my public notes' },
    refused: { state: 'locked', status: 'Public notes only' },
    insufficient: { state: 'insufficient', status: 'Not in the notes yet' },
    rate_limited: { state: 'locked', status: 'Try again in a moment' },
    upstream_error: { state: 'offline', status: 'Please try again' }
  };

  function askEndpoint(widget) {
    return (widget.getAttribute('data-placement-ask-endpoint') || '').trim();
  }

  function setInteractive(widget, busy) {
    widget.querySelector('[data-placement-ask-input]').disabled = busy;
    const submit = widget.querySelector('[data-placement-ask-submit]');
    submit.disabled = busy;
    submit.textContent = busy ? '…' : 'enter ↵';
    widget.querySelectorAll('[data-placement-suggestion]').forEach(function (button) { button.disabled = busy; });
    widget.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function writeAskResult(widget, question, output, status, state) {
    widget.setAttribute('data-placement-knowledge-state', state);
    widget.querySelector('[data-placement-ask-state]').setAttribute('data-placement-ask-state', state);
    const questionNode = widget.querySelector('[data-placement-ask-question]');
    questionNode.textContent = question;
    questionNode.hidden = !question;
    widget.querySelector('[data-placement-ask-answer]').hidden = !output;
    widget.querySelector('[data-placement-terminal-output]').textContent = output;
    widget.querySelector('[data-placement-ask-status]').textContent = status;
    const sources = widget.querySelector('[data-placement-ask-sources]');
    sources.replaceChildren();
    sources.hidden = true;
  }

  function approvedSources(payload) {
    if (!payload || !Array.isArray(payload.sources)) return [];
    const seen = new Set();
    return payload.sources.reduce(function (sources, source) {
      if (!source || typeof source.url !== 'string') return sources;
      const label = typeof source.label === 'string' ? source.label.trim() : '';
      if (!label || !source.url.trim()) return sources;
      try {
        const url = new URL(source.url, document.baseURI);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || seen.has(url.href)) return sources;
        seen.add(url.href);
        sources.push({ label: label, url: url.href });
      } catch (error) { /* Ignore malformed source URLs. */ }
      return sources;
    }, []);
  }

  function renderSources(widget, payload) {
    const container = widget.querySelector('[data-placement-ask-sources]');
    approvedSources(payload).forEach(function (source) {
      const link = document.createElement('a');
      link.textContent = source.label + ' ↗';
      link.href = source.url;
      if (new URL(source.url).origin !== new URL(document.baseURI).origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } else link.target = '_self';
      container.appendChild(link);
    });
    container.hidden = container.children.length === 0;
  }

  function resultText(payload) {
    const answer = payload && typeof payload.answer === 'string' ? payload.answer.trim() : '';
    const status = payload && typeof payload.status === 'string' ? payload.status : '';
    if (!answer || !STATUS_COPY[status]) return '';
    if (status === 'answered' && approvedSources(payload).length === 0) return '';
    return answer;
  }

  async function loadKnowledge(widget, signal) {
    if (knowledgeCache.has(widget)) return knowledgeCache.get(widget);
    const url = widget.getAttribute('data-placement-knowledge-url');
    if (!url) throw new Error('No public notes configured');
    const response = await fetch(url, { signal: signal, credentials: 'same-origin' });
    if (!response.ok) throw new Error('Public notes unavailable');
    const data = await response.json();
    if (!data || data.schemaVersion !== 1 || !data.catalog || !data.responses || !data.policy || !Array.isArray(data.topics)) {
      throw new Error('Invalid public notes');
    }
    knowledgeCache.set(widget, data);
    return data;
  }

  function answerFromNotes(data, question) {
    const query = question.normalize('NFKC').replace(/[\u200B-\u200D\u2060\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
    const locale = 'en';
    function decline(reason, status) {
      return { status: status || 'refused', answer: data.responses[reason][locale], sources: [] };
    }
    if (!query || Array.from(query).length > 240 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(query)) {
      return decline('insufficient', 'insufficient');
    }
    const compact = query.toLowerCase().replace(/[\s._:/\\-]+/g, '');
    function matchesPolicy(name) {
      return (data.policy[name] || []).some(function (pattern) {
        const expression = new RegExp(pattern.source, pattern.flags);
        return expression.test(query) || expression.test(compact);
      });
    }
    if (matchesPolicy('sensitive')) return decline('sensitive');
    if (matchesPolicy('injection')) return decline('injection');
    const publicNews = typeof data.newsQuery === 'string' && new RegExp(data.newsQuery, 'i').test(query);
    if ((matchesPolicy('outOfScope') && !publicNews) || /https?:\/\/|www\.|[A-Za-z0-9+/=_-]{96,}/i.test(query)) return decline('out_of_scope');
    // Specific unpublished details cannot be inferred from a broad topic match.
    if (/how (?:many|much)|which (?:dataset|module)|具体|多少|参数|超参|数据集|模型多大/i.test(query)) return decline('insufficient', 'insufficient');
    const topic = data.topics.find(function (rule) { return new RegExp(rule[1], 'i').test(query); });
    const entry = topic && data.catalog[topic[0]];
    if (!entry) return decline('insufficient', 'insufficient');
    return { status: 'answered', answer: entry.answer[locale], sources: entry.sources };
  }

  async function submitAsk(form) {
    const widget = form.closest('[data-placement-widget="terminal"]');
    if (!widget || widget.getAttribute('aria-busy') === 'true') return;
    const input = form.querySelector('[data-placement-ask-input]');
    const restoreFocus = widget.contains(document.activeElement);
    const question = input.value.trim();
    if (!question) { input.focus(); return; }
    input.value = '';
    setInteractive(widget, true);
    writeAskResult(widget, question, 'One moment…', 'Finding a note', 'retrieving');
    const controller = new AbortController();
    const timeout = window.setTimeout(function () { controller.abort(); }, ASK_TIMEOUT_MS);
    try {
      const endpoint = askEndpoint(widget);
      let payload;
      let statusCode = 200;
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: question, locale: 'en' }),
          signal: controller.signal
        });
        payload = await response.json();
        statusCode = response.status;
        if (!response.ok && statusCode !== 429) throw new Error('Ask request failed');
      } else {
        const data = await loadKnowledge(widget, controller.signal);
        payload = answerFromNotes(data, question);
      }
      const output = resultText(payload);
      if (!output || payload.status === 'upstream_error') throw new Error('Invalid Ask response');
      if (statusCode === 429 || payload.status === 'rate_limited') input.value = question;
      const copy = statusCode === 429 ? STATUS_COPY.rate_limited : STATUS_COPY[payload.status];
      writeAskResult(widget, question, output, copy.status, copy.state);
      if (statusCode !== 429 && payload.status === 'answered') renderSources(widget, payload);
    } catch (error) {
      input.value = question;
      const output = error && error.name === 'AbortError'
        ? 'No response within 20 seconds. Your question is saved — try again?'
        : 'Couldn’t load an answer just now. Your question is saved — please try again.';
      writeAskResult(widget, question, output, 'Please try again', 'offline');
    } finally {
      window.clearTimeout(timeout);
      setInteractive(widget, false);
      if (restoreFocus && (document.activeElement === document.body || widget.contains(document.activeElement))) input.focus();
    }
  }

  function initializeTerminals() {
    document.querySelectorAll('[data-placement-widget="terminal"]').forEach(async function (widget) {
      if (askEndpoint(widget)) {
        writeAskResult(widget, '', '', 'Just the parts I’ve made public', 'ready');
        setInteractive(widget, false);
        return;
      }
      setInteractive(widget, true);
      const controller = new AbortController();
      const timeout = window.setTimeout(function () { controller.abort(); }, ASK_TIMEOUT_MS);
      try {
        await loadKnowledge(widget, controller.signal);
        writeAskResult(widget, '', '', 'A few things about me', 'ready');
      } catch (error) {
        writeAskResult(widget, '', 'Couldn’t load my public notes. Ask a question to retry.', 'Please try again', 'offline');
      } finally {
        window.clearTimeout(timeout);
        setInteractive(widget, false);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeTerminals);
  else initializeTerminals();

  document.addEventListener('submit', function (event) {
    const form = event.target.closest('[data-placement-ask-form]');
    if (!form) return;
    event.preventDefault();
    submitAsk(form);
  });

  document.addEventListener('click', function (event) {
    const suggestion = event.target.closest('[data-placement-suggestion]');
    if (!suggestion || suggestion.disabled) return;
    const widget = suggestion.closest('[data-placement-widget="terminal"]');
    const form = widget && widget.querySelector('[data-placement-ask-form]');
    const input = form && form.querySelector('[data-placement-ask-input]');
    if (!form || !input) return;
    input.value = suggestion.getAttribute('data-question') || suggestion.textContent.trim();
    if (typeof form.requestSubmit === 'function') form.requestSubmit();
    else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
})();
