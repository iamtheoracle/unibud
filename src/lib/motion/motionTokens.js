/**
 * UNIBUD Motion Tokens — The Single Source of Truth
 *
 * Every spring config, duration, and easing curve in the OS references
 * these tokens. No component or preset contains hardcoded motion values.
 *
 * This is pure data — no React hooks, no side effects. The MotionEngine
 * and useMotion() hook consume these tokens at runtime.
 *
 * Web equivalent of motionTokens.ts (adapted from Reanimated to framer-motion).
 */

export const motionTokens = {
  // ── Duration (ms → seconds at consumption) ──
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    glacial: 800,
  },

  // ── Spring physics presets — named by use-case ──
  spring: {
    fast:     { mass: 1,   stiffness: 350, damping: 28 },
    normal:   { mass: 1,   stiffness: 200, damping: 22 },
    slow:     { mass: 1,   stiffness: 60,  damping: 12 },
    elastic:  { mass: 1,   stiffness: 400, damping: 15 },
    navigation: { mass: 0.9, stiffness: 420, damping: 32 },
    dialog:   { mass: 1,   stiffness: 300, damping: 30 },
    card:     { mass: 1,   stiffness: 200, damping: 22 },
    ai:       { mass: 1,   stiffness: 90,  damping: 10 },
    button:   { mass: 0.8, stiffness: 350, damping: 28 },
    sheet:    { mass: 1,   stiffness: 300, damping: 30 },
  },

  // ── Easing curves — UNIBUD cubic-bezier signatures ──
  easing: {
    standard:   [0.16, 1, 0.3, 1],
    accelerate: [0.4, 0, 1, 1],
    decelerate: [0, 0, 0.2, 1],
    overshoot:  [0.34, 1.56, 0.64, 1],
  },
};

/**
 * Resolve a spring token to a framer-motion transition object.
 * @param {keyof typeof motionTokens.spring} token
 * @param {object} overrides — additional framer-motion transition props
 * @returns {object} framer-motion transition config
 */
export function resolveSpring(token = 'normal', overrides = {}) {
  const config = motionTokens.spring[token] || motionTokens.spring.normal;
  return { type: 'spring', ...config, ...overrides };
}

/**
 * Resolve a duration token to a framer-motion transition object.
 * @param {keyof typeof motionTokens.duration} token
 * @param {object} overrides
 * @returns {object} framer-motion transition config (seconds)
 */
export function resolveTiming(token = 'normal', overrides = {}) {
  const ms = motionTokens.duration[token] ?? motionTokens.duration.normal;
  return { duration: ms / 1000, ease: motionTokens.easing.standard, ...overrides };
}