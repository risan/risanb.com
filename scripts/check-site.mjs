#!/usr/bin/env node
/**
 * Verify a built Astro site the way scripts/check-site.py verified the Hugo one:
 * every expected page exists, every internal link resolves, and the migration's
 * redirect map actually covers the URLs search engines already know about.
 *
 * Node rather than Python so CI needs only the toolchain the site already uses.
 *
 *   node scripts/check-site.mjs [distDir]
 *
 * Exits non-zero listing every problem found, not just the first.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, process.argv[2] ?? 'dist');

/** Pages that must exist for the site to be shippable. */
const REQUIRED = [
  'index.html',
  '404.html',
  'about/index.html',
  'code/index.html',
  'categories/index.html',
  'tags/index.html',
  'rss.xml',
  'sitemap-index.xml',
  'favicon.svg',
  'search.json',
  'robots.txt',
  '_redirects',
];

/** Schemes and fragments we never resolve against the filesystem. */
const SKIP = /^(?:[a-z]+:|\/\/|#|$)/i;

/**
 * Hosts a link is allowed to leave for. The blog half of the site lives on its
 * own domain after the split, so post bodies legitimately link out to it.
 */
const EXTERNAL_HOSTS = ['blog.risanb.com'];

const problems = [];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** Map a site-absolute URL path to the file that should satisfy it. */
function resolves(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const candidates = [
    join(DIST, clean),
    join(DIST, clean, 'index.html'),
    join(DIST, `${clean}.html`),
  ];
  return candidates.some((c) => existsSync(c) && statSync(c).isFile());
}

for (const required of REQUIRED) {
  if (!existsSync(join(DIST, required))) problems.push(`missing required file: ${required}`);
}

const files = (await walk(DIST)).filter((f) => f.endsWith('.html'));

// ---------------------------------------------------------------- links -----
let linkCount = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const page = relative(DIST, file);

  for (const [, attr, rawValue] of html.matchAll(/\b(href|src)="([^"]*)"/g)) {
    const value = rawValue.trim();
    if (SKIP.test(value)) continue;

    if (/^https?:\/\//i.test(value)) {
      const host = new URL(value).host;
      if (!EXTERNAL_HOSTS.includes(host) && !host.endsWith('risanb.com')) {
        problems.push(`${page}: unexpected external ${attr} -> ${value}`);
      }
      continue;
    }

    if (!value.startsWith('/')) continue;

    linkCount += 1;
    if (!resolves(value)) problems.push(`${page}: broken ${attr} -> ${value}`);
  }
}

// ------------------------------------------------------------- redirects ----
/**
 * Parse static/_redirects. Rules are `from  to  status`, '#' comments allowed,
 * and a trailing '*' in `from` is a splat. The status must be stated: omitting
 * it makes Cloudflare and Netlify serve a 302, which does not carry ranking.
 */
const redirectsPath = join(DIST, '_redirects');
const redirectRules = [];

if (existsSync(redirectsPath)) {
  const lines = readFileSync(redirectsPath, 'utf8').split('\n');

  lines.forEach((line, index) => {
    const at = `_redirects:${index + 1}`;
    const text = line.trim();
    if (!text || text.startsWith('#')) return;

    const [from, to, status] = text.split(/\s+/);
    if (!from || !to) {
      problems.push(`${at}: expected "<from> <to> <status>", got: ${text}`);
      return;
    }
    if (!from.startsWith('/')) problems.push(`${at}: source must be site-absolute, got: ${from}`);
    if (!/^https:\/\//.test(to)) problems.push(`${at}: destination must be absolute https, got: ${to}`);
    if (status !== '301') {
      problems.push(`${at}: status must be an explicit 301 (a 302 loses ranking), got: ${status ?? '(omitted)'}`);
    }
    redirectRules.push({ from, to, status });
  });
}

/** Does a legacy path fall under a rule's source? */
function matchesRule(path, from) {
  if (!from.includes('*')) return path === from;
  const [prefix, suffix = ''] = from.split('*');
  return path.startsWith(prefix) && path.endsWith(suffix);
}

// A non-wildcard rule must not point at a path the build actually serves, or
// hosting would hijack a real page.
for (const { from } of redirectRules) {
  if (from.includes('*')) continue;
  if (resolves(from)) problems.push(`_redirects: ${from} shadows a page the build serves`);
}

// ---------------------------------------------------------- legacy URLs -----
/**
 * The 250 URLs in risanb.com's sitemap before the split. Each must be either
 * served by this build or covered by a redirect rule — that is the whole
 * promise of the migration, and it stays checkable after content/blog is gone.
 */
const legacyPath = join(ROOT, 'scripts', 'legacy-urls.txt');
let legacyCount = 0;

if (existsSync(legacyPath)) {
  const legacy = readFileSync(legacyPath, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  for (const path of legacy) {
    legacyCount += 1;
    if (resolves(path)) continue;
    if (redirectRules.some((r) => matchesRule(path, r.from))) continue;
    problems.push(`legacy URL is neither served nor redirected: ${path}`);
  }
}

// ----------------------------------------------------------------- report ---
console.log(`pages checked      : ${files.length}`);
console.log(`internal links     : ${linkCount}`);
console.log(`required files     : ${REQUIRED.length - problems.filter((p) => p.startsWith('missing')).length}/${REQUIRED.length}`);
console.log(`redirect rules     : ${redirectRules.length}`);
console.log(`legacy URLs covered: ${legacyCount - problems.filter((p) => p.startsWith('legacy URL')).length}/${legacyCount}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log('\nOK — no broken links, no shadowed pages, no orphaned legacy URLs');
