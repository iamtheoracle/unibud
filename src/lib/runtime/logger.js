/**
 * Structured Logger — Runtime Quality Requirement
 *
 * Provides leveled, contextual logging with optional CrashReport forwarding
 * for errors. All runtime components use this logger — no raw console calls.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const ENV_LEVEL = (import.meta?.env?.VITE_LOG_LEVEL) || 'info';
const MIN_LEVEL = LEVELS[ENV_LEVEL] ?? LEVELS.info;
const SENSITIVE_KEY_RE = /(token|password|secret|authorization|cookie|api[_-]?key|session)/i;

const maskText = (text) => String(text)
  .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "******")
  .replace(/\beyJ[A-Za-z0-9._-]{10,}\b/g, "[REDACTED_JWT]");

function redact(value, depth = 0) {
  if (value == null) return value;
  if (depth > 4) return "[TRUNCATED]";
  if (typeof value === "string") return maskText(value);
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 40).map((entry) => redact(entry, depth + 1));
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    out[key] = SENSITIVE_KEY_RE.test(key) ? "[REDACTED]" : redact(val, depth + 1);
  }
  return out;
}

class Logger {
  constructor(context = {}) {
    this.context = context;
  }

  child(extra = {}) {
    return new Logger({ ...this.context, ...extra });
  }

  log(level, message, data = {}) {
    if (LEVELS[level] < MIN_LEVEL) return;
    const safeMessage = maskText(message);
    const safeData = redact(data);
    const entry = {
      level,
      message: String(safeMessage),
      data: safeData,
      context: this.context,
      timestamp: new Date().toISOString(),
    };

    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`[${level.toUpperCase()}] [${this.context.subsystem || 'runtime'}]`, safeMessage, safeData);

    if (level === 'error' && typeof window !== 'undefined' && window.location) {
      import('@/api/base44Client').then(({ base44 }) => {
        if (!base44?.entities?.CrashReport?.create) return;
        base44.entities.CrashReport.create({
          message: String(safeMessage).slice(0, 500),
          stack: typeof safeData === 'string' ? safeData : JSON.stringify(safeData).slice(0, 4000),
          url: window.location.href,
          user_agent: navigator?.userAgent?.slice(0, 300),
          severity: 'error',
          context: { ...this.context, ...entry.data },
        }).catch(() => {});
      }).catch(() => {});
    }
  }

  debug(msg, data) { this.log('debug', msg, data); }
  info(msg, data) { this.log('info', msg, data); }
  warn(msg, data) { this.log('warn', msg, data); }
  error(msg, data) { this.log('error', msg, data); }
}

export const logger = new Logger({ subsystem: 'runtime' });
export default logger;