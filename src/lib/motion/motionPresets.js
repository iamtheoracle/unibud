/**
 * Premium Motion System — reusable Framer Motion presets.
 *
 * Design philosophy: Motion communicates state changes and improves
 * usability. Never distracts. Calm, fast, premium, GPU-accelerated.
 *
 * All values reference motionTokens — no hardcoded spring/duration/easing.
 * Tokens are the single source of truth; presets compose them into
 * reusable variant configs.
 *
 * Usage:
 *   import { pageTransition, cardEntrance, staggerContainer } from "@/lib/motion/motionPresets";
 *   <motion.div {...pageTransition}>...</motion.div>
 *   <motion.div variants={cardEntrance} initial="initial" animate="animate">...</motion.div>
 */

import { motionTokens, resolveSpring } from './motionTokens';

export const EASE = motionTokens.easing.standard;
export const EASE_OUT_BACK = motionTokens.easing.overshoot;

// ── Page transitions — smooth fade + slide for route changes ──
export const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.4, ease: EASE },
};

// ── Card entrance — subtle rise for content cards ──
export const cardEntrance = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: EASE },
};

// ── Stagger — progressive reveal for lists and grids ──
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: EASE },
};

// ── Card expansion — shared layout for expand/collapse ──
export const cardExpansion = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.3, ease: EASE },
};

// ── Slide in from right — for sheets and drawers ──
export const slideInRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: resolveSpring('sheet'),
};

// ── Slide up — for bottom sheets ──
export const slideUp = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
  transition: resolveSpring('sheet'),
};

// ── Fade through — for tab switches and modal content ──
export const fadeThrough = {
  initial: { opacity: 0, scale: 0.97, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.97, filter: "blur(4px)" },
  transition: { duration: 0.4, ease: EASE },
};

// ── Scale in — for popovers and menus ──
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2, ease: EASE_OUT_BACK },
};

// ── Spring presets — tactile interaction feedback (tokenized) ──
export const springGentle = resolveSpring('normal');
export const springSnappy = resolveSpring('button');
export const springBouncy = resolveSpring('elastic');

// ── Gesture configs — drag, swipe, pull ──
export const dragSpring = resolveSpring('sheet');

// ── Animated counter — for numbers and stats ──
export const counterVariants = {
  initial: { opacity: 0, y: 4, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.4, ease: EASE },
};

// ── Success checkmark draw ──
export const successDraw = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { duration: 0.4, ease: EASE, delay: 0.1 },
};

// ── Reduced motion wrapper ──
// Use with <motion.div variants={reducedMotionSafe}> to ensure
// accessibility for users who prefer reduced motion.
export const reducedMotionSafe = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
};

/**
 * Creates a staggered animation config for a list of N items.
 * @param {number} count - number of items
 * @param {number} delay - initial delay before stagger starts
 * @returns {object} Framer Motion transition config
 */
export function staggerDelay(count, delay = 0) {
  return {
    animate: {
      transition: {
        staggerChildren: Math.min(0.06, 0.5 / count),
        delayChildren: delay,
      },
    },
  };
}