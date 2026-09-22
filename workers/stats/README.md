# risanb-stats (Cloudflare Worker + D1)

Lightweight stats engine for risanb.com: tracks page views and provides an interactive Love/Heart reaction counter.

## Architecture

To prevent interference with `risanb.com`'s static asset layer (which handles 143 legacy 301 redirects in `_redirects`), this Worker runs as its own dedicated service (`risanb-stats`), connected to Cloudflare D1.

## Setup via Cloudflare Dashboard UI

You can set this up completely in the Cloudflare Dashboard in under 3 minutes without touching the CLI or using company tokens:

### 1. Create the D1 Database
1. Go to **Cloudflare Dashboard** -> **Storage & Databases** -> **D1 SQL Database**.
2. Click **Create database**.
3. Name it: `risanb-stats-db`.
4. Click **Create**.
5. Note the **Database ID** (you will bind this to your worker).
6. Click on the **Console** tab of your new database, paste the contents of `schema.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS page_stats (
     slug TEXT PRIMARY KEY,
     views INTEGER NOT NULL DEFAULT 0,
     likes INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL DEFAULT (datetime('now')),
     updated_at TEXT NOT NULL DEFAULT (datetime('now'))
   );

   CREATE INDEX IF NOT EXISTS idx_page_stats_views ON page_stats(views DESC);
   CREATE INDEX IF NOT EXISTS idx_page_stats_likes ON page_stats(likes DESC);
   ```
7. Click **Execute**.

### 2. Create the Cloudflare Worker
1. Go to **Workers & Pages** -> **Overview** -> **Create application** -> **Create Worker**.
2. Name it: `risanb-stats`.
3. Click **Deploy**.
4. In the worker's page, click **Settings** -> **Bindings** (under Variables & Secrets) -> **Add binding**:
   - **Type**: D1 Database
   - **Variable name**: `DB`
   - **D1 Database**: Select `risanb-stats-db`
   - Click **Save and Deploy**.
5. Click **Edit code** in the top right, copy and paste the code from `workers/stats/src/index.ts`, and click **Deploy**.

### 3. Add Custom Domain
1. In the `risanb-stats` Worker settings, go to **Settings** -> **Domains & Routes** -> **Add**:
   - Select **Custom Domain**.
   - Enter: `stats.risanb.com` (or your preferred subdomain).
   - Click **Add Custom Domain** (Cloudflare automatically configures DNS and SSL certificate).

### 4. Optional: Local & Production Environment Variables
The Astro frontend defaults to `https://stats.risanb.com`. If you use a different domain or path, you can set:
```bash
PUBLIC_STATS_API_URL=https://stats.risanb.com
```
in your Cloudflare Workers Builds dashboard (or `.env`).
