/**
 * Production logging — leveled logger with a ring buffer and global error
 * capture. Keeps a lightweight in-memory log buffer (useful for attaching
 * to support reports) and forwards uncaught errors / unhandled rejections.
 */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
let minLevel = LEVELS.info;
const buffer = [];
let lastSentKey = "";
let lastSentAt = 0;
const SENSITIVE_KEY_RE = /(token|password|secret|authorization|cookie|api[_-]?key|session)/i;
const MAX_DEPTH = 4;

const maskText = (text) => String(text)
  .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "******")
  .replace(/\beyJ[A-Za-z0-9._-]{10,}\b/g, "[REDACTED_JWT]");

function redact(value, depth = 0) {
  if (value == null) return value;
  if (depth > MAX_DEPTH) return "[TRUNCATED]";
  if (typeof value === "string") return maskText(value);
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 40).map((item) => redact(item, depth + 1));
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    out[key] = SENSITIVE_KEY_RE.test(key) ? "[REDACTED]" : redact(val, depth + 1);
  }
  return out;
}

/** Fire-and-forget remote crash sink — throttled, never throws. */
function remoteCrashSink(level, msg, ctx) {
  if (level !== "error" || typeof window === "undefined") return;
  const safeCtx = redact(ctx);
  const key = String(msg) + "|" + (safeCtx?.message || safeCtx?.reason || "");
  const now = Date.now();
  if (key === lastSentKey && now - lastSentAt < 60000) return;
  lastSentKey = key; lastSentAt = now;
  try {
    import("@/api/base44Client").then(({ base44 }) =>
      base44.entities.CrashReport.create({
        message: maskText(String(msg)).slice(0, 500),
        stack: typeof safeCtx?.stack === "string" ? safeCtx.stack.slice(0, 4000) : JSON.stringify(safeCtx || {}).slice(0, 4000),
        url: location.href,
        user_agent: navigator.userAgent,
        severity: "error",
        context: safeCtx || {},
      }).catch(() => {})
    ).catch(() => {});
  } catch { /* no-op */ }
}

function record(level, msg, ctx) {
  if ((LEVELS[level] || 40) < minLevel) return;
  const safeMsg = maskText(msg);
  const safeCtx = redact(ctx);
  const entry = { t: Date.now(), level, msg: safeMsg, ctx: safeCtx };
  buffer.push(entry);
  if (buffer.length > 200) buffer.shift();
  const fn = level === "error" ? "error" : level === "warn" ? "warn" : "log";
  console[fn](`[${level}]`, safeMsg, safeCtx || "");
  remoteCrashSink(level, safeMsg, safeCtx);
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