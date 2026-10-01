// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src/data/github-contributions.json');
const EXPECTED_USER = 'risan';

function resolveToken() {
  const fromEnv = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();

  if (fromEnv) {
    return fromEnv;
  }

  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

async function graphql(token, query) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'risanb.com-updater',
    },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`GitHub API responded with HTTP ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();

  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(payload.errors)}`);
  }

  return payload.data;
}

function writeSnapshot(snapshot) {
  const tempFile = `${OUTPUT_FILE}.tmp`;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(tempFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  fs.renameSync(tempFile, OUTPUT_FILE);
}

async function main() {
  const token = resolveToken();

  if (!token) {
    if (process.env.CI || !fs.existsSync(OUTPUT_FILE)) {
      throw new Error('No GitHub token (GITHUB_TOKEN, GH_TOKEN or gh auth) and no usable cached snapshot.');
    }

    console.log('[github] No GitHub token found. Keeping the cached snapshot.');
    return;
  }

  // The trailing-year calendar is the single source for every stat the page shows
  // (this month, this year, streak, peak). Only the all-time total needs extra queries.
  const overview = await graphql(
    token,
    `query {
      viewer {
        login
        contributionsCollection {
          contributionYears
          contributionCalendar {
            totalContributions
            weeks {
              firstDay
              contributionDays { date contributionCount contributionLevel weekday }
            }
          }
        }
      }
    }`,
  );

  const { login, contributionsCollection } = overview.viewer;
  const { contributionYears, contributionCalendar } = contributionsCollection;

  if (login.toLowerCase() !== EXPECTED_USER) {
    throw new Error(`Token belongs to "${login}", expected "${EXPECTED_USER}". Refusing to overwrite the snapshot.`);
  }

  if (!contributionCalendar.weeks.length || contributionCalendar.totalContributions === 0) {
    throw new Error('Received an empty calendar. Refusing to overwrite the snapshot.');
  }

  const yearFields = contributionYears
    .map(
      (year) =>
        `y${year}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") { contributionCalendar { totalContributions } }`,
    )
    .join('\n');
  const { viewer: yearTotals } = await graphql(token, `query { viewer { ${yearFields} } }`);

  const allTimeContributions = contributionYears.reduce(
    (sum, year) => sum + yearTotals[`y${year}`].contributionCalendar.totalContributions,
    0,
  );

  writeSnapshot({
    username: login,
    updatedAt: new Date().toISOString(),
    stats: { allTime: { contributions: allTimeContributions } },
    calendar: {
      totalContributions: contributionCalendar.totalContributions,
      weeks: contributionCalendar.weeks,
    },
  });

  console.log(`[github] Wrote ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log(`[github] Trailing year: ${contributionCalendar.totalContributions}, all time: ${allTimeContributions}`);
}

main().catch((error) => {
  console.error('[github] Fatal error:', error);
  process.exit(1);
});
