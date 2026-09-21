// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src/data/github-contributions.json');

/**
 * Resolves a GitHub token from environment variables or the local gh CLI.
 * Returns null if no token is available.
 */
function resolveToken() {
  if (process.env.GITHUB_TOKEN?.trim()) {
    return process.env.GITHUB_TOKEN.trim();
  }
  if (process.env.GH_TOKEN?.trim()) {
    return process.env.GH_TOKEN.trim();
  }
  try {
    const out = execSync('gh auth token', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (out?.trim()) {
      return out.trim();
    }
  } catch {
    // gh CLI not authenticated or not installed
  }
  return null;
}

/**
 * Performs an authenticated GitHub GraphQL API query.
 */
async function graphql(token, query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'risanb.com-updater',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API responded with HTTP ${res.status}: ${text}`);
  }

  const payload = await res.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(payload.errors)}`);
  }
  return payload.data;
}

async function main() {
  const token = resolveToken();
  if (!token) {
    if (process.env.CI) {
      console.error('[github] ERROR: No GitHub token found in CI environment. Ensure secrets.GH_PAT is configured.');
      process.exit(1);
    }
    console.log('[github] No GitHub token found (GITHUB_TOKEN, GH_TOKEN, or gh auth).');
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log('[github] Keeping existing cached snapshot at src/data/github-contributions.json.');
      process.exit(0);
    }
    console.error('[github] ERROR: No token and no cached snapshot exists.');
    process.exit(1);
  }

  console.log('[github] Fetching contributions from GitHub GraphQL API...');

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const monthStart = `${year}-${month}-01T00:00:00Z`;
  const yearStart = `${year}-01-01T00:00:00Z`;
  const nowIso = now.toISOString();

  // 1. Fetch calendar (trailing year), thisMonth, thisYear, and list of all active years
  const queryOverview = `
    query GetOverview($monthStart: DateTime!, $yearStart: DateTime!, $now: DateTime!) {
      viewer {
        login
        calendar: contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              firstDay
              contributionDays {
                date
                contributionCount
                contributionLevel
                weekday
              }
            }
            months {
              name
              firstDay
              totalWeeks
            }
          }
          contributionYears
        }
        thisMonth: contributionsCollection(from: $monthStart, to: $now) {
          totalCommitContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
          }
        }
        thisYear: contributionsCollection(from: $yearStart, to: $now) {
          totalCommitContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  const dataOverview = await graphql(token, queryOverview, {
    monthStart,
    yearStart,
    now: nowIso,
  });

  const viewer = dataOverview.viewer;
  const username = viewer.login;
  const calendar = viewer.calendar.contributionCalendar;
  const years = viewer.calendar.contributionYears;

  const EXPECTED_USER = 'risan';
  if (username.toLowerCase() !== EXPECTED_USER) {
    throw new Error(
      `[github] Token belongs to "${username}", expected "${EXPECTED_USER}". Refusing to overwrite data snapshot.`,
    );
  }

  if (!calendar || calendar.totalContributions === 0) {
    throw new Error(
      `[github] Received 0 contributions for "${username}". Refusing to overwrite existing snapshot with empty data.`,
    );
  }

  // 2. Fetch all historical years in a single batched query to sum all-time contributions
  const yearAliases = years
    .map(
      (y) =>
        `y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") { contributionCalendar { totalContributions } totalCommitContributions restrictedContributionsCount }`,
    )
    .join('\n');

  const queryAllYears = `query { viewer { ${yearAliases} } }`;
  const dataAllYears = await graphql(token, queryAllYears);

  let allTimeContributions = 0;
  let allTimePublicCommits = 0;
  let allTimeRestricted = 0;

  for (const y of years) {
    const item = dataAllYears.viewer[`y${y}`];
    if (item) {
      allTimeContributions += item.contributionCalendar?.totalContributions || 0;
      allTimePublicCommits += item.totalCommitContributions || 0;
      allTimeRestricted += item.restrictedContributionsCount || 0;
    }
  }

  const result = {
    username,
    updatedAt: nowIso,
    stats: {
      thisMonth: {
        contributions: viewer.thisMonth.contributionCalendar.totalContributions,
        publicCommits: viewer.thisMonth.totalCommitContributions,
        restricted: viewer.thisMonth.restrictedContributionsCount,
      },
      thisYear: {
        contributions: viewer.thisYear.contributionCalendar.totalContributions,
        publicCommits: viewer.thisYear.totalCommitContributions,
        restricted: viewer.thisYear.restrictedContributionsCount,
      },
      lastYear: {
        contributions: calendar.totalContributions,
      },
      allTime: {
        contributions: allTimeContributions,
        publicCommits: allTimePublicCommits,
        restricted: allTimeRestricted,
      },
    },
    calendar: {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
      months: calendar.months,
    },
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2) + '\n', 'utf-8');

  console.log(`[github] Wrote snapshot to ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log(`[github] Trailing year: ${calendar.totalContributions} contributions`);
  console.log(`[github] This month:   ${result.stats.thisMonth.contributions} contributions`);
  console.log(`[github] This year:    ${result.stats.thisYear.contributions} contributions`);
  console.log(`[github] All time:     ${result.stats.allTime.contributions} contributions`);
}

main().catch((err) => {
  console.error('[github] Fatal error:', err);
  process.exit(1);
});
