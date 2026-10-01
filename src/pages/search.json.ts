import type { APIRoute } from 'astro';
import { toPlainText } from '../lib/plain-text';
import { getPosts, postSlug, postUrl } from '../lib/posts';

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
  const posts = await getPosts();

  const index = posts.map((post) => ({
    id: postSlug(post),
    url: postUrl(post),
    title: post.data.title,
    description: post.data.description ?? '',
    date: post.data.date.toISOString().slice(0, 10),
    tags: post.data.tags,
    categories: post.data.categories,
    text: toPlainText(post.body ?? ''),
  }));

  return Response.json(index);
};
