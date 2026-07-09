# UNIBUD IDENTITY SYSTEM SPECIFICATION

> One secure, scalable identity system for the entire platform.
> Every user has one account that unlocks the correct experience based on role, permissions, and verified information.

---

## 1. AUTHENTICATION METHODS

Layered authentication — methods are complementary, not exclusive.

| Method | Description |
|---|---|
| **Guest Mode** | Immediate StudyBuddy access without an account. Daily conversation limits. Can upload study materials. Conversations, notes, and preferences transfer on registration. |
| **Email + Password** | Registration with email verification (OTP). |
| **Phone Number** | Registration with SMS OTP verification. |
| **Google** | OAuth social sign-in. |
| **Apple** | Sign in with Apple (iOS). |
| **Passkeys** | Passwordless via device biometrics/secure enclave. |
| **Biometrics** | Face ID / Touch ID / fingerprint for device unlock (after initial auth). |
| **Trusted Devices** | Device fingerprinting. New device triggers verification. |
| **2FA** | OTP (SMS/email/authenticator) for sensitive operations and high-risk logins. |

### Guest Mode Rules

- Guest can use StudyBuddy with daily limits (e.g., 10 conversations/day).
- Guest can upload supported study materials (file size limits apply).
- Guest data stored locally (IndexedDB) + temporary server session.
- On registration: offer to transfer conversation history, saved notes, and preferences.
- Guest is prompted to register when approaching limits or accessing campus features.

### Registration Principles

- Collect only essential details first (name, identifier, role selection).
- Allow profile completion later — never block the experience.
- Never force unnecessary information during registration.
- Onboarding is welcoming, not overwhelming.

### Login Security

- Every login creates a secure session associated with the device.
- Detect: unusual login activity, impossible travel, suspicious devices, repeated failed attempts, abnormal behavior.
- High-risk logins trigger 2FA challenge.
- Notify users about important security events.
- Allow immediate session management across all devices.

---

## 2. ROLES

Each role receives an experience appropriate to its responsibilities.

| Role | Experience |
|---|---|
| **Guest** | StudyBuddy only, with limits. No campus access. |
| **Prospective Student** | University discovery, admission info, campus previews, StudyBuddy. |
| **Student** | Full campus experience: courses, assignments, communities, marketplace, opportunities. |
| **Postgraduate Student** | Student features + research resources, conferences, collaboration tools. |
| **Lecturer** | Course management, assignments, grades, announcements, office hours. |
| **Researcher** | Research tools, publications, collaboration, funding opportunities. |
| **Alumni** | Alumni communities, mentorship, career networking, events. |
| **Parent / Guardian** | Limited view of student's academic progress (with permission). |
| **University Staff** | Institutional administration scoped to their department. |
| **Organization Representative** | Organization profile, verified announcements, opportunity posting. |
| **Moderator** | Content moderation tools scoped to assigned communities. |
| **Operations Administrator** | University-level administration. |
| **Co-Founder** | Platform-level administration (institutional scope). |
| **Oracle** | Global platform administration. Full control. |

### Role Identification During Onboarding

1. User selects role during registration.
2. System adapts the onboarding flow based on role.
3. Role-specific features are unlocked. Unnecessary features are hidden.
4. Roles can be layered (e.g., a Lecturer who is also an Alumni).

---

## 3. ONBOARDING FLOW

### Step 1: Role Selection
- "What best describes you?" — Prospective Student, Student, Postgraduate, Lecturer, Researcher, Alumni, etc.
- Skip allowed — defaults to Student.

### Step 2: Essential Details
- Preferred name.
- Email or phone (already verified during registration).
- Profile photo (optional, can skip).

### Step 3: Academic Identity (Students)
- Country selection (auto-detected, manually changeable).
- University search and selection.
- If institution not found: suggest for review + create a personal reference (does not affect verified data).
- Faculty, department, programme selection.
- Campus, level, semester, academic session, expected graduation year.
- If department/programme not found: suggest for review.

### Step 4: Personalization (Optional, Skippable)
- Interests and goals.
- Preferred learning style.
- Study habits.
- Accessibility preferences.

### Step 5: Privacy & Preferences
- Notification preferences.
- Privacy settings (profile visibility defaults).
- Language selection.

### Progressive Personalization
- Additional personalization happens over time as the student uses the platform.
- Never block access behind forced onboarding steps.

---

## 4. PROFILES

### 4.1 Student Profile

| Section | Fields |
|---|---|
| **Identity** | Profile photo, preferred name, biography |
| **Academic** | Verified university, department, programme, level, semester, academic session, expected graduation |
| **Achievements** | Certifications, awards, badges, academic milestones |
| **Statistics** | Study streak, GPA/CGPA (optional), courses completed, learning goals |
| **Goals** | Learning goals, career interests |
| **Skills** | Skills, languages, portfolios |
| **Communities** | Clubs, societies, organizations |
| **Links** | Social links (where supported) |
| **Preferences** | Accessibility settings, learning preferences |
| **Privacy** | Visibility controls per section |

