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
    input.disabled = busy;
    submit.disabled = busy;
    suggestions.forEach(function (button) { button.disabled = busy; });
    widget.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function writeAskResult(widget, commandText, outputText, statusText, state) {
    widget.setAttribute('data-placement-knowledge-state', state);
    widget.querySelector('[data-placement-ask-state]').setAttribute('data-placement-ask-state', state);
    widget.querySelector('[data-placement-terminal-command]').textContent = commandText;
    widget.querySelector('[data-placement-terminal-output]').textContent = outputText;
    widget.querySelector('[data-placement-ask-status]').textContent = statusText;
  }

  function sourceLabels(payload) {
    if (!payload || !Array.isArray(payload.sources)) return [];
    return payload.sources
      .map(function (source) { return source && (source.label || source.id); })
      .filter(Boolean)
      .filter(function (label, index, labels) { return labels.indexOf(label) === index; });
  }

  function resultText(payload) {
    const answer = payload && typeof payload.answer === 'string' ? payload.answer.trim() : '';
    const status = payload && typeof payload.status === 'string' ? payload.status : '';
    const sources = sourceLabels(payload);
    if (!answer) return '';
    if (status === 'answered') {
      if (sources.length === 0) return '';
      return 'answer → ' + answer + '\n\nSources → ' + sources.join(' · ');
    }
    if (STATUS_COPY[status]) return answer;
    return '';
  }

  async function readPayload(response) {
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async function submitAsk(form) {
    const widget = form.closest('[data-placement-widget="terminal"]');
    if (!widget) return;

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

    if (!endpoint) {
      writeAskResult(
        widget,
        commandText,
        'configuration pending\nThe public knowledge endpoint has not been connected.',
        'Qwen · endpoint not configured',
        'offline'
      );
      setInteractive(widget, false);
      if (restoreFocus && (document.activeElement === document.body || widget.contains(document.activeElement))) input.focus();
      return;
    }

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
      if (!output) {
        if (!response.ok) throw new Error('ask endpoint returned ' + response.status);
        writeAskResult(
          widget,
          commandText,
          'evidence missing\nThis topic is not in Chen\'s approved public profile.',
          'Knowledge base · no approved evidence',
          'insufficient'
        );
        return;
      }

      const copy = STATUS_COPY[payload.status] || STATUS_COPY.insufficient;
      writeAskResult(widget, commandText, output, copy.status, copy.state);
    } catch (error) {
      const output = error && error.name === 'AbortError'
        ? 'timeout\nThe public knowledge router did not respond within 20 seconds.'
        : 'offline\nThe public knowledge router is not reachable right now.';
      writeAskResult(widget, commandText, output, 'Qwen · knowledge router offline', 'offline');
    } finally {
      window.clearTimeout(timeout);
      setInteractive(widget, false);
      if (restoreFocus && (document.activeElement === document.body || widget.contains(document.activeElement))) input.focus();
    }
  }

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
    if (terminalBody && !event.target.closest('input, button, a')) {
      terminalBody.querySelector('[data-placement-ask-input]').focus();
    }
  });
})();
