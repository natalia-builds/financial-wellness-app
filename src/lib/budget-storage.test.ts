import { describe, expect, it } from 'vitest';
import {
  BUDGET_STORAGE_KEY,
  BUDGET_STORAGE_VERSION,
  eraseBudget,
  FIXED_LINES,
  isStorageAvailable,
  loadBudget,
  saveBudget,
} from './budget-storage';

function fakeStorage(initial: Record<string, string> = {}) {
  const items = { ...initial };
  return {
    items,
    getItem: (key: string) => items[key] ?? null,
    setItem: (key: string, value: string) => {
      items[key] = value;
    },
    removeItem: (key: string) => {
      delete items[key];
    },
  };
}

const blocked = () => {
  throw new Error('Storage is blocked');
};

const throwingStore = { getItem: blocked, setItem: blocked, removeItem: blocked };

// A complete, valid budget with a few lines filled in.
function sampleBudget() {
  const lines = Object.fromEntries(FIXED_LINES.map((id) => [id, { amount: '', frequency: 'month' as const }]));
  lines.pay = { amount: '1,200.50', frequency: 'two-weeks' };
  lines.housing = { amount: '900', frequency: 'month' };
  return { lines, ownCosts: [{ name: 'Pet care', amount: '40', frequency: 'year' as const }] };
}

const withStored = (value: unknown) => fakeStorage({ [BUDGET_STORAGE_KEY]: JSON.stringify(value) });

describe('saving a budget', () => {
  it('keeps nothing until it is told to save', () => {
    const storage = fakeStorage();
    expect(loadBudget(() => storage)).toBeNull();
    expect(storage.items).toEqual({});
  });

  it('saves the numbers and loads them back exactly as typed', () => {
    const storage = fakeStorage();
    const budget = sampleBudget();
    expect(saveBudget(budget, () => storage)).toBe(true);
    expect(loadBudget(() => storage)).toEqual({ version: BUDGET_STORAGE_VERSION, ...budget });
  });

  it('saves a budget with no costs of the person\'s own', () => {
    const storage = fakeStorage();
    saveBudget({ ...sampleBudget(), ownCosts: [] }, () => storage);
    expect(loadBudget(() => storage)?.ownCosts).toEqual([]);
  });

  it('keeps a saved version number', () => {
    const storage = fakeStorage();
    saveBudget(sampleBudget(), () => storage);
    expect(JSON.parse(storage.items[BUDGET_STORAGE_KEY]).version).toBe(BUDGET_STORAGE_VERSION);
  });
});

describe('erasing a saved budget', () => {
  it('removes everything that was saved', () => {
    const storage = fakeStorage();
    saveBudget(sampleBudget(), () => storage);
    expect(eraseBudget(() => storage)).toBe(true);
    expect(storage.items).toEqual({});
    expect(loadBudget(() => storage)).toBeNull();
  });

  it('is fine when nothing was saved', () => {
    expect(eraseBudget(() => fakeStorage())).toBe(true);
  });
});

describe('damaged or mismatched saved data', () => {
  const ignoredAndErased = (stored: ReturnType<typeof fakeStorage>) => {
    expect(loadBudget(() => stored)).toBeNull();
    expect(stored.items).toEqual({});
  };

  it('ignores and erases text that is not JSON', () => {
    ignoredAndErased(fakeStorage({ [BUDGET_STORAGE_KEY]: '{not json' }));
  });

  it('ignores and erases JSON of the wrong kind', () => {
    for (const value of [null, 42, 'text', [], {}]) ignoredAndErased(withStored(value));
  });

  it('ignores and erases a different version', () => {
    ignoredAndErased(withStored({ version: BUDGET_STORAGE_VERSION + 1, ...sampleBudget() }));
    ignoredAndErased(withStored(sampleBudget()));
  });

  it('ignores and erases a save that is missing a line', () => {
    const budget = sampleBudget();
    delete budget.lines.food;
    ignoredAndErased(withStored({ version: BUDGET_STORAGE_VERSION, ...budget }));
  });

  it('ignores and erases a save with a line the form no longer has', () => {
    const budget = sampleBudget();
    budget.lines['old-category'] = { amount: '5', frequency: 'month' };
    ignoredAndErased(withStored({ version: BUDGET_STORAGE_VERSION, ...budget }));
  });

  it('ignores and erases an unknown how-often choice', () => {
    const budget = sampleBudget();
    budget.lines.pay = { amount: '5', frequency: 'daily' as never };
    ignoredAndErased(withStored({ version: BUDGET_STORAGE_VERSION, ...budget }));
  });

  it('ignores and erases an amount that is not text', () => {
    const budget = sampleBudget();
    budget.lines.pay = { amount: 5 as never, frequency: 'month' };
    ignoredAndErased(withStored({ version: BUDGET_STORAGE_VERSION, ...budget }));
  });

  it('ignores and erases text longer than the form allows', () => {
    const budget = sampleBudget();
    budget.ownCosts = [{ name: 'x'.repeat(41), amount: '1', frequency: 'month' }];
    ignoredAndErased(withStored({ version: BUDGET_STORAGE_VERSION, ...budget }));
  });

  it('ignores and erases more own costs than the form allows', () => {
    const cost = { name: 'a', amount: '1', frequency: 'month' as const };
    const budget = { ...sampleBudget(), ownCosts: [cost, cost, cost, cost] };
    ignoredAndErased(withStored({ version: BUDGET_STORAGE_VERSION, ...budget }));
  });

  it('ignores and erases an own cost with no name', () => {
    const budget = { ...sampleBudget(), ownCosts: [{ amount: '1', frequency: 'month' }] };
    ignoredAndErased(withStored({ version: BUDGET_STORAGE_VERSION, ...budget }));
  });
});

describe('storage that is blocked or throws', () => {
  it('reports that saving is not available', () => {
    expect(isStorageAvailable(() => throwingStore)).toBe(false);
    expect(isStorageAvailable(blocked)).toBe(false);
  });

  it('reports that saving is available, and leaves nothing behind', () => {
    const storage = fakeStorage();
    expect(isStorageAvailable(() => storage)).toBe(true);
    expect(storage.items).toEqual({});
  });

  it('does not throw when saving, and says it failed', () => {
    expect(saveBudget(sampleBudget(), () => throwingStore)).toBe(false);
    expect(saveBudget(sampleBudget(), blocked)).toBe(false);
  });

  it('does not throw when loading, and finds nothing', () => {
    expect(loadBudget(() => throwingStore)).toBeNull();
    expect(loadBudget(blocked)).toBeNull();
  });

  it('does not throw when erasing, and says it failed', () => {
    expect(eraseBudget(() => throwingStore)).toBe(false);
    expect(eraseBudget(blocked)).toBe(false);
  });
});
