import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COUNT_ENDPOINT } from '../src/lib/analytics';
import { TOOLS } from '../src/lib/tools';
import { apiBaseFrom, hourRange, summarize, tokenFrom, toolsFrom } from './goatcounter-snapshot.mjs';

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const tools = [
  { key: 'credit', url: '/credit-score-and-interest/' },
  { key: 'debt', url: '/debt-or-emergency-fund/' },
];

describe('reading the site code', () => {
  it('finds the same API address as src/lib/analytics.ts', () => {
    expect(apiBaseFrom(source('src/lib/analytics.ts'))).toBe(COUNT_ENDPOINT.replace(/\/count$/, '/api/v0'));
  });

  it('finds every tool in src/lib/tools.ts, with its page', () => {
    expect(toolsFrom(source('src/lib/tools.ts'))).toEqual(TOOLS.map(({ key, url }) => ({ key, url })));
  });
});

describe('tokenFrom', () => {
  it('reads the key from .env, with or without quotes', () => {
    expect(tokenFrom('OTHER=1\nGOATCOUNTER_API_TOKEN=abc123\n')).toBe('abc123');
    expect(tokenFrom('GOATCOUNTER_API_TOKEN="abc123"')).toBe('abc123');
  });

  it('prefers the environment, and explains what to do when the key is missing', () => {
    expect(tokenFrom('', { GOATCOUNTER_API_TOKEN: 'fromenv' })).toBe('fromenv');
    expect(() => tokenFrom('GOATCOUNTER_API_TOKEN=')).toThrow(/Add GOATCOUNTER_API_TOKEN/);
  });
});

describe('hourRange', () => {
  it('starts at midnight UTC and ends at the start of the next hour', () => {
    expect(hourRange('2026-11-08', new Date('2026-11-09T14:25:10Z'))).toEqual({
      start: '2026-11-08T00:00:00Z',
      end: '2026-11-09T15:00:00Z',
    });
  });
});

describe('summarize', () => {
  const hits = [
    { path: '/debt-or-emergency-fund/', event: false, count: 10, stats: [{ day: '2026-11-08', daily: 4 }, { day: '2026-11-09', daily: 6 }] },
    { path: '/', event: false, count: 7, stats: [{ day: '2026-11-08', daily: 7 }] },
    { path: 'helpful/debt/yes', event: true, count: 3 },
    { path: 'helpful/debt/no', event: true, count: 1 },
    { path: 'goal/debt/not-yet', event: true, count: 2 },
    { path: 'used/debt', event: true, count: 5 },
    { path: 'something-else', event: true, count: 1 },
  ];
  const result = summarize(hits, tools);

  it('lists page visits, most visited first', () => {
    expect(result.pages).toEqual([
      { page: '/debt-or-emergency-fund/', visitors: 10 },
      { page: '/', visitors: 7 },
    ]);
  });

  it('lists every tool and answer, with 0 where nobody has answered', () => {
    expect(result.answers).toHaveLength(8);
    expect(result.answers).toContainEqual({ tool: 'debt', question: 'helpful', answer: 'yes', visitors: 3 });
    expect(result.answers).toContainEqual({ tool: 'debt', question: 'goal', answer: 'yes', visitors: 0 });
    expect(result.answers).toContainEqual({ tool: 'credit', question: 'helpful', answer: 'no', visitors: 0 });
  });

  it('puts calculator use next to the visits to the same page', () => {
    expect(result.usage).toEqual([
      { tool: 'credit', page: '/credit-score-and-interest/', pageVisitors: 0, usedVisitors: 0 },
      { tool: 'debt', page: '/debt-or-emergency-fund/', pageVisitors: 10, usedVisitors: 5 },
    ]);
  });

  it('adds up page visits by day, leaving out answers', () => {
    expect(result.daily).toEqual([
      { day: '2026-11-08', visitors: 11 },
      { day: '2026-11-09', visitors: 6 },
    ]);
  });

  it('keeps events it does not recognize, so nothing goes missing quietly', () => {
    expect(result.otherEvents).toEqual([{ event: 'something-else', visitors: 1 }]);
  });
});
