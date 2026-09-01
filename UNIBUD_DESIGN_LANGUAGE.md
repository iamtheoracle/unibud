# UNIBUD MASTER DESIGN LANGUAGE & BRAND SYSTEM

> **The permanent visual identity for UNIBUD — The Future Starts Together.**
> Every screen, component, animation, icon, and future feature must inherit these rules.
> Never introduce a second design language.

---

## 0. GOVERNING PRINCIPLES

| Principle | Rule |
|---|---|
| Brand authority | The uploaded Brand Kit is the only source of truth for logo, mountain, gold, and typography. Never recreate or substitute. |
| One system | One color system, one type scale, one spacing grid, one glass system, one shadow system, one radius system, one icon family, one motion language — platform-wide. |
| Calm by default | Every surface, animation, and interaction must feel calm, premium, warm, and intelligent. Never institutional. Never overwhelming. |
| Accessibility-first | WCAG 2.2 AA minimum on every surface. Reduced-motion respected. Keyboard navigable. Screen-reader compatible. |
| Mission-driven | Every visual choice must help students feel more confident, organized, connected, or closer to their goals. If it doesn't, remove it. |
| No fake data | Never fabricate students, lecturers, content, or activity. Elegant empty states with onboarding guidance when real data doesn't exist yet. |
| Terminology | Never display "AI", "Artificial Intelligence", "Assistant", "Bot", "GPT", "LLM" or similar anywhere in the user experience. Bud is a trusted university friend. |

---

## 1. BRAND

### 1.1 Logo Usage

The official UNIBUD logo and mountain symbol are sacred. Rules:

- **Never redesign** the logo or mountain.
- **Never recreate** the logo in code, SVG approximation, or placeholder.
- **Never alter** proportions, spacing, or relationships.
- Use only **approved variations** provided in the Brand Kit.

### 1.2 Approved Logo Variations

| Variation | Background | Usage |
|---|---|---|
| **Primary (Full Color)** | Light surfaces | Default on white/light backgrounds |
| **Reversed (White)** | Dark surfaces, photos, colored backgrounds | Dark mode, hero sections, colored cards |
| **Monochrome (Black)** | White / ultra-light | Print, documents, monochrome contexts |
| **Monochrome (White)** | Dark / colored | Inverse monochrome |
| **University Theme** | Dynamic | Mountain recolored to university accent; UNIBUD wordmark stays unchanged |
| **App Icon** | N/A | System launcher icon — use Brand Kit exact asset |

### 1.3 Logo Clear Space & Minimum Sizes

- **Clear space:** Equal to the height of the mountain symbol on all sides.
- **Minimum width (digital):** 120px standard, 80px in navigation, 32px favicon.
- **Minimum width (print):** 25mm.
- Never place the logo on busy backgrounds without a solid or glass backdrop.

### 1.4 Brand Accent: Gold

Gold is UNIBUD's signature accent. It is used sparingly — for achievement, celebration, premium moments, and brand emphasis. It is never used for large fills.

- **Exact hex value:** To be confirmed from Brand Kit. System placeholder: `#C5A572` (warm muted gold).
- Gold appears on: achievement badges, streaks, premium tiers, success celebrations, the Bud sparkle accent, featured content markers.
- Gold never appears on: body text, large backgrounds, primary buttons (use Black), error states.

---

## 2. DESIGN PHILOSOPHY

UNIBUD is the operating system for university life. The design must feel like a cohesive ecosystem — calm, premium, modern, friendly, intelligent, warm, and minimal.

### 2.1 Personality Attributes

| Attribute | Design Expression |
|---|---|
| **Calm** | Generous whitespace, soft shadows, gentle motion, muted backgrounds, no aggressive colors |
| **Premium** | Liquid Glass surfaces, refined typography, gold accents, smooth animations, attention to detail |
| **Modern** | Glassmorphism, spring physics, shared-element transitions, adaptive layouts |
| **Friendly** | Warm copy, rounded corners, approachable iconography, encouraging tone, Bud's personality |
| **Intelligent** | Adaptive content, contextual suggestions, progressive disclosure, Bud's guidance woven throughout |
| **Warm** | Soft gradients, warm neutrals over cold grays, human-centered copy, supportive empty states |
| **Minimal** | One primary action per screen, clear hierarchy, remove the inessential, content over chrome |

