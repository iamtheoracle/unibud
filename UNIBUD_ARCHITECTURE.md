# UNIBUD SYSTEM ARCHITECTURE

> **The scalable foundation for a platform serving millions of students, lecturers, universities, and educational organizations worldwide.**
> One connected ecosystem. One source of truth. No future redesign required.

---

## 0. ARCHITECTURE PRINCIPLES

| Principle | Rule |
|---|---|
| Modular | Every feature belongs to one module. Modules communicate through clean APIs and shared services. |
| Scalable | The architecture supports millions of users without structural redesign. |
| Single source of truth | One navigation system, one notification system, one permission system, one search engine, one settings system. |
| No duplication | Never duplicate business logic, pages, APIs, settings, permissions, or workflows. |
| Reusable | Components, services, APIs, and data models are designed for reuse. |
| Secure | Enterprise-grade security at every layer. |
| Observable | Full monitoring, logging, and health dashboards. |
| Resilient | Offline-first, autosave, sync-on-reconnect. Never lose user data. |
| Global | Multilingual, multi-currency, multi-calendar, multi-grading, timezone-aware. Never assume one country or curriculum. |
| Mission-driven | Every feature must help students succeed. If it doesn't, remove it. |

---

## 1. PLATFORM ROLES & ACCESS CONTROL

### 1.1 Role Hierarchy

| Role | Scope | Capabilities |
|---|---|---|
| **Oracle** (Platform Admin) | Global platform | Full platform administration. Activates/suspends universities. Manages global settings, feature registry, security, audit logs. |
| **University Admin** | Single institution | Manages their university only (after activation by Oracle). Manages faculties, departments, programmes, courses, staff, students, campus settings. Cannot access other universities or platform-level controls. |
| **Lecturer** | Assigned courses/department | Manages courses, assignments, grades, announcements within their department/courses. Cannot modify university settings. |
| **Student** | Enrolled programmes | Accesses enrolled courses, assignments, campus communities, marketplace, opportunities. |
| **Guest** | Platform-wide (limited) | Experiences StudyBuddy with usage limits. Conversations preserved on registration. No campus access. |

### 1.2 Permission System

- **Centrally managed** — all permissions defined in one registry.
- **Inherited** — a role inherits all permissions from its parent in the hierarchy.
- **Scope-bound** — permissions are always scoped (platform / university / department / course / personal).
- **Module-aware** — feature registry controls which modules' permissions are active per institution.
- **Immutable audit** — every permission change is logged in the audit trail.

### 1.3 Authentication

Supported methods (layered, not exclusive):

| Method | Description |
|---|---|
| **Guest access** | Browse and use StudyBuddy with rate-limited usage. No account required. Conversations stored locally + synced on registration. |
| **Email + Password** | Standard registration with email verification (OTP). |
| **Phone Number** | Phone-based registration with SMS OTP verification. |
| **Google OAuth** | Social sign-in. |
| **Apple Sign-In** | Social sign-in (iOS). |
| **Passkeys** | Passwordless authentication using device biometrics/secure enclave. |
| **Biometrics** | Face ID / Touch ID / fingerprint for device unlock (after initial auth). |
| **Trusted Devices** | Device fingerprinting and trust management. New device triggers verification. |
| **2FA** | Two-factor authentication via OTP (SMS/email/authenticator) for sensitive operations. |

### 1.4 Guest → Registered User Flow

1. Guest uses StudyBuddy with limits (e.g., 10 conversations/day).
2. Guest conversations are stored locally (IndexedDB) and in a temporary server-side guest session.
3. On registration, guest conversations are migrated to the new user account.
4. Guest is prompted to register when approaching limits or attempting campus-specific features.

---

## 2. DATA MODEL ARCHITECTURE

The database schema is designed for long-term growth. Every entity has built-in fields: `id`, `created_date`, `updated_date`, `created_by_id`. New modules add entities without modifying existing ones.

