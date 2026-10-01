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

// publicDir is `static/` rather than Astro's default `public/`: the Hugo-era
// layout kept it that way, so `static/img/x.png` resolves to `/img/x.png`.
export default defineConfig({
  site: 'https://risanb.com',

  // Every page is `<route>/index.html` and canonical with a trailing slash. The
  // redirect map and wrangler's `auto-trailing-slash` depend on it, so it is
  // stated rather than left to the defaults.
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
      defaultProps: {
        frame: 'terminal',
      },
      shiki: {
        langAlias: {
          'go-html-template': 'html',
        },
      },
      frames: {
        showCopyToClipboardButton: true,
        removeCommentsWhenCopyingTerminalFrames: false,
      },
    }),
  ],

  vite: {
    // Only used for its preflight reset; the site's own CSS is in styles/global.css.
    plugins: [tailwindcss()],
  },

  markdown: {
    // Configured on the unified processor explicitly (Astro 7+ default processor is Sätteri).
    processor: unified({
      remarkPlugins: [remarkHugoShortcodes],
      rehypePlugins: [rehypeFigure],
    }),
  },

  // These belong to the top-level `image` key; under `markdown.image` they are
  // silently ignored. 'constrained' fits images to the column without exceeding
  // their natural size, and emits a srcset so phones don't download 1950px originals.
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
});