### 2.2 Screen Principles

Every screen must immediately answer three questions:

1. **Where am I?** — Clear navigation context, page title, institution identity.
2. **What can I do?** — Primary actions visible and reachable within minimal interactions.
3. **What should I do next?** — Bud guidance, suggested actions, logical next steps.

Rules:
- No clutter. No unnecessary decoration. No inconsistent layouts.
- Maximum 1 primary action per view. Secondary actions are accessible but not competing.
- Three-zone information hierarchy on every dashboard/home screen: Context & Status → Primary Content → Supporting.

---

## 3. COLOR SYSTEM

### 3.1 Primary Palette

The UNIBUD identity is built on Black, White, and Gold.

#### Core Neutrals

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--unibud-black` | `#0A0A0B` | `#F5F5F7` | Primary text (light) / Primary text inverted (dark) |
| `--unibud-white` | `#FFFFFF` | `#0A0A0B` | Primary surfaces (light) / Primary surfaces (dark) |
| `--unibud-graphite` | `#1C1C1E` | `#2C2C2E` | Secondary text, navigation bars |
| `--unibud-silver` | `#86868B` | `#98989D` | Tertiary text, captions, placeholders |
| `--unibud-cloud` | `#F5F5F7` | `#1C1C1E` | Muted backgrounds, subtle surfaces |

#### Brand Accent: Gold Scale

Full 50–900 scale for the brand gold. Replace placeholder values with exact Brand Kit values.

| Step | Hex | Usage |
|---|---|---|
| 50 | `#FBF8F1` | Subtle gold tints, backgrounds |
| 100 | `#F5EDDB` | Badge backgrounds, hover states |
| 200 | `#EBDBB6` | Borders, dividers in gold contexts |
| 300 | `#DCC58B` | Icons on light gold |
| 400 | `#CDB063` | Interactive gold elements |
| 500 | `#C5A572` | **Primary brand gold** — achievements, Bud accent |
| 600 | `#B08D4F` | Pressed states, emphasis |
| 700 | `#8F703E` | Gold text on light backgrounds |
| 800 | `#6B542E` | Deep gold |
| 900 | `#4A3A20` | Maximum contrast gold |

### 3.2 Dynamic University Accent

Every university applies its official primary color as a dynamic accent throughout the interface — while the UNIBUD identity (logo, black, white, gold) remains unchanged.

**Implementation:**
- A single CSS variable `--university-accent` is set per institution at runtime.
- The full 50–900 scale is generated programmatically from the university's primary color using HSL manipulation (lighten/darken steps).
- University accent applies to: active navigation states, progress bars, schedule highlights, university-branded cards, institution headers.
- University accent never overrides: the logo, gold brand accent, semantic colors, or primary buttons (Black).

**Example:**
- University of Lagos → `--university-accent: #003366` (deep blue)
- University of Ibadan → `--university-accent: #4B0082` (indigo)
- Ahmadu Bello University → `--university-accent: #006400` (green)

### 3.3 Semantic Colors (Full 50–900 Scales)

Each semantic color has a complete scale. Only 500 is the "primary" usage; other steps are for backgrounds, borders, hover, pressed, and contrast adjustments.

#### Success (Academic Progress)

| Step | Hex |
|---|---|
| 50 | `#F0FDF4` |
| 100 | `#DCFCE7` |
| 200 | `#BBF7D0` |
| 300 | `#86EFAC` |
| 400 | `#4ADE80` |
| 500 | `#22C55E` |
| 600 | `#16A34A` |
| 700 | `#15803D` |
| 800 | `#166534` |
| 900 | `#14532D` |

#### Warning

| Step | Hex |
|---|---|
| 50 | `#FFFBEB` |
| 100 | `#FEF3C7` |
| 200 | `#FDE68A` |
| 300 | `#FCD34D` |
| 400 | `#FBBF24` |
| 500 | `#F59E0B` |
| 600 | `#D97706` |
| 700 | `#B45309` |
| 800 | `#92400E` |
| 900 | `#78350F` |

#### Error

