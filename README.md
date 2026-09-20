# risanb.com

Risan Bagja's technical writing — code posts, notes and tutorials in English
and Indonesian.

Live at <https://risanb.com>.

## What this is

An [Astro](https://astro.build) static site with Vue islands and TypeScript.
It is half of a two-site split of what was previously a single Hugo site:

| Site | Content | Repo |
| --- | --- | --- |
| `risanb.com` | technical posts, at `/code/<slug>/` | this repo |
| `blog.risanb.com` | everything else, at `/<slug>/` | [risan/blog.risanb.com](https://github.com/risan/blog.risanb.com) |

The two share a design system, the remark/rehype plugins in `src/lib/`, and the
search island — but own their content, builds and deploys independently.

This repo previously held a Hugo site. Code posts kept their `/code/<slug>/`
paths unchanged, so no technical post needed a redirect.

## Requirements

Node 20.3+ (see `.tool-versions`). npm.

Hugo is still pinned in `.tool-versions`, but it is no longer part of the build.
It is kept only until the Astro site is cut over.

## Commands

```sh
npm install
npm run dev          # dev server on :4321
npm run build        # type-check, then build to dist/
npm run build:only   # build without the type-check
npm run preview      # serve dist/
npm run check        # astro check + vue-tsc
npm run check:site   # verify dist/ (links, redirects, legacy URLs)
npx wrangler deploy  # ship dist/ to Cloudflare Workers
```

`npm run check:site` is the one that matters before a deploy. It asserts every
page exists, every internal link resolves, no redirect rule shadows a real page,
and — using `scripts/legacy-urls.txt` — that all 250 URLs the Hugo site served
are still served or redirected.

## Layout

```
content/               50 posts (Hugo-era markdown, page bundles + flat files)
src/content.config.ts  the `code` and `about` collection schemas
src/layouts/           BaseLayout + PostLayout
src/pages/             home, /code/<slug>/ posts, tags, categories, rss, search.json
src/lib/               remark/rehype plugins, Shiki theme, text helpers
static/                favicon, robots.txt, img, _redirects
scripts/check-site.mjs post-build verification
wrangler.jsonc         Cloudflare Workers deploy config (static assets only)
```

## Notes on the migration

- Code posts keep `/code/<slug>/` unchanged, so inbound links and search
  rankings are untouched and no technical post redirects at all.
- `static/_redirects` sends the 143 `/blog/*` URLs plus 29 blog-only category
  and tag pages to `blog.risanb.com`. Cloudflare defaults to 302 when the status
  is omitted, so every rule states `301` explicitly — a 302 would not carry the
  ranking. Static rules are listed before the splat rule, per Cloudflare's
  ordering requirement.
- Astro writes to `dist/`, deliberately not Hugo's `public/`, so a Hugo build
  and an Astro build could coexist during the migration without clobbering each
  other. `publicDir` stays `static/` to match Hugo's asset semantics.

## Deploy

Deployed to **Cloudflare Workers** as a static-assets-only Worker: no Worker
script, so requests are served straight from the asset store and no invocations
are billed.

```sh
npm run build
npx wrangler deploy
```

Build settings, if configuring a CI/CD integration rather than deploying
manually:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |

Two things `wrangler.jsonc` deliberately does **not** do:

- **No `main` script.** Redirects in `dist/_redirects` are applied by the
  static-assets layer and are *skipped* for any request a Worker script handles.
  Adding a Worker would silently disable the 143 `/blog/*` redirects.
- **No `run_worker_first`**, for the same reason.

`html_handling: "auto-trailing-slash"` matches the build's `trailingSlash:
"always"` + `format: "directory"`, preserving the trailing-slash parity with
Hugo that the legacy redirect map depends on.

The custom domain (`risanb.com`) is bound under the Worker's
*Settings → Domains & Routes* in the Cloudflare dashboard.

**Cutover note:** this repo previously deployed through Cloudflare Pages with
the dashboard-configured build command `hugo --minify` and output `public`.
That configuration has to be replaced — or the Pages project retired — when
switching to the Worker, otherwise Pages keeps building Hugo and overwrites the
deploy.
