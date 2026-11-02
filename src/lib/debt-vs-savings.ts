// Compares ways of dividing extra monthly money between debt and savings.

export const MAX_MONTHS = 600;
export const SURPRISE_MONTH = 6;

export interface Situation {
  debt: number;
  debtRatePercent: number;
  minimumPayment: number;
  savings: number;
  savingsRatePercent: number;
  extraPerMonth: number;
  surpriseExpense: number;
}

export interface PlanResult {
  debtFreeMonth: number | null; // null if the debt isn't paid off within the months checked
  interestPaid: number;
  interestEarned: number;
  debtLeft: number;
  savings: number;
  surpriseAddedToDebt: number;
}

export interface Plan {
  id: 'debt' | 'split' | 'savings';
  shareToSavings: number;
}

export const PLANS: Plan[] = [
  { id: 'debt', shareToSavings: 0 },
  { id: 'split', shareToSavings: 0.5 },
  { id: 'savings', shareToSavings: 1 },
];

// Each month, in order: interest is charged, any surprise expense arrives, the
// payment is made, and savings grow. Once the debt is gone, its whole payment
// moves to savings.
export function simulatePlan(situation: Situation, shareToSavings: number, months: number): PlanResult {
  const monthlyDebtRate = situation.debtRatePercent / 100 / 12;
  const monthlySavingsRate = situation.savingsRatePercent / 100 / 12;
  const budget = situation.minimumPayment + situation.extraPerMonth;
  const toSavings = situation.extraPerMonth * shareToSavings;

  let debt = situation.debt;
  let savings = situation.savings;
  let debtFreeMonth: number | null = null;
  let interestPaid = 0;
  let interestEarned = 0;
  let surpriseAddedToDebt = 0;

  for (let month = 1; month <= months; month += 1) {
    const interest = debt * monthlyDebtRate;
    debt += interest;
    interestPaid += interest;

    if (month === SURPRISE_MONTH && situation.surpriseExpense > 0) {
      const fromSavings = Math.min(savings, situation.surpriseExpense);
      savings -= fromSavings;
      surpriseAddedToDebt = situation.surpriseExpense - fromSavings;
      debt += surpriseAddedToDebt;
    }

    const payment = Math.min(debt, budget - toSavings);
    debt -= payment;
    if (debt < 0.005) debt = 0;

    if (debt > 0) debtFreeMonth = null;
    else if (debtFreeMonth === null) debtFreeMonth = month;

    const earned = savings * monthlySavingsRate;
    interestEarned += earned;
    savings += earned + budget - payment;
  }

  return { debtFreeMonth, interestPaid, interestEarned, debtLeft: debt, savings, surpriseAddedToDebt };
}

export interface Comparison {
  months: number;
  plans: { plan: Plan; result: PlanResult }[];
}

// Every plan is measured over the same months, so their savings can be compared.
export function comparePlans(situation: Situation): Comparison {
  const longest = PLANS.map((plan) => simulatePlan(situation, plan.shareToSavings, MAX_MONTHS).debtFreeMonth).reduce<number>(
    (most, month) => Math.max(most, month ?? 0),
    0,
  );
  const months = Math.max(longest, SURPRISE_MONTH);

  return {
    months,
    plans: PLANS.map((plan) => {
      const result = simulatePlan(situation, plan.shareToSavings, months);
      const paidOffLater = simulatePlan(situation, plan.shareToSavings, MAX_MONTHS).debtFreeMonth;
      return { plan, result: { ...result, debtFreeMonth: paidOffLater } };
    }),
  };
}

// The debt never shrinks unless the payment is more than a month's interest.
export function paymentCoversInterest(debt: number, debtRatePercent: number, payment: number): boolean {
  return payment > (debt * debtRatePercent) / 100 / 12;
}
