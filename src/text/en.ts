// All user-facing wording lives here so it can be reviewed, and later
// translated, without touching the code.

export const text = {
  site: {
    name: 'Financial Wellness',
    footer: 'Free and open source. This site is for education only and is not financial advice.',
    sourceCode: 'See the source code',
  },
  home: {
    title: 'Financial Wellness',
    description: 'Free, plain-language tools for understanding money.',
    heading: 'Understand your money, one step at a time',
    intro: 'Free, plain-language tools with no ads and no sign-up.',
    toolsHeading: 'Tools',
    creditToolLink: 'How your credit score affects what you pay',
    creditToolSummary: 'See what the same car loan can cost at different credit scores.',
  },
  creditTool: {
    title: 'How your credit score affects what you pay',
    description: 'See what the same car loan can cost at different credit scores.',
    intro:
      'When you borrow money, you pay extra for it. That extra is called interest. Lenders often charge lower rates to people with higher credit scores, so the same loan can cost very different amounts.',
    dignity: 'A credit score is a measure of borrowing history. It says nothing about your worth.',
    formHeading: 'Try a loan',
    privacy: 'Your numbers stay on your device. Nothing you type here is saved or sent anywhere.',
    amountLabel: 'Loan amount ($)',
    monthsLabel: 'Loan length',
    monthsOption: (months: number) => `${months} months (${months / 12} years)`,
    vehicleLabel: 'Car type',
    vehicleNew: 'New',
    vehicleUsed: 'Used',
    ownRateLabel: 'Your own interest rate (%), optional',
    ownRateHint: 'If you have a real offer, enter its APR to compare it.',
    resultsHeading: 'What this loan could cost',
    tableCaption: 'Estimated cost of this loan at average interest rates for each credit score range',
    scoreColumn: 'Credit score',
    rateColumn: 'Average rate (APR)',
    paymentColumn: 'Monthly payment',
    interestColumn: 'Total interest',
    ownRateRow: 'Your rate',
    empty: '—',
    needsJavaScript: 'This calculator needs JavaScript. Please turn it on in your browser to see the results.',
    summary: (difference: string, highScores: string, lowScores: string) =>
      `With these average rates, this loan costs about ${difference} more in interest for someone with a ${lowScores} score than for someone with a ${highScores} score.`,
    ownRateSummary: (rate: string, interest: string) => `At your rate of ${rate}, total interest is ${interest}.`,
    invalidAmount: 'Please enter a loan amount greater than zero.',
    invalidRate: 'Please enter an interest rate between 0 and 100, or leave it blank.',
    aboutHeading: 'About these numbers',
    aboutRates: (period: string, scoreModel: string) =>
      `These are national averages for ${period}, using ${scoreModel} scores. They are not loan offers, and your rate may be higher or lower.`,
    aboutFactors:
      'Lenders also look at your income, your down payment, the car, and the loan length. There are several kinds of credit score, so yours may vary depending on which one you see.',
    sourceLabel: 'Source:',
    lastChecked: (date: string) => `Last checked ${date}.`,
    backHome: 'Back to all tools',
  },
};
