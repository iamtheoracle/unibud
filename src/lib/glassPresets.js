/**
 * UNIBUD Premium Liquid Glass Animation Presets
 *
 * Shared spring physics, stagger patterns, and entrance helpers
 * for portal workspaces. Every transition uses spring-based motion
 * for fluid, responsive, premium feel — no abrupt movements.
 */

// ─── Spring Physics ──────────────────────────────────────────────────────────
export const SPRING = {
  gentle: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
  smooth: { type: "spring", stiffness: 200, damping: 26, mass: 1 },
  bouncy: { type: "spring", stiffness: 400, damping: 22, mass: 0.6 },
  hover: { type: "spring", stiffness: 500, damping: 28, mass: 0.5 },
  tap: { type: "spring", stiffness: 600, damping: 20, mass: 0.4 },
  glide: { type: "spring", stiffness: 180, damping: 24, mass: 1.2 },
  quick: { type: "spring", stiffness: 350, damping: 28, mass: 0.6 },
};

// ─── Hover / Tap Interactions ───────────────────────────────────────────────
export const hoverLift = {
  whileHover: { y: -4, transition: SPRING.hover },
  whileTap: { y: -1, scale: 0.98, transition: SPRING.tap },
};

export const hoverLiftStrong = {
  whileHover: { y: -6, scale: 1.01, transition: SPRING.hover },
  whileTap: { y: -2, scale: 0.97, transition: SPRING.tap },
};

// ─── Entrance Presets ───────────────────────────────────────────────────────
export const glassEntrance = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: SPRING.smooth },
};

export const glassEntranceDelay = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { ...SPRING.smooth, delay } },
});

export const scaleEntrance = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: SPRING.smooth },
};

export const scaleEntranceDelay = (delay = 0) => ({
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { ...SPRING.smooth, delay } },
});

export const slideInRight = (delay = 0) => ({
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { ...SPRING.gentle, delay } },
});

// ─── Stagger Containers ─────────────────────────────────────────────────────
export const staggerContainer = (stagger = 0.06, delay = 0.08) => ({
  initial: {},
  animate: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const staggerItem = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: SPRING.smooth },
};

export const staggerItemFast = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: SPRING.gentle },
};