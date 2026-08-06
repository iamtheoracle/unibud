/**
 * UNIBUD Navigation OS — Navigation State Manager
 *
 * Persists navigation state per-tab so the user's position is restored
 * when they return to a destination after switching to another.
 *
 * State tracked per tab:
 *   - lastPath:     the last route visited in this destination
 *   - scrollY:      the scroll position on that page
 *   - backStack:    the history stack within the tab
 *
 * Storage: localStorage (survives app close, within-session is instant)
 */

const STORAGE_KEY = "unibud:nav-state";
const MAX_BACK_STACK = 20;

/** @typedef {{ lastPath: string, scrollY: number, backStack: string[] }} TabState */

/**
 * Load the full nav state from localStorage.
 * @returns {Record<string, TabState>}
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persist the full nav state to localStorage.
 * @param {Record<string, TabState>} state
 */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or private browsing — ignore
  }
}

// In-memory mirror for fast synchronous reads
let _state = loadState();

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Record a navigation event — call this on every route change.
 *
 * @param {string} destinationId  - The active tab (e.g. "square")
 * @param {string} pathname       - The new route path
 * @param {number} [scrollY=0]    - Current scroll position before leaving the page
 */
export function recordNavigation(destinationId, pathname, scrollY = 0) {
  if (!destinationId || !pathname) return;

  const prev = _state[destinationId] || { lastPath: null, scrollY: 0, backStack: [] };
  const backStack = [...prev.backStack];

  // Push previous path onto the back stack (avoid duplicates at head)
  if (prev.lastPath && prev.lastPath !== pathname) {
    backStack.push(prev.lastPath);
    if (backStack.length > MAX_BACK_STACK) backStack.shift();
  }

  _state = {
    ..._state,
    [destinationId]: {
      lastPath: pathname,
      scrollY,
      backStack,
    },
  };

  saveState(_state);
}

/**
 * Update only the scroll position for the current tab without changing the path.
 * Call this on scroll events (debounced).
 *
 * @param {string} destinationId
 * @param {number} scrollY
 */
export function recordScrollPosition(destinationId, scrollY) {
  if (!destinationId) return;
  const prev = _state[destinationId];
  if (!prev) return;

  _state = {
    ..._state,
    [destinationId]: { ...prev, scrollY },
  };

  saveState(_state);
}

/**
 * Get the last visited path for a destination.
 * Falls back to the destination's canonical root (e.g. "/square").
 *
 * @param {string} destinationId
 * @param {string} fallback       - The canonical root path for this destination
 * @returns {string}
 */
export function getLastPath(destinationId, fallback) {
  return _state[destinationId]?.lastPath || fallback;
}

/**
 * Get the saved scroll position for a destination.
 *
 * @param {string} destinationId
 * @returns {number}
 */
export function getSavedScrollY(destinationId) {
  return _state[destinationId]?.scrollY || 0;
}

/**
 * Get the back stack for a destination (most recent is last).
 *
 * @param {string} destinationId
 * @returns {string[]}
 */
export function getBackStack(destinationId) {
  return _state[destinationId]?.backStack || [];
}

/**
 * Pop the back stack for a destination and return the path to go back to.
 *
 * @param {string} destinationId
 * @returns {string|null}
 */
export function popBackStack(destinationId) {
  const tabState = _state[destinationId];
  if (!tabState?.backStack?.length) return null;

  const backStack = [...tabState.backStack];
  const target = backStack.pop();

  _state = {
    ..._state,
    [destinationId]: { ...tabState, backStack },
  };

  saveState(_state);
  return target;
}

/**
 * Clear navigation state for one or all destinations.
 *
 * @param {string} [destinationId] - If omitted, clears all state.
 */
export function clearNavState(destinationId) {
  if (destinationId) {
    const { [destinationId]: _removed, ...rest } = _state;
    _state = rest;
  } else {
    _state = {};
  }
  saveState(_state);
}

/**
 * Get a snapshot of the full nav state (read-only).
 * @returns {Record<string, TabState>}
 */
export function getNavStateSnapshot() {
  return { ..._state };
}
