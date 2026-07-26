/**
 * Production logging — leveled logger with a ring buffer and global error
 * capture. Keeps a lightweight in-memory log buffer (useful for attaching
 * to support reports) and forwards uncaught errors / unhandled rejections.
 */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
let minLevel = LEVELS.info;
const buffer = [];

function record(level, msg, ctx) {
  if ((LEVELS[level] || 40) < minLevel) return;
  const entry = { t: Date.now(), level, msg, ctx };
  buffer.push(entry);
  if (buffer.length > 200) buffer.shift();
  const fn = level === "error" ? "error" : level === "warn" ? "warn" : "log";
  // eslint-disable-next-line no-console
  console[fn](`[${level}]`, msg, ctx || "");
}

export const logger = {
  setLevel: (l) => { minLevel = LEVELS[l] || LEVELS.info; },
  debug: (m, c) => record("debug", m, c),
  info: (m, c) => record("info", m, c),
  warn: (m, c) => record("warn", m, c),
  error: (m, c) => record("error", m, c),
  flush: () => [...buffer],
};

/** Install global listeners for uncaught errors and unhandled rejections. */
export function initProductionLogging() {
  if (typeof window === "undefined") return;
  window.addEventListener("error", (e) =>
    logger.error("uncaught", { message: e.message, file: e.filename, line: e.lineno })
  );
  window.addEventListener("unhandledrejection", (e) =>
    logger.error("unhandledrejection", { reason: e.reason?.message || String(e.reason) })
  );
}

export default logger;