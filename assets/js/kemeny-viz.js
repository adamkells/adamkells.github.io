(function () {
  const container = document.getElementById('kemeny-viz');
  if (!container) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function mk(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function div(cls) {
    const d = document.createElement('div');
    d.className = cls;
    return d;
  }

  // ── The chain: a little weather model ───────────────────────────────────────
  const states = [
    { name: 'Sunny',  glyph: '☀', x: 270, y: 90,  color: '#FFC04D' },
    { name: 'Cloudy', glyph: '☁', x: 150, y: 270, color: '#B8AEC2' },
    { name: 'Rainy',  glyph: '☂', x: 390, y: 270, color: '#61C7EF' }
  ];
  const P = [
    [0.4, 0.4, 0.2],
    [0.3, 0.3, 0.4],
    [0.3, 0.5, 0.2]
  ];
  const N = states.length;
  const COLORS = states.map(s => s.color);

  // ── Linear algebra ───────────────────────────────────────────────────────────
  function stationary(mat, iters) {
    let pi = new Array(N).fill(1 / N);
    for (let k = 0; k < iters; k++) {
      const out = new Array(N).fill(0);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) out[j] += pi[i] * mat[i][j];
      pi = out;
    }
    const s = pi.reduce((a, b) => a + b, 0);
    return pi.map(x => x / s);
  }
  function solve(A, b) {
    const n = b.length;
    const M = A.map((row, i) => row.concat(b[i]));
    for (let col = 0; col < n; col++) {
      let piv = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
      const tmp = M[col]; M[col] = M[piv]; M[piv] = tmp;
      const d = M[col][col];
      for (let c = col; c <= n; c++) M[col][c] /= d;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const f = M[r][col];
        for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
      }
    }
    return M.map(row => row[n]);
  }
  // Mean first-passage times: m[i][j] = 1 + sum_{k!=j} P[i][k] m[k][j], m[j][j] = 0.
  function meanFirstPassage(mat) {
    const m = Array.from({ length: N }, () => new Array(N).fill(0));
    for (let j = 0; j < N; j++) {
      const idx = [];
      for (let i = 0; i < N; i++) if (i !== j) idx.push(i);
      const sz = idx.length;
      const A = Array.from({ length: sz }, () => new Array(sz).fill(0));
      const b = new Array(sz).fill(1);
      for (let r = 0; r < sz; r++) {
        const i = idx[r];
        for (let c = 0; c < sz; c++) A[r][c] = (i === idx[c] ? 1 : 0) - mat[i][idx[c]];
      }
      const x = solve(A, b);
      for (let r = 0; r < sz; r++) m[idx[r]][j] = x[r];
    }
    return m;
  }

  const pi = stationary(P, 800);
  const M = meanFirstPassage(P);
  const kemeny = M[0].reduce((acc, mij, j) => acc + pi[j] * mij, 0);

  const cum = P.map(row => { let acc = 0; return row.map(p => (acc += p)); });
  function pickNext(from) {
    const r = Math.random();
    for (let j = 0; j < N; j++) if (r <= cum[from][j]) return j;
    return N - 1;
  }

  // ── Shared glow filter + arrow marker (built via DOM, not innerHTML) ──────────
  function buildDefs() {
    const defs = mk('defs');
    const filter = mk('filter', { id: 'kemeny-glow', x: '-60%', y: '-60%', width: '220%', height: '220%' });
    filter.appendChild(mk('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }));
    const merge = mk('feMerge');
    merge.appendChild(mk('feMergeNode', { in: 'blur' }));
    merge.appendChild(mk('feMergeNode', { in: 'SourceGraphic' }));
    filter.appendChild(merge);
    defs.appendChild(filter);

    const marker = mk('marker', {
      id: 'kemeny-arrow', viewBox: '0 0 10 10', refX: '9', refY: '5',
      markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse'
    });
    marker.appendChild(mk('path', { d: 'M0,0 L10,5 L0,10 z', class: 'kemeny-arrowhead' }));
    defs.appendChild(marker);
    return defs;
  }

  // ── Timeline strip chart (state over time) ────────────────────────────────────
  const TL_W = 540, TL_H = 130, TL_X0 = 92, TL_X1 = 524, TL_MAX = 28;
  const TL_STEP = (TL_X1 - TL_X0) / (TL_MAX - 1);
  const laneY = [30, 65, 100]; // Sunny / Cloudy / Rainy lanes

  const tlSvg = mk('svg', {
    viewBox: `0 0 ${TL_W} ${TL_H}`, preserveAspectRatio: 'xMidYMid meet',
    class: 'kemeny-timeline', role: 'img',
    'aria-label': 'Timeline of the simulated weather sequence'
  });
  tlSvg.appendChild(buildDefs());

  states.forEach((s, i) => {
    tlSvg.appendChild(mk('line', {
      x1: TL_X0, y1: laneY[i], x2: TL_X1, y2: laneY[i], class: 'kemeny-tl-guide'
    }));
    const lbl = mk('text', { x: 8, y: laneY[i] + 4, class: 'kemeny-tl-label' });
    lbl.textContent = `${s.glyph} ${s.name}`;
    lbl.style.fill = s.color;
    tlSvg.appendChild(lbl);
  });
  const tlHint = mk('text', { x: TL_X1, y: TL_H - 6, class: 'kemeny-tl-hint', 'text-anchor': 'end' });
  tlHint.textContent = 'time →';
  tlSvg.appendChild(tlHint);
  const tlPlot = mk('g');
  tlSvg.appendChild(tlPlot);

  function drawTimeline(history) {
    while (tlPlot.firstChild) tlPlot.removeChild(tlPlot.firstChild);
    const view = history.slice(-TL_MAX);
    const n = view.length;
    if (n === 0) return;
    const xs = view.map((_, k) => TL_X1 - (n - 1 - k) * TL_STEP);

    let d = '';
    view.forEach((s, k) => {
      const x = xs[k], y = laneY[s];
      if (k === 0) d += `M${x.toFixed(1)},${y}`;
      else d += ` L${x.toFixed(1)},${laneY[view[k - 1]]} L${x.toFixed(1)},${y}`;
    });
    tlPlot.appendChild(mk('path', { d: d, class: 'kemeny-tl-line' }));

    view.forEach((s, k) => {
      const newest = k === n - 1;
      const dot = mk('circle', { cx: xs[k].toFixed(1), cy: laneY[s], r: newest ? 5.5 : 3.5, class: 'kemeny-tl-dot' });
      dot.style.fill = COLORS[s];
      if (newest) dot.setAttribute('filter', 'url(#kemeny-glow)');
      tlPlot.appendChild(dot);
    });
  }

  // ── Graph SVG ────────────────────────────────────────────────────────────────
  const G_W = 540, G_H = 360, R = 27;
  const gSvg = mk('svg', {
    viewBox: `0 0 ${G_W} ${G_H}`, preserveAspectRatio: 'xMidYMid meet',
    class: 'kemeny-svg', role: 'img',
    'aria-label': 'Weather Markov chain — click a state to start the walk there'
  });
  gSvg.appendChild(buildDefs());

  const edgeMap = {};
  states.forEach((a, i) => states.forEach((b, j) => {
    if (i === j || P[i][j] === 0) return;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const px = -dy / len, py = dx / len, bow = 34;
    const cx = (a.x + b.x) / 2 + px * bow;
    const cy = (a.y + b.y) / 2 + py * bow;
    edgeMap[`${i}-${j}`] = { x: cx, y: cy };

    const sLen = Math.hypot(cx - a.x, cy - a.y);
    const sx = a.x + ((cx - a.x) / sLen) * R, sy = a.y + ((cy - a.y) / sLen) * R;
    const eLen = Math.hypot(cx - b.x, cy - b.y);
    const ex = b.x + ((cx - b.x) / eLen) * (R + 4), ey = b.y + ((cy - b.y) / eLen) * (R + 4);

    gSvg.appendChild(mk('path', {
      d: `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`, class: 'kemeny-edge', 'marker-end': 'url(#kemeny-arrow)'
    }));
    const lbl = mk('text', {
      x: (cx + px * 8).toFixed(1), y: (cy + py * 8).toFixed(1),
      class: 'kemeny-edge-label', 'text-anchor': 'middle'
    });
    lbl.textContent = P[i][j].toFixed(1);
    gSvg.appendChild(lbl);
  }));

  const trail = mk('polyline', { class: 'kemeny-trail', fill: 'none' });
  gSvg.appendChild(trail);

  const nodeEls = states.map((s, i) => {
    const g = mk('g', { class: 'kemeny-node', tabindex: '0', role: 'button', 'aria-label': `Start the walk in ${s.name}` });
    const ring = mk('circle', { cx: s.x, cy: s.y, r: R, class: 'kemeny-node-circle' });
    ring.style.stroke = s.color;
    g.appendChild(ring);
    const glyph = mk('text', { x: s.x, y: s.y + 1, class: 'kemeny-node-glyph', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    glyph.textContent = s.glyph;
    g.appendChild(glyph);
    const label = mk('text', { x: s.x, y: s.y + R + 17, class: 'kemeny-node-label', 'text-anchor': 'middle' });
    label.textContent = s.name;
    g.appendChild(label);

    const choose = () => selectStart(i);
    g.addEventListener('click', choose);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
    gSvg.appendChild(g);
    return { g, ring };
  });

  const walker = mk('circle', { class: 'kemeny-walker', r: 7, filter: 'url(#kemeny-glow)', cx: states[0].x, cy: states[0].y });
  gSvg.appendChild(walker);

  // ── Panel ──────────────────────────────────────────────────────────────────
  const panel = div('kemeny-panel');
  const pct = pi.map(p => (p * 100).toFixed(0));
  panel.innerHTML = `
    <div class="kemeny-block">
      <div class="kemeny-label">Long-run share of days (&pi;)</div>
      <div class="kemeny-bars">
        ${states.map((s, i) => `
          <div class="kemeny-bar-row">
            <span class="kemeny-bar-name">${s.glyph} ${s.name}</span>
            <span class="kemeny-bar-track">
              <span class="kemeny-bar-fill" data-bar="${i}" style="width:0%"></span>
              <span class="kemeny-bar-tick" style="left:${pct[i]}%"></span>
            </span>
            <span class="kemeny-bar-val"><span data-emp="${i}">0</span>% <em>/ ${pct[i]}%</em></span>
          </div>`).join('')}
      </div>
      <div class="kemeny-sub">bar = simulated &middot; tick = theoretical &pi;</div>
    </div>
    <div class="kemeny-block">
      <div class="kemeny-label">Mean first-passage time from <strong data-start-name>Sunny</strong></div>
      <dl class="kemeny-mfpt" data-mfpt></dl>
    </div>
    <div class="kemeny-block kemeny-reveal">
      <div class="kemeny-label">Weighted travel time &Sigma;<sub>j</sub> &pi;<sub>j</sub> m<sub>ij</sub></div>
      <div class="kemeny-badges">
        ${states.map((s, i) => `
          <div class="kemeny-badge" data-badge="${i}">
            <span class="kemeny-badge-from">from ${s.name}</span>
            <span class="kemeny-badge-val"><span data-kval="${i}">&middot;&middot;&middot;</span> <em>/ ${kemeny.toFixed(2)}</em></span>
          </div>`).join('')}
      </div>
      <div class="kemeny-constant">Kemeny constant K = <strong>${kemeny.toFixed(3)}</strong></div>
      <div class="kemeny-sub">Each badge is estimated from the trajectory (<span data-days>0</span> days) &mdash; watch all three drift to K.</div>
    </div>
  `;
  const barFills = pi.map((_, i) => panel.querySelector(`[data-bar="${i}"]`));
  const empVals = pi.map((_, i) => panel.querySelector(`[data-emp="${i}"]`));
  const badgeEls = pi.map((_, i) => panel.querySelector(`[data-badge="${i}"]`));
  const kvalEls = pi.map((_, i) => panel.querySelector(`[data-kval="${i}"]`));
  const daysEl = panel.querySelector('[data-days]');
  const mfptList = panel.querySelector('[data-mfpt]');
  const startNameEl = panel.querySelector('[data-start-name]');
  barFills.forEach((el, i) => { el.style.background = COLORS[i]; });

  function renderMfpt(start) {
    startNameEl.textContent = states[start].name;
    mfptList.innerHTML = states.map((s, j) => {
      if (j === start) return `<div class="self"><dt>&rarr; ${s.name}</dt><dd>0 steps</dd></div>`;
      return `<div><dt>&rarr; ${s.name}</dt><dd><span data-m="${j}">···</span> <em>/ ${M[start][j].toFixed(2)}</em></dd></div>`;
    }).join('');
  }

  // ── Speed control ─────────────────────────────────────────────────────────────
  let tps = 2; // transitions (days) per second
  const controls = div('kemeny-controls');
  controls.innerHTML = `
    <label class="kemeny-speed">
      <span class="kemeny-speed-label">Speed</span>
      <input type="range" min="1" max="10" step="1" value="${tps}" class="kemeny-speed-range" aria-label="Transitions per second">
      <span class="kemeny-speed-val"><span data-tps>${tps}</span> / sec</span>
    </label>
  `;
  const speedRange = controls.querySelector('.kemeny-speed-range');
  const tpsEl = controls.querySelector('[data-tps]');
  speedRange.addEventListener('input', () => {
    tps = parseInt(speedRange.value, 10) || 1;
    tpsEl.textContent = tps;
  });

  // ── Assemble ────────────────────────────────────────────────────────────────
  const tlHost = div('kemeny-timeline-host');
  tlHost.appendChild(tlSvg);
  const graphHost = div('kemeny-graph');
  graphHost.appendChild(gSvg);
  graphHost.appendChild(controls);
  const body = div('kemeny-body');
  body.appendChild(graphHost);
  body.appendChild(panel);
  container.appendChild(tlHost);
  container.appendChild(body);

  // ── State ─────────────────────────────────────────────────────────────────────
  let startState = 0, current = 0, next = 0, hopStart = 0, positions = [], walkToken = 0;
  let history = []; // visible walk, drives the timeline + node highlight

  function setActive(s) {
    nodeEls.forEach((n, i) => {
      n.g.classList.toggle('active', i === s);
      n.ring.style.fill = i === s ? COLORS[i] : '';
    });
  }
  function visibleStep(s) {
    recordStats(s);
    history.push(s);
    if (history.length > 60) history.shift();
    setActive(s);
    drawTimeline(history);
    updatePanel();
  }
  function selectStart(i) {
    startState = i;
    nodeEls.forEach((n, k) => n.g.classList.toggle('start', k === i));
    badgeEls.forEach((b, k) => b.classList.toggle('selected', k === i));
    renderMfpt(i);
    restartWalk(i);
  }

  // ── Live statistics from the walk ────────────────────────────────────────────
  // Everything in the panel is estimated from the trajectory you can see. We tally
  // how often each state is visited (-> pi), and for every ordered pair the time
  // from each visit of i until j is next reached (-> mean first-passage time m_ij).
  // The weighted travel time sum_j pi_j m_ij is simply those two combined, live.
  const counts = new Array(N).fill(0);
  const fpSum = Array.from({ length: N }, () => new Array(N).fill(0));
  const fpN = Array.from({ length: N }, () => new Array(N).fill(0));
  let pendC = Array.from({ length: N }, () => new Array(N).fill(0));
  let pendT = Array.from({ length: N }, () => new Array(N).fill(0));
  let dayT = 0, days = 0;

  function clearPending() {
    pendC = Array.from({ length: N }, () => new Array(N).fill(0));
    pendT = Array.from({ length: N }, () => new Array(N).fill(0));
  }

  // Fold one observed day (state x) into the running statistics.
  function recordStats(x) {
    const t = dayT;
    // x closes every pending journey that was waiting to reach x...
    for (let i = 0; i < N; i++) {
      if (i === x || pendC[i][x] === 0) continue;
      fpSum[i][x] += pendC[i][x] * t - pendT[i][x];
      fpN[i][x] += pendC[i][x];
      pendC[i][x] = 0; pendT[i][x] = 0;
    }
    // ...and opens a new pending journey from x to every other state.
    for (let j = 0; j < N; j++) {
      if (j === x) continue;
      pendC[x][j] += 1; pendT[x][j] += t;
    }
    counts[x] += 1; days += 1; dayT += 1;
  }

  function updatePanel() {
    const total = days || 1;
    const piHat = counts.map(c => c / total);
    for (let i = 0; i < N; i++) {
      barFills[i].style.width = `${(piHat[i] * 100).toFixed(1)}%`;
      empVals[i].textContent = (piHat[i] * 100).toFixed(0);
    }
    // Live mean first-passage times for the currently selected start state.
    const mHat = (i, j) => (fpN[i][j] ? fpSum[i][j] / fpN[i][j] : null);
    for (let j = 0; j < N; j++) {
      const el = mfptList.querySelector(`[data-m="${j}"]`);
      if (!el) continue;
      const m = mHat(startState, j);
      el.textContent = m === null ? '···' : m.toFixed(2);
    }
    // Weighted travel time per start = sum_j piHat_j * mHat_ij — the two combined.
    for (let i = 0; i < N; i++) {
      let ready = true, k = 0;
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const m = mHat(i, j);
        if (m === null) { ready = false; break; }
        k += piHat[j] * m;
      }
      kvalEls[i].textContent = ready ? k.toFixed(3) : '···';
    }
    daysEl.textContent = days.toLocaleString();
  }

  // ── Animation ────────────────────────────────────────────────────────────────
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TRAIL_LEN = 7;
  let hopDur = 800;
  const period = () => 1000 / tps; // ms per transition, from the speed slider

  function bezier(a, c, b, t) {
    const mt = 1 - t;
    return { x: mt * mt * a.x + 2 * mt * t * c.x + t * t * b.x, y: mt * mt * a.y + 2 * mt * t * c.y + t * t * b.y };
  }
  const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function restartWalk(initial) {
    walkToken += 1;
    const token = walkToken;
    current = initial;
    history = [];
    clearPending(); // drop in-flight journeys at the teleport; keep accrued stats
    positions = [{ x: states[current].x, y: states[current].y }];
    trail.setAttribute('points', '');
    walker.setAttribute('cx', states[current].x);
    walker.setAttribute('cy', states[current].y);
    visibleStep(current);

    if (reduceMotion) {
      // No animation: fold in a chunk of days so the panel shows settled numbers.
      for (let k = 0; k < 2000; k++) { current = pickNext(current); recordStats(current); history.push(current); }
      history = history.slice(-60);
      setActive(current); drawTimeline(history); updatePanel();
      walker.style.display = 'none';
      return;
    }
    scheduleHop(token);
  }

  function scheduleHop(token) {
    next = pickNext(current);
    if (next === current) {
      setTimeout(() => { if (token === walkToken) { visibleStep(current); scheduleHop(token); } }, period());
      return;
    }
    hopDur = period() * 0.8; // animate for most of the period, then a short pause
    hopStart = performance.now();
    requestAnimationFrame(now => tick(now, token));
  }

  function tick(now, token) {
    if (token !== walkToken) return;
    const t = Math.min(1, (now - hopStart) / hopDur);
    const a = states[current], b = states[next];
    const c = edgeMap[`${current}-${next}`] || { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const pos = bezier(a, c, b, easeInOut(t));
    walker.setAttribute('cx', pos.x.toFixed(1));
    walker.setAttribute('cy', pos.y.toFixed(1));

    const last = positions[positions.length - 1];
    if (Math.hypot(pos.x - last.x, pos.y - last.y) > 7) {
      positions.push(pos);
      if (positions.length > TRAIL_LEN) positions.shift();
      trail.setAttribute('points', positions.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    }

    if (t >= 1) {
      current = next;
      visibleStep(current);
      setTimeout(() => { if (token === walkToken) scheduleHop(token); }, period() * 0.2);
      return;
    }
    requestAnimationFrame(n => tick(n, token));
  }

  selectStart(0);
})();
