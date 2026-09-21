import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('code')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: 'Risan Bagja',
    description:
      'Tutorials and notes on web development, tooling, and the things I break along the way.',
    // Hugo's feed lived at /index.xml; RSS readers and existing subscribers point
    // there. Cloudflare redirects /index.xml -> /rss.xml so those keep working.
    site: context.site ?? 'https://risanb.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? '',
      pubDate: post.data.date,
      link: `/posts/${post.id.replace(/\/index$/, '')}/`,
      categories: [...post.data.categories, ...post.data.tags],
    })),
    customData: '<language>en</language>',
  });
}
