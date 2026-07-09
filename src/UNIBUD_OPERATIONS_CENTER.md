# UNIBUD OPERATIONS CENTER SPECIFICATION

> One centralized Operations Center managing the entire UNIBUD ecosystem.
> A modern command center — not a traditional admin panel.
- Students never see internal administration tools. Public users experience only a stable, secure, premium platform.

---

## 1. ADMINISTRATIVE HIERARCHY

### 1.1 Role Hierarchy

| Role | Authority | Scope |
|---|---|---|
| **Oracle** | Highest authority, platform owner | Unrestricted access to every feature, module, permission, API, database, integration, deployment, configuration, security policy, analytics, Operations Center, and future expansion. |
| **Co-Founder** | Created only by Oracle | Co-Founder privileges via shared code. Must authenticate with own verified account. Every action recorded under own identity. |
| **Operations Administrator** | Created only by Oracle | Day-to-day platform operations per assigned permissions. Cannot modify Oracle settings, platform architecture, global security, core permissions, or Oracle-only features. |
| **University Administrator** | Per institution | Manages only their own university (after activation by Oracle). Never a platform administrator. **Disabled by default — Coming Soon until Oracle activates.** |
| **Faculty Administrator** | Per faculty | Manages only assigned faculty. Permissions never extend beyond assigned academic scope. |
| **Department Administrator** | Per department | Manages only assigned department. Permissions never extend beyond assigned academic scope. |
| **Moderator** | Scoped to assigned areas | Reviews reports, moderates communities, marketplace listings, public content, user-generated activity. |
| **Support Administrator** | Scoped | Assists users, reviews tickets, verifies account recovery, resolves platform issues. Cannot access Oracle functions or unauthorized private information. |

### 1.2 Oracle Code

- During first setup, Oracle creates and confirms a unique **Oracle Code**.
- Never displayed again after creation.
- Never exposed.
- Never stored as plain text.
- Never recoverable through ordinary administrators.
- Oracle approval required for high-impact system changes.

### 1.3 Co-Founder Code

- One shared Co-Founder Code, created only by Oracle.
- Every Co-Founder must authenticate using their own verified account.
- The shared code grants Co-Founder privileges only — never replaces authentication.
- Every action permanently recorded under the Co-Founder's own identity.
- Oracle may regenerate, suspend, or permanently revoke the shared code at any time.

### 1.4 University Administration

- **Disabled by default** and clearly marked "Coming Soon" until Oracle activates.
- University Administrators belong only to their own institutions.
- Never become platform administrators.
- Faculty Administrators manage only assigned faculties.
- Department Administrators manage only assigned departments.
- Permissions never extend beyond assigned academic scope.

---

## 2. AUDIT LOGGING

Every administrative action generates immutable audit logs.

### 2.1 Audit Record Fields

| Field | Description |
|---|---|
| **Timestamp** | When the action occurred |
| **Authenticated Account** | Who performed the action (real identity, not shared code) |
| **Affected Resources** | What was impacted |
| **Previous State** | State before the change |
| **New State** | State after the change |
| **Originating Device** | Device fingerprint |
| **IP Information** | Where appropriate |
| **Action Outcome** | Success/failure |
| **Verification Status** | How the action was verified |

### 2.2 Rules
- Audit history never editable by ordinary administrators.
- Immutable — tamper-evident.
- Retained per configurable retention policy.
- Accessible only to authorized roles.

---

## 3. OPERATIONS DASHBOARD

One unified dashboard displaying real-time platform health.

### 3.1 Dashboard Sections

| Section | Metrics |
|---|---|
| **Platform Health** | Overall system status, uptime |
| **User Growth** | Registration trends, active users, DAU/MAU |
| **Active Sessions** | Current concurrent sessions |
| **Authentication Activity** | Logins, failures, 2FA challenges, suspicious activity |
| **API Status** | Endpoint health, latency, error rates |
| **Database Health** | Query performance, connection pool, slow queries |
| **Storage Usage** | Disk usage, growth rate, file count |
| **Notification Delivery** | Push/email/SMS delivery rates, bounce rates |
| **Background Jobs** | Queue depth, processing time, failures |
| **Search Indexing** | Index status, indexing lag |
| **Integrations** | Connector status, webhook health |
| **Moderation Activity** | Reports, actions, appeals |
| **Security Alerts** | Threats, blocked actions, suspicious activity |
| **Reported Content** | Pending reports, resolution time |
| **Performance Metrics** | Response times, Core Web Vitals |
| **Uptime** | Service availability |
| **Deployment History** | Recent deployments, rollback history |
| **Feature Status** | Module enable/disable status |

---

## 4. FEATURE FLAGS

Oracle can safely enable, disable, schedule, suspend, or restore any module.

### 4.1 Flag States

| State | Behavior |
|---|---|
| **Enabled** | Module active and visible |
| **Disabled** | Module hidden, data preserved, APIs return 410 Gone |
| **Scheduled** | Module enabled/disabled on a schedule |
| **Suspended** | Temporary disable (e.g., during investigation) |
| **Restored** | Reactivated — instant restore without rebuilding |

### 4.2 Rules
- Disabled modules remain installed with their data, permissions, and configuration preserved.
- Reactivating a module restores it instantly without rebuilding or reconfiguration.
- Feature flags support gradual rollout (selected universities, countries, roles, or student groups).

---

## 5. PRODUCTION MONITORING

### 5.1 Monitored Systems

