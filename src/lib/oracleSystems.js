/**
 * UNIBUD Oracle Systems — The 7 Coordinated Platform Services
 *
 * Architecture:
 *   Oracle Core (orchestration)
 *     → Bud (only user-facing assistant)
 *       → 7 Oracle Systems (coordinated services)
 *
 * Systems never communicate directly with one another.
 * All inter-system communication flows through Oracle Core.
 * Users interact only with Bud.
 */

import {
  GraduationCap, Building2, Compass, Users, ShieldCheck,
  Wrench, Plug,
} from "lucide-react";

export const ORACLE_SYSTEMS = [
  {
    id: "learning_studio",
    name: "Learning Studio",
    codename: "Learn",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/10",
    tagline: "Academic lifecycle — from future student to graduation",
    description:
      "Manages the entire academic journey: future students, enrolled students, lecturers, courses, programmes, assignments, timetables, academic progress, research, scholarships, careers, internships, competitions, and the graduation journey.",
    domains: [
      "Future Students — pre-university guidance, exam prep, admission support",
      "Students — courses, assignments, exams, timetables, academic progress",
      "Lecturers — teaching workflows, class management, grading, attendance",
      "Research — publications, collaborations, labs, funding",
      "Scholarships — discovery, eligibility matching, application tracking",
      "Careers — CV building, interview prep, job matching, internships",
      "Graduation — journey tracking, milestones, transition to alumni",
    ],
    managedAgents: ["atlas", "sage"],
    managedServices: [
      "academic_service", "admissions_service", "exam_service",
      "lecturer_service", "live_class_service", "library_service",
      "research_service", "scholarship_service", "career_service",
    ],
    modules: ["academics", "assignments", "examinations", "timetable", "live", "library", "research", "scholarships", "career_hub", "cv_builder"],
    accessRoles: ["oracle", "university_admin", "faculty_admin", "department_admin", "lecturer", "student", "future_student"],
  },
  {
    id: "campus_central",
    name: "Campus Central",
    codename: "Campus",
    icon: Building2,
    color: "text-warning",
    bg: "bg-warning/10",
    tagline: "Institutions, campuses, faculties, directories & services",
    description:
      "Manages institution infrastructure: universities, colleges, polytechnics, research institutes, faculties, departments, campus directories, student housing, cafés, printing centres, campus businesses, campus transport, institution verification, and lecturer verification.",
    domains: [
      "Institutions — universities, polytechnics, colleges of education, technical institutes",
      "Campus Structure — faculties, departments, programmes, levels",
      "Campus Directory — buildings, offices, libraries, facilities",
      "Student Housing — accommodation listings, hostel management",
      "Campus Services — cafés, printing, businesses, dining",
      "Campus Transport — shuttle schedules, commute assistance",
      "Verification — institution verification, lecturer identity verification",
    ],
    managedAgents: ["nova"],
    managedServices: [
      "institution_service", "housing_service", "transport_service",
      "marketplace_service",
    ],
    modules: ["institution_config", "faculties", "departments", "courses", "accommodation", "transport", "marketplace", "lost_found"],
    accessRoles: ["oracle", "university_admin", "operations_staff"],
  },
  {
    id: "discovery_hub",
    name: "Discovery Hub",
    codename: "Explore",
    icon: Compass,
    color: "text-success",
    bg: "bg-success/10",
    tagline: "Discover valuable information, opportunities & recommendations",
    description:
      "Powers discovery across the platform: My Day, opportunities, scholarships, events, competitions, campus news, public university announcements, educational trends, research highlights, student creators, and personalized recommendations.",
    domains: [
      "My Day — daily briefing, schedule, priorities, recommendations",
      "Opportunities — scholarships, internships, competitions, grants",
      "Events — campus events, workshops, guest lectures, career fairs",
      "Campus News — university announcements, faculty updates, SUG news",
      "Educational Trends — emerging fields, industry insights",
      "Research Highlights — publications, breakthroughs, student research",
      "Student Creators — portfolios, projects, showcases",
      "Recommendations — personalized content based on profile and activity",
    ],
    managedAgents: ["nexus", "pulse"],
    managedServices: [
      "scholarship_service", "career_service", "events_service",
      "notification_service", "personalization_service",
    ],
    modules: ["opportunities", "scholarships", "events", "campus_traditions", "celebrations", "marketplace"],
    accessRoles: ["oracle", "operations_staff", "student", "future_student"],
  },
  {
    id: "community_circle",
    name: "Community Circle",
    codename: "Connect",
    icon: Users,
    color: "text-info",
    bg: "bg-info/10",
    tagline: "Social capabilities — education always takes priority",
    description:
      "Manages social capabilities: Quad feed, posts, messaging, groups, clubs, communities, stories, live discussions, comments, reactions, friend suggestions, and study groups. UNIBUD is an education platform with social capabilities — education always takes priority over entertainment.",
    domains: [
      "Quad — campus social feed, posts, discussions, polls",
      "Messaging — direct messages, group chats, study group messages",
      "Groups — study groups, project teams, interest groups",
      "Clubs — student organizations, societies, associations",
      "Communities — faculty, department, course, level communities",
      "Stories — ephemeral campus moments and highlights",
      "Live Discussions — real-time conversations and discussions",
      "Connections — friend suggestions, mentorship connections, alumni network",
    ],
    managedAgents: ["pulse"],
    managedServices: [
      "community_service", "notification_service", "communication_service",
    ],
    modules: ["quad", "connect", "messages", "communities", "clubs", "study_groups", "shorts", "stories"],
    accessRoles: ["oracle", "operations_staff", "student", "future_student", "lecturer"],
  },
  {
    id: "trust_shield",
    name: "Trust Shield",
    codename: "Protect",
    icon: ShieldCheck,
    color: "text-error",
    bg: "bg-error/10",
    tagline: "Verification, security, fraud detection & platform trust",
    description:
      "Guards platform integrity: verification (institution and lecturer identity), security, fraud detection, duplicate account detection, content moderation, permissions, audit logs, and platform trust. Every action is auditable and compliant.",
    domains: [
      "Verification — institution verification, lecturer identity verification",
      "Security — access control, threat prevention, incident response",
      "Fraud Detection — suspicious activity monitoring, duplicate account detection",
      "Moderation — content moderation, policy enforcement, community standards",
      "Permissions — role-based access control, permission matrix",
      "Audit Logs — immutable audit trail for every platform action",
      "Compliance — regulatory alignment, data protection, privacy",
      "Platform Trust — trust scores, reputation, community safety",
    ],
    managedAgents: ["sentinel"],
    managedServices: [
      "moderation_service", "security_service", "analytics_service",
      "payment_service",
    ],
    modules: ["security", "audit_logs", "support", "reports"],
    accessRoles: ["oracle", "compliance_officer", "moderator", "senior_operator", "super_admin"],
  },
  {
    id: "the_architect",
    name: "The Architect",
    codename: "Architect",
    icon: Wrench,
    color: "text-purple",
    bg: "bg-purple/10",
    tagline: "System design, diagnostics, performance & continuous improvement",
    description:
      "The platform configuration and system design environment: bug detection, diagnostics, performance monitoring, UI/UX review, configuration validation, workflow optimization, automated testing, and continuous improvements. Responsible for institution templates, workflows, permissions, automation, feature flags, modules, APIs, integrations, databases, infrastructure, and deployment settings.",
    domains: [
      "Bug Detection — automated error detection and diagnostics",
      "Performance Monitoring — real-time system health and metrics",
      "UI/UX Review — interface quality and usability auditing",
      "Configuration Validation — schema and config integrity checks",
      "Workflow Optimization — process analysis and improvement",
      "Automated Testing — regression, integration, and end-to-end testing",
      "Platform Architecture — modules, APIs, databases, infrastructure",
      "Feature Flags — controlled rollout and A/B testing",
      "Deployment — release management and deployment settings",
    ],
    managedAgents: [],
    managedServices: ["integration_service", "analytics_service"],
    modules: ["modules", "feature_flags", "system_health", "maintenance", "settings"],
    accessRoles: ["oracle", "super_admin", "developer", "executive"],
  },
  {
    id: "integration_bridge",
    name: "Integration Bridge",
    codename: "Sync",
    icon: Plug,
    color: "text-info",
    bg: "bg-info/10",
    tagline: "Connect UNIBUD with approved external services",
    description:
      "Connects UNIBUD with approved external services: email, SMS, WhatsApp, push notifications, Google, Apple, Microsoft, maps, weather, payment providers, calendar providers, university integrations, government integrations, and future official APIs. All integrations are modular and configurable.",
    domains: [
      "Communication — email, SMS, WhatsApp, push notifications",
      "Identity Providers — Google, Apple, Microsoft",
      "Maps & Location — campus navigation, directions, geolocation",
      "Weather — campus weather data and forecasts",
      "Payments — payment providers, billing, subscriptions",
      "Calendar — Google Calendar, Apple Calendar, Microsoft Calendar",
      "University Systems — LMS integration, SIS integration, portal sync",
      "Government — education ministry APIs, accreditation databases",
      "Cloud Storage — file storage, document management",
      "Future APIs — extensible connector framework for new services",
    ],
    managedAgents: [],
    managedServices: ["integration_service", "notification_service", "communication_service", "payment_service"],
    modules: ["integrations", "connected_accounts", "calendar"],
    accessRoles: ["oracle", "super_admin", "developer"],
  },
];

