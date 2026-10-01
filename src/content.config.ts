import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// The `code` collection reads the posts in content/code/. A slug maps to its URL:
//
//   content/code/switching-to-hugo.md                       -> /posts/switching-to-hugo/
//   content/code/vue-chart-component-with-chartjs/index.md  -> /posts/vue-chart-component-with-chartjs/
//
// _index.md is Hugo's section-metadata file and is not a post.
//
// A missing or renamed frontmatter key fails the build rather than silently
// degrading a page.
const code = defineCollection({
  loader: glob({
    pattern: ['**/*.md', '!**/_index.md'],
    base: './content/code',
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** Shown as "Updated" when later than `date`. */
    lastmod: z.coerce.date().optional(),
    description: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    /** Social/OG images. Absolute site paths, not bundle-relative. */
    images: z.array(z.string()).default([]),
    /** Drives the homepage featured list. */
    featured: z.boolean().default(false),
    /** Used for <html lang>; some posts are Indonesian. */
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
