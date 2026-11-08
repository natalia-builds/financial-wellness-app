// All user-facing wording lives here so it can be reviewed, and later
// translated, without touching the code.

export const text = {
  site: {
    name: 'Financial Wellness',
    titleSeparator: ' – ',
    home: 'Home',
    breadcrumbLabel: 'Breadcrumb',
    skipLink: 'Skip to main content',
    footer: 'Free and open source. This site is for education only and is not financial advice.',
    sourceCode: 'See the source code',
  },
  home: {
    title: 'Financial Wellness',
    description: 'Free, plain-language tools for understanding money.',
    heading: 'Understand your money, one step at a time',
    intro: 'Free, plain-language tools with no ads and no sign-up.',
    toolsHeading: 'Tools',
    allToolsLink: 'See all tools',
  },
  // The two questions under each tool's results. Answers are counted as totals (see src/lib/count.ts).
  feedback: {
    heading: 'Tell us how it went',
    helpful: {
      question: 'Was this helpful?',
      yes: 'Yes',
      no: 'No',
    },
    goal: {
      question: 'Have you moved on to a new money goal since you started using this site?',
      hint: 'This question is optional. You can skip it.',
      yes: 'Yes',
      notYet: 'Not yet',
    },
    thanks: 'Thank you for letting us know.',
    note: 'Answers are counted as totals. There are no cookies, and the numbers you typed are never sent.',
  },
  // Card wording for each tool in src/lib/tools.ts, found by the tool's key.
  toolList: {
    credit: {
      title: 'How your credit score affects what you pay',
      summary: 'See what the same car loan can cost at different credit scores.',
    },
    debt: {
      title: 'Paying down debt or building savings',
      summary: 'See what happens when extra money goes toward debt, savings, or both.',
    },
  },
  toolsPage: {
    title: 'Tools',
    description: 'All of the free tools, listed from the basics to planning ahead.',
    crumb: 'Tools',
    intro: 'Each tool lets you try your own numbers. Nothing you type is saved or sent anywhere.',
    groups: {
      'getting-started': {
        name: 'Getting started',
        description: 'Understanding the basics.',
      },
      'building-habits': {
        name: 'Building habits',
        description: 'Everyday choices with your money.',
      },
      'planning-ahead': {
        name: 'Planning ahead',
        description: 'Longer-term goals.',
      },
    },
  },
  debtTool: {
    title: 'Paying down debt or building savings',
    description: 'See what happens when extra money goes toward debt, savings, or both.',
    lesson: {
      title: 'Lesson: how interest works on debt and on savings',
      paragraphs: [
        'Debt and savings both use interest, but it works in opposite directions. When you owe money, the lender charges you interest, which is a percentage of what you still owe. The longer a balance stays, the more that adds up. When you save, the bank pays you interest, a percentage of what you have saved.',
        'If you have extra money each month, you can put it toward debt, into savings, or some of each. Money paid toward debt lowers the balance that interest is charged on. Money put into savings builds a cushion and earns a little interest of its own. The two rates are often different sizes, which is why the rates you enter below matter.',
        'A cushion matters because life is unpredictable. A car repair or a medical bill can show up at any time. Without savings, that cost may land on a credit card and add to the debt, along with its interest. With some savings set aside, it may not. The tool below lets you see both paths with your own numbers.',
      ],
    },
    noRightAnswer: 'There is no single right answer. This tool shows what can happen, and the choice is yours.',
    formHeading: 'Try your numbers',
    privacy: 'Your numbers stay on your device. Nothing you type here is saved or sent anywhere.',
    examples: 'The starting numbers are examples. Replace them with your own.',
    debtLabel: 'What you owe ($)',
    debtRateLabel: 'Interest rate on your debt (%)',
    minimumLabel: 'Minimum monthly payment ($)',
    extraLabel: 'Extra you have each month ($)',
    extraHint: 'This is the money on top of your minimum payment.',
    savingsLabel: 'Savings you have now ($)',
    savingsRateLabel: 'Interest rate on your savings (%)',
    surpriseLabel: 'Surprise expense ($), optional',
    surpriseHint: (month: number) => `This could be a car repair or medical bill. It arrives in month ${month}.`,
    resultsHeading: 'What could happen',
    tableCaption: 'Three ways to use your extra money',
    tableCaptionMonths: (months: number) => `Three ways to use your extra money, with savings shown after ${months} months`,
    planColumn: 'Where the extra goes',
    debtFreeColumn: 'Debt paid off in',
    interestColumn: 'Interest you pay',
    savingsColumn: 'Savings',
    planNames: {
      debt: 'All to debt',
      split: 'Half and half',
      savings: 'All to savings',
    },
    monthCount: (months: number) => `${months} ${months === 1 ? 'month' : 'months'}`,
    notPaidOff: (months: number) => `Not in ${months} months`,
    empty: '—',
    needsJavaScript: 'This tool needs JavaScript. Please turn it on in your browser to see the results.',
    summary: (saved: string, months: number) =>
      months > 0
        ? `Putting all the extra toward debt pays about ${saved} less in interest than putting it all into savings, and the debt ends ${months} ${months === 1 ? 'month' : 'months'} sooner.`
        : `Putting all the extra toward debt pays about ${saved} less in interest than putting it all into savings.`,
    summaryClose: 'With these numbers, all three plans pay about the same interest.',
    summaryNoExtra: 'With no extra money each month, all three plans are the same.',
    summaryNotAllPaid: (owed: string, months: number) =>
      `With all the extra going into savings, the minimum payment alone doesn't pay off the debt. After ${months} months, about ${owed} would still be owed, and it would keep growing.`,
    summarySurprise: (surprise: string, month: number, onDebt: string, onSavings: string) =>
      `The ${surprise} surprise in month ${month} adds ${onDebt} to the debt with all the extra going toward debt, and ${onSavings} with it all going into savings.`,
    paymentTooLow: (interest: string) =>
      `The debt charges about ${interest} in interest each month. A total payment at or below that doesn't shrink the debt, so no plan can pay it off.`,
    fixFields: 'Please check the fields marked above.',
    invalidDebt: 'Please enter what you owe, as an amount greater than zero.',
    invalidMinimum: 'Please enter a payment greater than zero.',
    invalidAmount: 'Please enter an amount of zero or more.',
    invalidRate: 'Please enter a rate between 0 and 100.',
    aboutHeading: 'About these numbers',
    aboutTable:
      'The table only shows money. It can\'t show how it feels to have a cushion, or what else a surprise bill could lead to, such as late fees.',
    aboutLimits: 'This is an estimate, and it assumes:',
    assumptions: [
      'Your rates and payments stay the same.',
      'You don\'t borrow more, apart from any part of the surprise that savings can\'t cover.',
      'Once the debt is gone, all the money you were paying toward it goes into savings.',
      'The minimum payment doesn\'t change. On many credit cards it falls as the balance falls.',
    ],
    aboutRates:
      'The starting rates are national averages, so yours may be higher or lower. Some savings accounts pay more than the average.',
    sourceLabel: 'Source:',
    lastChecked: (date: string) => `Last checked ${date}.`,
  },
  creditTool: {
    title: 'How your credit score affects what you pay',
    description: 'See what the same car loan can cost at different credit scores.',
    lesson: {
      title: 'Lesson: what a credit score is, and why rates differ',
      paragraphs: [
        'When you borrow money, you pay extra for it. That extra is called interest. A credit score is a number that summarizes your borrowing history, such as whether past loans and cards were paid on time and how much of your available credit you use.',
        'A lender can\'t know ahead of time whether a loan will be repaid, so many lenders use credit scores to estimate that risk. A higher score usually points to lower risk, and lenders often offer lower rates to match. A lower score usually points to higher risk, and lenders often charge higher rates to make up for it. Every lender weighs scores in its own way, so rates can differ from place to place.',
        'A rate that looks only a little higher can add up. Interest is charged every month on what you still owe, so over the life of a loan a small difference in the rate becomes a real difference in the total cost. The tool below shows this with your own numbers.',
      ],
    },
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
  },
};
