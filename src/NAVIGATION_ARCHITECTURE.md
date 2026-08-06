# UNIBUD Navigation Operating System — Architecture Documentation

## Overview

The UNIBUD Navigation OS (Milestone 2) establishes a single, consistent, intelligent navigation system for the entire platform. This document is the authoritative reference for how navigation is structured, implemented, and extended.

---

## Primary Destinations

The platform has **four visible tabs** in the navigation bar. Bud is **not** a tab.

| ID | Label | Route | Description |
|----|-------|-------|-------------|
| `square` | Square | `/square` | Global discovery — news, communities, trending, podcasts, movies, anime, sports, marketplace, events, challenges, creators |
| `quad` | Quad | `/quad` | Campus Operating System — academic + social campus life (courses, assignments, exams, study, clubs, events) |
| `connect` | Connect | `/connect` | Communication — messaging, calls, groups, study rooms, mentorship, networking |
| `me` | Me | `/me` | Personal Operating System — profile, identity, settings, wallet, achievements, notifications, **Bud Home** |

### Bud

Bud is **not a navigation tab**. Bud is an intelligence layer accessible through:

- **Me → Bud Home** (`/home`) — full Bud workspace
- **Command Bar** (Cmd/Ctrl+K, long-press) — ask Bud anything
- **Voice** — voice activation
- **Search** — universal search triggers Bud
- **Quick Actions** — contextual Bud suggestions

---

## File Map

```
src/lib/navigation/
├── registry.js                  # PRIMARY_DESTINATIONS — single source of truth for all 4 tabs
├── routeRegistry.js             # Every route with title, breadcrumb, deep-link pattern, auth flag
├── deepLinkRegistry.js          # Every deep-linkable entity (course, profile, community, etc.)
├── deepLinkHandler.js           # resolveDeepLink(), useDeepLink() hook
├── navigationStateManager.js    # Per-tab back-stack + scroll position (localStorage)
├── navigationAnalyticsStore.js  # Pure analytics functions (no JSX, importable in tests)
├── navigationAnalytics.jsx      # NavigationAnalyticsProvider + useNavigationAnalytics hook
├── navigationAnalytics.js       # Re-export facade (imports from both .jsx and Store)
├── navigationIntelligence.js    # Personalised ordering, ranked destinations, top routes
├── quickActions.js              # Context-aware quick actions for Command Bar + screens
└── adaptiveNavConfig.js         # Legacy compat — maps to PRIMARY_DESTINATIONS

src/lib/os/
└── NavigationContext.jsx        # NavigationProvider + useNavigation() hook (updated to 4-tab model)

src/components/layout/
├── PrimaryNavBar.jsx            # THE canonical bottom navigation bar (replaces MainTabBar + AdaptiveNav)
├── MainTabBar.jsx               # Re-export shim → PrimaryNavBar (backward compat)
└── AppShell.jsx                 # Authenticated shell — uses PrimaryNavBar, removes FloatingBudButton

src/components/navigation/
├── CommandBar.jsx               # Universal Command Bar (Cmd+K) + CommandBarProvider
├── AdaptiveNav.jsx              # Legacy — kept for reference, not rendered
├── QuickActionBar.jsx           # Screen-level quick actions
└── QuickActionCapsule.jsx       # Capsule variant of quick actions

src/hooks/
└── useNavigationState.js        # Wires navigationStateManager into React (used by AppShell)

tests/navigation/
├── registry.test.js
├── routeRegistry.test.js
├── deepLinkRegistry.test.js
├── deepLinkHandler.test.js
├── navigationStateManager.test.js
├── navigationAnalytics.test.js
├── navigationIntelligence.test.js
└── quickActions.test.js
```

---

## Key Architectural Decisions

### 1. Bud is not a tab
Per the product spec: *"Bud is NOT a floating button. Bud lives inside Me."* The `FloatingBudButton` is removed from `AppShell`. Bud is accessed through Me, the Command Bar, voice, and Quick Actions.

### 2. Single navigation bar
`PrimaryNavBar` is the only navigation bar. `MainTabBar` and `AdaptiveNav` are now either shims or legacy-only. No code should render multiple navigation bars.

### 3. Registry-driven routes
All routes are declared in `routeRegistry.js`. `App.jsx` uses these routes. Any new page must be added to the route registry first.