### 2.1 Core Identity Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **User** (built-in) | Platform user | email, full_name, role, university_id, department_id, programme_id, level, avatar, locale, timezone, currency |
| **University** | Institution record | name, short_name, logo_url, accent_color, country, city, address, website, accreditation_status, is_active, activated_date, settings |
| **Faculty** | Academic faculty | university_id, name, dean_name, description |
| **Department** | Academic department | faculty_id, name, hod_name, description |
| **Programme** | Degree programme | department_id, name, code, duration_years, degree_type, grading_system, calendar_system |
| **Enrollment** | Student enrollment in a programme | user_id, programme_id, level, status, enrollment_date, expected_graduation |
| **StaffAssignment** | Lecturer assignment | user_id, department_id, role (lecturer/HOD/dean), courses[] |

### 2.2 Academic Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **Course** | Academic course | title, code, department_id, programme_id, credits, semester, lecturer_id, description, syllabus, status |
| **CourseEnrollment** | Student enrolled in course | user_id, course_id, semester, status, grade, progress |
| **TimetableEntry** | Class schedule | course_id, day, start_time, end_time, location, type, lecturer_id, semester |
| **Assignment** | Course assignment | course_id, title, description, due_date, type, max_grade, status, attachments[] |
| **Submission** | Student submission | assignment_id, user_id, content, submitted_date, grade, feedback, status |
| **Exam** | Examination | course_id, title, date, duration, location, total_marks, semester |
| **Grade** | Grade record | user_id, course_id, semester, grade, grade_point, credits, gpa_contribution |
| **AcademicRecord** | Transcript entry | user_id, programme_id, semester, courses[], gpa, cgpa, academic_standing |

### 2.3 Campus Life Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **Community** | Campus community/club | university_id, name, description, category, type, members_count, icon, is_official, is_active |
| **CommunityMember** | Membership | community_id, user_id, role (member/moderator/admin), joined_date |
| **Post** (QuadPost) | Social feed post | author_id, university_id, community_id, content, type, media_urls[], tags[], likes_count, comments_count, is_pinned, is_approved |
| **Comment** | Post comment | post_id, author_id, content, parent_comment_id, likes_count |
| **Reaction** | Like/react | target_id, target_type, user_id, type |
| **Event** | Campus event | university_id, title, description, start_date, end_date, location, organizer_id, capacity, attendees[], type |
| **EventRSVP** | Event attendance | event_id, user_id, status (going/maybe/declined) |

### 2.4 Communication Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **Conversation** | Direct message thread | participants[], type (direct/group), last_message_id |
| **Message** | Individual message | conversation_id, sender_id, content, type (text/image/file/voice), attachments[], read_by[], sent_date |
| **BudConversation** | StudyBuddy conversation | user_id, title, messages[], context, course_code, type, is_guest (for pre-registration) |

### 2.5 Productivity Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **Note** | Student note | user_id, title, content, course_id, tags[], is_pinned, is_offline, last_synced |
| **Flashcard** | Study flashcard | user_id, course_id, front, back, deck_id, difficulty, last_reviewed, next_review (spaced repetition) |
| **FlashcardDeck** | Flashcard collection | user_id, course_id, name, card_count |
| **MindMap** | Visual study map | user_id, course_id, title, nodes[], edges[], is_offline |
| **StudySession** | Study tracking | user_id, course_id, start_time, end_time, duration, focus_score |
| **StudyStreak** | Streak tracking | user_id, current_streak, longest_streak, last_study_date, history[] |

### 2.6 Opportunities & Career Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **Opportunity** | Scholarship/internship/job/etc. | title, organization, type, description, deadline, location, amount, eligibility, link, tags[], scope (university/global) |
| **SavedOpportunity** | Bookmark | user_id, opportunity_id, saved_date |
| **Application** | Track applications | user_id, opportunity_id, status, submitted_date, documents[] |
| **JobListing** | Career job | title, company, salary, location, type, requirements, deadline, application_link |
| **Internship** | SIWES/internship | title, organization, duration, start_date, end_date, supervisor, report_due, status |

