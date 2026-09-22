export interface Env {
  DB: D1Database;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Check if request is from a search engine crawler or browser prefetcher
function isBotOrPrefetch(request: Request): boolean {
  const ua = request.headers.get('User-Agent') || '';
  const purpose = request.headers.get('Purpose') || request.headers.get('Sec-Purpose') || '';
  if (purpose.toLowerCase() === 'prefetch') return true;
  return /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingbot|googlebot|duckduckbot|baiduspider|yandex/i.test(ua);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. GET /api/stats?slug=<slug>
      if (request.method === 'GET' && path === '/api/stats') {
        const slug = url.searchParams.get('slug');
        if (!slug) {
          return Response.json({ error: 'Missing slug parameter' }, { status: 400, headers: CORS_HEADERS });
        }

        const row = await env.DB.prepare(
          'SELECT views, likes FROM page_stats WHERE slug = ?'
        ).bind(slug).first<{ views: number; likes: number }>();

        return Response.json({
          slug,
          views: row?.views ?? 0,
          likes: row?.likes ?? 0
        }, { headers: CORS_HEADERS });
      }

      // 2. POST /api/views
      if (request.method === 'POST' && path === '/api/views') {
        const body = await request.json().catch(() => ({})) as { slug?: string };
        const slug = body.slug;
        if (!slug || typeof slug !== 'string') {
          return Response.json({ error: 'Invalid slug' }, { status: 400, headers: CORS_HEADERS });
        }

        // Return current counts for bots/prefetchers without recording an increment
        if (isBotOrPrefetch(request)) {
          const row = await env.DB.prepare('SELECT views, likes FROM page_stats WHERE slug = ?')
            .bind(slug)
            .first<{ views: number; likes: number }>();
          return Response.json({ slug, views: row?.views ?? 0, likes: row?.likes ?? 0 }, { headers: CORS_HEADERS });
        }

        // Atomic upsert: increment views
        const updated = await env.DB.prepare(`
          INSERT INTO page_stats (slug, views, likes, updated_at)
          VALUES (?1, 1, 0, datetime('now'))
          ON CONFLICT(slug) DO UPDATE SET
            views = views + 1,
            updated_at = datetime('now')
          RETURNING views, likes;
        `).bind(slug).first<{ views: number; likes: number }>();

        return Response.json({
          slug,
          views: updated?.views ?? 1,
          likes: updated?.likes ?? 0
        }, { headers: CORS_HEADERS });
      }

      // 3. POST /api/likes
      if (request.method === 'POST' && path === '/api/likes') {
        const body = await request.json().catch(() => ({})) as { slug?: string; count?: number };
        const slug = body.slug;
        const count = Math.min(Math.max(1, Number(body.count) || 1), 10);
        if (!slug || typeof slug !== 'string') {
          return Response.json({ error: 'Invalid slug' }, { status: 400, headers: CORS_HEADERS });
        }

        // Atomic upsert: increment likes
        const updated = await env.DB.prepare(`
          INSERT INTO page_stats (slug, views, likes, updated_at)
          VALUES (?1, 0, ?2, datetime('now'))
          ON CONFLICT(slug) DO UPDATE SET
            likes = likes + ?2,
            updated_at = datetime('now')
          RETURNING views, likes;
        `).bind(slug, count).first<{ views: number; likes: number }>();

        return Response.json({
          slug,
          views: updated?.views ?? 0,
          likes: updated?.likes ?? count
        }, { headers: CORS_HEADERS });
      }

      return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json({ error: message }, { status: 500, headers: CORS_HEADERS });
    }
  }
};