| Step | Hex |
|---|---|
| 50 | `#FEF2F2` |
| 100 | `#FEE2E2` |
| 200 | `#FECACA` |
| 300 | `#FCA5A5` |
| 400 | `#F87171` |
| 500 | `#EF4444` |
| 600 | `#DC2626` |
| 700 | `#B91C1C` |
| 800 | `#991B1B` |
| 900 | `#7F1D1D` |

#### Information

| Step | Hex |
|---|---|
| 50 | `#EFF6FF` |
| 100 | `#DBEAFE` |
| 200 | `#BFDBFE` |
| 300 | `#93C5FD` |
| 400 | `#60A5FA` |
| 500 | `#3B82F6` |
| 600 | `#2563EB` |
| 700 | `#1D4ED8` |
| 800 | `#1E40AF` |
| 900 | `#1E3A8A` |

#### Academic Progress

| Step | Hex |
|---|---|
| 50 | `#F0F9FF` |
| 100 | `#E0F2FE` |
| 200 | `#BAE6FD` |
| 300 | `#7DD3FC` |
| 400 | `#38BDF8` |
| 500 | `#0EA5E9` |
| 600 | `#0284C7` |
| 700 | `#0369A1` |
| 800 | `#075985` |
| 900 | `#0C4A6E` |

#### Opportunities

| Step | Hex |
|---|---|
| 50 | `#F0FDFA` |
| 100 | `#CCFBF1` |
| 200 | `#99F6E4` |
| 300 | `#5EEAD4` |
| 400 | `#2DD4BF` |
| 500 | `#14B8A6` |
| 600 | `#0D9488` |
| 700 | `#0F766E` |
| 800 | `#115E59` |
| 900 | `#134E4A` |

#### Wellbeing

| Step | Hex |
|---|---|
| 50 | `#FDF4FF` |
| 100 | `#FAE8FF` |
| 200 | `#F5D0FE` |
| 300 | `#F0ABFC` |
| 400 | `#E879F9` |
| 500 | `#D946EF` |
| 600 | `#C026D3` |
| 700 | `#A21CAF` |
| 800 | `#86198F` |
| 900 | `#701A75` |

#### Notifications

| Step | Hex |
|---|---|
| 50 | `#FFF7ED` |
| 100 | `#FFEDD5` |
| 200 | `#FED7AA` |
| 300 | `#FDBA74` |
| 400 | `#FB923C` |
| 500 | `#F97316` |
| 600 | `#EA580C` |
| 700 | `#C2410C` |
| 800 | `#9A3412` |
| 900 | `#7C2D12` |

### 3.4 Dark Mode

Dark mode is not inverted light mode. It is a deliberately designed dark experience:

- **Background:** Deep graphite (`#0A0A0B`), not pure black (avoiding eye strain).
- **Surfaces:** Elevated layers use progressively lighter graphite (`#1C1C1E`, `#2C2C2E`).
- **Text:** Off-white (`#F5F5F7`) primary, silver (`#98989D`) secondary.
- **Glass:** Adjusted opacity and blur for dark glass (see Glass System).
- **Gold:** Steps 400–500 for visibility against dark.
- **Semantic:** Same hue, adjusted lightness for dark backgrounds (typically 400–500 range).
- **University accent:** Lightened 1–2 steps for contrast.

### 3.5 Accessibility

- All text/background combinations meet **WCAG 2.2 AA** (4.5:1 normal text, 3:1 large text).
- Interactive elements meet **3:1 contrast** against adjacent colors.
- Color is never the sole indicator of state — always pair with icon, label, or pattern.
- Focus rings use `--university-accent` at 500 step with 3px offset for visibility.
- Color-blind safe: semantic colors are distinguishable in protanopia, deuteranopia, and tritanopia simulations.

---

## 4. TYPOGRAPHY

### 4.1 Font Families

The official font families come from the Brand Kit. The system defines three roles:

| Role | Token | Usage |
|---|---|---|
| **Display** | `--font-display` | Hero numbers, large marketing, splash screens |
| **Heading** | `--font-heading` | Page titles, section headers, card titles, navigation |
| **Body** | `--font-body` | Paragraphs, descriptions, form text, all readable content |

