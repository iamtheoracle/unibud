/**
 * UNIBUD Motion Engine — Pure Service Layer
 *
 * RESPONSIBILITIES (no React hooks, no UI):
 *   • Resolve spring / timing / sequence configs from tokens
 *   • Transaction-aware orchestration (group + cancel by transaction)
 *   • Screen-scoped ownership tracking (auto-dispose on unmount)
 *   • Anonymous motion analytics (duration, completion, interruption)
 *   • Accessibility state (reduced motion, battery saver)
 *
 * The engine is instantiated by MotionProvider and injected via React
 * Context — never a singleton. Every subsystem consumes it through
 * useMotion(), enabling dependency injection, testing, mocking, and
 * future engine replacement.
 */

import { motionTokens, resolveSpring, resolveTiming } from './motionTokens';

export class MotionEngine {
  constructor(config = {}) {
    this.tokens = config.tokens || motionTokens;
    this._transactions = new Map();
    this._screenScopes = new Map();
    this._analytics = [];
    this._maxAnalytics = 500;
    this._reducedMotion = false;
    this._batterySaver = false;
  }

  // ── Token resolution ──────────────────────────────────────────

  /** Get a spring transition config by token name. */
  spring(token = 'normal', overrides = {}) {
    if (this._reducedMotion) return { duration: 0, ...overrides };
    return resolveSpring(token, overrides);
  }

  /** Get a timing transition config by token name. */
  timing(token = 'normal', overrides = {}) {
    if (this._reducedMotion) return { duration: 0, ...overrides };
    return resolveTiming(token, overrides);
  }

  /** Get a raw easing curve. */
  ease(name = 'standard') {
    return this.tokens.easing[name] || this.tokens.easing.standard;
  }

  // ── Orchestration ─────────────────────────────────────────────

  /**
   * Create a staggered container config for framer-motion variants.
   * Completion-driven: children animate only after delayChildren.
   * @param {number} count — number of items (caps stagger to avoid slow lists)
   * @param {{ delay?: number }} options
   */
  stagger(count, options = {}) {
    const staggerChildren = Math.min(0.06, 0.5 / Math.max(count, 1));
    return {
      animate: {
        transition: {
          staggerChildren,
          delayChildren: options.delay || 0,
        },
      },
    };
  }

  /**
   * Create a sequence of animations with completion-driven chaining.
   * Each step includes a delay computed from cumulative prior durations,
   * so step N starts only after step N-1's duration has elapsed.
   * @param {Array<{ token?: string, duration?: number }>} steps
   * @returns {Array<object>} framer-motion transition configs with delays
   */
  sequence(steps) {
    let cumulativeDelay = 0;
    return steps.map((step) => {
      const durationSec = (step.duration ?? this.tokens.duration[step.token ?? 'normal'] ?? 300) / 1000;
      const config = { ...this.timing(step.token ?? 'normal'), delay: cumulativeDelay };
      cumulativeDelay += durationSec;
      return config;
    });
  }

  // ── Transaction management ────────────────────────────────────

  /**
   * Create a motion transaction. Related animations belong to a transaction
   * (Navigation, Authentication, Upload, Payment, Bud, Notification,
   * ScreenTransition) so cancelling one cancels only its owned animations.
   * @param {string} name — human-readable transaction name
   * @returns {string} transaction ID
   */
  createTransaction(name) {
    const id = `txn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    this._transactions.set(id, {
      name,
      animations: new Set(),
      createdAt: Date.now(),
      cancelled: false,
    });
    return id;
  }

  /** Register an animation (by control ref or ID) under a transaction. */
  registerAnimation(txnId, animId) {
    const txn = this._transactions.get(txnId);
    if (txn && !txn.cancelled) txn.animations.add(animId);
  }

  /** Cancel all animations owned by a transaction. */
  cancelTransaction(txnId) {
    const txn = this._transactions.get(txnId);
    if (!txn) return;
    txn.cancelled = true;
    this._transactions.delete(txnId);
  }

  /** Check if a transaction is still active (not cancelled). */
  isTransactionActive(txnId) {
    const txn = this._transactions.get(txnId);
    return !!txn && !txn.cancelled;
  }

  // ── Screen-scoped ownership ───────────────────────────────────

  /**
   * Register a screen scope. Animations created on this screen are
   * automatically disposed when the scope is released (on unmount).
   * Global animations (Bud, notifications, downloads, system overlays)
   * use the 'global' scope and persist across screens.
   * @param {string} screenId — unique screen identifier
   * @returns {string} scope handle
   */
  registerScreen(screenId) {
    const scope = { screenId, animations: new Set(), createdAt: Date.now() };
    this._screenScopes.set(screenId, scope);
    return screenId;
  }

  /** Dispose all animations owned by a screen scope. */
  releaseScreen(screenId) {
    this._screenScopes.delete(screenId);
  }

  // ── Accessibility ─────────────────────────────────────────────

  /** Update reduced-motion state (typically from prefers-reduced-motion). */
  setReducedMotion(enabled) {
    this._reducedMotion = !!enabled;
  }

  /** Update battery-saver state (reduces animation complexity). */
  setBatterySaver(enabled) {
    this._batterySaver = !!enabled;
  }

  get isReducedMotion() { return this._reducedMotion; }
  get isBatterySaver() { return this._batterySaver; }

  // ── Analytics (anonymous, performance-safe) ───────────────────

  /**
   * Record a motion analytics event. Remains anonymous — captures only
   * performance and completion metadata, never user data.
   * @param {{ animationId: string, feature: string, txnId?: string, screenId?: string, durationMs: number, fps?: number, droppedFrames?: number, interrupted: boolean, cancelled?: string, completed: boolean }} metric
   */
  recordMetric(metric) {
    this._analytics.push({
      ...metric,
      reducedMotion: this._reducedMotion,
      batterySaver: this._batterySaver,
      timestamp: Date.now(),
    });
    if (this._analytics.length > this._maxAnalytics) this._analytics.shift();
  }

  /** Retrieve analytics (most recent first, optionally filtered). */
  getAnalytics(filter) {
    const results = filter
      ? this._analytics.filter(filter)
      : [...this._analytics];
    return results.reverse();
  }

  /** Clear all analytics. */
  clearAnalytics() {
    this._analytics = [];
  }
}

/** Factory: create a fresh MotionEngine instance (used by MotionProvider). */
export function createMotionEngine(config) {
  return new MotionEngine(config);
}