/**
 * Crash Reporting Service — unified remote crash + error telemetry.
 * Reuses the production logger (src/lib/production/logger.js), which
 * already throttles and writes to the CrashReport entity, plus the
 * global uncaught-error/rejection listeners.
 */
import { logger, initProductionLogging } from "@/lib/production/logger";

export function crashService(base44) {
  return {
    /** Report an Error (or any value) with optional context. */
    report: (error, context) =>
      logger.error(error?.message || String(error), {
        stack: error?.stack,
        ...context,
      }),

    /** Capture a non-fatal message (warn level). */
    captureMessage: (msg, context) => logger.warn(msg, context),

    /** Install global window error/rejection listeners (idempotent). */
    init: () => initProductionLogging(),

    /** In-memory log ring buffer (useful for support reports). */
    flush: () => logger.flush(),

    /** Underlying logger for advanced callers. */
    logger,
  };
}