*Placeholder families (replace with Brand Kit fonts): Inter (heading/display), DM Sans (body).*

### 4.2 Type Scale

| Style | Font Role | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| **Display** | Display | 48px / 3rem | 800 | 1.1 | -0.03em | Splash, hero numbers, onboarding |
| **Display Small** | Display | 32px / 2rem | 700 | 1.15 | -0.02em | Large stat numbers |
| **Heading 1** | Heading | 24px / 1.5rem | 700 | 1.25 | -0.02em | Page titles |
| **Heading 2** | Heading | 20px / 1.25rem | 700 | 1.3 | -0.01em | Section headers |
| **Heading 3** | Heading | 17px / 1.0625rem | 600 | 1.35 | -0.01em | Card titles |
| **Heading 4** | Heading | 15px / 0.9375rem | 600 | 1.4 | 0 | Subsections, list headers |
| **Body Large** | Body | 17px / 1.0625rem | 400 | 1.5 | 0 | Reading-optimized body |
| **Body** | Body | 15px / 0.9375rem | 400 | 1.55 | 0 | Default body text |
| **Body Small** | Body | 13px / 0.8125rem | 400 | 1.5 | 0 | Secondary descriptions |
| **Caption** | Body | 12px / 0.75rem | 500 | 1.4 | 0.01em | Timestamps, metadata, hints |
| **Micro** | Body | 10px / 0.625rem | 600 | 1.3 | 0.04em | Badges, overlines, labels |
| **Button** | Heading | 15px / 0.9375rem | 600 | 1.0 | 0.01em | Button labels |
| **Navigation** | Heading | 11px / 0.6875rem | 600 | 1.2 | 0.02em | Bottom nav, tab labels |
| **Number** | Display | Variable | 700 | 1.0 | -0.02em | Stats, grades, counts (tabular-nums) |

### 4.3 Rules

- Headings use tight tracking (negative letter spacing) for a premium, compact feel.
- Body uses normal tracking with generous line height for readability.
- Numbers use `font-variant-numeric: tabular-nums` so they align in columns.
- Maximum line length for reading: 65–75 characters. Beyond that, constrain width.
- Font weights limited to: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold). No thin/light in UI.
- Text is never fully justified. Always left-aligned (RTL languages mirror).
- Minimum font size in the interface: 10px (micro/overline only). Body text minimum: 13px.

---

## 5. SPACING SYSTEM

Everything follows the 4px base grid. No arbitrary values.

| Token | Value | Usage |
|---|---|---|
| `space-0` | 0px | No spacing |
| `space-1` | 4px | Tight gaps: icon-text, badge padding |
| `space-2` | 8px | Small gaps: between related items |
| `space-3` | 12px | Card internal padding (compact) |
| `space-4` | 16px | Card padding (default), list item gaps |
| `space-5` | 20px | Section internal padding |
| `space-6` | 24px | Screen horizontal padding, section gaps |
| `space-8` | 32px | Large section gaps |
| `space-10` | 40px | Major section separation |
| `space-12` | 48px | Hero section padding |
| `space-16` | 64px | Page-level vertical rhythm |
| `space-24` | 96px | Splash / onboarding spacing |

### Rules

- All padding, margin, gap, and positioning values must use these tokens.
- Component internal padding scales with density: compact = 12px, default = 16px, comfortable = 20px.
- Screen horizontal padding: 24px (mobile), 32px (tablet), 48px (desktop).
- Vertical rhythm between sections: 32px default, 48px for major breaks.

---

## 6. GLASS SYSTEM (Liquid Glass)

Premium Liquid Glass with four levels of intensity. Glass should feel subtle — never overpower readability.

### 6.1 Glass Levels

| Level | Name | Blur | Background Opacity | Border | Shadow | Usage |
|---|---|---|---|---|---|---|
| **1** | Subtle | 12px | 55% white | 1px / 30% white | 0 4px 16px rgba(0,0,0,0.04) | Inline cards, list items, secondary surfaces |
| **2** | Standard | 20px | 72% white | 1px / 50% white | 0 8px 32px rgba(0,0,0,0.06) | Default cards, content containers, modals |
| **3** | Strong | 28px | 85% white | 1px / 60% white | 0 8px 40px rgba(0,0,0,0.08) | Navigation bars, floating elements, command dock |
| **4** | Frosted | 40px | 92% white | 1px / 70% white | 0 12px 48px rgba(0,0,0,0.10) | Overlays, bottom sheets, full-screen dialogs |

