// Budget math: turns amounts paid at any pace into monthly amounts, adds them
// up, and works out what is left or short. It only describes the person's own
// numbers. It has no targets, rules of thumb, or advice built in.

import { parseUserNumber } from './loan';

// "How often" choices, in the order they appear in the select.
export const FREQUENCIES = ['week', 'two-weeks', 'twice-a-month', 'month', 'year'] as const;

export type Frequency = (typeof FREQUENCIES)[number];

export const DEFAULT_FREQUENCY: Frequency = 'month';

// Converts an amount paid at the given pace into a monthly amount. A year has
// 52 weeks, 26 two-week periods, and 12 months, so:
//   every week × 52 ÷ 12, every two weeks × 26 ÷ 12, twice a month × 2,
//   every month × 1, once a year ÷ 12.
export function toMonthly(amount: number, frequency: Frequency): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new RangeError('Amount must be zero or more.');
  }
  switch (frequency) {
    case 'week':
      return (amount * 52) / 12;
    case 'two-weeks':
      return (amount * 26) / 12;
    case 'twice-a-month':
      return amount * 2;
    case 'month':
      return amount;
    case 'year':
      return amount / 12;
    default:
      throw new RangeError('Unknown how-often choice.');
  }
}

// The fixed lines people fill in, in the order they appear on the page. Their
// wording is in src/text/en.ts, found by these ids.
export const INCOME_LINES = ['pay', 'other-income'] as const;

export const COST_LINES = [
  'housing',
  'utilities',
  'food',
  'transportation',
  'debt',
  'childcare',
  'health',
  'phone',
  'savings',
  'everything-else',
] as const;

// People can add up to this many costs of their own, and name them.
export const MAX_OWN_COSTS = 3;

export type AmountReading =
  | { status: 'empty'; value: 0 } // Nothing typed. Counts as 0.
  | { status: 'valid'; value: number }
  | { status: 'invalid'; value: null }; // Letters, a negative number, or anything else that isn't an amount.

// What people may type: digits with an optional decimal point, and "$", commas
// and spaces. Anything else (letters, a minus sign, "%", "1e3") is invalid.
const PLAIN_AMOUNT = /^(\d+\.?\d*|\.\d+)$/;

// Reads a typed amount. An empty field counts as 0; an invalid one is reported
// so the page can mark it and leave that line out of the totals.
export function readAmount(input: string): AmountReading {
  if (input.trim() === '') return { status: 'empty', value: 0 };
  const value = parseUserNumber(input);
  const looksLikeAnAmount = PLAIN_AMOUNT.test(input.replace(/[$,\s]/g, ''));
  if (!looksLikeAnAmount || !Number.isFinite(value)) return { status: 'invalid', value: null };
  return { status: 'valid', value };
}

export interface BudgetLine {
  id: string;
  kind: 'in' | 'out';
  amount: number;
  frequency: Frequency;
}

export interface BudgetRow {
  id: string;
  kind: 'in' | 'out';
  monthly: number;
  // Share of monthly income, from 0 to beyond 1. null when there is no income to divide by.
  share: number | null;
}

// How the month looks, using whole cents so tiny floating-point leftovers
// (like 0.1 + 0.2 - 0.3) can't turn "even" into a surplus or a shortfall.
export type BudgetStatus = 'nothing' | 'no-income' | 'shortfall' | 'even' | 'surplus';

export interface BudgetResult {
  moneyIn: number;
  moneyOut: number;
  left: number; // Money in minus money out. Negative when more is going out.
  shortfall: number; // How much more is going out than coming in. 0 when it isn't.
  // Money out as a share of income, or null with no income.
  outShare: number | null;
  status: BudgetStatus;
  rows: BudgetRow[]; // Only lines with something in them, in the order given.
}

// Totals come from the unrounded monthly amounts, so the total is never off
// because of rounding.
export function calculateBudget(lines: BudgetLine[]): BudgetResult {
  const withMonthly = lines.map((line) => ({ line, monthly: toMonthly(line.amount, line.frequency) }));

  const sum = (kind: BudgetLine['kind']) =>
    withMonthly.filter(({ line }) => line.kind === kind).reduce((total, { monthly }) => total + monthly, 0);

  const moneyIn = sum('in');
  const moneyOut = sum('out');
  const left = moneyIn - moneyOut;
  const shortfall = left < 0 ? -left : 0;

  const rows: BudgetRow[] = withMonthly
    .filter(({ monthly }) => monthly > 0)
    .map(({ line, monthly }) => ({
      id: line.id,
      kind: line.kind,
      monthly,
      share: moneyIn > 0 ? monthly / moneyIn : null,
    }));

  const leftCents = Math.round(left * 100);
  let status: BudgetStatus;
  if (rows.length === 0) status = 'nothing';
  else if (moneyIn === 0) status = 'no-income';
  else if (leftCents < 0) status = 'shortfall';
  else if (leftCents === 0) status = 'even';
  else status = 'surplus';

  return {
    moneyIn,
    moneyOut,
    left,
    shortfall,
    outShare: moneyIn > 0 ? moneyOut / moneyIn : null,
    status,
    rows,
  };
}
