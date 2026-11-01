import { describe, expect, it } from 'vitest';
import { AUTO_RATES } from '../data/auto-rates';
import { monthlyPayment, parseUserNumber, totalInterest } from './loan';

describe('parseUserNumber', () => {
  it('reads plain numbers', () => {
    expect(parseUserNumber('25000')).toBe(25000);
    expect(parseUserNumber('7.5')).toBe(7.5);
    expect(parseUserNumber('0')).toBe(0);
  });

  it('accepts the symbols people naturally type', () => {
    expect(parseUserNumber('$25,000')).toBe(25000);
    expect(parseUserNumber(' 7.5% ')).toBe(7.5);
  });

  it('returns NaN for anything that is not a number', () => {
    expect(parseUserNumber('')).toBeNaN();
    expect(parseUserNumber('   ')).toBeNaN();
    expect(parseUserNumber('abc')).toBeNaN();
    expect(parseUserNumber('12abc')).toBeNaN();
  });
});

describe('monthlyPayment', () => {
  it('matches a known loan: $25,000 at 6% for 60 months', () => {
    expect(monthlyPayment(25000, 6, 60)).toBeCloseTo(483.32, 2);
  });

  it('matches a known loan: $200,000 at 6% for 360 months', () => {
    expect(monthlyPayment(200000, 6, 360)).toBeCloseTo(1199.1, 2);
  });

  it('splits the loan evenly when the rate is 0%', () => {
    expect(monthlyPayment(1200, 0, 12)).toBe(100);
  });

  it('rejects amounts, rates, and lengths that make no sense', () => {
    expect(() => monthlyPayment(0, 6, 60)).toThrow(RangeError);
    expect(() => monthlyPayment(-100, 6, 60)).toThrow(RangeError);
    expect(() => monthlyPayment(Number.NaN, 6, 60)).toThrow(RangeError);
    expect(() => monthlyPayment(1000, -1, 60)).toThrow(RangeError);
    expect(() => monthlyPayment(1000, 6, 0)).toThrow(RangeError);
    expect(() => monthlyPayment(1000, 6, 1.5)).toThrow(RangeError);
  });
});

describe('totalInterest', () => {
  it('matches a known loan: $25,000 at 6% for 60 months', () => {
    expect(totalInterest(25000, 6, 60)).toBeCloseTo(3999.2, 0);
  });

  it('is zero when the rate is 0%', () => {
    expect(totalInterest(1200, 0, 12)).toBe(0);
  });

  it('costs more at a higher rate', () => {
    expect(totalInterest(25000, 12, 60)).toBeGreaterThan(totalInterest(25000, 6, 60));
  });
});

describe('AUTO_RATES', () => {
  it('has rates that rise as credit scores fall', () => {
    for (let i = 1; i < AUTO_RATES.length; i += 1) {
      expect(AUTO_RATES[i].new).toBeGreaterThan(AUTO_RATES[i - 1].new);
      expect(AUTO_RATES[i].used).toBeGreaterThan(AUTO_RATES[i - 1].used);
    }
  });
});
