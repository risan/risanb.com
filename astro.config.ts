// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import { unified } from '@astrojs/markdown-remark';
import { rehypeFigure } from './src/lib/rehype-figure.mjs';
import { remarkHugoShortcodes } from './src/lib/remark-hugo-shortcodes.mjs';
import { monographLight, monographDark } from './src/lib/shiki-monograph.mjs';

// Astro project config for risanb.com (the technical/code site).
//
// Two path decisions worth knowing about:
//
//   publicDir: 'static'
//     Hugo's static/ and Astro's public/ mean the same thing: files copied
//     verbatim to the output root. Reusing static/ keeps `static/img/x.png`
//     resolving to `/img/x.png` exactly as before, and avoids a collision with
//     .gitignore's `public` entry (which exists because public/ is Hugo's
//     *output* directory).
//
//   outDir: 'dist'
//     Deliberately not Hugo's public/, so a Hugo build and an Astro build can
//     coexist during the migration without clobbering each other.
export default defineConfig({
  site: 'https://risanb.com',

  // Hugo emits /code/foo/index.html. 'directory' is Astro's default but is
  // stated explicitly because trailing-slash parity with Hugo is a hard
  // requirement for the redirect map — a mismatch would turn every existing
  // inbound link into a redirect.
  build: { format: 'directory' },
  trailingSlash: 'always',

  publicDir: './static',
  outDir: './dist',

  integrations: [
    vue(),
    sitemap(),
    expressiveCode({
      themes: [monographLight, monographDark],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => (theme.name === 'monograph-dark' ? '.dark' : false),
      shiki: {
        langAlias: {
          'go-html-template': 'html',
        },
      },
      frames: { showCopyToClipboardButton: true },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    // Configured on the unified processor explicitly (Astro 7+ default processor is Sätteri).
    processor: unified({
      remarkPlugins: [remarkHugoShortcodes],
      rehypePlugins: [rehypeFigure],
    }),
  },

  // NOTE: these belong to the TOP-LEVEL `image` key, not `markdown.image`.
  // Nesting them under markdown silently does nothing — which is how this was
  // caught: srcset was absent from the built HTML while every other image
  // attribute (width/height/loading) was present.
  //
  // 'constrained' scales images to fit the column without exceeding their
  // natural size, the closest analogue to Hugo's 1080px width cap — except it
  // also emits a srcset, so phones stop downloading 1950px originals.
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
});
