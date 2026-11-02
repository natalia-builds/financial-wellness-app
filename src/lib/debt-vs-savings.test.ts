import { describe, expect, it } from 'vitest';
import { comparePlans, paymentCoversInterest, simulatePlan, SURPRISE_MONTH } from './debt-vs-savings';
import type { Situation } from './debt-vs-savings';

const base: Situation = {
  debt: 1000,
  debtRatePercent: 12,
  minimumPayment: 100,
  savings: 0,
  savingsRatePercent: 0,
  extraPerMonth: 0,
  surpriseExpense: 0,
};

describe('simulatePlan', () => {
  it('matches a hand-calculated payoff: $1,000 at 12%, paying $100 a month', () => {
    const result = simulatePlan(base, 0, 24);
    expect(result.debtFreeMonth).toBe(11);
    expect(result.interestPaid).toBeCloseTo(58.99, 1);
    expect(result.debtLeft).toBe(0);
  });

  it('takes exact steps when there is no interest', () => {
    const result = simulatePlan({ ...base, debtRatePercent: 0 }, 0, 10);
    expect(result.debtFreeMonth).toBe(10);
    expect(result.interestPaid).toBe(0);
  });

  it('earns a month of interest on savings', () => {
    const result = simulatePlan({ ...base, debt: 100, debtRatePercent: 0, savings: 1000, savingsRatePercent: 12 }, 0, 1);
    expect(result.interestEarned).toBeCloseTo(10, 5);
    expect(result.savings).toBeCloseTo(1010, 5);
  });

  it('splits the extra money by the share given', () => {
    const situation = { ...base, debtRatePercent: 0, extraPerMonth: 100 };
    const result = simulatePlan(situation, 0.5, 2);
    expect(result.savings).toBeCloseTo(100, 5);
    expect(result.debtLeft).toBeCloseTo(700, 5);
  });

  it('moves the whole payment to savings once the debt is gone', () => {
    const result = simulatePlan({ ...base, debt: 100, debtRatePercent: 0 }, 0, 3);
    expect(result.debtFreeMonth).toBe(1);
    expect(result.savings).toBeCloseTo(200, 5);
  });

  it('pays a surprise from savings first', () => {
    const result = simulatePlan({ ...base, debtRatePercent: 0, savings: 500, surpriseExpense: 300 }, 0, SURPRISE_MONTH);
    expect(result.surpriseAddedToDebt).toBe(0);
    expect(result.savings).toBeCloseTo(200, 5);
  });

  it('adds what savings cannot cover to the debt', () => {
    const result = simulatePlan({ ...base, debtRatePercent: 0, savings: 100, surpriseExpense: 300 }, 0, SURPRISE_MONTH);
    expect(result.surpriseAddedToDebt).toBeCloseTo(200, 5);
    expect(result.savings).toBe(0);
    expect(result.debtLeft).toBeCloseTo(600, 5);
  });

  it('never loses money when no interest applies', () => {
    const situation = { ...base, debtRatePercent: 0, savings: 250, extraPerMonth: 75, surpriseExpense: 400 };
    const months = 12;
    const result = simulatePlan(situation, 0.5, months);
    const budget = situation.minimumPayment + situation.extraPerMonth;
    const expected = situation.savings - situation.debt - situation.surpriseExpense + budget * months;
    expect(result.savings - result.debtLeft).toBeCloseTo(expected, 5);
  });

  it('reports no payoff when the payment does not cover the interest', () => {
    const result = simulatePlan({ ...base, minimumPayment: 5 }, 0, 600);
    expect(result.debtFreeMonth).toBeNull();
    expect(result.debtLeft).toBeGreaterThan(1000);
  });

  it('resets the debt-free month if a surprise brings debt back', () => {
    // Paid off in month 1, then $400 saved by month 5. Month 6's $1,000 surprise
    // takes that $400 and adds $600 to the debt, which clears by month 11.
    const result = simulatePlan({ ...base, debt: 100, debtRatePercent: 0, surpriseExpense: 1000 }, 0, 24);
    expect(result.surpriseAddedToDebt).toBeCloseTo(600, 5);
    expect(result.debtFreeMonth).toBe(11);
  });
});

describe('comparePlans', () => {
  const situation: Situation = {
    debt: 5000,
    debtRatePercent: 22.36,
    minimumPayment: 150,
    savings: 0,
    savingsRatePercent: 0.38,
    extraPerMonth: 100,
    surpriseExpense: 0,
  };

  it('measures every plan over the same months', () => {
    const { months, plans } = comparePlans(situation);
    const slowest = Math.max(...plans.map(({ result }) => result.debtFreeMonth ?? 0));
    expect(months).toBe(slowest);
  });

  it('charges less interest the more goes toward debt', () => {
    const { plans } = comparePlans(situation);
    const [debt, split, savings] = plans.map(({ result }) => result.interestPaid);
    expect(debt).toBeLessThan(split);
    expect(split).toBeLessThan(savings);
  });

  it('adds less of a surprise to the debt the more goes toward savings', () => {
    const { plans } = comparePlans({ ...situation, surpriseExpense: 1000 });
    const [debt, split, savings] = plans.map(({ result }) => result.surpriseAddedToDebt);
    expect(debt).toBeCloseTo(1000, 5);
    expect(split).toBeLessThan(debt);
    expect(savings).toBeLessThan(split);
  });

  it('marks a plan that never pays off, and still compares the others', () => {
    const { plans } = comparePlans({ ...situation, minimumPayment: 50, extraPerMonth: 150 });
    expect(plans[0].result.debtFreeMonth).not.toBeNull();
    expect(plans[2].result.debtFreeMonth).toBeNull();
  });
});

describe('paymentCoversInterest', () => {
  it('compares the payment with one month of interest', () => {
    expect(paymentCoversInterest(1000, 12, 11)).toBe(true);
    expect(paymentCoversInterest(1000, 12, 10)).toBe(false);
    expect(paymentCoversInterest(1000, 12, 5)).toBe(false);
  });
});
