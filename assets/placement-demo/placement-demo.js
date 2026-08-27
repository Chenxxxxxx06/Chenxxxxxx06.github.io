(function () {
  'use strict';

  const ASK_TIMEOUT_MS = 12000;

  function askEndpoint(widget) {
    return (widget.getAttribute('data-placement-ask-endpoint') || '').trim();
  }

  function writeAskResult(widget, commandText, outputText, statusText, state) {
    widget.setAttribute('data-placement-knowledge-state', state);
    widget.querySelector('[data-placement-terminal-command]').textContent = commandText;
    widget.querySelector('[data-placement-terminal-output]').textContent = outputText;
    widget.querySelector('[data-placement-ask-status]').textContent = statusText;
  }

  function approvedAnswerText(payload) {
    const answer = payload && typeof payload.answer === 'string' ? payload.answer.trim() : '';
    const sources = payload && Array.isArray(payload.sources)
      ? payload.sources.map(function (source) { return source && (source.label || source.id); }).filter(Boolean)
      : [];
    if (!answer || sources.length === 0) return '';
    return answer + '\n\nSources → ' + sources.join(' · ');
  }

  async function submitAsk(form) {
    const widget = form.closest('[data-placement-widget="terminal"]');
    const input = form.querySelector('[data-placement-ask-input]');
    const submit = form.querySelector('[data-placement-ask-submit]');
    const question = input.value.trim();
    if (!widget || !question) {
      input.focus();
      return;
    }

    const commandText = 'ask "' + question + '"';
    const endpoint = askEndpoint(widget);
    submit.disabled = true;
    input.value = '';
    writeAskResult(widget, commandText, 'retrieving approved knowledge…', 'GPT · checking the personal knowledge base', 'retrieving');

    if (!endpoint) {
      window.setTimeout(function () {
        writeAskResult(
          widget,
          commandText,
          'knowledge base · draft\nNo approved answer is connected yet.\nThis question is ready for the personal knowledge base you add later.',
          'Knowledge source: waiting for your approved content.',
          'draft'
        );
        submit.disabled = false;
        input.focus();
      }, 260);
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
      if (!response.ok) throw new Error('ask endpoint returned ' + response.status);
      const answer = approvedAnswerText(await response.json());
      if (!answer) {
        writeAskResult(widget, commandText, 'evidence missing\nChen has not published enough approved material to answer that yet.', 'GPT · no approved evidence', 'insufficient');
      } else {
        writeAskResult(widget, commandText, answer, 'GPT · grounded in the personal knowledge base', 'answered');
      }
    } catch (error) {
      const copy = error && error.name === 'AbortError'
        ? 'timeout\nThe personal knowledge base did not respond within 12 seconds.'
        : 'offline\nThe personal knowledge base is not reachable right now.';
      writeAskResult(widget, commandText, copy, 'GPT · knowledge service offline', 'offline');
    } finally {
      window.clearTimeout(timeout);
      submit.disabled = false;
      input.focus();
    }
  }

  document.addEventListener('submit', function (event) {
    const form = event.target.closest('[data-placement-ask-form]');
    if (!form) return;
    event.preventDefault();
    submitAsk(form);
  });

  document.addEventListener('click', function (event) {
    const terminalBody = event.target.closest('[data-placement-terminal-focus]');
    if (terminalBody && !event.target.closest('input, button, a')) {
      terminalBody.querySelector('[data-placement-ask-input]').focus();
    }
  });
})();
