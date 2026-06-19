(function () {
  const container = document.getElementById('markov-viz');
  if (!container) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const W = 540;
  const H = 340;

  const nodes = [
    { id: 0,  x: 135, y: 90  },
    { id: 1,  x: 210, y: 60  },
    { id: 2,  x: 265, y: 140 },
    { id: 3,  x: 160, y: 180 },
    { id: 4,  x: 245, y: 220 },
    { id: 5,  x: 75,  y: 145 },
    { id: 6,  x: 340, y: 105 },
    { id: 7,  x: 335, y: 195 },
    { id: 8,  x: 420, y: 145 },
    { id: 9,  x: 400, y: 235 },
    { id: 10, x: 115, y: 240 },
    { id: 11, x: 190, y: 285 },
    { id: 12, x: 60,  y: 225 },
    { id: 13, x: 480, y: 90  },
    { id: 14, x: 490, y: 195 },
    { id: 15, x: 445, y: 285 }
  ];
  const N = nodes.length;

  const edges = [
    [0, 1, 3], [0, 2, 2], [0, 3, 3], [0, 4, 3], [0, 5, 1],
    [1, 2, 3], [1, 4, 2],
    [2, 3, 2], [2, 4, 3], [2, 5, 2],
    [3, 4, 2], [3, 5, 1],
    [4, 5, 3],
    [6, 7, 3], [6, 8, 3], [6, 9, 2],
    [7, 8, 2], [7, 9, 2],
    [8, 9, 2],
    [2, 6, 3], [2, 7, 3],
    [5, 6, 2],
    [4, 9, 2],
    [1, 8, 2],
    [0, 6, 2],
    [0, 11, 1],
    [1, 10, 1],
    [5, 12, 1], [5, 10, 1],
    [10, 11, 1],
    [6, 13, 1], [7, 13, 1],
    [9, 14, 1],
    [14, 15, 1], [13, 15, 1],
    [5, 15, 1]
  ];

  const adj = nodes.map(() => []);
  edges.forEach(([a, b, w]) => {
    adj[a].push({ to: b, w });
    adj[b].push({ to: a, w });
  });

  const transitions = adj.map(list => {
    const total = list.reduce((s, e) => s + e.w, 0);
    let acc = 0;
    return list.map(e => {
      acc += e.w / total;
      return { to: e.to, cum: acc };
    });
  });

  function pickNext(from) {
    const r = Math.random();
    for (const e of transitions[from]) {
      if (r <= e.cum) return e.to;
    }
    return transitions[from][transitions[from].length - 1].to;
  }

  // ── Graph SVG ──────────────────────────────────────────────────────────────
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('class', 'markov-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', "Animated Markov chain of Adam's intellectual interests");

  const defs = document.createElementNS(SVG_NS, 'defs');
  defs.innerHTML = `
    <filter id="markov-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);

  const edgesGroup = document.createElementNS(SVG_NS, 'g');
  edgesGroup.setAttribute('class', 'markov-edges');
  edges.forEach(([a, b, w]) => {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', nodes[a].x);
    line.setAttribute('y1', nodes[a].y);
    line.setAttribute('x2', nodes[b].x);
    line.setAttribute('y2', nodes[b].y);
    line.setAttribute('stroke-width', 0.4 + w * 0.25);
    edgesGroup.appendChild(line);
  });
  svg.appendChild(edgesGroup);

  const trail = document.createElementNS(SVG_NS, 'polyline');
  trail.setAttribute('class', 'markov-trail');
  trail.setAttribute('fill', 'none');
  svg.appendChild(trail);

  const nodeEls = nodes.map((n) => {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', n.x);
    c.setAttribute('cy', n.y);
    c.setAttribute('r', 4.5);
    c.setAttribute('class', 'markov-node-dot');
    svg.appendChild(c);
    return c;
  });

  const walker = document.createElementNS(SVG_NS, 'circle');
  walker.setAttribute('class', 'markov-walker');
  walker.setAttribute('r', 6);
  walker.setAttribute('filter', 'url(#markov-glow)');
  walker.setAttribute('cx', nodes[0].x);
  walker.setAttribute('cy', nodes[0].y);
  svg.appendChild(walker);

  const graphHost = document.createElement('div');
  graphHost.className = 'markov-graph';
  graphHost.appendChild(svg);
  container.appendChild(graphHost);

  // ── Stats panel ────────────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'markov-stats';
  panel.innerHTML = `
    <div class="markov-stats-label">Coverage</div>
    <svg class="markov-chart" viewBox="0 0 180 80" preserveAspectRatio="none" aria-hidden="true">
      <line class="markov-chart-axis" x1="0" y1="0.5" x2="180" y2="0.5"/>
      <line class="markov-chart-baseline" x1="0" y1="79.5" x2="180" y2="79.5"/>
      <path class="markov-chart-area" d=""/>
      <polyline class="markov-chart-line" points=""/>
    </svg>
    <dl class="markov-stats-rows">
      <div><dt>Visited</dt><dd><span data-stat="visited">1</span> / ${N}</dd></div>
      <div><dt>Hops</dt><dd><span data-stat="hops">0</span></dd></div>
      <div><dt>Run</dt><dd>#<span data-stat="run">1</span></dd></div>
    </dl>
    <div class="markov-stats-flash" data-flash></div>
  `;
  container.appendChild(panel);

  const chartLine = panel.querySelector('.markov-chart-line');
  const chartArea = panel.querySelector('.markov-chart-area');
  const statVisited = panel.querySelector('[data-stat="visited"]');
  const statHops = panel.querySelector('[data-stat="hops"]');
  const statRun = panel.querySelector('[data-stat="run"]');
  const statFlash = panel.querySelector('[data-flash]');

  // ── Animation state ────────────────────────────────────────────────────────
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    walker.style.display = 'none';
    trail.style.display = 'none';
    return;
  }

  const HOP_MS = 1500;
  const PAUSE_MS = 250;
  const RESET_PAUSE_MS = 3500;
  const TRAIL_LEN = 6;
  const CHART_W = 180;
  const CHART_H = 80;

  let runIndex = 1;
  let current, next, hopStart, positions, visited, hops, history;

  function startRun(initial) {
    current = initial !== undefined ? initial : Math.floor(Math.random() * N);
    next = pickNext(current);
    hopStart = performance.now();
    positions = [{ x: nodes[current].x, y: nodes[current].y }];
    visited = new Set([current]);
    hops = 0;
    history = [{ hop: 0, pct: 1 / N }];
    nodeEls.forEach(el => el.classList.remove('visited'));
    nodeEls[current].classList.add('visited');
    redrawChart();
    updateStats();
    statRun.textContent = runIndex;
    statFlash.classList.remove('show');
    statFlash.textContent = '';
  }

  function updateStats() {
    statVisited.textContent = visited.size;
    statHops.textContent = hops;
  }

  function redrawChart() {
    const maxHop = Math.max(history[history.length - 1].hop, 12);
    const pts = history.map(h => {
      const x = (h.hop / maxHop) * CHART_W;
      const y = CHART_H - h.pct * CHART_H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    chartLine.setAttribute('points', pts.join(' '));
    if (history.length > 0) {
      const last = history[history.length - 1];
      const lastX = (last.hop / maxHop) * CHART_W;
      chartArea.setAttribute('d', `M0,${CHART_H} L${pts.join(' L')} L${lastX.toFixed(1)},${CHART_H} Z`);
    }
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function onHopComplete() {
    hops += 1;
    current = next;
    visited.add(current);
    nodeEls[current].classList.add('visited');
    history.push({ hop: hops, pct: visited.size / N });
    redrawChart();
    updateStats();

    if (visited.size === N) {
      statFlash.textContent = `Covered in ${hops} hops`;
      statFlash.classList.add('show');
      setTimeout(() => {
        runIndex += 1;
        startRun();
      }, RESET_PAUSE_MS);
      return;
    }

    setTimeout(() => {
      next = pickNext(current);
      hopStart = performance.now();
      requestAnimationFrame(tick);
    }, PAUSE_MS);
  }

  function tick(now) {
    const elapsed = now - hopStart;
    const t = Math.min(1, elapsed / HOP_MS);
    const e = easeInOut(t);
    const a = nodes[current];
    const b = nodes[next];
    const x = a.x + (b.x - a.x) * e;
    const y = a.y + (b.y - a.y) * e;
    walker.setAttribute('cx', x);
    walker.setAttribute('cy', y);

    const lastPos = positions[positions.length - 1];
    if (Math.hypot(x - lastPos.x, y - lastPos.y) > 6) {
      positions.push({ x, y });
      if (positions.length > TRAIL_LEN) positions.shift();
      trail.setAttribute('points', positions.map(p => `${p.x},${p.y}`).join(' '));
    }

    if (t >= 1) {
      onHopComplete();
      return;
    }
    requestAnimationFrame(tick);
  }

  startRun(0);
  requestAnimationFrame(tick);
})();