### 2.7 Marketplace Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **MarketplaceListing** | Buy/sell item | title, description, price, currency, category, condition, images[], seller_id, status, location, is_verified |
| **MarketplaceTransaction** | Purchase record | listing_id, buyer_id, seller_id, price, currency, status, completed_date |

### 2.8 Finance Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **Wallet** | Student wallet | user_id, balance, currency, transactions[] |
| **Transaction** | Wallet transaction | wallet_id, type (credit/debit), amount, description, category, reference_id, status |
| **StudentLoan** | Loan record | user_id, provider, amount, currency, status, disbursement_date, repayment_start |
| **ScholarshipAward** | Awarded scholarship | user_id, opportunity_id, amount, currency, status, awarded_date |

### 2.9 Campus Services Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **TransportRoute** | Campus transport | university_id, route_name, stops[], schedule, vehicle_type |
| **TransportSchedule** | Transport timetable | route_id, day, departure_times[] |
| **Accommodation** | Housing listing | university_id, title, type, price, currency, location, amenities[], images[], status |
| **LibraryResource** | Library item | university_id, title, author, isbn, category, available_copies, total_copies, location |

### 2.10 System Entities

| Entity | Purpose | Key Fields |
|---|---|---|
| **Notification** | Platform notification | user_id, title, message, type, is_read, link, icon, created_date |
| **AuditLog** | Immutable audit trail | actor_id, action, target_type, target_id, changes{}, ip_address, user_agent, timestamp |
| **FeatureRegistry** | Module registry | module_name, is_enabled, university_id (null = global), enabled_date, disabled_date, config{} |
| **Setting** | Platform/institution setting | scope (platform/university/user), key, value, category |
| **Integration** | Third-party integration | name, type, credentials_ref, scopes[], status, university_id |
| **SearchIndex** | Unified search index | entity_type, entity_id, university_id, content, tags[], weight, updated_date |
| **AnalyticsEvent** | Usage analytics | user_id, event_name, properties{}, university_id, timestamp |
| **DeviceSession** | Trusted device | user_id, device_fingerprint, device_name, is_trusted, last_active, ip_address |

---

## 3. API ARCHITECTURE

### 3.1 Standards

| Standard | Rule |
|---|---|
| **Versioning** | All APIs versioned (`/v1/`, `/v2/`). Old versions maintained with deprecation notices. |
| **REST + GraphQL** | REST for CRUD operations. GraphQL for complex queries (aggregated dashboards, flexible filtering). |
| **Validation** | Every request validated server-side. Schema-based (Zod). Invalid requests return 400 with field-level errors. |
| **Authorization** | Every endpoint checks role + scope + ownership. No client-trusted authorization. |
| **Rate limiting** | Per-user, per-IP, per-endpoint rate limits. Guest endpoints have stricter limits. 429 with Retry-After header. |
| **Pagination** | Cursor-based pagination for all list endpoints. Default 20, max 100 per page. |
| **Filtering & sorting** | Standardized query params: `?filter[field]=value&sort=-created_date`. |
| **Caching** | ETag + Cache-Control on read-heavy endpoints. CDN for static assets. Redis for session/cache. |
| **Error handling** | Consistent error envelope: `{ error: { code, message, details, request_id } }`. HTTP status codes respected. |
| **Monitoring** | Every request logged with request_id, duration, status. Structured JSON logs. |
| **Documentation** | OpenAPI 3.0 spec auto-generated. Interactive docs available. |

### 3.2 API Envelope

**Success:**
```json
{
  "data": { ... } | [ ... ],
  "pagination": { "cursor": "...", "has_more": true, "total": 150 },
  "request_id": "req_..."
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request was invalid.",
    "details": [{ "field": "email", "issue": "Invalid email format" }],
    "request_id": "req_..."
  }
}
```