// ─── Helper Functions ───────────────────────────────────────────────────────
export function getSystemById(id) {
  return ORACLE_SYSTEMS.find((s) => s.id === id);
}

export function getSystemsByAgent(agentId) {
  return ORACLE_SYSTEMS.filter((s) => s.managedAgents.includes(agentId));
}

export function getSystemsByService(serviceId) {
  return ORACLE_SYSTEMS.filter((s) => s.managedServices.includes(serviceId));
}

export function getSystemsByModule(moduleKey) {
  return ORACLE_SYSTEMS.filter((s) => s.modules.includes(moduleKey));
}

// ─── Communication Rules ────────────────────────────────────────────────────
export const SYSTEM_COMMUNICATION_RULES = {
  title: "Oracle-Mediated System Communication",
  rules: [
    "Oracle Systems never communicate directly with one another",
    "All inter-system data flows through Oracle Core's orchestration layer",
    "Each system exposes its capabilities to Oracle via a secure service interface",
    "Oracle resolves conflicts when systems provide conflicting guidance",
    "System priority: Trust Shield > Campus Central > Learning Studio > Discovery Hub > Community Circle",
    "Failed system operations trigger Oracle fallback to general knowledge",
    "All system-to-system transactions are logged to Audit Intelligence",
  ],
};