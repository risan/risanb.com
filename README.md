# risanb.com

Risan Bagja's technical writing — code posts, notes and tutorials in English
and Indonesian.

Live at <https://risanb.com>.

## What this is

An [Astro](https://astro.build) static site with Vue islands and TypeScript.
It is half of a two-site split of what was previously a single Hugo site:

| Site | Content | Repo |
| --- | --- | --- |
| `risanb.com` | technical posts, at `/posts/<slug>/` | this repo |
| `blog.risanb.com` | everything else, at `/<slug>/` | [risan/blog.risanb.com](https://github.com/risan/blog.risanb.com) |

The two share a design system, the remark/rehype plugins in `src/lib/`, and the
search island — but own their content, builds and deploys independently.

## Requirements

Node 20.3+ (see `.node-version`). npm.

`.tool-versions` is deliberately **absent**. Workers Builds detects that file and
tries to install its contents, but the build image only supports `NODE_VERSION`,
`.nvmrc` and `.node-version` — a `.tool-versions` file fails the build before it
starts with `Failed: error occurred while installing tools or dependencies`.

## Commands

```sh
npm install
npm run dev          # dev server on :4321
npm run build        # build to dist/ (no type-check; CI runs it separately)
npm run preview      # serve dist/
npm run check        # astro check + vue-tsc
npm run check:site   # verify dist/ (links, feeds, redirects, legacy URLs)
npx wrangler deploy  # ship dist/ to Cloudflare Workers
```

`npm run build` does not type-check, so a deploy build doesn't repeat what CI
already ran. Run `npm run check` before pushing; CI fails on type errors.

`npm run check:site` asserts every page exists, every internal link resolves,
the URLs in `rss.xml` and the sitemap are served, no redirect rule shadows a
real page, and — using `scripts/legacy-urls.txt` — that all 250 URLs the Hugo
site served are still served or redirected.

## Layout

```
content/code/          the posts (markdown, page bundles and flat files)
content/about/         the /about/ page
src/content.config.ts  the `code` and `about` collection schemas
src/layouts/           BaseLayout + PostLayout
src/pages/             home, /posts/, tags, categories, about, rss.xml, search.json
src/components/        PostList, TagCloud, counters, search modal, home widgets
src/lib/               post and date helpers, stats API client, remark/rehype plugins, Shiki theme
static/                favicon, robots.txt, img, _redirects
scripts/               check-site.mjs (post-build verification), GitHub contributions fetcher
wrangler.jsonc         Cloudflare Workers deploy config (static assets only)
```

`content/blog/` is a leftover of the split and is not read by the build.

## Notes on the migration

- Technical posts moved from `/code/<slug>/` to `/posts/<slug>/`; `/code/*`
  redirects there.
- `static/_redirects` sends the 143 `/blog/*` URLs plus 29 blog-only category
  and tag pages to `blog.risanb.com`, and the old Hugo feed `/index.xml` to
  `/rss.xml`. Cloudflare defaults to 302 when the status is omitted, so every
  rule states `301` explicitly — a 302 would not carry the ranking. Static
  rules are listed before the splat rule, per Cloudflare's ordering requirement.
- Astro writes to `dist/`. `publicDir` stays `static/`, as it was under Hugo.
- `src/lib/remark-hugo-shortcodes.mjs` still renders the Hugo shortcodes the
  older posts use.

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