### 3.3 Shared Services (One Source of Truth)

| Service | Responsibility |
|---|---|
| **Auth Service** | Authentication, sessions, tokens, device trust, 2FA |
| **Permission Service** | Role resolution, permission checking, scope validation |
| **Notification Service** | One system for all notifications (push, in-app, email, SMS). Type-based routing. |
| **Search Service** | Unified search across all entities. University-scoped. Global for cross-campus features. |
| **Settings Service** | Platform → University → User settings hierarchy. Inherited and overridden. |
| **Media Service** | File upload, compression, CDN, signed URLs, private storage |
| **Analytics Service** | Event tracking, aggregation, dashboards |
| **Audit Service** | Immutable audit logging for all state changes |
| **Cache Service** | Redis-backed caching with TTL and invalidation |
| **Queue Service** | Background job processing (emails, notifications, sync, cleanup) |
| **Localization Service** | Translations, date/number/currency formatting, timezone conversion |

---

## 4. FEATURE REGISTRY (MODULAR MODULES)

Modules can be enabled, disabled, suspended, or restored without deleting data or changing architecture. Every module remains installed even when disabled.

| Module | Status Options | Data Retention |
|---|---|---|
| Academic Suite (courses, assignments, grades, timetable) | enabled / disabled / suspended | Retained on disable |
| Campus Quad (social feed, communities) | enabled / disabled / suspended | Retained |
| Connect (student networking, clubs, mentors) | enabled / disabled / suspended | Retained |
| Marketplace | enabled / disabled / suspended | Retained |
| Opportunities (scholarships, jobs, internships) | enabled / disabled / suspended | Retained |
| StudyBuddy (Bud) | enabled / disabled / suspended | Retained |
| Transport | enabled / disabled / suspended | Retained |
| Accommodation | enabled / disabled / suspended | Retained |
| Library | enabled / disabled / suspended | Retained |
| Wallet & Finance | enabled / disabled / suspended | Retained |
| Analytics & Insights | enabled / disabled / suspended | Retained |
| Events | enabled / disabled / suspended | Retained |
| Wellbeing | enabled / disabled / suspended | Retained |

**Implementation:**
- Each module has a registry entry with `status`, `university_id` (null = global default), and `config`.
- Oracle sets global defaults. University admins can override for their institution (if the module is globally enabled).
- Disabled modules: data is retained, UI is hidden, APIs return 410 (Gone) with a "module disabled" message.
- Suspended modules: temporary disable (e.g., during investigation). Can be restored.
- Restoring a module re-enables UI and APIs immediately — data was never deleted.

---

## 5. PLUGIN-READY ARCHITECTURE

Third-party integrations and future extensions without modifying the core platform.

| Capability | Implementation |
|---|---|
| **Integration registry** | Register external services with credentials, scopes, and webhook endpoints. |
| **OAuth connectors** | Shared (builder account) and App-User (per-user) connector modes. |
| **Webhook system** | Inbound webhooks trigger workflows. Outbound webhooks notify external systems. |
| **Plugin sandbox** | Third-party code runs in isolation. Cannot access core data without permission grants. |
| **Event bus** | Plugins subscribe to platform events (new post, assignment graded, enrollment created). |
| **Extension points** | Defined UI extension slots where plugins can inject components (e.g., course page tabs, profile sections). |

---

## 6. INTERNATIONALIZATION & LOCALIZATION

### 6.1 Multilingual

- Interface supports multiple languages with full translations.
- Fallback chain: user preference → university locale → platform default (English).
- RTL languages (Arabic, Hebrew) fully supported with mirrored layouts.

### 6.2 Multi-Currency

- Every monetary value stored with currency code.
- Display currency auto-detected from user locale. Manual override in settings.
- Exchange rates maintained for display purposes. Transactions always in the listing's native currency.

### 6.3 Multi-Education System