### 4.2 Lecturer Profile

| Section | Fields |
|---|---|
| **Identity** | Profile photo, name, verified academic identity |
| **Academic** | Department, courses taught, office hours |
| **Research** | Research interests, publications |
| **Achievements** | Professional achievements, qualifications |
| **Contact** | Contact preferences (office hours, email availability) |

### 4.3 University Profile

| Section | Fields |
|---|---|
| **Branding** | Logo, accent color, campus photos |
| **Structure** | Campuses, faculties, departments, programmes |
| **Information** | Official announcements, academic calendar, admission info |
| **Verification** | Institutional verification badge |

### 4.4 Alumni Profile
- Combines student history (university, programme, graduation year) with professional present (career, company, industry).
- Mentorship availability toggle.

### 4.5 Club / Society / Organization Profile
- Name, category, description, members, leadership, events, verified status.

---

## 5. PRIVACY CONTROLS

### 5.1 Visibility Levels

| Level | Who Can See |
|---|---|
| **Public** | Anyone on UNIBUD |
| **University** | Only members of the same university |
| **Connections** | Only accepted connections |
| **Private** | Only the user |

### 5.2 Per-Section Control

Every profile section has its own visibility setting:
- Academic info: University / Connections / Private
- Achievements: Public / University / Connections / Private
- Contact info: Connections / Private
- Study statistics: University / Connections / Private
- Social links: Public / Connections / Private

### 5.3 Rules
- Never expose personal information without explicit permission.
- Default to most restrictive (Connections or Private) for sensitive data.
- Students decide what is public, university-visible, connections-only, or private.

---

## 6. VERIFICATION FRAMEWORK

| Entity | Verification Method |
|---|---|
| **Universities** | Official institutional verification process (documentation, domain verification, accreditation check). |
| **Lecturers** | Institutional credentials (university email, staff ID, department assignment). |
| **Organizations** | Approved documentation (registration, licenses). |
| **Students** | University identifiers (student email, matriculation number) without exposing sensitive personal data. |

### Verification Badges
- Verified university: institutional badge on university profile.
- Verified lecturer: academic badge on lecturer profile.
- Verified organization: organization badge.
- Verified student: subtle indicator (university-scoped, not publicly visible).

---

## 7. ACCOUNT RECOVERY

Multi-step secure recovery:

1. **Initiate** — user requests recovery via email or phone.
2. **Verify** — OTP to registered email/phone.
3. **Device trust** — if on a trusted device, simplified flow. If new device, additional verification.
4. **Biometric** — where available, biometric confirmation.
5. **Liveness** — for high-risk recoveries, liveness verification (camera check).
6. **Reset** — set new credentials.
7. **Session invalidation** — all other sessions terminated for security.

### Rules
- Never compromise security for convenience.
- High-risk recoveries require more steps.
- All recovery attempts are audit-logged.

---

## 8. PERMISSION SYSTEM (RBAC)

### Principles
- **Centrally managed** — all permissions defined in one registry.
- **Inherited** — roles inherit permissions from parent roles.
- **Scope-bound** — every permission is scoped (platform / university / department / course / personal).
- **Module-aware** — feature registry controls which module permissions are active.
- **Validated before execution** — every action checks permissions server-side.

### Unauthorized Access Handling
- Unauthorized actions return: "Operation unavailable", "Permission denied", or "Error 403".
- Never reveal higher permission levels to unauthorized users.
- Never expose the existence of features a user can't access.

---

## 9. SESSION & DEVICE MANAGEMENT

### 9.1 Session Features
- View all active sessions (device, location, last active).
- Remote logout from any device.
- Trusted device management (add/remove trusted devices).
- Login history with IP, device, location, timestamp.
- Security event notifications (new login, suspicious activity).

### 9.2 Device Trust
- New device triggers verification (OTP or 2FA).
- Trusted devices bypass additional verification on subsequent logins.
- Device fingerprinting tracks device identity (user agent, screen, locale, etc.).

---

## 10. PRIVACY BY DESIGN

| Principle | Implementation |
|---|---|
| **Minimal data** | Collect only what's needed for functionality. |
| **Data export** | Users can export their personal data in a standard format. |
| **Permission management** | Users review and manage all granted permissions. |
| **Connected services** | Users review and revoke connected third-party services. |
| **Account deletion** | Users can permanently delete their account where legally permitted. |
| **Transparent data usage** | Clear, simple language explaining how data is used. |
| **No selling data** | User data is never sold to third parties. |

---

## 11. MULTI-LANGUAGE & SYNCHRONIZATION

### Multi-Language
- Onboarding, authentication, settings, and profile management all support multiple languages.
- Auto-detect device language. Manual selection at any time.
- RTL languages fully supported.

### Cross-Device Sync
- User preferences, accessibility settings, personalization, learning progress, StudyBuddy preferences, saved content, and profile info sync securely across all devices.
- Conflicts resolved with last-write-wins + manual merge for complex cases.
- Offline changes queue and sync on reconnection.

---

> **UNIBUD — The Future Starts Together.**