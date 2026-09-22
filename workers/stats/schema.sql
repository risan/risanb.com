-- D1 Database Schema for risanb.com page views and love/like counter
-- Apply to D1 via Cloudflare Dashboard or wrangler d1 execute

CREATE TABLE IF NOT EXISTS page_stats (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_page_stats_views ON page_stats(views DESC);
CREATE INDEX IF NOT EXISTS idx_page_stats_likes ON page_stats(likes DESC);
