---
title: Kemeny Constant
subtitle: Markov chains being weird little guys
# image:
tags: [data-science, interactive]
comments: false
math: true
---

In this post, I want to cover a result in Markov dynamics that made my head hurt back during my PhD: the **Kemeny constant**. This result is so mental and surprising that I think it's best not to spoil it too much in advance. So let's start with a Markov model — the world's most clichéd one, a little weather chain.

Three states — **Sunny**, **Cloudy**, **Rainy** — and each day the weather hops to the next according to some fixed probabilities. The numbers on the arrows below are the transition probabilities (I've left out the probabilities of *staying* in the same state, but those are easy to infer — each state's outgoing probabilities sum to one).

## Play with it

**Click any state to start the walk there.** The glowing dot is a simulated trajectory — a random sequence of days drifting through the chain.

<div id="kemeny-viz" class="kemeny-viz"></div>
<script src="{{ '/assets/js/kemeny-viz.js' | relative_url }}" defer></script>

Watch the bars on the right for a while. The **simulated** share of Sunny/Cloudy/Rainy days (the filled bars) settles toward a fixed set of values — the little ticks — no matter where you start. That's the **equilibrium distribution** $\pi$: the long-run fraction of time the chain spends in each state.

## A more interesting question

Equilibrium is the warm-up. Here's the quantity I actually care about: the **mean first-passage time** $m_{ij}$ — starting in state $i$, how many days on average until you *first* reach state $j$?

That panel updates as you pick different start states. Starting from Sunny, it takes some average number of steps to first see Rain; starting from Cloudy, a different number; and so on. Nothing surprising yet — different starting points, different travel times.

## Now here comes the mind-bending part

Take the average travel time from your start state $i$ to each destination $j$, but **weight each one by how often you end up in $j$ in the long run** (that's $\pi_j$), and add them up:

$$ K_i \;=\; \sum_j \pi_j \, m_{ij} $$

Compute it starting from **Sunny**. Fine, you get some number.

Might as well do it starting from **Cloudy** instead.

...the same number.

Try **Rainy**. *Same number again.* What?

That's exactly what the three badges at the bottom of the widget are doing — and crucially, they're not reading off a formula. Each one is **estimated from the simulated trajectory itself**: every time the walk sits in state $i$, we clock how long until it next reaches each $j$, average those journeys, and weight by $\pi$. Three independent tallies, one per starting state — and they're a live readout of the walk above, so they start noisy and jumpy. But let it run: as the days tick by, all three wobble in toward the **same value**.

This invariant is the **Kemeny constant**. For a given chain it doesn't matter one bit which state you start in: the expected weighted distance to "anywhere" is a property of the *network*, not of where you happen to be standing.

## Why on earth is this true?

The hand-wavy intuition: starting somewhere "close to" the high-traffic states saves you time reaching them, but costs you exactly that much extra getting to the far-flung ones — and because the far states are visited rarely (small $\pi_j$), the books balance perfectly. The clean proof falls out of the fundamental matrix $Z = (I - P + \mathbf{1}\pi^\top)^{-1}$, where one shows $\sum_j \pi_j m_{ij} = \operatorname{tr}(Z) - 1$ for *every* $i$ — a quantity with no $i$ in it. Equivalently, $K = \sum_{k \ge 2} \frac{1}{1 - \lambda_k}$, a sum over the chain's non-unit eigenvalues.

I'll come back and flesh out the proof properly. For now I just wanted you to *feel* the weirdness by clicking around.
