// Lets people choose to keep their budget on their own device. It lives in the
// browser's local storage, never in a cookie, so it is never sent to a server.
// Nothing is written unless the person ticks the box, and unticking erases it.
// Storage can be blocked or throw, so every call is wrapped and reports success.

import { COST_LINES, FREQUENCIES, INCOME_LINES, MAX_OWN_COSTS } from './budget';
import type { Frequency } from './budget';

export const BUDGET_STORAGE_KEY = 'budget-numbers';

// Bump this when the saved shape changes. Older saves are then ignored and erased.
export const BUDGET_STORAGE_VERSION = 1;

// The longest text kept for one field. It matches the form, which allows 40
// characters for a name. Anything longer wasn't saved by this tool.
const MAX_TEXT = 40;

export const FIXED_LINES = [...INCOME_LINES, ...COST_LINES] as const;

// The fields exactly as typed, so what comes back looks the way the person left it.
export interface SavedAmount {
  amount: string;
  frequency: Frequency;
}

export interface SavedOwnCost extends SavedAmount {
  name: string;
}

export interface SavedBudget {
  version: typeof BUDGET_STORAGE_VERSION;
  lines: Record<string, SavedAmount>;
  ownCosts: SavedOwnCost[];
}

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// A function, not a value, because even reading `localStorage` can throw.
const browserStorage = (): Store => window.localStorage;

const isText = (value: unknown): value is string => typeof value === 'string' && value.length <= MAX_TEXT;

const isFrequency = (value: unknown): value is Frequency => FREQUENCIES.includes(value as Frequency);

function isSavedAmount(value: unknown): value is SavedAmount {
  if (typeof value !== 'object' || value === null) return false;
  const { amount, frequency } = value as Record<string, unknown>;
  return isText(amount) && isFrequency(frequency);
}

// True only when the data matches the current form exactly: the same fixed lines,
// no extras, and at most the allowed number of costs the person named.
export function isSavedBudget(value: unknown): value is SavedBudget {
  if (typeof value !== 'object' || value === null) return false;
  const { version, lines, ownCosts } = value as Record<string, unknown>;
  if (version !== BUDGET_STORAGE_VERSION) return false;

  if (typeof lines !== 'object' || lines === null || Array.isArray(lines)) return false;
  const ids = Object.keys(lines);
  if (ids.length !== FIXED_LINES.length || !FIXED_LINES.every((id) => ids.includes(id))) return false;
  if (!FIXED_LINES.every((id) => isSavedAmount((lines as Record<string, unknown>)[id]))) return false;

  if (!Array.isArray(ownCosts) || ownCosts.length > MAX_OWN_COSTS) return false;
  return ownCosts.every((cost) => isSavedAmount(cost) && isText((cost as SavedOwnCost).name));
}

// Whether this browser lets the site keep anything. It writes a tiny test item
// and removes it again at once, so nothing is left behind.
export function isStorageAvailable(getStorage: () => Store = browserStorage): boolean {
  const testKey = `${BUDGET_STORAGE_KEY}-test`;
  try {
    const storage = getStorage();
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Returns true when the numbers were kept.
export function saveBudget(
  data: Omit<SavedBudget, 'version'>,
  getStorage: () => Store = browserStorage,
): boolean {
  try {
    const saved: SavedBudget = { version: BUDGET_STORAGE_VERSION, ...data };
    getStorage().setItem(BUDGET_STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch {
    return false;
  }
}

// Returns true when nothing is left saved.
export function eraseBudget(getStorage: () => Store = browserStorage): boolean {
  try {
    getStorage().removeItem(BUDGET_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

// Returns the saved numbers, or null when there are none. Saved data that is
// damaged, from an older format, or doesn't match the form is erased, so stale
// data never shows up as someone's numbers.
export function loadBudget(getStorage: () => Store = browserStorage): SavedBudget | null {
  let raw: string | null;
  try {
    raw = getStorage().getItem(BUDGET_STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isSavedBudget(parsed)) return parsed;
  } catch {
    // Not valid JSON: treated like any other damaged data below.
  }
  eraseBudget(getStorage);
  return null;
}
