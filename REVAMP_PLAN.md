# Site Revamp Plan

A staged plan for revamping adamkells.github.io. Written for a fresh model to pick up and execute — all context needed should be in this doc.

## Context

This is a Jekyll site (Minima theme v3.0.0.dev — the repo *is* the theme). See `CLAUDE.md` for build commands and architecture.

The revamp has three drivers:
1. A warmer, more personal landing page inspired by the cover of *The Emperor of All Maladies*.
2. A live animated Markov-chain visualisation on the home page.
3. A rebrand pivoting Adam's positioning toward AI for time series.

## Locked-in decisions

### Palette
Four colors provided by Adam, sampled from the *Emperor of All Maladies* cover:
- `#982E2E` — deep crimson (headings, site title)
- `#2D282C` — warm near-black (page background)
- `#61C7EF` — bright sky blue (link hover, tooltip accent)
- `#FF5A1A` — vivid orange (link base, walker dot)

No light tone was provided. Introduce a warm off-white for body text — proposed `#EFE6D6` (confirm with Adam before committing).

The mood is "warm dark / firelit," not cream parchment. This is a deliberate shift from the existing `_sass/minima/skins/warm.scss` skin.

### Layout
- Home page only: vertical nav on the right (~30% column), content on the left (~70%).
- All other pages: keep the existing top `header.html` untouched.
- Home page: no headshot, no blog list. Just name, tagline, ~5 bullets, the Markov viz, and the right-side nav.
- Blog post list moves to a new `/blog/` page.

### Markov visualisation
- One walker, SVG-rendered, vanilla JS (no framework).
- ~16 nodes (see "Node set" below), hand-positioned in a soft cluster.
- Hover reveals node label + one-line tooltip.
- Walker is a glowing `#FF5A1A` dot with a fading tail, 1.5s ease-in-out per hop.
- Transition matrix biased so the walker spends most time in *Foreground* + *Bridge* nodes (the rebrand-relevant clusters).
- Respects `prefers-reduced-motion`: render static graph, no walker.
- Container roughly 480×320, sits below the bullets.

### Rebrand
- Rewrite both home bullets *and* the about page to position Adam as an AI-for-time-series specialist.
- Frame his Markov / state-space background as the *bridge* to modern foundation-model TS work (Chronos, TimesFM, Moirai, Mamba/SSMs), not as a past chapter.
- Backlog (`BACKLOG.md`) refocused to elevate AI-for-TS posts.

## Node set for the Markov viz

16 nodes, three tiers. Edges should be weighted so the walker dwells mostly in Foreground + Bridge.

**Foreground (rebrand):**
1. Time-series forecasting
2. Foundation models for TS
3. State-space models
4. Hierarchical forecasting
5. Probabilistic forecasting
6. Bayesian inference

