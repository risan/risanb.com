# Scout: risanb.com

## Repo rules
- None found. No applicable `CLAUDE.md` or `AGENTS.md` was present at the repository root or checked ancestors.

## Map
- `content/code/building-a-github-activity-heatmap/index.md` — tutorial source, front matter, code examples, inline demo, and screenshot reference — `content/code/building-a-github-activity-heatmap/index.md:1-19`, `:350-453`.
- `scripts/fetch-github-contributions.mjs` — obtains and validates the GraphQL data, then writes the local snapshot — `scripts/fetch-github-contributions.mjs:16-32`, `:85-102`, `:139-207`.
- `src/data/github-contributions.json` — checked-in snapshot statically imported by the Astro component — `scripts/fetch-github-contributions.mjs:10`, `:200-207`; `src/components/GithubHeatmap.astro:1-11`.
- `.github/workflows/update-contributions.yml` — scheduled/manual snapshot refresh and commit-if-changed — `.github/workflows/update-contributions.yml:3-7`, `:31-50`.
- `src/components/GithubHeatmap.astro` — homepage heatmap markup, geometry, dates, colors, and styles; current file includes post-baseline sound features — `src/components/GithubHeatmap.astro:16-71`, `:449-509`, `:531-538`.
- `src/pages/index.astro` — homepage imports and renders the heatmap component; at baseline commit `7bb6f05`, it appears after the intro and before the post columns — `src/pages/index.astro:3-5`, `:56` (at `7bb6f05`).

## Current behavior
- The article opens with the motivation to avoid a third-party iframe/widget and describes build-time GraphQL data, a local JSON snapshot, scheduled refresh, and pure SVG rendering — `content/code/building-a-github-activity-heatmap/index.md:9-19`.
- Its sections are GraphQL/token handling; alias-batched all-time totals; GitHub Actions; Astro/SVG geometry; date labels and tooltips; terracotta colors; result/demo; summary — `content/code/building-a-github-activity-heatmap/index.md:15`, `:80`, `:104`, `:158`, `:224`, `:302`, `:350`, `:447`.
- Baseline fetcher resolves `GITHUB_TOKEN`, `GH_TOKEN`, or `gh auth token`; it rejects a token for a different login and an empty calendar, then stores aggregate stats plus daily counts/levels in JSON. A first overview query returns active years; a second query uses aliases to fetch those years together — `scripts/fetch-github-contributions.mjs:16-32`, `:85-108`, `:139-161`, `:176-207`.
- The workflow runs at 02:00 UTC and on manual dispatch, uses `GH_PAT`, and commits/pushes only if the JSON changed — `.github/workflows/update-contributions.yml:3-7`, `:17-39`, `:41-50`.
- The component statically imports the JSON and draws 10px cells on a 13px grid, with seven weekday rows, dynamic week count, month/weekday labels, quartile classes, and native SVG `<title>` tooltips. On the original heatmap-only baseline it scrolls the calendar to the newest edge and colors it with theme-aware CSS variables — `src/components/GithubHeatmap.astro:1-26`, `:28-71`, `:147-204`, `:207-222` (geometry/helpers/styles in baseline `7bb6f05`).
- The article’s result demo is literal HTML/SVG in the Markdown and the screenshot is a separate image; the homepage component uses the checked-in JSON. Keep those representations distinct when describing refresh behavior — `content/code/building-a-github-activity-heatmap/index.md:354-445`, `:445`; `src/components/GithubHeatmap.astro:1-11`.
- Best implementation baseline: `7bb6f050088a486be2828fc14511bf15ba2d8655` added the fetcher, snapshot, workflow, component, and homepage insertion. The tutorial was added later in `355ebe1`. Sonification begins after the heatmap baseline in `05e0be6`, with later work in `79637af`, `0275cb1`, and `1d2eb8f`; omit it from the rewrite. Current component sound controls/script are visible at `src/components/GithubHeatmap.astro:117-135`, `:531-538`.

## Pattern
- `content/code/vue-chart-component-with-chartjs/index.md` — approachable tutorial pattern: personal tinkering anecdote, a direct question to the reader, a clear “let’s build it” transition, TOC, then incremental headings and code — `content/code/vue-chart-component-with-chartjs/index.md:9-21`.
- `content/code/i-create-my-own-static-site-generator/index.md` — personal log voice uses a specific self-deprecating joke and concrete motivation; the closing returns to the author’s own experience — `content/code/i-create-my-own-static-site-generator/index.md:9-19`, `:209-219`.
- `content/code/building-a-github-activity-heatmap/index.md` — retain the existing tutorial metadata, TOC shortcode, explanatory prose around examples, and closing/demo convention — `content/code/building-a-github-activity-heatmap/index.md:1-13`, `:350-453`.

## Tests
- Framework: Unknown; no test framework or test files were found in the repo file search.
- Command: `npm run build` — the package script runs `npm run check && astro build` — `package.json:6-16`.
- Closest test: None found. The scout did not run the build or tests.

## Contracts
- Post metadata is YAML front matter with `title`, `date`, `description`, `categories`, `tags`, and `images`; content is Markdown with fenced code and the `{{<toc>}}` shortcode — `content/code/building-a-github-activity-heatmap/index.md:1-13`.
- Snapshot contract used by the component: `username`, `stats`, and `calendar`; calendar weeks contain dates, counts, weekdays, and contribution levels — `scripts/fetch-github-contributions.mjs:176-203`; `src/components/GithubHeatmap.astro:1-26`, `:54-71`.
- The homepage includes `GithubHeatmap` as an Astro component — `src/pages/index.astro:3-5`, `:56` (baseline `7bb6f05`).

## Must not change
- Keep GitHub credentials in the build/update environment. The renderer imports only the JSON snapshot, while the fetcher uses the token for authenticated API calls — `scripts/fetch-github-contributions.mjs:16-45`; `src/components/GithubHeatmap.astro:1-11`.
- Preserve the distinction between contribution volume and code quality; the heatmap footer explicitly says it does not measure code quality — `src/components/GithubHeatmap.astro:180-194` (baseline `7bb6f05`); `content/code/building-a-github-activity-heatmap/index.md:428-439`.

## Open decisions
- Editorial choice: whether to keep the embedded demo/screenshot or show the current homepage component; the article’s demo is static markup, while the homepage renders from the JSON snapshot — `content/code/building-a-github-activity-heatmap/index.md:354-445`; `src/components/GithubHeatmap.astro:1-11`.