### 6.2 Dark Mode Glass

| Level | Background Opacity | Border |
|---|---|---|
| 1 Subtle | 55% `#1C1C1E` | 1px / 20% white |
| 2 Standard | 72% `#2C2C2E` | 1px / 15% white |
| 3 Strong | 85% `#1C1C1E` | 1px / 12% white |
| 4 Frosted | 92% `#0A0A0B` | 1px / 10% white |

### 6.3 Reflection & Depth

- **Reflection:** A subtle top-edge 1px gradient highlight (from 60% white to transparent) simulates light hitting glass.
- **Elevation mapping:** Glass level correlates with visual elevation. Higher glass = more prominent = more shadow.
- **Background interaction:** Glass surfaces blur whatever is behind them. Content behind glass must not be busy or distracting.
- **Readability rule:** Text on glass must always meet contrast standards. If it doesn't, increase opacity or use solid background.

---

## 7. SHADOW SYSTEM

| Token | Value | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Hairline depth on flat cards |
| `shadow-sm` | `0 2px 8px rgba(0,0,0,0.05)` | Default cards, list items |
| `shadow-md` | `0 4px 16px rgba(0,0,0,0.06)` | Elevated cards on hover, dropdowns |
| `shadow-lg` | `0 8px 32px rgba(0,0,0,0.08)` | Modals, popovers, floating panels |
| `shadow-xl` | `0 12px 48px rgba(0,0,0,0.10)` | Full-screen dialogs, major overlays |
| `shadow-floating` | `0 8px 32px rgba(0,0,0,0.12)` | Floating action buttons, command dock |
| `shadow-hero` | `0 16px 64px rgba(0,0,0,0.12)` | Hero sections, splash elements |
| `shadow-popup` | `0 4px 24px rgba(0,0,0,0.10)` | Tooltips, toast notifications |
| `shadow-nav` | `0 -2px 16px rgba(0,0,0,0.06)` | Bottom navigation bar |
| `shadow-card` | `0 2px 12px rgba(0,0,0,0.04)` | Standard content cards |
| `shadow-bud` | `0 0 32px rgba(197,165,114,0.20), 0 8px 32px rgba(0,0,0,0.06)` | Bud elements — soft gold glow + standard shadow |

### Dark Mode Shadows

Shadows are less visible on dark backgrounds. In dark mode, increase opacity by ~50% and use darker rgba values (`rgba(0,0,0,0.20)`–`0.40`). Rely more on surface elevation (lighter graphite) than shadow for depth perception.

---

## 8. BORDER RADIUS SYSTEM

| Token | Value | Usage |
|---|---|---|
| `radius-none` | 0px | Full-bleed images, dividers |
| `radius-sm` | 8px | Badges, tags, small chips |
| `radius-md` | 12px | Inputs, small buttons, toggles |
| `radius-lg` | 16px | Standard cards, medium buttons |
| `radius-xl` | 20px | Large cards, content containers |
| `radius-2xl` | 24px | Hero cards, feature blocks |
| `radius-3xl` | 32px | Bottom sheets, large dialogs |
| `radius-full` | 9999px | Pills, avatars, FABs, circular elements |

### Mapping

| Element | Radius |
|---|---|
| Buttons (default) | `radius-lg` (16px) |
| Buttons (pill) | `radius-full` |
| Cards | `radius-lg` (16px) or `radius-xl` (20px) |
| Inputs | `radius-md` (12px) |
| Images | `radius-lg` (16px) |
| Avatars | `radius-full` |
| Bottom Sheets | `radius-3xl` (32px) top corners |
| Dialogs | `radius-2xl` (24px) |
| Navigation Bar | `radius-2xl` (24px) |
| Pills / Chips | `radius-full` |
| Badges | `radius-sm` (8px) or `radius-full` |

---

## 9. ICONOGRAPHY

### 9.1 Icon Family