| System | Monitoring |
|---|---|
| **APIs** | Health, latency, error rates, rate-limit hits |
| **Databases** | Query performance, connection pools, index usage, slow queries |
| **Caching** | Hit rate, memory usage, eviction rate |
| **Queues** | Depth, processing time, failure rate, retry count |
| **Storage** | Disk usage, growth, file count, CDN hit rate |
| **Media Processing** | Processing queue, success rate |
| **Notifications** | Delivery rate, bounce rate, latency per channel |
| **Scheduled Jobs** | Execution status, duration, failures |
| **Synchronization** | Sync queue, conflict rate, resolution time |
| **Search Indexing** | Index lag, query performance |
| **Integrations** | Connector health, webhook delivery |
| **Deployment Pipelines** | Build status, deployment success, rollback |

### 5.2 Rules
- Detect failures automatically.
- Notify authorized administrators before users experience major disruptions.
- Auto-escalate critical issues.

---

## 6. FRAUD & ABUSE DETECTION

### 6.1 Detection Systems

| System | Description |
|---|---|
| **Fraud Detection** | Pattern-based fraud detection |
| **Spam Detection** | Content spam filtering |
| **Duplicate Account Detection** | Detect multiple accounts from same user |
| **Suspicious Login Detection** | Impossible travel, new devices, unusual times |
| **Abnormal Behaviour Detection** | Unusual activity patterns |
| **Abuse Monitoring** | Harassment, bullying, harmful content |
| **Automated Risk Scoring** | Risk score per user/action |

### 6.2 Rules
- Preserve user privacy.
- Require human review for high-impact actions.
- Risk scoring is transparent and reviewable.
- False positives can be appealed.

---

## 7. HIGH-IMPACT OPERATIONS

### 7.1 Confirmation Requirements

Every sensitive administrative action requires confirmation before execution.

### 7.2 Oracle-Approval Operations

| Operation | Requirement |
|---|---|
| **Mass Deletion** | Oracle approval or delegated authorization |
| **Permission Changes** | Oracle approval or delegated authorization |
| **Database Migration** | Oracle approval |
| **Deployment** | Oracle approval or delegated authorization |
| **Backup Restoration** | Oracle approval |
| **Global Configuration Changes** | Oracle approval |
| **Feature Flag Changes (global)** | Oracle approval |
| **Security Policy Changes** | Oracle approval |

---

## 8. BACKUP & RECOVERY

### 8.1 Features

| Feature | Description |
|---|---|
| **Backup Management** | Scheduled encrypted backups |
| **Disaster Recovery** | Multi-region failover, RPO < 1 hour, RTO < 4 hours |
| **Rollback Operations** | Revert to previous state |
| **Deployment Management** | Version tracking, rollback capability |
| **Maintenance Mode** | Controlled platform downtime |
| **Environment Management** | Dev, testing, staging, production |
| **Version Tracking** | Every deployment versioned |
| **Migration Management** | Schema migrations, reversible |
| **Production Diagnostics** | Diagnostic tools for production issues |

### 8.2 Rules
- Automatically verify system integrity after high-impact changes.
- Rollback safely if verification fails.
- High-impact changes create restore points automatically.

---

## 9. VISIBILITY RULES

### 9.1 Hidden from Public Users

| Hidden | Rule |
|---|---|
| Oracle role | Never exposed to public users |
| Hidden administrative roles | Never exposed |
| Internal prompts | Never exposed |
| Internal architecture | Never exposed |
| Internal APIs | Never exposed |
| Security logic | Never exposed |
| Private configuration | Never exposed |
| Development tools | Never exposed |

### 9.2 Unauthorized Access Response
- Unauthorized actions return: "Operation unavailable", "Permission denied", or "Error 403".
- Never reveal additional permissions or hidden capabilities.
- Never reveal the existence of features a user can't access.

---

## 10. ANALYTICS

Comprehensive analytics using privacy-respecting aggregated data where users have consented.

### 10.1 Analytics Categories

| Category | Metrics |
|---|---|
| **Platform Growth** | User registrations, growth rate |
| **Student Engagement** | DAU, MAU, session length, feature usage |
| **Lecturer Engagement** | Course creation, assignment posting, interaction |
| **University Adoption** | Institution onboarding, active universities |
| **StudyBuddy Usage** | Conversations, topics, learning outcomes |
| **Learning Outcomes** | Grade improvements, course completion |
| **Search Behaviour** | Search queries, result engagement |
| **Community Activity** | Posts, communities, engagement |
| **Marketplace Activity** | Listings, transactions, activity |
| **Scholarship Engagement** | Views, applications, awards |
| **Career Engagement** | Job views, applications |
| **System Performance** | Latency, uptime, error rates |
| **Operational Health** | Incident count, resolution time |

### 10.2 Rules
- Privacy-respecting aggregated analytics.
- Only where users have consented.
- Emphasize actionable insights over raw statistics.
- Never expose individual user data without authorization.

---

## 11. CONTINUOUS QUALITY ENGINE

The Operations Center continuously improves platform quality.

### 11.1 Detected Issues

| Detector | What It Finds |
|---|---|
| **Duplicate Code** | Repeated logic across modules |
| **Broken Workflows** | Dead links, incomplete flows |
| **Inconsistent Interfaces** | UI deviations from design system |
| **Accessibility Issues** | WCAG violations |
| **Performance Bottlenecks** | Slow queries, large bundles |
| **Security Risks** | Exposed secrets, missing auth |
| **Database Inefficiencies** | Missing indexes, schema bloat |
| **Integration Failures** | Broken connectors, failed webhooks |

### 11.2 Rules
- Preserve every approved feature.
- Maintain backward compatibility.
- Correct problems automatically where safe.
- Notify administrators when manual review is required.

---

> **Operations Center — enterprise-grade governance, security, reliability, and scalability while remaining completely invisible to ordinary users.**