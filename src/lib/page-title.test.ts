import { describe, expect, it } from 'vitest';
import { pageTitle } from './page-title';

describe('pageTitle', () => {
  it('puts the page name first, then the site name', () => {
    expect(pageTitle('Tools')).toBe('Tools – Financial Wellness');
  });

  it('does not repeat the site name on the home page', () => {
    expect(pageTitle('Financial Wellness')).toBe('Financial Wellness');
  });

  it('ignores extra spaces around the page name', () => {
    expect(pageTitle('  Tools  ')).toBe('Tools – Financial Wellness');
    expect(pageTitle('  Financial Wellness ')).toBe('Financial Wellness');
  });

  it('falls back to the site name when the page name is empty', () => {
    expect(pageTitle('   ')).toBe('Financial Wellness');
  });

  it('uses the en dash with spaces from the wording file', () => {
    expect(pageTitle('Tools')).toContain(' – ');
  });
});
