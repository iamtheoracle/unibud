/**
 * Structured Logger — Runtime Quality Requirement
 *
 * Provides leveled, contextual logging with optional CrashReport forwarding
 * for errors. All runtime components use this logger — no raw console calls.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const ENV_LEVEL = (import.meta?.env?.VITE_LOG_LEVEL) || 'info';
const MIN_LEVEL = LEVELS[ENV_LEVEL] ?? LEVELS.info;

class Logger {
  constructor(context = {}) {
    this.context = context;
  }

  child(extra = {}) {
    return new Logger({ ...this.context, ...extra });
  }

  log(level, message, data = {}) {
    if (LEVELS[level] < MIN_LEVEL) return;
    const entry = {
      level,
      message: String(message),
      data,
      context: this.context,
      timestamp: new Date().toISOString(),
    };

    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`[${level.toUpperCase()}] [${this.context.subsystem || 'runtime'}]`, message, data);

    if (level === 'error' && typeof window !== 'undefined' && window.location) {
      import('@/api/base44Client').then(({ base44 }) => {
        if (!base44?.entities?.CrashReport?.create) return;
        base44.entities.CrashReport.create({
          message: String(message).slice(0, 500),
          stack: typeof data === 'string' ? data : JSON.stringify(data).slice(0, 4000),
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