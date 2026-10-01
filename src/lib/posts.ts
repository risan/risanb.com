import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** All posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');

  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** A page bundle ('foo/index') and a flat file ('foo') share the URL '/posts/foo/'. */
export function postSlug(post: Post): string {
  return post.id.replace(/\/index$/, '');
}

export function postUrl(post: Post): string {
  return `/posts/${postSlug(post)}/`;
}

/** Group posts by each of their tags or categories, keeping the input order within a group. */
export function groupByTerm(posts: Post[], field: 'tags' | 'categories'): Map<string, Post[]> {
  const groups = new Map<string, Post[]>();

  for (const post of posts) {
    for (const term of post.data[field]) {
      const group = groups.get(term);

      if (group) {
        group.push(post);
      } else {
        groups.set(term, [post]);
      }
    }
  }

  return groups;
}