One unified **outline** icon family. Consistent stroke weight, corner radius, and optical sizing across the entire platform.

- **Style:** Outline (stroke-based), rounded line caps, rounded line joins.
- **Stroke width:** 1.75px (default), 2px (active/emphasis), 1.5px (dense/small contexts).
- **Optical size:** 24px base. Rendered at 16px–32px depending on context.
- **Corner style:** Slightly rounded (2px corner radius on geometric forms).
- **Implementation:** Lucide React (installed) as the base family. Custom UNIBUD-specific icons (mountain, campus-specific) designed to match Lucide's stroke style.

### 9.2 Required Icons

#### Navigation
Home, Campus (mountain), Quad (compass), Connect (users), Me (user), Search, Notifications (bell), Settings (gear)

#### Academic
Course (book-open), Assignment (file-text), Calendar, Results (bar-chart), Grade (award), Exam (clipboard), Timetable (layout-grid), Lecture (presentation), Lab (flask), Tutorial (lightbulb)

#### Opportunities
Scholarship (graduation-cap), Internship (briefcase), Job (suitcase), Competition (trophy), Research (microscope), Exchange (globe), Grant (hand-coins), Fellowship (medal), Mentorship (users-round), Volunteering (heart-handshake)

#### Campus Life
Marketplace (shopping-bag), Events (calendar-days), Community (users-round), Club (users), Gaming (gamepad), Entertainment (music), News (newspaper), Achievement (trophy), Poll (bar-chart-3), Post (message-square)

#### Communication
Message (message-circle), Voice (mic), Camera (camera), Send, Share (share-2), Bookmark, Like (heart), Comment (message-square)

#### Utilities
Location (map-pin), Library (library), Transport (bus), Housing (home), Health (heart-pulse), Emergency (shield-alert), Wallet (wallet), Notes (notebook-pen), Flashcards (layers), Mind Map (git-fork), Quiz (circle-help)

#### Actions
Add (plus), Edit (pencil), Delete (trash), Download, Upload, Filter, Sort (arrow-up-down), More (more-horizontal), Close (x), Check, Chevron Right/Left/Up/Down, Arrow Right/Left/Up/Down

### 9.3 Icon Usage Rules

- Icons are always paired with labels in navigation and primary actions.
- Icon-only buttons must have `aria-label` for accessibility.
- Icon color inherits from text color by default. Semantic colors override for status indication.
- Never mix icon families (no filled icons alongside outline icons).
- Icon size is consistent within a context: 16px in dense lists, 20px in cards, 24px in navigation, 32px in feature highlights.

---

## 10. COMPONENT SYSTEM

Every component inherits the design system: color tokens, type scale, spacing grid, glass levels, shadows, and radius. Components are built as small, focused, reusable units.

### 10.1 Core Components

| Component | Description |
|---|---|
| **Button** | Primary (Black), Secondary (Glass), Tertiary (Text), Destructive (Error), Gold (Achievement). Sizes: sm, md, lg. Loading state with spinner. |
| **Card** | GlassCard with 4 levels. Props: variant, onClick, padding. Hover state: lift + shadow-md. |
| **Input** | Text, search, textarea, OTP. Glass background, radius-md, focus ring (university accent). |
| **Search** | Universal search bar with icon, voice button, suggestions dropdown. |
| **List** | Scrollable list with dividers, optional avatars, trailing actions, swipe actions. |
| **Badge / Status Badge** | Semantic status pills. Color-mapped to status value. |
| **Avatar** | Circular, supports image or initials fallback. Size scale: xs(24) to xl(64). |
| **Pill / Chip** | Removable filter chips, category tags. |
| **Tabs** | Segmented control or scrollable pill tabs. Active indicator with spring animation. |
| **Dialog / Modal** | Glass level 4, radius-2xl, backdrop blur, spring entrance. |
| **Bottom Sheet** | Radius-3xl top, drag handle, snap points, glass level 4. |
| **Toast / Snackbar** | Glass level 3, radius-full or radius-lg, auto-dismiss, swipe to dismiss. |
| **Progress** | Linear and circular. University accent or semantic color. Animated fill. |
| **Skeleton** | Shimmer placeholder matching component layout. |
| **Empty State** | Icon + title + description + CTA. Never shows fake data. Guides user to next action. |
| **Section Header** | Title + subtitle + optional action link. Icon optional. |

