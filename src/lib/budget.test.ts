import { describe, expect, it } from 'vitest';
import { text } from '../text/en';
import {
  calculateBudget,
  COST_LINES,
  DEFAULT_FREQUENCY,
  FREQUENCIES,
  INCOME_LINES,
  readAmount,
  shouldShowHelp,
  toMonthly,
} from './budget';
import type { BudgetLine, Frequency } from './budget';

const line = (id: string, kind: 'in' | 'out', amount: number, frequency: Frequency = 'month'): BudgetLine => ({
  id,
  kind,
  amount,
  frequency,
});

describe('wording', () => {
  const t = text.budgetTool;

  it('has a name for every line and every how-often choice', () => {
    for (const id of [...INCOME_LINES, ...COST_LINES]) expect(t.lines[id].name, id).toBeTruthy();
    for (const frequency of FREQUENCIES) expect(t.frequencies[frequency], frequency).toBeTruthy();
  });

  it('has no target percentages or rules of thumb', () => {
    const everything = JSON.stringify(t);
    expect(everything).not.toMatch(/50\/30\/20|50-30-20|rule of thumb|should spend|recommended/i);
  });
});

describe('toMonthly', () => {
  // Each expected value is worked out by hand from the Issue's table.
  it('converts every week: × 52 ÷ 12', () => {
    expect(toMonthly(12, 'week')).toBeCloseTo(52, 10); // 12 × 52 ÷ 12 = 52
    expect(toMonthly(100, 'week')).toBeCloseTo(433.3333333, 6); // 5200 ÷ 12
  });

  it('converts every two weeks: × 26 ÷ 12', () => {
    expect(toMonthly(12, 'two-weeks')).toBeCloseTo(26, 10); // 12 × 26 ÷ 12 = 26
    expect(toMonthly(1000, 'two-weeks')).toBeCloseTo(2166.6666667, 6); // 26000 ÷ 12
  });

  it('converts twice a month: × 2', () => {
    expect(toMonthly(750, 'twice-a-month')).toBe(1500);
  });

  it('keeps every month as it is: × 1', () => {
    expect(toMonthly(1234.56, 'month')).toBe(1234.56);
  });

  it('converts once a year: ÷ 12', () => {
    expect(toMonthly(1200, 'year')).toBe(100);
    expect(toMonthly(600, 'year')).toBe(50);
  });

  it('has a conversion for every choice, with every month as the default', () => {
    expect(DEFAULT_FREQUENCY).toBe('month');
    for (const frequency of FREQUENCIES) {
      expect(Number.isFinite(toMonthly(100, frequency))).toBe(true);
    }
  });

  it('turns 0 into 0 for every choice', () => {
    for (const frequency of FREQUENCIES) {
      expect(toMonthly(0, frequency)).toBe(0);
    }
  });

  it('refuses amounts that are not zero or more', () => {
    expect(() => toMonthly(-1, 'month')).toThrow(RangeError);
    expect(() => toMonthly(Number.NaN, 'month')).toThrow(RangeError);
    expect(() => toMonthly(Number.POSITIVE_INFINITY, 'month')).toThrow(RangeError);
    expect(() => toMonthly(10, 'daily' as Frequency)).toThrow(RangeError);
  });
});

describe('readAmount', () => {
  it('counts an empty field as 0, however much blank space is in it', () => {
    expect(readAmount('')).toEqual({ status: 'empty', value: 0 });
    expect(readAmount('   ')).toEqual({ status: 'empty', value: 0 });
  });

  it('reads amounts the way people type them', () => {
    expect(readAmount('1400')).toEqual({ status: 'valid', value: 1400 });
    expect(readAmount('$1,400.50')).toEqual({ status: 'valid', value: 1400.5 });
    expect(readAmount(' 12 ')).toEqual({ status: 'valid', value: 12 });
    expect(readAmount('.5')).toEqual({ status: 'valid', value: 0.5 });
    expect(readAmount('0')).toEqual({ status: 'valid', value: 0 });
  });

  it('marks letters, negatives, and other non-amounts invalid', () => {
    for (const input of ['abc', '12abc', '-5', '-0', '1e3', '0x10', '5%', '1.2.3', '$', '.', 'Infinity', 'NaN', '1 2 x']) {
      expect(readAmount(input), input).toEqual({ status: 'invalid', value: null });
    }
  });

  it('marks a number too big to use invalid, never Infinity', () => {
    expect(readAmount('9'.repeat(400))).toEqual({ status: 'invalid', value: null });
  });
});

