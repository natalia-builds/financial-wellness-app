// Remembers whether the person prefers lessons collapsed. It lives in the
// browser's local storage, never in a cookie, so it is never sent to a server.
// Storage can be blocked or missing, so every call falls back to "open".

export const LESSONS_COLLAPSED_KEY = 'lessons-collapsed';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// A function, not a value, because even reading `localStorage` can throw.
const browserStorage = (): Store => window.localStorage;

export function areLessonsCollapsed(getStorage: () => Store = browserStorage): boolean {
  try {
    return getStorage().getItem(LESSONS_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

// Collapsing saves the setting. Opening a lesson again clears it.
export function saveLessonsCollapsed(collapsed: boolean, getStorage: () => Store = browserStorage): void {
  try {
    if (collapsed) getStorage().setItem(LESSONS_COLLAPSED_KEY, 'true');
    else getStorage().removeItem(LESSONS_COLLAPSED_KEY);
  } catch {
    // Nothing to do: the lesson simply isn't remembered.
  }
}