### 10.2 Domain-Specific Card Components

| Component | Content |
|---|---|
| **Feed Card** | Author, content, media, tags, poll, reactions, comments |
| **Profile Card** | Avatar, name, role, department, mutual connections, connect button |
| **Weather Card** | Temperature, condition icon, mini forecast |
| **Schedule Card** | Course code, title, time, location, "NOW" indicator, color bar |
| **Assignment Card** | Title, course, due date, priority badge, checkbox, status |
| **Exam Card** | Title, date, time, location, countdown, preparation progress |
| **Scholarship Card** | Title, organization, amount, deadline, eligibility tags, save button |
| **Job Card** | Title, company, salary, location, type, deadline, apply button |
| **Marketplace Card** | Image/placeholder, title, price, condition, seller, rating, verified badge |
| **Community Card** | Icon, name, members count, category, join button |
| **Event Card** | Image, title, date, location, attendee count, RSVP |
| **Notification Card** | Type icon, title, message, time, read/unread indicator |
| **GPA Card** | Circular progress, GPA value, scale, classification, stat breakdown |
| **Streak Card** | Day grid, streak count, trend indicator |
| **Bud Card** | Gold-accented glass card with Bud's avatar, tip/recommendation, CTA |
| **Opportunity Card** | Type icon, title, org, amount, location, deadline, tags, save |
| **Course Card** | Color bar, code, title, lecturer, progress bar, credits |

### 10.3 Component Rules

- Every card has: a loading skeleton, an empty state, and an error state.
- Cards never hardcode colors — they consume design tokens.
- Card interactivity: hover lifts 2px with shadow-md. Press scales to 0.98. Release springs back.
- List items are swipeable on touch (reveal actions).
- All interactive elements have minimum 44×44px touch target.

---

## 11. MOTION SYSTEM

Animations feel like modern Apple software: natural, fast, purposeful, smooth. Never decorative for decoration's sake.

### 11.1 Motion Tokens

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `instant` | 100ms | `ease-out` | Micro-interactions, color changes |
| `quick` | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Toggles, tabs, small state changes |
| `standard` | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Default transitions, card hover |
| `smooth` | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Content entrance, page transitions |
| `deliberate` | 500ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Major content reveals, modals |
| `spring` | 400ms | Spring: stiffness 300, damping 26 | Bouncy elements, FAB, dock |

### 11.2 Animation Types

| Type | Implementation | Usage |
|---|---|---|
| **Fade** | opacity 0→1, `smooth` | Default entrance for all content |
| **Slide** | translateY 12px→0 + fade, `smooth` | List items, cards, sections staggered |
| **Scale** | scale 0.96→1 + fade, `smooth` | Buttons, cards, modals |
| **Shared Element** | Framer Motion `layoutId` | Navigation transitions, active tab indicator |
| **Hero Transition** | Framer Motion shared layout | Image or title from card to detail page |
| **Spring** | Framer Motion spring physics | FAB, command dock, interactive elements |
| **Stagger** | Sequential delay 50ms per item | List rendering, grid entrance |

### 11.3 Motion Rules

- **Page transitions:** Fade + slide-up (12px), 300ms.
- **Card entrance:** Stagger by 50ms, each fades and slides up 12px.
- **Modal/Dialog:** Scale 0.95→1 + fade, spring physics.
- **Bottom Sheet:** Slide up from bottom, spring physics, drag-to-dismiss.
- **Tab indicator:** Shared element layout animation (spring).
- **Pull to refresh:** Native-feeling spring with custom spinner.
- **Bud typing indicator:** Three dots bouncing with 150ms stagger.
- **Achievement celebration:** Confetti burst (canvas-confetti) in gold + university accent.

### 11.4 Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- All animations reduce to instant opacity changes only (100ms fade).
- No slides, scales, springs, or parallax.
- Confetti and celebration animations are disabled.
- Page transitions become cross-fades.

---

## 12. BUD IDENTITY

Bud is not an AI. Bud is a trusted university friend. Bud's visual presence is woven throughout the platform.

