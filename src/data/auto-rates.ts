// Average auto loan rates by credit score. Update these together with the
// source details below whenever Experian publishes a newer quarter.

export type VehicleType = 'new' | 'used';

export interface AutoRate {
  scoreRange: string;
  tier: string; // Experian's name, kept for reference and not shown to users
  new: number;
  used: number;
}

export const AUTO_RATE_SOURCE = {
  name: 'Experian, State of the Automotive Finance Market',
  period: 'Q2 2026',
  scoreModel: 'VantageScore 4.0',
  url: 'https://www.experian.com/blogs/ask-experian/auto-loan-rates-financing/',
  lastChecked: 'November 2, 2026',
};

// Ordered from the highest credit scores to the lowest.
export const AUTO_RATES: AutoRate[] = [
  { scoreRange: '781–850', tier: 'Super prime', new: 4.41, used: 6.29 },
  { scoreRange: '661–780', tier: 'Prime', new: 6.15, used: 8.81 },
  { scoreRange: '601–660', tier: 'Near prime', new: 9.71, used: 13.93 },
  { scoreRange: '501–600', tier: 'Subprime', new: 13.52, used: 19.1 },
  { scoreRange: '300–500', tier: 'Deep subprime', new: 16.11, used: 21.62 },
];