describe('calculateBudget', () => {
  // Worked out by hand, separately from the code:
  //   In:  pay $500 every week            = 500 × 52 ÷ 12 = 2166.666…
  //        other $1,000 twice a month      = 2000
  //        total in                         = 4166.666…
  //   Out: housing $1,400 every month      = 1400
  //        utilities $90 every two weeks   = 90 × 26 ÷ 12 = 195
  //        food $60 every week             = 60 × 52 ÷ 12 = 260
  //        own cost $600 once a year       = 50
  //        total out                        = 1905
  //   Left = 4166.666… − 1905 = 2261.666…
  const lines: BudgetLine[] = [
    line('pay', 'in', 500, 'week'),
    line('other', 'in', 1000, 'twice-a-month'),
    line('housing', 'out', 1400),
    line('utilities', 'out', 90, 'two-weeks'),
    line('food', 'out', 60, 'week'),
    line('own-1', 'out', 600, 'year'),
  ];

  it('matches a separate hand calculation', () => {
    const result = calculateBudget(lines);
    expect(result.moneyIn).toBeCloseTo(4166.6666667, 6);
    expect(result.moneyOut).toBeCloseTo(1905, 10);
    expect(result.left).toBeCloseTo(2261.6666667, 6);
    expect(result.shortfall).toBe(0);
    expect(result.status).toBe('surplus');
  });

  it('works out each line and its share of income', () => {
    const { rows } = calculateBudget(lines);
    expect(rows.map((row) => row.id)).toEqual(['pay', 'other', 'housing', 'utilities', 'food', 'own-1']);
    const housing = rows.find((row) => row.id === 'housing')!;
    expect(housing.monthly).toBe(1400);
    expect(housing.share).toBeCloseTo(1400 / 4166.6666667, 8); // 0.336
    expect(rows.find((row) => row.id === 'pay')!.share).toBeCloseTo(2166.6666667 / 4166.6666667, 8); // 0.52
    expect(calculateBudget(lines).outShare).toBeCloseTo(1905 / 4166.6666667, 8); // 0.4572
  });

  it('adds up unrounded amounts, so rounding can never throw the total off', () => {
    // Three lines of $100 a week are 433.33… each. Rounded to cents they would
    // add to 1299.99, but the true total is exactly 1300.
    const result = calculateBudget([
      line('a', 'in', 5000),
      line('b', 'out', 100, 'week'),
      line('c', 'out', 100, 'week'),
      line('d', 'out', 100, 'week'),
    ]);
    expect(result.moneyOut).toBeCloseTo(1300, 10);
    expect(result.left).toBeCloseTo(3700, 10);
  });

  it('leaves out lines with nothing in them', () => {
    const result = calculateBudget([line('pay', 'in', 2000), line('housing', 'out', 0), line('food', 'out', 300)]);
    expect(result.rows.map((row) => row.id)).toEqual(['pay', 'food']);
  });

  it('describes a shortfall, with the amount going out beyond what comes in', () => {
    // In 1000. Out 1100 + 20 = 1120. About $120 more is going out.
    const result = calculateBudget([line('pay', 'in', 1000), line('housing', 'out', 1100), line('food', 'out', 20)]);
    expect(result.status).toBe('shortfall');
    expect(result.left).toBeCloseTo(-120, 10);
    expect(result.shortfall).toBeCloseTo(120, 10);
    expect(result.outShare).toBeCloseTo(1.12, 10); // Shares above 100% are allowed
  });

  it('calls the month even when income and costs match', () => {
    const result = calculateBudget([line('pay', 'in', 1000), line('housing', 'out', 1000)]);
    expect(result.status).toBe('even');
    expect(result.shortfall).toBe(0);
  });

  it('treats floating-point dust as even, not as a shortfall', () => {
    // 0.1 + 0.2 is 0.30000000000000004 in floating point, so subtracting 0.3 leaves dust.
    const result = calculateBudget([line('a', 'in', 0.1), line('b', 'in', 0.2), line('c', 'out', 0.3)]);
    expect(result.status).toBe('even');
  });

  it('shows amounts without shares, and never divides by zero, when there is no income', () => {
    const result = calculateBudget([line('housing', 'out', 900), line('food', 'out', 200)]);
    expect(result.status).toBe('no-income');
    expect(result.moneyIn).toBe(0);
    expect(result.moneyOut).toBe(1100);
    expect(result.outShare).toBeNull();
    expect(result.rows.every((row) => row.share === null)).toBe(true);
    for (const value of [result.left, result.moneyOut, result.shortfall]) expect(Number.isFinite(value)).toBe(true);
  });

  it('treats an income of 0 the same as no income', () => {
    const result = calculateBudget([line('pay', 'in', 0), line('housing', 'out', 500)]);
    expect(result.status).toBe('no-income');
    expect(result.rows.map((row) => row.share)).toEqual([null]);
  });

  it('has nothing to show for an empty budget', () => {
    expect(calculateBudget([]).status).toBe('nothing');
    const zeros = calculateBudget([line('pay', 'in', 0), line('housing', 'out', 0)]);
    expect(zeros.status).toBe('nothing');
    expect(zeros.rows).toEqual([]);
    expect(zeros.left).toBe(0);
    expect(zeros.outShare).toBeNull();
  });

  it('shows all the money as left over when nothing is going out', () => {
    const result = calculateBudget([line('pay', 'in', 1500, 'two-weeks')]);
    expect(result.status).toBe('surplus');
    expect(result.moneyOut).toBe(0);
    expect(result.left).toBeCloseTo(3250, 10); // 1500 × 26 ÷ 12
    expect(result.outShare).toBe(0);
  });

  it('never produces NaN, whatever mix of lines it is given', () => {
    const results = [
      calculateBudget([]),
      calculateBudget([line('a', 'in', 0)]),
      calculateBudget([line('a', 'out', 5, 'year')]),
      calculateBudget([line('a', 'in', 1e9, 'week'), line('b', 'out', 1e9, 'week')]),
    ];
    for (const result of results) {
      for (const value of [result.moneyIn, result.moneyOut, result.left, result.shortfall]) {
        expect(Number.isNaN(value)).toBe(false);
      }
    }
  });
});

