/**
 * UNIBUD Design System — Consolidated Tokens v2.0
 *
 * Single source of truth for ALL design values.
 * No hardcoded values anywhere in the app — everything references these tokens.
 *
 * Phase 2 — Complete OS UI Migration
 */

// ── Spacing Scale (4px base) ──────────────────────────────────
export const SPACING = {
  xs: 4,      // micro — icon gaps, tight clusters
  sm: 8,      // compact — inline element gaps
  md: 12,     // default — component internal padding
  lg: 16,     // comfortable — card padding
  xl: 20,     // standard — page horizontal padding
  '2xl': 24,  // spacious — section gaps
  '3xl': 32,  // generous — major section breaks
  '4xl': 48,  // expansive — hero spacing
  '5xl': 64,  // maximum — page-level breaks
};

// ── Section Spacing ───────────────────────────────────────────
export const SECTION_GAP = {
  flush: 'mt-0',
  tight: 'mt-4',      // 16px — grouped items
  default: 'mt-6',   // 24px — standard sections
  spacious: 'mt-8',  // 32px — major sections
  expansive: 'mt-10', // 40px — premium breaks
  hero: 'mt-12',     // 48px — hero breaks
};

// ── Animation Duration (OS-standard) ──────────────────────────
export const DURATION = {
  instant: 0.1,   // 100ms — micro feedback
  fast: 0.15,     // 150ms — buttons, taps, toggles
  normal: 0.2,    // 200ms — standard transitions
  smooth: 0.3,    // 300ms — large element transitions
  deliberate: 0.4, // 400ms — page transitions
};

// ── Motion ────────────────────────────────────────────────────
export const MOTION = {
  // Spring presets — OS-standard: stiffness 400, damping 35
  spring: { type: 'spring', stiffness: 400, damping: 35 },
  springSoft: { type: 'spring', stiffness: 320, damping: 36 },
  springBouncy: { type: 'spring', stiffness: 500, damping: 24 },
  springSnappy: { type: 'spring', stiffness: 600, damping: 30 },

  // Duration presets
  instant: DURATION.instant,
  fast: DURATION.fast,
  standard: DURATION.normal,
  smooth: DURATION.smooth,
  deliberate: DURATION.deliberate,

  // Easing
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  easeSpring: { type: 'spring', stiffness: 400, damping: 35 },

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
  title: { fontSize: 'var(--text-title)', lineHeight: 1.25, fontWeight: 500 },
  subtitle: { fontSize: 'var(--text-subtitle)', lineHeight: 1.3, fontWeight: 500 },
  body: { fontSize: 'var(--text-body)', lineHeight: 1.5, fontWeight: 400 },
  caption: { fontSize: 'var(--text-caption)', lineHeight: 1.4, fontWeight: 500 },
  label: { fontSize: 'var(--text-label)', lineHeight: 1.3, fontWeight: 600, letterSpacing: '0.01em' },
  micro: { fontSize: 'var(--text-micro)', lineHeight: 1.3, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' },
};

// ── Elevation ────────────────────────────────────────────────
export const ELEVATION = {
  flat: 'none',
  soft: 'var(--shadow-soft)',
  premium: 'var(--shadow-premium)',
  elevated: 'var(--shadow-elevated)',
  hover: 'var(--shadow-hover)',
  ice: 'var(--shadow-ice)',
};

// ── Corner Radius ────────────────────────────────────────────
export const RADIUS = {
  sm: 'var(--radius-sm)',    // 8px
  md: 'var(--radius-md)',    // 12px
  lg: 'var(--radius-lg)',    // 16px
  xl: 'var(--radius-xl)',    // 20px
  '2xl': '1.5rem',           // 24px
  '3xl': '2.25rem',          // 36px
  pill: 'var(--radius-pill)', // 9999px
};

// ── Opacity ───────────────────────────────────────────────────
export const OPACITY = {
  transparent: 0,
  faint: 0.04,
  subtle: 0.06,
  light: 0.08,
  medium: 0.12,
  strong: 0.18,
  heavy: 0.28,
  opaque: 1,
};

// ── Blur ──────────────────────────────────────────────────────
export const BLUR = {
  none: 0,
  light: 12,
  standard: 20,
  strong: 32,
  heavy: 48,
  maximum: 72,
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
  paddingX: '20px',
  paddingTop: '24px',
  paddingBottom: '144px', // clears bottom nav
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
  hoverLift: -3,
  pressedScale: 0.985,
  transitionDuration: 150,
  springTransition: { type: 'spring', stiffness: 400, damping: 35 },
};

// ── Z-Index Scale ────────────────────────────────────────────
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

// ── Accent Colors (per experience domain) ────────────────────
export const ACCENT_COLORS = {
  academic: { hue: 221, sat: 83, light: 53, css: 'hsl(221 83% 53%)' },
  social: { hue: 251, sat: 90, light: 67, css: 'hsl(251 90% 67%)' },
  marketplace: { hue: 38, sat: 92, light: 50, css: 'hsl(38 92% 50%)' },
  wallet: { hue: 142, sat: 71, light: 45, css: 'hsl(142 71% 45%)' },
  research: { hue: 173, sat: 80, light: 40, css: 'hsl(173 80% 40%)' },
  settings: { hue: 220, sat: 9, light: 44, css: 'hsl(220 9% 44%)' },
};

// ── Responsive Breakpoints ────────────────────────────────────
export const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// ── Layout Modes ─────────────────────────────────────────────
export const LAYOUT = {
  phone: 'single-column',
  tablet: 'adaptive-dual',
  desktop: 'workspace',
};

// ── Touch Target (WCAG 2.1 AA) ────────────────────────────────
export const TOUCH_TARGET = {
  minimum: 44, // 44x44px minimum
  comfortable: 48,
  spacious: 56,
};