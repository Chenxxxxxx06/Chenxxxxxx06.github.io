(function () {
  'use strict';

  const ASK_TIMEOUT_MS = 20000;

  const STATUS_COPY = {
    answered: { state: 'answered', status: 'Qwen · approved public source' },
    refused: { state: 'locked', status: 'Boundary · request declined' },
    insufficient: { state: 'insufficient', status: 'Knowledge base · not published' },
    rate_limited: { state: 'locked', status: 'Boundary · request limit reached' },
    upstream_error: { state: 'offline', status: 'Qwen · knowledge router offline' }
  };

  function askEndpoint(widget) {
    return (widget.getAttribute('data-placement-ask-endpoint') || '').trim();
  }

  function setInteractive(widget, busy) {
    const input = widget.querySelector('[data-placement-ask-input]');
    const submit = widget.querySelector('[data-placement-ask-submit]');
    const suggestions = widget.querySelectorAll('[data-placement-suggestion]');
    const unavailable = !askEndpoint(widget);
    input.disabled = busy || unavailable;
    submit.disabled = busy || unavailable;
    submit.textContent = unavailable ? 'Offline' : busy ? 'Asking…' : 'Ask →';
    suggestions.forEach(function (button) { button.disabled = busy || unavailable; });
    widget.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function writeAskResult(widget, commandText, outputText, statusText, state) {
    widget.setAttribute('data-placement-knowledge-state', state);
    widget.querySelector('[data-placement-ask-state]').setAttribute('data-placement-ask-state', state);
    widget.querySelector('[data-placement-terminal-command]').textContent = commandText;
    widget.querySelector('[data-placement-terminal-output]').textContent = outputText;
    widget.querySelector('[data-placement-ask-status]').textContent = statusText;
    widget.querySelector('[data-placement-ask-badge]').textContent = state === 'retrieving' ? 'CHECKING' : state.toUpperCase();
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
      link.textContent = source.label;
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
    const sources = approvedSources(payload);
    if (!answer) return '';
    if (status === 'answered') {
      if (sources.length === 0) return '';
      return 'answer → ' + answer;
    }
    if (STATUS_COPY[status]) return answer;
    return '';
  }

  async function readPayload(response) {
    // A body-read abort or malformed JSON is a transport failure, not an
    // evidence-free answer. Preserve the error for submitAsk's error state.
    return response.json();
  }

  async function submitAsk(form) {
    const widget = form.closest('[data-placement-widget="terminal"]');
    if (!widget || widget.getAttribute('aria-busy') === 'true' || !askEndpoint(widget)) return;

    const input = form.querySelector('[data-placement-ask-input]');
    const restoreFocus = widget.contains(document.activeElement);
    const question = input.value.trim();
    if (!question) {
      input.focus();
      return;
    }

    const commandText = 'ask "' + question + '"';
    const endpoint = askEndpoint(widget);
    input.value = '';
    setInteractive(widget, true);
    writeAskResult(
      widget,
      commandText,
      'routing inside the approved profile…',
      'Qwen · checking the public knowledge boundary',
      'retrieving'
    );

    const controller = new AbortController();
    const timeout = window.setTimeout(function () { controller.abort(); }, ASK_TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, locale: document.documentElement.lang || 'en' }),
        signal: controller.signal
      });
      const payload = await readPayload(response);
      const output = resultText(payload);
      if (!output) throw new Error('ask endpoint returned an invalid response');
      if (!response.ok && response.status !== 429) throw new Error('ask endpoint returned ' + response.status);
      if (payload.status === 'upstream_error') throw new Error('ask endpoint is unavailable');
      if (response.status === 429 || payload.status === 'rate_limited') input.value = question;

      const copy = response.status === 429 ? STATUS_COPY.rate_limited : STATUS_COPY[payload.status];
      writeAskResult(widget, commandText, output, copy.status, copy.state);
      if (response.ok && payload.status === 'answered') renderSources(widget, payload);
    } catch (error) {
      input.value = question;
      const output = error && error.name === 'AbortError'
        ? 'timeout\nNo response within 20 seconds. Your question is saved; please try again.'
        : 'offline\nThe service could not complete this request. Your question is saved; please try again.';
      writeAskResult(widget, commandText, output, 'Qwen · knowledge router offline', 'offline');
    } finally {
      window.clearTimeout(timeout);
      setInteractive(widget, false);
      if (restoreFocus && (document.activeElement === document.body || widget.contains(document.activeElement))) input.focus();
    }
  }

  function initializeTerminals() {
    document.querySelectorAll('[data-placement-widget="terminal"]').forEach(function (widget) {
      const configured = Boolean(askEndpoint(widget));
      writeAskResult(
        widget,
        'ask --public-profile',
        configured
          ? 'ready — ask about my projects, research, or experience.'
          : 'currently unavailable — browse my profile or contact me using the links below.',
        configured ? 'Answers use only Chen’s approved public profile.' : 'Ask Chen is not connected yet.',
        configured ? 'ready' : 'offline'
      );
      widget.querySelector('[data-placement-ask-examples]').hidden = !configured;
      setInteractive(widget, false);
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
    if (suggestion) {
      const widget = suggestion.closest('[data-placement-widget="terminal"]');
      const form = widget && widget.querySelector('[data-placement-ask-form]');
      const input = form && form.querySelector('[data-placement-ask-input]');
      if (form && input && !suggestion.disabled) {
        input.value = suggestion.getAttribute('data-question') || suggestion.textContent.trim();
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
      return;
    }

    const terminalBody = event.target.closest('[data-placement-terminal-focus]');
    if (terminalBody && !event.target.closest('input, button, a, [tabindex]')) {
      terminalBody.querySelector('[data-placement-ask-input]').focus();
    }
  });
})();