describe('shouldShowHelp', () => {
  it('shows the 2-1-1 line for a shortfall and for costs with no income', () => {
    expect(shouldShowHelp('shortfall')).toBe(true);
    expect(shouldShowHelp('no-income')).toBe(true);
  });

  it('stays hidden when nothing is typed, or when the month is even or has money left', () => {
    expect(shouldShowHelp('nothing')).toBe(false);
    expect(shouldShowHelp('even')).toBe(false);
    expect(shouldShowHelp('surplus')).toBe(false);
  });

  it('follows real budgets: costs and no income show it, an empty or covered budget does not', () => {
    const show = (lines: BudgetLine[]) => shouldShowHelp(calculateBudget(lines).status);
    expect(show([line('housing', 'out', 900)])).toBe(true);
    expect(show([line('pay', 'in', 0), line('housing', 'out', 900)])).toBe(true);
    expect(show([line('pay', 'in', 1000), line('housing', 'out', 1200)])).toBe(true);
    expect(show([])).toBe(false);
    expect(show([line('pay', 'in', 0), line('housing', 'out', 0)])).toBe(false);
    expect(show([line('pay', 'in', 2000), line('housing', 'out', 900)])).toBe(false);
    expect(show([line('pay', 'in', 1500)])).toBe(false);
  });
});
