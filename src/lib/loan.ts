// Loan math for fixed-rate loans paid in equal monthly amounts.

function assertValidLoan(principal: number, annualRatePercent: number, months: number) {
  if (!Number.isFinite(principal) || principal <= 0) {
    throw new RangeError('Loan amount must be greater than zero.');
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    throw new RangeError('Interest rate cannot be negative.');
  }
  if (!Number.isInteger(months) || months <= 0) {
    throw new RangeError('Loan length must be a whole number of months.');
  }
}

export function monthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  assertValidLoan(principal, annualRatePercent, months);

  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / months;

  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
}

export function totalInterest(principal: number, annualRatePercent: number, months: number): number {
  return monthlyPayment(principal, annualRatePercent, months) * months - principal;
}
