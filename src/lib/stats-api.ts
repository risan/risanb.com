const STATS_API = (import.meta.env.PUBLIC_STATS_API_URL || 'https://stats.risanb.com').replace(
  /\/$/,
  '',
);

export interface PostStats {
  views?: number;
  likes?: number;
}

const statsBySlug = new Map<string, Promise<PostStats | null>>();

async function requestJson(path: string, init?: RequestInit): Promise<PostStats | null> {
  try {
    const response = await fetch(`${STATS_API}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init?.headers },
    });

    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

/** The like and view counters on a post page both need this; share one request. */
export function fetchStats(slug: string): Promise<PostStats | null> {
  let stats = statsBySlug.get(slug);

  if (!stats) {
    stats = requestJson(`/api/stats?slug=${encodeURIComponent(slug)}`);
    statsBySlug.set(slug, stats);
  }

  return stats;
}

/** Resolves to null when the API is down or rejects the request. */
export function postStatsEvent(
  endpoint: 'views' | 'likes',
  body: Record<string, unknown>,
  options: { keepalive?: boolean } = {},
): Promise<PostStats | null> {
  return requestJson(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ site: 'risanb.com', path: window.location.pathname, ...body }),
    keepalive: options.keepalive ?? false,
  });
}
