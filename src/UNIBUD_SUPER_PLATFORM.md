# UNIBUD — Super Platform Layer

**Scope:** Consolidate every shared platform service behind one clean, reusable interface (`Realm`). Reuse existing implementations; create only the missing services. No UI changes. No Orbit.

**Gateway:** `import { Realm } from "@/lib/realm"` — the single surface every app module consumes instead of talking to Base44 or individual infra modules directly.

---

## 1. Existing services reused (no changes)

These were already exposed on `Realm` as clean factory interfaces and are reused as-is:

| Service | Interface | Delegates to |
|---|---|---|
| Authentication | `Realm.auth` | Base44 Auth SDK + `AuthContext` |
| Notifications | `Realm.notifications` | `Notification` entity + `budNotificationEngine` |
| Search | `Realm.search` | `studentSearch` backend fn + faceted client |
| File storage | `Realm.storage` | `UploadFile` / `UploadPrivateFile` / `CreateFileSignedUrl` |
| Media management | `Realm.media` | media integrations + `Image` pipeline |
| Analytics | `Realm.analytics` | `base44.analytics.track` (privacy opt-out) |
| Audit logs | `Realm.governance.audit` / `auditList` / `securityEvent` | `AuditLog` + `SecurityEvent` entities |
| API gateway | `Realm` itself | `base44Client` is the transport; `Realm` is the app-level gateway |

`profile` and `ai` (Spark) also remain on `Realm` unchanged.

---

## 2. New services created

Eight thin facade modules, each delegating to an existing implementation (no reimplementation):

| Service | Interface | File | Delegates to |
|---|---|---|---|
| Authorization / permissions | `Realm.authz` | `lib/realm/authz.js` | `lib/admin/roles.js` (ADMIN_ROLES, surfaces, ownership) |
| Realtime communication | `Realm.realtime` | `lib/realm/realtime.js` | `base44.entities.<Name>.subscribe()` + `query-client` invalidation |
| Background jobs | `Realm.jobs` | `lib/realm/jobs.js` | `Automation` / `AutomationRun` entities + `runAutomation` backend fn |
| Scheduling | `Realm.scheduling` | `lib/realm/scheduling.js` | `CalendarEvent` / `OfficeHoursBooking` + `googleCalendarSync` fn |
| Crash reporting | `Realm.crash` | `lib/realm/crash.js` | `lib/production/logger.js` + `CrashReport` entity |
| Feature flags | `Realm.featureFlags` | `lib/realm/featureFlags.js` | `PlatformModule` entity + `PLATFORM_MODULES` fallback |
| Caching | `Realm.cache` | `lib/realm/cache.js` | `queryClientInstance` + invalidation helpers |
| Shared configuration | `Realm.config` | `lib/realm/config.js` | `platformIntelligence` + services/engines/registries catalogs |

---

## 3. Shared interfaces added

All exposed through the single `Realm` gateway (`src/lib/realm/index.js`):

```js
Realm.authz.getRole(user) | hasRole(user, role) | canAccess(user, surface) | accessibleSurfaces(user) | owns(record, userId)
Realm.realtime.subscribe(entityName, handler) | invalidate(entityName) | invalidateAll() | setQueryData(entityName, updater) | getQueryData(key)
Realm.jobs.list() | get(id) | run(automationId, input) | runs(automationId) | logRun(entry)
Realm.scheduling.listEvents() | createEvent(data) | updateEvent(id, data) | deleteEvent(id) | bookOfficeHours(slotId, data) | syncGoogleCalendar(payload)
Realm.crash.report(error, context) | captureMessage(msg, context) | init() | flush() | logger
Realm.featureFlags.isEnabled(key) | getModule(key) | list() | refresh()
Realm.cache.invalidate(entityName) | invalidateAll() | set(entityName, updater) | get(key) | prefetch(key, fn) | remove(key)
Realm.config.app | services() | getService(id) | engines() | getEngine(id) | registries() | getRegistry(id) | intelligence() | report()
```

Existing `Realm.*` interfaces (auth, email, notifications, profile, ai, governance, storage, media, search, analytics) are unchanged.

---

## 4. Remaining platform services

Genuinely absent and out of scope for this pass (no existing implementation to delegate to):

| Service | Status | Note |
|---|---|---|
| Push notifications (device-level) | In development | Browser Notification API + `useBudPush` exist; requires explicit device-permission opt-in flow. |
| Voice / video calls (WebRTC) | Dead-end | No real-time media backend in current Base44 runtime. Revisit only if a media backend is introduced. |
| E2E transport encryption | Dead-end | Not implementable on the current BaaS transport; client-side AES-GCM field encryption (`crypto.js`) covers PII at rest. |
| Service worker / offline sync engine | Missing | No service worker registered; offline is limited to react-query cache. |

Orbit was intentionally **not** implemented, per instruction.