| Dimension | Flexibility |
|---|---|
| **Grading systems** | Configurable per programme: GPA (4.0/5.0), percentage, letter grades, UK classification, CGPA scale. |
| **Academic calendars** | Configurable per university: semester, trimester, quarter, term-based. |
| **Semester structures** | Flexible: start/end dates, mid-semester breaks, exam periods defined per institution. |
| **Qualification systems** | Degree types configurable: BSc, BA, BEng, MSc, PhD, HND, ND, etc. |
| **Education frameworks** | NUC (Nigeria), ABET (US), QAA (UK), Bologna (EU), and others — configurable per institution. |

### 6.4 Timezone

- Every user has a timezone (auto-detected, manually overridable).
- All timestamps stored in UTC. Displayed in user's timezone.
- Date/time formatting respects locale (e.g., "July 9, 2026" vs "9 July 2026" vs "2026/07/09").

---

## 7. RESPONSIVE & ADAPTIVE DESIGN

Layouts are designed per screen size, not stretched. See Design Language §13 for breakpoints and strategy.

- **Mobile-first** design — every screen designed for phone first.
- **Genuinely different layouts** at tablet and desktop — not stretched mobile.
- Navigation transforms: bottom nav → sidebar.
- Cards reflow into responsive grids.
- Desktop supports keyboard shortcuts and hover states.
- Touch targets: 44px minimum on touch devices.

---

## 8. OFFLINE-FIRST & LOW-DATA

### 8.1 Offline-First

| Capability | Implementation |
|---|---|
| **Local caching** | Critical data cached in IndexedDB. Student can view courses, assignments, notes, Bud conversations offline. |
| **Autosave** | Notes, assignments, forms, and messages autosave continuously (debounced to local storage + sync queue). |
| **Sync queue** | Offline actions queued. Synced automatically when connectivity returns. Conflicts resolved with last-write-wins + manual merge prompt. |
| **Draft preservation** | Never lose work due to poor internet. Drafts persist across sessions and devices. |
| **Bud offline** | Bud conversations are cached. Last N messages available offline. New messages queued. |

### 8.2 Low-Data Optimization

| Strategy | Implementation |
|---|---|
| **Minimize requests** | Batch APIs. GraphQL for aggregated queries. Avoid redundant fetches. |
| **Image compression** | Server-side compression + responsive image sizes. WebP/AVIF where supported. |
| **Lazy loading** | Images, components, and routes lazy-loaded. Below-the-fold content deferred. |
| **Content caching** | Frequently accessed content (course materials, timetables) cached aggressively. |
| **Background activity** | Minimal. No aggressive polling. WebSocket for real-time, with exponential backoff reconnect. |
| **Data-aware mode** | Optional "low-data mode" that reduces image quality, disables auto-play, and minimizes background sync. |

---

## 9. ACCESSIBILITY (BUILT-IN, NOT BOLTED ON)

| Requirement | Standard |
|---|---|
| **Screen readers** | All components ARIA-labeled. Semantic HTML. Logical focus order. |
| **Keyboard navigation** | Every interactive element reachable and operable via keyboard. Visible focus indicators. |
| **High contrast** | High-contrast theme available. All text meets WCAG 2.2 AA. |
| **Adjustable text size** | User can increase text size. Layouts don't break at 200% zoom. |
| **Reduced motion** | `prefers-reduced-motion` respected. Animations reduce to fades. |
| **Color-blind safe** | Color never sole indicator. Semantic colors distinguishable in all color-blindness types. |
| **Accessible labels** | Every icon-only button has `aria-label`. Form fields have associated labels. |
| **Logical focus order** | Tab order follows visual order. Focus trap in modals. Escape to close. |

---

## 10. SECURITY

### 10.1 Core Security

