// Takes a snapshot of the site's anonymous GoatCounter totals for the
// dashboard (see docs/operations.md, "Counting visits").
//
//   node scripts/goatcounter-snapshot.mjs > snapshot.json
//   node scripts/goatcounter-snapshot.mjs --start 2026-12-01 > snapshot.json
//
// It reads a read-only API key from GOATCOUNTER_API_TOKEN in .env, which Git
// ignores, and never prints it. The snapshot holds totals only.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('..', import.meta.url);

// Counting started when #44 went live.
export const DEFAULT_START = '2026-11-08';

// The count address from src/lib/analytics.ts, turned into the API's base address.
export function apiBaseFrom(analyticsSource) {
  const match = analyticsSource.match(/COUNT_ENDPOINT\s*=\s*'(https:\/\/[^']+)\/count'/);
  if (!match) throw new Error('Could not find COUNT_ENDPOINT in src/lib/analytics.ts');
  return `${match[1]}/api/v0`;
}

// Each tool's key and page from src/lib/tools.ts, so new tools are picked up.
export function toolsFrom(toolsSource) {
  const tools = [...toolsSource.matchAll(/\{\s*key:\s*'([^']+)',\s*url:\s*'([^']+)'/g)].map(([, key, url]) => ({
    key,
    url,
  }));
  if (tools.length === 0) throw new Error('Could not find any tools in src/lib/tools.ts');
  return tools;
}

export function tokenFrom(envSource, env = {}) {
  if (env.GOATCOUNTER_API_TOKEN) return env.GOATCOUNTER_API_TOKEN;
  const line = envSource.split(/\r?\n/).find((l) => l.startsWith('GOATCOUNTER_API_TOKEN='));
  const token = line?.slice('GOATCOUNTER_API_TOKEN='.length).trim().replace(/^["']|["']$/g, '');
  if (!token) throw new Error('Add GOATCOUNTER_API_TOKEN to .env first (see docs/operations.md).');
  return token;
}

// GoatCounter wants times rounded to the hour. The end is the start of the next
// hour, so the current hour is included.
export function hourRange(startDay, now = new Date()) {
  const end = new Date(now);
  end.setUTCMinutes(0, 0, 0);
  end.setUTCHours(end.getUTCHours() + 1);
  return { start: `${startDay}T00:00:00Z`, end: end.toISOString().replace('.000Z', 'Z') };
}

// Sorts GoatCounter's per-path rows into the dashboard's four tables. GoatCounter
// counts visitors, not clicks: someone who answers twice counts once per answer.
export function summarize(hits, tools) {
  const pageRows = hits.filter((h) => !h.event);
  const eventRows = hits.filter((h) => h.event);
  // GoatCounter drops the trailing slash ("/tools"), while the site's links keep it ("/tools/").
  const samePage = (a, b) => a.replace(/(.)\/$/, '$1') === b.replace(/(.)\/$/, '$1');
  const visitorsOn = (path) => pageRows.find((h) => samePage(h.path, path))?.count ?? 0;
  const eventCount = (path) => eventRows.find((h) => h.path === path)?.count ?? 0;

  const pages = pageRows
    .map((h) => ({ page: h.path, visitors: h.count }))
    .sort((a, b) => b.visitors - a.visitors || a.page.localeCompare(b.page));

  // Every tool and answer appears, with 0 where nobody has answered yet.
  const questions = { helpful: ['yes', 'no'], goal: ['yes', 'not-yet'] };
  const answers = tools.flatMap(({ key }) =>
    Object.entries(questions).flatMap(([question, options]) =>
      options.map((answer) => ({ tool: key, question, answer, visitors: eventCount(`${question}/${key}/${answer}`) })),
    ),
  );

  const usage = tools.map(({ key, url }) => ({
    tool: key,
    page: url,
    pageVisitors: visitorsOn(url),
    usedVisitors: eventCount(`used/${key}`),
  }));

  const byDay = new Map();
  for (const row of pageRows) {
    for (const stat of row.stats ?? []) {
      byDay.set(stat.day, (byDay.get(stat.day) ?? 0) + (stat.daily ?? 0));
    }
  }
  const daily = [...byDay].map(([day, visitors]) => ({ day, visitors })).sort((a, b) => a.day.localeCompare(b.day));

  const known = new Set(answers.map((a) => `${a.question}/${a.tool}/${a.answer}`).concat(tools.map((t) => `used/${t.key}`)));
  const otherEvents = eventRows.filter((h) => !known.has(h.path)).map((h) => ({ event: h.path, visitors: h.count }));

  return { pages, answers, usage, daily, otherEvents };
}

async function fetchAllHits(base, token, range) {
  const hits = [];
  for (let page = 0; page < 20; page++) {
    const params = new URLSearchParams({ start: range.start, end: range.end, limit: '100', group: 'day' });
    if (hits.length) params.set('exclude_paths', hits.map((h) => h.path_id).join(','));
    const url = `${base}/stats/hits?${params}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401) throw new Error('GoatCounter refused the API key. Check GOATCOUNTER_API_TOKEN in .env.');
    if (response.status === 403) throw new Error('The API key needs the "Read statistics" permission.');
    // The address holds no key, so it's safe to show.
    if (!response.ok) throw new Error(`GoatCounter answered ${response.status} for ${url}`);
    const body = await response.json();
    hits.push(...(body.hits ?? []));
    if (!body.more) return hits;
  }
  throw new Error('Stopped after 20 pages of results.');
}

async function main() {
  const read = (path) => readFileSync(new URL(path, ROOT), 'utf8');
  const startArg = process.argv.indexOf('--start');
  const startDay = startArg > -1 ? process.argv[startArg + 1] : DEFAULT_START;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDay ?? '')) throw new Error('Use --start YYYY-MM-DD.');

  let envSource = '';
  try {
    envSource = read('.env');
  } catch {
    // No .env file: the key may still be in the environment.
  }

  const base = apiBaseFrom(read('src/lib/analytics.ts'));
  const tools = toolsFrom(read('src/lib/tools.ts'));
  const range = hourRange(startDay);
  const hits = await fetchAllHits(base, tokenFrom(envSource, process.env), range);

  const snapshot = { takenAt: new Date().toISOString(), from: range.start, to: range.end, ...summarize(hits, tools) };
  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
