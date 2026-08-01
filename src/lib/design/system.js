/**
 * UNIBUD Design System — Consolidated Tokens
 *
 * Single source of truth for spacing, motion, typography, elevation,
 * and interaction constants. All components should reference these
 * rather than hardcoding values.
 *
 * Phase 2 — Design System Foundation
 */

// ── Spacing Scale (4px base) ──────────────────────────────────
export const SPACING = {
  xs: 4,      // micro — icon gaps, tight clusters
  sm: 8,      // compact — inline element gaps
  md: 12,     // default — component internal padding
  lg: 16,     // comfortable — card padding
  xl: 24,     // spacious — section gaps
  '2xl': 32,  // generous — major section breaks
  '3xl': 48,  // expansive — hero spacing
  '4xl': 64,  // maximum — page-level breaks
};

// ── Section Spacing ───────────────────────────────────────────
export const SECTION_GAP = {
  tight: 'mt-4',     // 16px — grouped items
  default: 'mt-6',   // 24px — standard sections
  spacious: 'mt-8',  // 32px — major sections
  expansive: 'mt-12', // 48px — hero breaks
};

// ── Motion ────────────────────────────────────────────────────
export const MOTION = {
  // Spring presets
  spring: { type: 'spring', stiffness: 420, damping: 32 },
  springSoft: { type: 'spring', stiffness: 320, damping: 36 },
  springBouncy: { type: 'spring', stiffness: 500, damping: 24 },
  springSnappy: { type: 'spring', stiffness: 600, damping: 30 },

  // Duration presets
  instant: 0.1,
  fast: 0.15,
  standard: 0.2,
  smooth: 0.3,
  deliberate: 0.4,

  // Easing
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  easeSpring: { type: 'spring', stiffness: 420, damping: 32 },

  // Stagger
  staggerContainer: { animate: { transition: { staggerChildren: 0.04 } } },
  staggerItem: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  },
};

// ── Typography Scale ─────────────────────────────────────────
export const TYPOGRAPHY = {
  display: { fontSize: 'var(--text-display)', lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em' },
  heading: { fontSize: 'var(--text-heading)', lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.01em' },
  title: { fontSize: 'var(--text-title)', lineHeight: 1.25, fontWeight: 600 },
  subtitle: { fontSize: 'var(--text-subtitle)', lineHeight: 1.3, fontWeight: 600 },
  body: { fontSize: 'var(--text-body)', lineHeight: 1.5, fontWeight: 400 },
  caption: { fontSize: 'var(--text-caption)', lineHeight: 1.4, fontWeight: 500 },
  label: { fontSize: 'var(--text-label)', lineHeight: 1.3, fontWeight: 600, letterSpacing: '0.01em' },
  micro: { fontSize: 'var(--text-micro)', lineHeight: 1.3, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' },
};

// ── Elevation ─────────────────────────────────────────────────
export const ELEVATION = {
  flat: 'none',
  soft: 'var(--shadow-soft)',
  premium: 'var(--shadow-premium)',
  elevated: 'var(--shadow-elevated)',
  hover: 'var(--shadow-hover)',
};

// ── Corner Radius ─────────────────────────────────────────────
export const RADIUS = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  pill: 'var(--radius-pill)',
};

// ── Icon Sizes ────────────────────────────────────────────────
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
};

// ── Icon Stroke ───────────────────────────────────────────────
export const ICON_STROKE = {
  light: 1.5,
  regular: 1.8,
  medium: 2.0,
  bold: 2.3,
};

// ── Page Layout ───────────────────────────────────────────────
export const PAGE = {
  maxWidth: '520px',
  paddingX: '20px', // px-5
  paddingTop: '32px', // pt-8
  paddingBottom: '144px', // pb-36 — clears bottom nav
};

// ── Glass Materials ───────────────────────────────────────────
export const GLASS = {
  standard: 'glass',
  strong: 'glass-strong',
  card: 'glass-card',
  crystal: 'crystal-card',
  dock: 'founder-dock',
  mirror: 'mirror-glass',
  liquid: 'liquid-mirror',
  frosted: 'frosted-mirror',
};

// ── Interaction Feedback ─────────────────────────────────────
export const INTERACTION = {
  tapScale: 0.96,
  hoverLift: -3, // px translateY
  pressedScale: 0.985,
  transitionDuration: 150, // ms
  springTransition: { type: 'spring', stiffness: 420, damping: 32 },
};

// ── Z-Index Scale ─────────────────────────────────────────────
export const Z_INDEX = {
  base: 0,
  content: 10,
  sticky: 20,
  dock: 40,
  overlay: 50,
  sheet: 60,
  modal: 70,
  toast: 80,
  capsule: 9997,
  dropdown: 9998,
  dialog: 9999,
};