### 12.1 Bud Visual Identity

- **Avatar:** A warm, friendly abstract form (not a robot). Uses the gold brand accent gradient with a subtle mountain motif.
- **Color signature:** Gold accent (`#C5A572`) with soft gold glow (`shadow-bud`).
- **Presence indicator:** Green dot (online) / Gold dot (thinking) / Gray dot (offline).
- **Sparkle:** A subtle sparkle icon marks Bud-powered suggestions throughout the app.

### 12.2 Bud Personality

- Speaks naturally in simple English.
- Is patient, encouraging, and warm.
- Teaches using stories, analogies, diagrams, sketches, quizzes, flashcards, mind maps, and real-world examples.
- Adapts to every student's learning style.
- Never uses technical terminology (AI, model, prompt, etc.).
- Appears as: daily tips, study suggestions, deadline reminders, concept explanations, quiz generation, schedule planning, and motivational support.

### 12.3 Bud Touchpoints

| Location | Bud's Role |
|---|---|
| Home Dashboard | Daily tip card, study recommendation, next-action suggestion |
| Course Page | Concept explanation, study tips, practice quiz suggestion |
| Assignment Detail | Step-by-step guidance, resource suggestions |
| Schedule | Study plan suggestions, preparation reminders |
| Deadline Card | "Study with Bud" CTA |
| Dedicated Bud Page | Full conversation: tutoring, guidance, study planning |
| Notifications | Bud-sourced reminders and encouragement |
| Empty States | Bud guidance on what to do next |

---

## 13. ADAPTIVE LAYOUT PRINCIPLES

UNIBUD must adapt perfectly to every device. Layouts are designed per screen size, not stretched.

| Breakpoint | Width | Layout Strategy |
|---|---|---|
| **Mobile** | < 640px | Single column, bottom navigation, command dock, full-width cards |
| **Tablet** | 640–1024px | Two-column where appropriate, bottom nav or sidebar, wider cards |
| **Desktop** | 1024–1440px | Multi-column, sidebar navigation, grid layouts, expanded content |
| **Large** | > 1440px | Max-width container, multi-column grids, generous whitespace |

Rules:
- Mobile is the primary canvas. Every screen is designed mobile-first.
- Tablet and desktop are not stretched mobile — they use genuinely different layouts.
- Navigation transforms: bottom nav (mobile) → sidebar (tablet/desktop).
- Cards reflow into grids at larger breakpoints.
- Touch targets: 44px minimum on touch devices.
- Desktop supports keyboard shortcuts and hover states.

---

## 14. EMPTY STATES & ONBOARDING

When no real data exists, UNIBUD shows elegant empty states — never fake content.

### Empty State Structure

1. **Illustration/Icon** — Large, warm, on-brand icon or illustration.
2. **Title** — Clear, friendly statement of the situation.
3. **Description** — Brief explanation and encouragement.
4. **Bud Guidance** — What Bud suggests doing next.
5. **Primary CTA** — The action that creates the first data (add course, join community, start studying with Bud).

### Onboarding Principles

- Progressive: reveal features as the student needs them, not all at once.
- Guided: Bud walks students through their first interaction with each module.
- Optional: never block access to the platform behind forced onboarding.
- Preserves guest data: if a guest registers, their Bud conversations carry over.

---

## 15. FINAL GOVERNING RULES

1. **This is the only design language.** Every future screen, feature, animation, icon, card, and component inherits these rules automatically.
2. **Never introduce a second design language.**
3. **The logo, mountain, gold, and typography are sacred** — sourced only from the Brand Kit.
4. **Calm, premium, warm, intelligent, minimal** — if a design choice doesn't reinforce these, remove it.
5. **Accessibility is non-negotiable** — WCAG 2.2 AA, reduced motion, keyboard, screen reader.
6. **No fake data** — empty states with guidance, always.
7. **No "AI" terminology** — Bud is a friend, not a bot.
8. **One source of truth** — one color system, one type scale, one spacing grid, one everything.
9. **UNIBUD is instantly recognizable without the logo** — through its calm glass surfaces, gold accents, warm neutrals, and purposeful motion.
10. **The mission never changes: help every student succeed.**

> **The Future Starts Together.**