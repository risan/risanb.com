import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// The `code` collection reads Hugo's content directory directly, so there is no
// duplicated content during the migration and a slug maps 1:1 to its Hugo URL:
//
//   content/code/switching-to-hugo.md            -> /code/switching-to-hugo/
//   content/code/vue-chart-component-with-chartjs/index.md
//                                                -> /code/vue-chart-component-with-chartjs/
//
// _index.md is Hugo's section-metadata file (it renders /code/) and is excluded
// here; the section page is built from src/pages/code/index.astro instead.
//
// The schema mirrors the frontmatter actually present across all 50 code posts
// (audited 2026-09): every field below is either present everywhere or has a
// default, so a missing/renamed key fails the build rather than silently
// degrading a page.
const code = defineCollection({
  loader: glob({
    pattern: ['**/*.md', '!**/_index.md'],
    base: './content/code',
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** Hugo renders "Updated on <lastmod>" when lastmod > date. 1 post uses it. */
    lastmod: z.coerce.date().optional(),
    description: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    /** Social/OG images. Absolute site paths, not bundle-relative. */
    images: z.array(z.string()).default([]),
    /** Drives the homepage featured list. 7 code posts are featured. */
    featured: z.boolean().default(false),
    /** 4 code posts are Indonesian; Hugo used this for <html lang>. */
    languageCode: z.string().default('en'),
  }),
});

/**
 * Standalone pages. Currently just /about/, which Hugo served from
 * content/about/index.md. Kept in the collection rather than inlined into the
 * .astro page so the prose has one source of truth and its bundle-relative
 * image (risan.jpg) resolves through the same image pipeline as post images.
 */
const about = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './content/about',
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    lastmod: z.coerce.date().optional(),
  }),
});

export const collections = { code, about };
