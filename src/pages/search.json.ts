import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { toPlainText } from '../lib/plain-text';

/**
 * Static search index for the ⌘K modal.
 *
 * Emitted as a real file at /search.json so it is CDN-cacheable and costs
 * nothing on page load — SearchModal fetches it on first open, not on hydrate.
 * That is the whole reason full-text is affordable here: a visitor who never
 * searches downloads zero index bytes.
 *
 * `text` is the flattened body. Fields are kept as separate arrays/strings
 * rather than one blob so MiniSearch can boost title and tags above body prose.
 */
export const GET: APIRoute = async () => {
  const posts = await getCollection('code');

  const index = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((post) => {
      // Same normalisation as src/pages/code/[...slug].astro — a bundle
      // directory ('foo/index') and a flat file ('foo') share one URL.
      const slug = post.id.replace(/\/index$/, '');

      return {
        id: slug,
        url: `/posts/${slug}/`,
        title: post.data.title,
        description: post.data.description ?? '',
        date: post.data.date.toISOString().slice(0, 10),
        tags: post.data.tags,
        categories: post.data.categories,
        text: toPlainText(post.body ?? ''),
      };
    });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Long-lived: the file is content-hashed by nothing, but it changes only
      // on deploy, and a stale index is worse than a revalidation round-trip.
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