### 4. Navigation state is restorable
Every navigation state is persisted to `localStorage` via `navigationStateManager.js`. Per-tab back stacks allow the user to return to their position when switching tabs. Every state can be restored from a URL.

### 5. Deep links for every entity
`deepLinkRegistry.js` registers every addressable entity. Use `buildDeepLink(type, params)` to generate links and `useDeepLink().shareLink()` to share them via the Web Share API.

---

## Navigation Intelligence

Navigation learns from user behavior:

1. **`navigationAnalyticsStore.js`** — records every tab visit, route visit, and time-on-tab.
2. **`navigationIntelligence.js`** — computes frequency × recency scores to rank pages and destinations.
3. **`quickActions.js`** — generates context-aware, personalized quick actions for the Command Bar.

The intelligence layer refreshes on every navigation event — no server round-trip required.

---

## Command Bar

The Universal Command Bar (`CommandBar.jsx`) is the primary interface between the user and Bud on every screen.

### Triggering
- Keyboard: `Cmd+K` / `Ctrl+K`
- Programmatic: `useCommandBar().openCommandBar()`
- Search context: when `useSearch().searchOpen` becomes true

### Capabilities
- Universal search (powered by `useUniversalSearch`)
- Navigate to any page
- Create (new post, message, etc.)
- Ask Bud (opens BudSheet)
- Voice activation
- Recent pages (from NavigationIntelligence)
- Quick Actions (from `quickActions.js`)

### Provider
`CommandBarProvider` must be rendered inside `BudLauncherProvider` and `NavigationAnalyticsProvider`. It is already registered in `AppShell.jsx`.

---

## Deep Links

### Pattern
Every deep-linkable entity has:
- **Web path**: `/entity/id` (e.g. `/course/abc-123`)
- **Native scheme**: `unibud://entity/id` (e.g. `unibud://course/abc-123`)
- **Full URL**: `https://app.unibud.com/entity/id`

### Usage
```js
import { useDeepLink } from "@/lib/navigation/deepLinkHandler";

const { generateLink, shareLink } = useDeepLink();

// Generate a link
const path = generateLink("course", { courseId: "cs101" });
// → "/course/cs101"

// Share via Web Share API
await shareLink("course", { courseId: "cs101" }, { title: "CS 101" });
```

### Adding new entity types
Add an entry to `DEEP_LINK_ENTITIES` in `deepLinkRegistry.js`:
```js
{
  type: "my-entity",
  pattern: "/my-entity/:entityId",
  scheme: "unibud://my-entity/:entityId",
  title: "My Entity",
  ogTitle: (p) => `${p.name} — UNIBUD`,
  ogDescription: (p) => p.description || "View on UNIBUD",
}
```

---

## Adding New Pages

1. Add the route to `ROUTE_REGISTRY` in `routeRegistry.js`
2. Add the path to the correct destination's `subRoutes` in `registry.js`
3. If the entity is deep-linkable, add it to `DEEP_LINK_ENTITIES` in `deepLinkRegistry.js`
4. Add the `<Route>` to `App.jsx`

No new primary destinations may be created. Every page belongs to exactly one of the four destinations.

---

## Accessibility

- Touch targets: minimum 44×44px (`minHeight: 44px, minWidth: 44px`)
- `aria-current="page"` on the active tab
- `aria-label` on every tab and action button
- Keyboard navigation: Tab/Enter selects tabs; Command Bar supports ↑↓/Enter navigation
- Screen reader route announcements: handled by `ScrollToTop` component + document title updates
- Reduced motion: all Framer Motion transitions check `useMotion()` from the Motion Engine
- Focus management: focus moves to main content area on route change

---

## Performance

- All page components are lazily loaded (`React.lazy()`) — zero route-change bundle blocking
- Tab transitions: `opacity + y` spring animation (~200ms)
- Navigation analytics writes are fire-and-forget (no async blocking)
- Registry lookups are O(1) via `Map` / direct array lookup

---

## Testing

Run all navigation tests:
```bash
./node_modules/.bin/vitest run tests/navigation/
```

103 tests across 8 test files covering:
- Registry correctness
- Route resolution (exact + parameterized)
- Deep link generation and parsing
- State manager (back stack, scroll persistence)
- Analytics recording and clearing
- Intelligence scoring and ranking
- Quick Actions generation and de-duplication
- Deep link handler (web path, native scheme, external URL)
