# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

This is a personal blog/portfolio site for Adam Kells, built with **Jekyll** using the **Minima** theme (v3.0.0.dev — this repo *is* the theme, not just a site using it). The site is hosted on GitHub Pages at adamkells.github.io.

## Commands

```sh
# Install dependencies
script/bootstrap        # or: gem install bundler && bundle install

# Serve locally (live reload at http://localhost:4000)
script/server           # or: bundle exec jekyll serve

# Build the site
script/build            # or: bundle exec jekyll build

# Run CI checks (builds site + builds gem)
script/cibuild
```

## Architecture

This repo doubles as both the **Minima theme gem** and the **example/demo site**. Jekyll uses the files at the repo root as the example site, while the theme files (`_layouts/`, `_includes/`, `_sass/`, `assets/`) are packaged into the gem via `minima.gemspec`.

**Content files (site-specific):**
- `index.md` — home page (uses `home` layout)
- `about.md`, `research.md`, `links.md` — static pages linked in the header (configured via `header_pages` in `_config.yml`)
- `_posts/` — blog posts in Markdown, named `YYYY-MM-DD-title.md`
- `assets/` — images and PDFs (blog post images live under `assets/blogs/<post-name>/`)

**Theme files (part of the gem):**
- `_layouts/` — `base.html` is the root layout; `home.html`, `page.html`, `post.html` extend it
- `_includes/` — reusable partials; `custom-head.html` is the hook for adding to `<head>`
- `_sass/minima/` — Sass partials; customise via `custom-variables.scss` (variables) or `custom-styles.scss` (styles overrides)
- `_sass/minima/skins/` — colour palettes (`classic`, `dark`, `auto`, `solarized`, etc.); active skin set in `_config.yml` under `minima.skin`

**CI:** `.github/workflows/ci.yaml` runs `script/cibuild` against Jekyll 3.9 and 4.2.

## Blog Post Front Matter

```yaml
---
title: Post Title
subtitle: Optional subtitle
image: /assets/blogs/<slug>/image.png
tags: [data-science]
comments: false   # disables Disqus comments
---
```

Posts do not need a `layout:` key — Jekyll infers `post` layout for files in `_posts/`.
