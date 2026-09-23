# Rewrite the GitHub activity heatmap tutorial

Status: ready
Type: chore
Route: quick-change — one post, with clear behavior and a small editorial scope.
Next: build

## Request
Rewrite `content/code/building-a-github-activity-heatmap` as a fun, easy-to-follow tutorial about adding the GitHub activity heatmap to the homepage. Keep the code accurate and exclude the later sound-generation and synthesizer work.

## Goal
Make the post useful to developers and sound like the author's other writing. Explain the data fetch, refresh, and SVG rendering in plain language; retain the rendered example, remove the redundant screenshot, and link to the heatmap-only implementation.

## Target
- `content/code/building-a-github-activity-heatmap/index.md` — tutorial to rewrite.
- Pattern to follow: `content/code/vue-chart-component-with-chartjs/index.md` — personal opening, direct transition, incremental explanation.

## Acceptance criteria
- [ ] The article explains the heatmap-only flow in simple words and keeps a playful first-person voice.
- [ ] Snippets are accurate excerpts from the implementation at `7bb6f050088a486be2828fc14511bf15ba2d8655`; later audio and synthesizer code is absent.
- [ ] The rendered inline example remains, the end screenshot is removed, and readers can open the heatmap-only source commit.
