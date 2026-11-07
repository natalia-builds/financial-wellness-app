import { describe, expect, it } from 'vitest';
import { areLessonsCollapsed, LESSONS_COLLAPSED_KEY, saveLessonsCollapsed } from './lesson-preference';

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

const blockedStorage = () => {
  throw new Error('Storage is blocked');
};

const throwingStore = {
  getItem: blockedStorage,
  setItem: blockedStorage,
  removeItem: blockedStorage,
};

describe('lesson preference', () => {
  it('shows lessons open when nothing is saved', () => {
    expect(areLessonsCollapsed(() => fakeStorage())).toBe(false);
  });

  it('remembers a collapsed lesson', () => {
    const storage = fakeStorage();
    saveLessonsCollapsed(true, () => storage);
    expect(storage.items[LESSONS_COLLAPSED_KEY]).toBe('true');
    expect(areLessonsCollapsed(() => storage)).toBe(true);
  });

  it('clears the setting when a lesson is opened again', () => {
    const storage = fakeStorage({ [LESSONS_COLLAPSED_KEY]: 'true' });
    saveLessonsCollapsed(false, () => storage);
    expect(storage.items).toEqual({});
    expect(areLessonsCollapsed(() => storage)).toBe(false);
  });

  it('ignores an unexpected saved value', () => {
    expect(areLessonsCollapsed(() => fakeStorage({ [LESSONS_COLLAPSED_KEY]: 'maybe' }))).toBe(false);
  });

  it('shows the lesson open when reading storage throws', () => {
    expect(areLessonsCollapsed(() => throwingStore)).toBe(false);
  });

  it('shows the lesson open when storage cannot be reached at all', () => {
    expect(areLessonsCollapsed(blockedStorage)).toBe(false);
  });

  it('does not throw when saving fails', () => {
    expect(() => saveLessonsCollapsed(true, () => throwingStore)).not.toThrow();
    expect(() => saveLessonsCollapsed(false, () => throwingStore)).not.toThrow();
    expect(() => saveLessonsCollapsed(true, blockedStorage)).not.toThrow();
  });
});
