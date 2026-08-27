(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const shellOf = (node) => node.closest('[data-demo-shell]');
  const dialog = $('.focus-dialog');
  const focusCanvas = $('[data-focus-canvas]', dialog);
  let focusIndex = 0;

  const signalStates = {
    work: ['Training a multimodal agent.', 'Quiet mode · replies may be slow.'],
    open: ['Open for one good question.', 'Click again and let’s start with the idea.'],
    away: ['Out collecting better context.', 'Probably eating, walking, or noticing things.']
  };
  const bearings = {
    0: ['Vision–Language–Action', '让模型从“理解画面”走向“采取行动”。'],
    90: ['Vision–Language Models', '把视觉、语言与不确定性放进同一个问题。'],
    180: ['Data Analysis Agents', '让代理系统提供证据，而不只是答案。'],
    270: ['Multimodal Anomaly', '寻找视频、音频与语言之间不诚实的瞬间。']
  };
  const moods = {
    clear: ['Clear focus, warm coffee.', '适合写实验，也适合认真回一封邮件。'],
    cloudy: ['Slow thinking, useful doubt.', '今天适合重读失败案例，而不是追新指标。'],
    storm: ['Deadline weather.', '先让程序跑起来，其他事情晚一点再说。']
  };
  const notes = [
    ['EXP. 042 · AUG 27', 'Audio helps only when timing is honest.', 'Aligned clips raised recall; loose windows mostly added confidence without evidence.', '+8.4%'],
    ['EXP. 041 · AUG 24', 'The model notices motion before meaning.', 'Freezing the visual encoder improved stability, but reduced sensitivity to brief events.', '+3.1%'],
    ['EXP. 039 · AUG 19', 'Synthetic data needs imperfect timing.', 'Perfectly aligned samples taught shortcuts. Small temporal noise made the policy more robust.', '+6.7%']
  ];
  const methods = [
    ['Observe', 'Start with the failure, not the benchmark.'],
    ['Synthesize', 'Build the smallest world where the question can be tested.'],
    ['Test', 'Change one assumption and watch what breaks.'],
    ['Refine', 'Keep the evidence; remove the ceremony.']
  ];
  const prompts = [
    'What are you building that almost works?',
    'Which failure taught you the most this month?',
    'What should an embodied agent notice first?',
    'Which idea deserves a tiny experiment together?'
  ];
  const tideData = {
    7: ['2.1M', 'M0 156 C90 158,125 134,205 140 S330 112,410 122 S540 35,720 52', 'M0 156 C90 158,125 134,205 140 S330 112,410 122 S540 35,720 52 L720 180 L0 180 Z'],
    30: ['8.4M', 'M0 150 C70 148,85 112,150 120 S230 150,300 104 S390 50,445 90 S540 130,590 62 S680 54,720 22', 'M0 150 C70 148,85 112,150 120 S230 150,300 104 S390 50,445 90 S540 130,590 62 S680 54,720 22 L720 180 L0 180 Z'],
    90: ['23.7M', 'M0 148 C60 100,115 152,170 128 S290 96,350 116 S450 62,520 78 S620 30,720 42', 'M0 148 C60 100,115 152,170 128 S290 96,350 116 S450 62,520 78 S620 30,720 42 L720 180 L0 180 Z']
  };
  const blueprintData = {
    all: ['All layers visible.', 'Inspect the whole path from observation to action.'],
    sense: ['Sense · 3 synchronized streams.', 'RGB, audio, and proprioception enter at 20 Hz.'],
    reason: ['Reason · one grounded state.', 'The policy keeps only evidence needed for the next action.'],
    act: ['Act · 7 discrete controls.', 'Joint targets are checked before the command leaves the loop.']
  };
  const terminalData = {
    inspect: ['agent inspect --scene lab.mp4', '✓ 4 objects tracked\n! audio lag detected at 00:07.4\n→ anomaly score: 0.82'],
    plan: ['agent plan --goal "place cup"', '01 locate handle\n02 approach from left\n03 grasp at 18 N\n04 place inside tray'],
    explain: ['agent explain --failure run_042', 'root cause: visual occlusion\nevidence: audio state remained stable\nnext test: extend memory by 2.0 s']
  };
  const failureData = [
    ['SPECIMEN F-07', 'The confident wrong turn.', 'Policy chose the shortest path and ignored the glass wall.'],
    ['SPECIMEN F-12', 'The perfectly timed shortcut.', 'Synthetic clips aligned too cleanly, so timing became a hidden label.'],
    ['SPECIMEN F-19', 'The memory that stayed too long.', 'An old instruction survived after the scene had already changed.']
  ];
  const figureData = {
    pipeline: ['<div class="figure-pipeline"><span>video</span><i>→</i><span>align</span><i>→</i><span>reason</span><i>→</i><span>act</span></div>', 'The four-stage inference pipeline.'],
    result: ['<div class="figure-bars"><i style="--h:48%" data-label="base"></i><i style="--h:66%" data-label="audio"></i><i style="--h:79%" data-label="memory"></i><i style="--h:91%" data-label="full"></i></div>', 'Event recall after each module is added.'],
    error: ['<div class="figure-errors"><span>timing drift</span><span>false object</span><span>stale memory</span></div>', 'Three dominant failure families.']
  };
  const reviewData = [
    ['R1 · Definition', 'Does “silent” mean zero confidence or no detected event? State the threshold.'],
    ['R2 · Scale', 'Normalization may hide a useful calibration error. Add the unnormalized ablation.']
  ];
  const citationData = ['2026 · the current question', '2024 · alignment became measurable', '2021 · time became contrastive', '2017 · attention became the common language'];
  const paperStackData = [
    ['ARXIV · 2026', 'When Modalities Disagree', 'Chen Xi · Peng Wu', '12 pages · code available'],
    ['WORKING PAPER · 2026', 'Small Memories for Useful Agents', 'Chen Xi · Lab collaborators', '9 pages · experiments active'],
    ['TECH NOTE · 2025', 'A Taxonomy of Slow Failures', 'Chen Xi', '6 pages · notes available']
  ];
  const terms = {
    agent: ['A / 04', 'agent', '/ˈeɪdʒənt/ · noun', 'A system that must choose what to do next, and remain accountable for the choice.', 'See also: memory, action, uncertainty'],
    embodied: ['E / 04', 'embodied', '/ɪmˈbɒdid/ · adjective', 'Situated where actions change the next observation instead of merely producing text.', 'See also: control, feedback, world'],
    grounding: ['G / 04', 'grounding', '/ˈɡraʊndɪŋ/ · noun', 'Connecting a word or plan to evidence that exists in the current scene.', 'See also: perception, reference, evidence'],
    world: ['W / 04', 'world model', '/wɜːld ˈmɒdl/ · noun', 'A compact guess about how the environment may change after an action.', 'See also: prediction, planning, simulation']
  };
  const mascotData = {
    work: ['10:00 — 12:00', 'Working · ask me something.', 'One more run before lunch.', '⌨'],
    eat: ['12:10 — 13:00', 'Eating · the noodles have priority.', 'Good food first; messages later.', '🍜'],
    sleep: ['00:30 — 08:00', 'Sleeping · no useful replies here.', 'The next idea can wait until morning.', 'Zz'],
    cheers: ['21:30 — 23:00', 'Cheers · currently off duty.', 'A small drink and zero benchmark talk.', '🥃']
  };
  const osData = {
    focus: ['FOCUS MODE', 'Protect the next 90 minutes.', 'Notifications quiet. One experiment active.'],
    open: ['OPEN MODE', 'One thoughtful conversation fits.', 'Questions, collaborations, and strange ideas welcome.'],
    wander: ['WANDER MODE', 'Follow the interesting side path.', 'No deliverable yet. Curiosity has control.'],
    offline: ['OFFLINE MODE', 'The system is resting.', 'Nothing urgent survives a good night of sleep.']
  };
  const robotTimers = new WeakMap();

  function buildRhythms(root = document) {
    $$('.rhythm-weeks', root).forEach((container) => {
      if (container.children.length) return;
      const levels = [1,2,2,3,1,4,3,2,4,4,2,1,3,2,4,3,4,2,1,3,4,4,2,3,4,3];
      levels.forEach((level, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.style.setProperty('--level', level);
        button.dataset.week = String(index + 1);
        button.dataset.level = String(level);
        button.setAttribute('aria-label', `第 ${index + 1} 周，专注等级 ${level}`);
        container.append(button);
      });
    });
  }

  function updateClock() {
    const now = new Date();
    const shanghai = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const h = shanghai.getHours();
    const m = shanghai.getMinutes();
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const state = h < 6 ? 'Sleeping · ideas are unattended.' : h < 10 ? 'Slow start · coffee and reading.' : h < 18 ? 'Deep work · likely in the lab.' : h < 21 ? 'Dinner and a little distance.' : 'Notes, code, and one last thought.';
    $$('[data-live-time]').forEach((el) => { el.textContent = time; });
    $$('[data-day-state]').forEach((el) => { el.textContent = state; });
    $$('[data-day-marker]').forEach((el) => { el.style.left = `${((h * 60 + m) / 1440) * 100}%`; });
  }

  function openFocus(index, updateHash = true) {
    const specimens = $$('.specimen[data-demo]');
    focusIndex = (index + specimens.length) % specimens.length;
    const source = specimens[focusIndex];
    $('[data-focus-number]', dialog).textContent = `${String(focusIndex + 1).padStart(2, '0')} / ${String(specimens.length).padStart(2, '0')}`;
    $('[data-focus-title]', dialog).textContent = source.dataset.name;
    $('[data-focus-description]', dialog).textContent = source.dataset.description;
    focusCanvas.replaceChildren($('.specimen__stage', source).cloneNode(true));
    buildRhythms(focusCanvas);
    updateClock();
    if (!dialog.open) dialog.showModal();
    if (updateHash) history.replaceState(null, '', `#demo-${String(focusIndex + 1).padStart(2, '0')}`);
  }

  function closeFocus() {
    if (dialog.open) dialog.close();
    if (/^#demo-\d{2}$/.test(location.hash)) history.replaceState(null, '', `${location.pathname}${location.search}`);
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, a, [role="button"]');
    if (!target) return;

    if (target.matches('.focus-open')) {
      openFocus($$('.specimen[data-demo]').indexOf(target.closest('.specimen')));
      return;
    }
    if (target.matches('.focus-close')) { closeFocus(); return; }
    if (target.matches('[data-focus-prev]')) { openFocus(focusIndex - 1); return; }
    if (target.matches('[data-focus-next]')) { openFocus(focusIndex + 1); return; }

    const shell = shellOf(target);
    if (!shell) return;

    if (target.matches('[data-preview-contact]')) {
      event.preventDefault();
      const copy = $('[data-prompt-text], [data-quiet-copy]', shell);
      if (copy) copy.textContent = 'Preview only · no address is exposed here.';
      return;
    }

    if (target.matches('[data-signal]')) {
      const key = target.dataset.signal;
      $$('[data-signal]', shell).forEach((b) => b.classList.toggle('is-active', b === target));
      $('[data-signal-title]', shell).textContent = signalStates[key][0];
      $('[data-signal-note]', shell).textContent = signalStates[key][1];
    }
    if (target.matches('[data-bearing]')) {
      const key = target.dataset.bearing;
      $$('[data-bearing]', shell).forEach((b) => b.classList.toggle('is-active', b === target));
      $('[data-compass-needle]', shell).style.transform = `rotate(${key}deg)`;
      $('[data-compass-title]', shell).textContent = bearings[key][0];
      $('[data-compass-text]', shell).textContent = bearings[key][1];
    }
    if (target.matches('[data-now-card]')) {
      target.setAttribute('aria-expanded', String(target.getAttribute('aria-expanded') !== 'true'));
    }
    if (target.matches('[data-mood]')) {
      const key = target.dataset.mood;
      shell.dataset.mood = key;
      $$('[data-mood]', shell).forEach((b) => b.classList.toggle('is-active', b === target));
      $('[data-desk-mood]', shell).textContent = moods[key][0];
      $('[data-desk-detail]', shell).textContent = moods[key][1];
    }
    if (target.matches('[data-slot]')) {
      $$('[data-slot]', shell).forEach((b) => b.classList.toggle('is-active', b === target));
      $('[data-slot-copy]', shell).textContent = `${target.textContent} saved for this preview — no booking was sent.`;
    }
    if (target.matches('[data-paper]')) {
      $('[data-paper-title]', shell).textContent = target.dataset.paper;
    }
    if (target.matches('[data-note]')) {
      const note = notes[Number(target.dataset.note)];
      $$('[data-note]', shell).forEach((b) => b.setAttribute('aria-selected', String(b === target)));
      $('[data-note-index]', shell).textContent = note[0];
      $('[data-note-title]', shell).textContent = note[1];
      $('[data-note-body]', shell).textContent = note[2];
      $('[data-note-metric]', shell).textContent = note[3];
    }
    if (target.matches('[data-method-prev], [data-method-next]')) {
      let index = Number(shell.dataset.methodIndex || 0);
      index = (index + (target.matches('[data-method-next]') ? 1 : -1) + methods.length) % methods.length;
      shell.dataset.methodIndex = String(index);
      $('[data-method-count]', shell).textContent = `${String(index + 1).padStart(2, '0')} / 04`;
      $('[data-method-title]', shell).textContent = methods[index][0];
      $('[data-method-copy]', shell).textContent = methods[index][1];
    }
    if (target.matches('[data-pulse]')) {
      $$('[data-pulse]', shell).forEach((b) => b.classList.toggle('is-active', b === target));
      $('[data-pulse-value]', shell).textContent = target.dataset.pulse;
    }
    if (target.matches('[data-question]')) {
      target.closest('li').classList.toggle('is-open');
    }
    if (target.matches('[data-week]')) {
      $('[data-rhythm-tip]', shell).textContent = `Week ${target.dataset.week} · focus level ${target.dataset.level}/4`;
    }
    if (target.matches('[data-tide-range]')) {
      const range = target.dataset.tideRange;
      $$('[data-tide-range]', shell).forEach((b) => b.classList.toggle('is-active', b === target));
      $('[data-tide-total]', shell).innerHTML = `${tideData[range][0]} <em>tokens · ${range}d</em>`;
      $('[data-tide-line]', shell).setAttribute('d', tideData[range][1]);
      $('[data-tide-area]', shell).setAttribute('d', tideData[range][2]);
    }
    if (target.matches('[data-book]')) {
      $('[data-book-title]', shell).textContent = target.dataset.book;
      $('[data-book-author]', shell).textContent = target.dataset.author;
    }
    if (target.matches('[data-film-prev], [data-film-next]')) {
      let index = Number(shell.dataset.filmIndex || 0);
      index = (index + (target.matches('[data-film-next]') ? 1 : -1) + 4) % 4;
      shell.dataset.filmIndex = String(index);
      $('[data-film-strip]', shell).style.transform = `translateX(-${index * 25}%)`;
      $('[data-film-index]', shell).textContent = `FRAME ${String(index + 1).padStart(2, '0')} / 04`;
    }
    if (target.matches('[data-city]')) {
      $('[data-city-name]', shell).textContent = target.dataset.city;
    }
    if (target.matches('[data-topic]')) {
      $('[data-topic-title]', shell).textContent = `${target.dataset.topic} changes the question.`;
    }
    if (target.matches('[data-prompt-next]')) {
      let index = Number(shell.dataset.promptIndex || 0);
      index = (index + 1) % prompts.length;
      shell.dataset.promptIndex = String(index);
      $('[data-prompt-text]', shell).textContent = prompts[index];
    }
    if (target.matches('[data-filter]')) {
      const kind = target.dataset.filter;
      $$('[data-filter]', shell).forEach((b) => b.classList.toggle('is-active', b === target));
      $$('[data-kind]', shell).forEach((item) => { item.hidden = kind !== 'all' && item.dataset.kind !== kind; });
    }
    if (target.matches('[data-quiet-toggle]')) {
      const playing = target.getAttribute('aria-pressed') !== 'true';
      target.setAttribute('aria-pressed', String(playing));
      shell.classList.toggle('is-playing', playing);
      $('[data-quiet-title]', shell).textContent = playing ? 'A small signal is listening.' : 'Leave one good question.';
      $('[data-quiet-copy]', shell).textContent = playing ? 'Click again to return to quiet.' : 'I read every thoughtful message.';
    }
    if (target.matches('[data-blueprint]')) {
      const key = target.dataset.blueprint;
      shell.dataset.blueprint = key;
      $$('[data-blueprint]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-blueprint-title]', shell).textContent = blueprintData[key][0];
      $('[data-blueprint-copy]', shell).textContent = blueprintData[key][1];
    }
    if (target.matches('[data-command]')) {
      const data = terminalData[target.dataset.command];
      $('[data-terminal-command]', shell).textContent = data[0];
      $('[data-terminal-output]', shell).textContent = 'running…';
      setTimeout(() => { const output = $('[data-terminal-output]', shell); if (output) output.textContent = data[1]; }, 180);
    }
    if (target.matches('[data-failure]')) {
      const index = Number(target.dataset.failure);
      shell.dataset.failure = String(index);
      $$('[data-failure]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-failure-id]', shell).textContent = failureData[index][0];
      $('[data-failure-title]', shell).textContent = failureData[index][1];
      $('[data-failure-copy]', shell).textContent = failureData[index][2];
    }
    if (target.matches('[data-queue-advance]')) {
      const items = $$('.queue-list li', shell);
      const active = items.findIndex((item) => item.classList.contains('is-active'));
      if (active >= 0) items[active].className = 'is-done';
      const next = Math.min(active + 1, items.length);
      if (next < items.length) items[next].className = 'is-active';
      const done = items.filter((item) => item.classList.contains('is-done')).length;
      $('[data-queue-done]', shell).textContent = `${done} / ${items.length} shipped`;
      if (done === items.length) target.textContent = 'Everything shipped ✓';
    }
    if (target.matches('[data-abstract]')) {
      const mode = target.dataset.abstract;
      shell.dataset.abstractMode = mode;
      $$('[data-abstract]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-abstract-caption]', shell).textContent = { contribution: 'Contribution · what is new?', method: 'Method · how was it tested?', limit: 'Limit · where does it break?' }[mode];
    }
    if (target.matches('[data-figure]')) {
      const key = target.dataset.figure;
      $$('[data-figure]', shell).forEach((button) => button.setAttribute('aria-selected', String(button === target)));
      $('[data-figure-canvas]', shell).innerHTML = figureData[key][0];
      $('[data-figure-caption]', shell).textContent = figureData[key][1];
    }
    if (target.matches('[data-review]')) {
      const index = Number(target.dataset.review);
      $$('[data-review]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-review-title]', shell).textContent = reviewData[index][0];
      $('[data-review-copy]', shell).textContent = reviewData[index][1];
    }
    if (target.matches('[data-citation]')) {
      const index = Number(target.dataset.citation);
      $$('[data-citation]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-citation-note]', shell).textContent = citationData[index];
    }
    if (target.matches('[data-paperstack]')) {
      const index = Number(target.dataset.paperstack);
      const data = paperStackData[index];
      $$('[data-paperstack]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-stack-venue]', shell).textContent = data[0];
      $('[data-stack-title]', shell).textContent = data[1];
      $('[data-stack-authors]', shell).textContent = data[2];
      $('[data-stack-code]', shell).textContent = data[3];
      $('.paperstack-visual>article', shell).style.transform = `translateX(${index * 5}px) rotate(${index - 1}deg)`;
    }
    if (target.matches('[data-cell]')) {
      $('[data-cell-copy]', shell).textContent = target.dataset.cell;
    }
    if (target.matches('[data-seed-rerun]')) {
      let total = 0;
      $$('.seeds-plot i', shell).forEach((dot, index) => {
        const value = 78 + ((index * 7 + Date.now()) % 8);
        total += value;
        dot.style.setProperty('--y', `${20 + (value - 78) * 8}%`);
        dot.style.setProperty('--x', `${7 + index * 9.6}%`);
      });
      const mean = total / 10;
      $('[data-seed-value]', shell).textContent = `μ ${mean.toFixed(1)} ± 2.1`;
      $('[data-seed-mean]', shell).style.bottom = `${20 + (mean - 78) * 8}%`;
    }
    if (target.matches('[data-prism]')) {
      const key = target.dataset.prism;
      const data = { all: ['All modalities', 'Video 100% · Audio 96% · Language 72%'], video: ['Vision channel', '12,480 clips · 24 fps · RGB'], audio: ['Audio channel', '11,981 clips · 48 kHz · stereo'], text: ['Language channel', '8,986 clips · event descriptions'] }[key];
      shell.dataset.prism = key;
      $$('[data-prism]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-prism-title]', shell).textContent = data[0];
      $('[data-prism-copy]', shell).textContent = data[1];
    }
    if (target.matches('[data-robot-play]')) {
      const playing = target.getAttribute('aria-pressed') !== 'true';
      target.setAttribute('aria-pressed', String(playing));
      target.textContent = playing ? '❚❚ Pause' : '▶ Play';
      const oldTimer = robotTimers.get(shell);
      if (oldTimer) clearInterval(oldTimer);
      if (playing) {
        const timer = setInterval(() => {
          const slider = $('[data-robot-slider]', shell);
          if (!slider) return clearInterval(timer);
          slider.value = String((Number(slider.value) + 1) % 4);
          slider.dispatchEvent(new Event('input', { bubbles: true }));
        }, 750);
        robotTimers.set(shell, timer);
      }
    }
    if (target.matches('[data-term]')) {
      const data = terms[target.dataset.term];
      $$('[data-term]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-term-index]', shell).textContent = data[0];
      $('[data-term-title]', shell).textContent = data[1];
      $('[data-term-phonetic]', shell).textContent = data[2];
      $('[data-term-copy]', shell).textContent = data[3];
      $('[data-term-related]', shell).textContent = data[4];
    }
    if (target.matches('[data-learning]')) {
      const key = target.dataset.learning;
      const copy = { vision: 'Vision → VLM: learn cross-attention.', vlm: 'VLM → VLA: connect tokens to control.', vla: 'VLA → evaluation: measure action recovery.', control: 'Control → VLA: learn feedback and stability.' }[key];
      $$('[data-learning]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-learning-copy]', shell).textContent = copy;
      $$('.learning-map i', shell).forEach((line, index) => line.classList.toggle('is-active', index <= $$('[data-learning]', shell).indexOf(target)));
    }
    if (target.matches('[data-annotation]')) {
      const key = target.dataset.annotation;
      shell.dataset.annotation = key;
      $$('[data-annotation]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-annotation-copy]', shell).textContent = { evidence: 'Evidence · observed in 37 of 42 runs.', assumption: 'Assumption · audio state remains causally relevant.', todo: 'To test · interruption windows above eight seconds.' }[key];
    }
    if (target.matches('[data-stamp]')) {
      target.classList.toggle('is-stamped');
      $('i', target).textContent = target.classList.contains('is-stamped') ? '已盖章' : '未盖章';
      $('[data-stamp-note]', shell).textContent = `${target.dataset.stamp.toUpperCase()} field note ${target.classList.contains('is-stamped') ? 'added to' : 'removed from'} the passport.`;
    }
    if (target.matches('[data-postcard]')) {
      const key = target.dataset.postcard;
      const data = { xian: ["XI'AN", '10:24', 'From the lab, with one unfinished experiment.'], shanghai: ['SHANGHAI', '10:24', 'A quick stop between code and conversation.'], london: ['LONDON', '03:24', 'The other side of the collaboration is still asleep.'] }[key];
      shell.dataset.postcardMode = key;
      $$('[data-postcard]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-postcard-city]', shell).textContent = data[0];
      $('[data-postcard-time]', shell).textContent = data[1];
      $('[data-postcard-note]', shell).textContent = data[2];
    }
    if (target.matches('[data-route]')) {
      const index = Number(target.dataset.route);
      const points = [[62,174],[370,102],[698,141]];
      $$('[data-route]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-route-dot]', shell).setAttribute('cx', points[index][0]);
      $('[data-route-dot]', shell).setAttribute('cy', points[index][1]);
      $('[data-route-note]', shell).textContent = ['Xi’an · began with anomaly detection.', 'Lab · moved from recognition to action.', 'Next · looking for the question that changes both.'][index];
    }
    if (target.matches('[data-sound]')) {
      $$('[data-sound]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-sound-copy]', shell).textContent = { keys: 'Fast keys, one stubborn test.', rain: 'Rain against the lab window.', train: 'A low rhythm between two cities.', glasses: 'A small cheers after the run.' }[target.dataset.sound];
    }
    if (target.matches('[data-mascot-mode]')) {
      const key = target.dataset.mascotMode;
      const data = mascotData[key];
      shell.dataset.mascot = key;
      $$('[data-mascot-mode]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-mascot-time]', shell).textContent = data[0];
      $('[data-mascot-title]', shell).textContent = data[1];
      $('[data-mascot-note]', shell).textContent = data[2];
      $('.mascotlab-prop', shell).textContent = data[3];
    }
    if (target.matches('[data-os-mode]')) {
      const key = target.dataset.osMode;
      const data = osData[key];
      shell.dataset.os = key;
      $$('[data-os-mode]', shell).forEach((button) => button.classList.toggle('is-active', button === target));
      $('[data-os-status]', shell).textContent = data[0];
      $('[data-os-title]', shell).textContent = data[1];
      $('[data-os-copy]', shell).textContent = data[2];
    }
  });

  document.addEventListener('input', (event) => {
    const target = event.target;
    const shell = shellOf(target);
    if (!shell) return;
    if (target.matches('[data-lens-slider]')) {
      shell.style.setProperty('--lens', `${target.value}%`);
    }
    if (target.matches('[data-ablation]')) {
      const penalties = { audio: 7.4, memory: 5.9, synthetic: 3.1 };
      let score = 84.6;
      $$('[data-ablation]', shell).forEach((input) => { if (!input.checked) score -= penalties[input.dataset.ablation]; });
      $('[data-ablation-score]', shell).textContent = score.toFixed(1);
      $('[data-ablation-bar]', shell).style.width = `${score}%`;
      $('[data-ablation-delta]', shell).textContent = score === 84.6 ? 'Full model · reference configuration' : `${(score - 84.6).toFixed(1)} points from full model`;
    }
    if (target.matches('[data-robot-slider]')) {
      const index = Number(target.value);
      shell.dataset.robotFrame = String(index);
      $('[data-robot-frame]', shell).textContent = ['FRAME 01 · LOCATE', 'FRAME 02 · APPROACH', 'FRAME 03 · GRASP', 'FRAME 04 · PLACE'][index];
    }
    if (target.matches('[data-half-slider]')) {
      const value = Number(target.value);
      shell.style.setProperty('--half', `${value}%`);
      $('[data-half-days]', shell).textContent = `DAY ${Math.round(value * .38)}`;
      const state = value < 28 ? ['New and untested.', 'The idea is mostly excitement; write down the hidden assumption.'] : value < 68 ? ['Interesting, not yet useful.', 'One small experiment exists; the assumption is still fragile.'] : ['Boring enough to trust.', 'Repeated evidence survived; now simplify the explanation.'];
      $('[data-half-title]', shell).textContent = state[0];
      $('[data-half-copy]', shell).textContent = state[1];
    }
    if (target.matches('[data-memory-search]')) {
      const query = target.value.trim().toLowerCase();
      let count = 0;
      $$('[data-memory-tags]', shell).forEach((note) => { note.hidden = !!query && !note.dataset.memoryTags.includes(query); if (!note.hidden) count += 1; });
      $('[data-memory-count]', shell).textContent = `${count} note${count === 1 ? '' : 's'} in the drawer.`;
    }
    if (target.matches('[data-pack]')) {
      const all = $$('[data-pack]', shell);
      const count = all.filter((input) => input.checked).length;
      $('[data-packing-count]', shell).textContent = `${count} / ${all.length}`;
      $('[data-packing-note]', shell).textContent = count === 0 ? 'Nothing packed yet.' : count === all.length ? 'Ready to travel · the idea fits.' : `${count} useful thing${count === 1 ? '' : 's'} packed.`;
    }
    if (target.matches('[data-exposure]')) {
      const value = Number(target.value) / 100;
      shell.style.setProperty('--exposure', value.toFixed(2));
      $('[data-exposure-caption]', shell).textContent = value > .66 ? 'Xi’an · 21:47 · the robot finally completed the fourth action.' : value > .35 ? 'A note is beginning to appear in the dark.' : 'Raise exposure to recover the field note.';
    }
    if (target.matches('[data-taste]')) {
      const values = $$('[data-taste]', shell).map((input) => Number(input.value));
      const evidence = values[0] > 70 ? 'rigorous' : values[0] > 35 ? 'practical' : 'speculative';
      const play = values[1] > 70 ? 'playful' : values[1] > 35 ? 'curious' : 'restrained';
      const speed = values[2] > 70 ? 'slightly impatient' : values[2] > 35 ? 'deliberate' : 'patient';
      $('[data-taste-sentence]', shell).textContent = `${evidence[0].toUpperCase() + evidence.slice(1)}, ${play}, ${speed}.`;
    }
  });

  document.addEventListener('pointermove', (event) => {
    const stage = event.target.closest('.hidden-stage');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    stage.style.setProperty('--spot-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    stage.style.setProperty('--spot-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });

  document.addEventListener('keydown', (event) => {
    const hiddenStage = event.target.closest('.hidden-stage');
    if (hiddenStage && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      let x = parseFloat(hiddenStage.style.getPropertyValue('--spot-x')) || 50;
      let y = parseFloat(hiddenStage.style.getPropertyValue('--spot-y')) || 50;
      if (event.key === 'ArrowLeft') x -= 5;
      if (event.key === 'ArrowRight') x += 5;
      if (event.key === 'ArrowUp') y -= 5;
      if (event.key === 'ArrowDown') y += 5;
      hiddenStage.style.setProperty('--spot-x', `${Math.max(5, Math.min(95, x))}%`);
      hiddenStage.style.setProperty('--spot-y', `${Math.max(5, Math.min(95, y))}%`);
      return;
    }
    const actionTarget = event.target.closest('[role="button"]');
    if (actionTarget && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      actionTarget.click();
    }
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') openFocus(focusIndex - 1);
    if (event.key === 'ArrowRight') openFocus(focusIndex + 1);
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeFocus();
  });
  dialog.addEventListener('cancel', () => {
    if (/^#demo-\d{2}$/.test(location.hash)) history.replaceState(null, '', `${location.pathname}${location.search}`);
  });

  buildRhythms();
  updateClock();
  setInterval(updateClock, 30000);

  const match = location.hash.match(/^#demo-(\d{2})$/);
  if (match) openFocus(Math.max(0, Math.min(49, Number(match[1]) - 1)), false);
  window.addEventListener('hashchange', () => {
    const next = location.hash.match(/^#demo-(\d{2})$/);
    if (next) openFocus(Math.max(0, Math.min(49, Number(next[1]) - 1)), false);
  });
})();
