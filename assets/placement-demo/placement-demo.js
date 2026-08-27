(function () {
  'use strict';

  const terminalData = {
    inspect: [
      'agent inspect --scene lab.mp4',
      '✓ 4 objects tracked\n! audio lag detected at 00:07.4\n→ anomaly score: 0.82'
    ],
    plan: [
      'agent plan --goal "place cup"',
      '01 locate handle\n02 approach from left\n03 grasp at 18 N\n04 place inside tray'
    ],
    explain: [
      'agent explain --failure run_042',
      'root cause: visual occlusion\nevidence: audio state remained stable\nnext test: extend memory by 2.0 s'
    ]
  };

  const routeData = [
    {
      point: [62, 174],
      note: "Xi'an · began with anomaly detection.",
      detail: 'Learning to notice what a model misses—and why it matters.'
    },
    {
      point: [370, 102],
      note: 'Lab · moved from recognition to action.',
      detail: 'VLM and VLA work turned perception questions into embodied ones.'
    },
    {
      point: [698, 141],
      note: 'Next · looking for the question that changes both.',
      detail: 'A deliberate open ending for the next lab, project, or collaborator.'
    }
  ];

  function setPressed(items, active) {
    items.forEach(function (item) {
      const selected = item === active;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function runTerminal(button) {
    const widget = button.closest('[data-placement-widget="terminal"]');
    const key = button.getAttribute('data-placement-command');
    const data = terminalData[key];
    if (!widget || !data) return;

    const command = widget.querySelector('[data-placement-terminal-command]');
    const output = widget.querySelector('[data-placement-terminal-output]');
    const buttons = Array.from(widget.querySelectorAll('[data-placement-command]'));
    const runId = String((Number(widget.dataset.runId || 0) + 1));
    widget.dataset.runId = runId;
    setPressed(buttons, button);
    command.textContent = data[0];
    output.textContent = 'running…';

    window.setTimeout(function () {
      if (widget.dataset.runId === runId) output.textContent = data[1];
    }, 220);
  }

  function moveRoute(node) {
    const widget = node.closest('[data-placement-widget="route"]');
    const index = Number(node.getAttribute('data-placement-route'));
    const data = routeData[index];
    if (!widget || !data) return;

    const nodes = Array.from(widget.querySelectorAll('[data-placement-route]'));
    const dot = widget.querySelector('[data-placement-route-dot]');
    const note = widget.querySelector('[data-placement-route-note]');
    const detail = widget.querySelector('[data-placement-route-detail]');
    const counter = widget.querySelector('.placement-route__note small');
    setPressed(nodes, node);
    dot.setAttribute('cx', String(data.point[0]));
    dot.setAttribute('cy', String(data.point[1]));
    note.textContent = data.note;
    detail.textContent = data.detail;
    counter.textContent = 'ROUTE NOTE · 0' + (index + 1) + ' / 03';
  }

  function selectCity(node) {
    const widget = node.closest('[data-placement-widget="atlas"]');
    if (!widget) return;

    const nodes = Array.from(widget.querySelectorAll('[data-placement-city]'));
    const city = node.getAttribute('data-placement-city');
    const note = node.getAttribute('data-placement-city-note');
    setPressed(nodes, node);
    widget.querySelector('[data-placement-city-name]').textContent = city;
    widget.querySelector('[data-placement-city-copy]').textContent = note;
  }

  document.addEventListener('click', function (event) {
    const command = event.target.closest('[data-placement-command]');
    if (command) {
      runTerminal(command);
      return;
    }

    const route = event.target.closest('[data-placement-route]');
    if (route) {
      moveRoute(route);
      return;
    }

    const city = event.target.closest('[data-placement-city]');
    if (city) selectCity(city);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const interactive = event.target.closest('[data-placement-route], [data-placement-city]');
    if (!interactive) return;
    event.preventDefault();
    if (interactive.hasAttribute('data-placement-route')) {
      moveRoute(interactive);
    } else {
      selectCity(interactive);
    }
  });
})();
