---
title: "Bayesian Updating: an interactive explainer"
subtitle: "Watch your beliefs change as evidence arrives — built with Marimo"
tags: [data-science, bayesian, interactive]
comments: false
---

Bayesian updating is one of those ideas that clicks immediately once you *see* it in motion, but can feel abstract on the page. So rather than explain it with equations, here's a live playground.

## The idea in one sentence

You start with a **prior belief** about some probability. When you observe new data, you combine that belief with the evidence to get a **posterior belief**. More data → the prior matters less.

## Play with it

The notebook below models a biased coin. You set:
- **α and β** — the shape of your prior (a Beta distribution). Equal values mean "I think it's fair"; skewing α up means you believe heads is more likely.
- **Observed heads / tails** — the actual data you've collected.

The chart updates in real time as you drag the sliders.

{% include notebook.html src="/assets/notebooks/bayesian-updating/bayesian-updating.html" %}

## What to notice

- **Strong prior, little data** — the posterior barely moves from the prior.
- **Weak prior (α=1, β=1 is uniform — "I have no idea"), lots of data** — the posterior converges tightly around the observed frequency.
- **The prior is just pseudo-data** — setting α=10, β=10 is equivalent to saying "I've already seen 20 fair flips". Ten real heads won't shift that much.

## How this notebook was built

The interactive version is a [Marimo](https://marimo.io) notebook exported to standalone WebAssembly — it runs entirely in your browser, no server required.

The source is at [`assets/notebooks/bayesian-updating.py`]({{ site.github.repository_url }}/blob/master/assets/notebooks/bayesian-updating.py). To run it locally:

```sh
pip install marimo scipy matplotlib
marimo run assets/notebooks/bayesian-updating.py
```

To re-export the embedded version after editing:

```sh
script/export-notebook assets/notebooks/bayesian-updating.py
```

This exports and injects the site's warm theme into the output. Commit the
`assets/notebooks/bayesian-updating/` directory alongside the post.
