---
layout: post
title: My Arxiv Frontpage
subtitle: Adapting an Arxiv Frontpage app for my website
image: /assets/arxiv.png
tags: [arxiv]
comments: false
archived: true
---

TLDR: You can find my Arxiv Frontpage [here](https://adamkells.github.io/arxiv-frontpage).

I recently came across a [side-project](https://koaning.github.io/arxiv-frontpage/) by Vincent Warmerdam where he created a personalised Arxiv Frontpage for himself. I thought this was really cool so I decided I would fork the repo and add this to my website and refining for my own interests. 

The project basically labels sentences from Arxiv paper abstracts according to whether they contain a topic that Vincent is interested in (new dataset etc.) and then uses a trained classifier to make predictions for new papers coming in. The whole thing uses github actions to automate the process of downloading the new papers from Arxiv each day and doing inference with the model.

My goal is to create my own annotated dataset for topics which interest me (causality, ethical ai etc.) and potentially add some functionality for creating paper summaries with an LLM.

The process has actually been pretty smooth so far. The only slight pain points were figuring out that I needed to set up a Weights and Biases account to store the pretrained model. 

I've managed to get my own version up and running [here](https://adamkells.github.io/arxiv-frontpage) so now I just need to re-annotate my data (which I'm going to do with [pigeon](https://github.com/agermanidis/pigeon) via a Jupyter notebook).