**Bridge (Adam's real differentiator):**
7. Markov chains
8. Hidden Markov models
9. Mixing times / Kemeny constant
10. Stochastic processes

**Adjacent expertise:**
11. Causal discovery
12. Anomaly detection
13. NLP

**Roots:**
14. Protein dynamics
15. Non-equilibrium systems
16. Theoretical physics

Each node should have a one-line tooltip (Adam to provide, or implementer to draft for review).

## Phases

### Phase 1 — Palette + skin
- Create `_sass/minima/skins/emperor.scss` from scratch (do not fork `warm.scss` — different mood).
- Background `#2D282C`, body text `#EFE6D6` (confirm with Adam).
- Site title and `h1`/`h2`/`h3`: `#982E2E`.
- Links: base `#FF5A1A`, hover `#61C7EF`, visited slightly muted.
- Borders/rules: muted crimson at low alpha (e.g. `rgba(152, 46, 46, 0.3)`).
- Code blocks: dark variant — pick a subtle tint of the background.
- Activate via `minima.skin: emperor` in `_config.yml`.

### Phase 2 — Split home from blog index
- Add `blog.md` with `permalink: /blog/`, `layout: blog`.
- Create `_layouts/blog.html` — lift the post-list block currently in `_layouts/home.html` (lines ~72–138) into here. Keep pagination handling.
- Add `blog.md` to `header_pages` in `_config.yml` (so it appears in the top nav on non-home pages).
- Remove the post-list block and the headshot block from `_layouts/home.html`.

### Phase 3 — Home page layout
- Rewrite `_layouts/home.html`:
  - Two-column flex container: left ~70%, right ~30%.
  - Left column: `<h1>Adam Kells</h1>`, a one-line tagline, then ~5 bullets (Adam to finalise; draft proposal below), then the Markov viz container `<div id="markov-viz"></div>`.
  - Right column: vertical nav listing About, Favourites, Blog, Links, Research; small caps, generous line-height. Social icons (GitHub, LinkedIn) and email at the bottom of the right column.
- Suppress the top `header.html` on the home page only. Cleanest way: edit `_layouts/base.html` to skip the `header.html` include when `page.layout == "home"`, or wrap the include in a conditional.
- Mobile: collapse to single column, nav becomes a top strip.

**Draft home-page bullets** (Adam to edit):
- Building forecasting systems in production at Artefact, with a focus on probabilistic and hierarchical methods.
- Currently obsessed with the boundary between classical state-space modelling and foundation models for time series.
- Previously: hierarchical forecasting at MADE, causal discovery at causaLens.
- PhD in biophysics — Markov models of protein dynamics. The state-space instinct goes back a decade.
- Outside work: reading, music, film, photography, a mild crossfit habit.

### Phase 4 — Markov visualisation
- New file `assets/js/markov-viz.js`.
- New CSS block in `_sass/minima/custom-styles.scss` under a `// ── Markov viz ──` section header.
- Implementation notes:
  - Pure SVG. Node positions hand-tuned (do not run a force-simulation in-browser on every page load — too costly for an ambient element).
  - Build a transition matrix `P[i][j]` with weights favouring intra-cluster transitions. Foreground↔Bridge edges should be heavy; Bridge↔Roots should exist but be light; Adjacent connects to Foreground via Anomaly Detection and to Bridge via Causal Discovery.
  - Walker logic: at each tick, sample `next = weightedChoice(P[current])`, animate position from `nodes[current]` to `nodes[next]` over 1.5s with ease-in-out.
  - Fading tail: a polyline of the last ~5 positions with decreasing alpha.
  - Hover: enlarge node by ~20%, show tooltip with `#61C7EF` text on a dark backdrop with subtle border.
  - `prefers-reduced-motion`: render nodes + edges only, no walker, no tail.
  - Container roughly 480×320; should scale down on mobile.
- Load the script in `_includes/head.html` or via a `<script>` tag at the end of `_layouts/home.html` (latter is simpler).

### Phase 5 — About page rewrite
- Edit `about.md`. New structure:
  - Lead paragraph: reframe Adam as a forecasting / probabilistic-TS specialist who's spent a decade in state-space thinking, now working at the boundary of classical TS modelling and foundation models.
  - Background: keep Artefact / MADE / causaLens, but emphasise the forecasting and probabilistic threads.
  - PhD section: reframe as the source of the state-space instinct, not a "previous lifetime."
  - Outside Work: keep the existing personality block.
- Tone: warmer, less corporate than the current version. Should match the home page bullets.

### Phase 6 — Backlog refocus (no code)
- Edit `BACKLOG.md` to elevate AI-for-TS posts to the top of the Ideas section:
  - A Chronos / TimesFM / Moirai paper-notes series.
  - "Classical vs foundation forecasting" opinion piece.
  - "Markov modelling for non-physicists" (already in backlog — promote it).
- The Kemeny constant draft (`_drafts/2026-04-17-kemeny-constant.md`) becomes thematically central. Finish and ship as the first post under the new positioning.

## Open items for Adam

Before Phase 1 ships:
- [ ] Confirm the off-white body-text hex (proposed `#EFE6D6`).

Before Phase 3 ships:
- [ ] Final pass on the home-page bullets.

Before Phase 4 ships:
- [ ] One-line tooltips for each of the 16 nodes (or approve implementer drafts).

Before Phase 5 ships:
- [ ] Read the rewritten about page before it lands.

## Files touched (summary)

New:
- `_sass/minima/skins/emperor.scss`
- `_layouts/blog.html`
- `blog.md`
- `assets/js/markov-viz.js`
- One small CSS section in `_sass/minima/custom-styles.scss`

Modified:
- `_config.yml` (skin, header_pages)
- `_layouts/home.html` (complete rewrite)
- `_layouts/base.html` (conditional header)
- `about.md` (rewrite)
- `BACKLOG.md` (reorder)

Untouched:
- Existing posts, `research.md`, `links.md`, `favourites.md`, `_data/favourites.yml`.
- Top `header.html` (still used on non-home pages).