| Layer | Implementation |
|---|---|
| **Encryption** | TLS 1.3 in transit. AES-256 at rest. Sensitive fields encrypted at field level. |
| **Secrets management** | No secrets in code or client. Server-side secret store with rotation. |
| **Device trust** | Device fingerprinting. New device triggers verification. Trusted device list per user. |
| **Fraud detection** | Anomaly detection on authentication, transactions, and content. Suspicious activity triggers challenges or blocks. |
| **Spam prevention** | Rate limiting, content filtering, reputation scoring, CAPTCHA for high-risk actions. |
| **Risk detection** | Risk scoring on login (new device, new location, unusual time). High risk triggers 2FA. |

### 10.2 Audit & Recovery

| Capability | Implementation |
|---|---|
| **Immutable audit logging** | Every state change logged: actor, action, target, before/after, timestamp, IP, user agent. Tamper-evident. |
| **Backup management** | Automated backups. Point-in-time recovery. Encryption at rest. |
| **Disaster recovery** | Multi-region failover. RPO < 1 hour. RTO < 4 hours. |
| **Rollback capability** | Schema migrations are reversible. Deployment rollback for bad releases. |
| **Monitoring** | Application, API, database, storage, notification, and background job monitoring. Health dashboards. |
| **Continuous security validation** | Automated security scans. Dependency vulnerability monitoring. Penetration testing schedule. |

---

## 11. OBSERVABILITY

| Layer | Metrics |
|---|---|
| **Application monitoring** | Request rate, latency (p50/p95/p99), error rate, throughput |
| **API monitoring** | Per-endpoint latency, error rates, rate-limit hits |
| **Database monitoring** | Query performance, slow queries, connection pool, index usage |
| **Storage monitoring** | Disk usage, growth rate, file count, CDN hit rate |
| **Notification monitoring** | Delivery rate, bounce rate, latency per channel (push/email/SMS) |
| **Background job monitoring** | Queue depth, processing time, failure rate, retry count |
| **Performance metrics** | Core Web Vitals (LCP, FID, CLS), TTFB, render time |
| **Health dashboards** | Real-time system health, uptime, incident status |
| **Structured logging** | JSON logs with request_id, user_id, university_id, trace_id. Correlation across services. |

---

## 12. DATA INTEGRITY & NO-FAKE-DATA POLICY

| Rule | Enforcement |
|---|---|
| **No fake data** | Never fabricate students, lecturers, universities, communities, messages, reviews, followers, comments, or activity. |
| **Empty states** | When no real data exists, show elegant empty states with onboarding guidance and Bud suggestions. |
| **Seeded content** | Only official institutional content (university info, course catalogs) may be pre-populated by university admins. Never fake social content. |
| **Data validation** | All data validated on write. Schema enforced. Referential integrity maintained. |
| **Soft deletes** | Records are soft-deleted (flagged), not hard-deleted, to preserve audit trail and enable restoration. |

---

## 13. CONTINUOUS OPTIMIZATION FRAMEWORK

A framework that detects and surfaces issues without breaking approved functionality.

| Detector | What It Finds |
|---|---|
| **Duplicate logic** | Repeated business logic across modules — surfaces for extraction to shared services |
| **Unused assets** | Dead code, unused imports, orphaned components, unused CSS |
| **Inconsistent interfaces** | UI patterns that deviate from the design system |
| **Accessibility problems** | WCAG violations, missing labels, contrast failures, focus issues |
| **Performance bottlenecks** | Slow queries, large bundles, unnecessary re-renders, N+1 queries |
| **Broken workflows** | Dead links, incomplete flows, orphaned states |
| **Database inefficiencies** | Missing indexes, unbounded queries, schema bloat |
| **Security risks** | Exposed secrets, missing auth checks, injection vectors, outdated dependencies |

**Principle:** Optimization never removes or alters approved functionality. It only improves how that functionality is implemented.

---

## 14. NAVIGATION SYSTEM (ONE NAVIGATION)

UNIBUD has one navigation system across the entire platform. No module creates its own navigation.

### Mobile Navigation

| Element | Purpose |
|---|---|
| **Bottom Nav** | 5 primary destinations: Home, Learn (Academics), Quad, Connect, Me |
| **Command Dock** | Floating dock with 4 actions: Bud, Search, Quick Actions, Emergency Support |
| **Top Bar** | Contextual: page title, institution identity, notification bell, profile avatar |

### Tablet / Desktop Navigation

| Element | Purpose |
|---|---|
| **Sidebar** | Expanded navigation with all modules accessible |
| **Command Dock** | Becomes a floating button (Bud) or side panel |
| **Top Bar** | Persistent search bar, notifications, profile |

### Navigation Rules

- One source of truth for routes. No duplicate routes.
- Deep linking: every screen is directly addressable by URL.
- Back navigation: always returns to the previous logical screen.
- Breadcrumbs on desktop for deep hierarchies.

---

## 15. NOTIFICATION SYSTEM (ONE SYSTEM)

One notification system handles all notifications across every module.

| Channel | Usage |
|---|---|
| **In-app** | Notification center, badges, banners |
| **Push** | Mobile push notifications (critical and opted-in only) |
| **Email** | Transactional and digest emails |
| **SMS** | Critical alerts and OTP |

### Notification Types

academic, social, opportunity, system, emergency, reminder, wellbeing, achievement

### Rules

- Every module routes through one notification service.
- Users control notification preferences per type and per channel.
- Emergency notifications override preferences (safety-critical only).
- Notifications link to their source (assignment, post, event, etc.).
- Unread badge count is consistent across all surfaces.

---

## 16. SEARCH SYSTEM (ONE SEARCH ENGINE)

One unified search across all entities. University-scoped by default.

| Scope | Search Range |
|---|---|
| **Personal** | My courses, assignments, notes, messages, saved items |
| **Campus** | University posts, communities, events, marketplace, people |
| **Global** | Opportunities (scholarships, jobs), cross-university competitions |

### Search Features

- Unified search bar accessible from command dock and top bar.
- Real-time suggestions as you type.
- Filtered by entity type (courses, posts, people, opportunities, etc.).
- Voice search supported.
- Search history (private to user).
- Relevance-ranked with university-scoped boosting.

---

## 17. SETTINGS SYSTEM (ONE SETTINGS)

Hierarchical settings: Platform → University → User. Inherited and overridden at each level.

| Level | Controlled By | Scope |
|---|---|---|
| **Platform** | Oracle | Global defaults (languages, currencies, feature availability, branding) |
| **University** | University Admin | Institution-specific (calendar, grading, modules, campus settings) |
| **User** | Student/Lecturer | Personal preferences (language, theme, notifications, privacy) |

### Rules

- Lower levels inherit from higher levels unless explicitly overridden.
- User settings never override platform security settings.
- All setting changes are audit-logged.
- Settings UI is consistent across all levels (same component, different scope).

---

## 18. MISSION VALIDATION

Every feature must answer "yes" to at least one of these questions:

1. Does it help students **learn**?
2. Does it **save time**?
3. Does it improve **organization**?
4. Does it reduce **stress**?
5. Does it improve **communication**?
6. Does it create **opportunities**?
7. Does it strengthen the **university experience**?

If a feature doesn't answer "yes" to at least one, it is redesigned or removed.

---

## 19. SCALABILITY ROADMAP

The architecture supports growth without redesign:

| Scale | Strategy |
|---|---|
| **1–10K users** | Single database, vertical scaling, basic caching |
| **10K–100K users** | Read replicas, Redis caching, CDN, background job workers |
| **100K–1M users** | Database sharding by university, horizontal API scaling, multi-region deployment |
| **1M+ users** | Full horizontal scaling, university-scoped data partitions, global CDN, microservices extraction (only when justified) |

**Key principle:** The data model and API design don't change at any scale. Only infrastructure deployment patterns scale. No schema redesign is ever needed.

---

> **UNIBUD — The Future Starts Together.**