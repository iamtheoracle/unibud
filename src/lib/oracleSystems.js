/**
 * UNIBUD Oracle Systems — The 7 Coordinated Platform Systems
 *
 * Architecture:
 *
 *                     ORACLE CORE
 *                           │
 *                          BUD
 *                           │
 *         ┌──────────────────────────────────────┐
 *         │          ORACLE SYSTEMS              │
 *         │                                      │
 *         │  Learning Studio                     │
 *         │  Campus Central                      │
 *         │  Community Circle                    │
 *         │  Trust Shield                        │
 *         │  Architect                           │
 *         └──────────────────────────────────────┘
 *                           │
 *         ┌──────────────────────────────────────┐
 *         │          PLATFORM ENGINES            │
 *         └──────────────────────────────────────┘
 *                           │
 *         ┌──────────────────────────────────────┐
 *         │          PLATFORM SERVICES           │
 *         └──────────────────────────────────────┘
 *
 * Oracle Systems answer: "What part of the business does this belong to?"
 * Platform Engines answer: "How does the platform make it work?"
 * Platform Services answer: "What shared infrastructure powers it?"
 *
 * Systems never communicate directly with one another.
 * All inter-system communication flows through Oracle Core.
 * Users interact only with Bud.
 */

import {
  Brain, Sparkles, GraduationCap, Building2, Users, ShieldCheck,
  Wrench,
} from "lucide-react";

// ─── Core Meta-Systems ───────────────────────────────────────────────────────
export const ORACLE_CORE = {
  id: "oracle_core",
  name: "Oracle Core",
  codename: "Core",
  icon: Brain,
  color: "text-primary",
  bg: "bg-primary/10",
  purpose: "Intelligence and orchestration",
  capabilities: [
    "Memory", "Knowledge Graph", "Search", "Routing", "Automation",
    "Recommendations", "Planning", "Analytics", "Context", "AI coordination",
  ],
  description:
    "The supreme intelligence layer. Orchestrates all Oracle Systems, manages knowledge, coordinates agents, and resolves conflicts. Oracle Core is the only system that communicates with other systems directly — every inter-system flow passes through it.",
  managedAgents: ["oracle"],
  managedServices: ["intelligence_service", "orchestration_service", "memory_service", "knowledge_service"],
  accessRoles: ["oracle"],
};

export const BUD_INTERFACE = {
  id: "bud",
  name: "Bud",
  codename: "Bud",
  icon: Sparkles,
  color: "text-primary",
  bg: "bg-primary/10",
  purpose: "The only user-facing assistant",
  capabilities: [
    "Chat", "Voice", "Vision", "OCR", "PDF", "Whiteboard",
    "Study Planner", "Flashcards", "Coding", "Research",
    "Translation", "Accessibility", "Personal assistance",
  ],
  description:
    "Bud is the sole conversational companion. Behind every Bud interaction, the Oracle Platform orchestrates specialist systems and engines — but the user only ever sees Bud. Bud is a trusted mentor, tutor, and friend — never an AI or chatbot.",
  managedAgents: ["bud"],
  managedServices: ["conversation_service", "voice_service", "vision_service"],
  accessRoles: ["all"],
};

// ─── 5 Business Domain Systems ──────────────────────────────────────────────
export const ORACLE_SYSTEMS = [
  {
    id: "learning_studio",
    name: "Learning Studio",
    codename: "Learn",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/10",
    purpose: "Everything academic",
    tagline: "Academic lifecycle — from pre-university to graduation and research",
    capabilities: [
      "Student OS", "Lecturer OS", "Pre-University OS", "Courses",
      "Exams", "GPA", "Assignments", "Library", "Research",
      "Scholarships", "Learning analytics",
    ],
    description:
      "Manages the entire academic journey: future students, enrolled students, lecturers, courses, programmes, assignments, timetables, exams, academic progress, research, scholarships, careers, internships, competitions, and the graduation journey.",
    domains: [
      "Student OS — courses, assignments, exams, timetables, academic progress",
      "Lecturer OS — teaching workflows, class management, grading, attendance",
      "Pre-University OS — exam prep, admission guidance, readiness",
      "Courses — course catalog, enrollment, materials",
      "Exams — schedules, revision tracking, results",
      "GPA — grade tracking, CGPA projection, analytics",
      "Assignments — deadlines, submissions, feedback",
      "Library — books, journals, past questions, notes",
      "Research — publications, collaborations, labs, funding",
      "Scholarships — discovery, eligibility matching, applications",
      "Learning Analytics — progress insights, weak-topic analysis",
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
    purpose: "Everything institutional and campus-related",
    capabilities: [
      "Institution OS", "Admissions", "Faculties", "Departments",
      "Housing", "Transport", "Campus directory", "Health",
      "Student services", "Alumni",
    ],
    description:
      "Manages institution infrastructure: universities, colleges, polytechnics, faculties, departments, campus directories, student housing, campus transport, health services, student services, alumni relations, and institution/lecturer verification.",
    domains: [
      "Institution OS — universities, polytechnics, colleges of education, technical institutes",
      "Admissions — application processing, admission workflow",
      "Faculties — faculty management and structure",
      "Departments — department management and programmes",
      "Housing — accommodation listings, hostel management",
      "Transport — shuttle schedules, commute assistance",
      "Campus Directory — buildings, offices, libraries, facilities",
      "Health — campus health services and wellness resources",
      "Student Services — support services, student affairs",
      "Alumni — alumni network, career tracking, mentorship",
    ],
    managedAgents: ["nova"],
    managedServices: [
      "institution_service", "housing_service", "transport_service",
      "health_service", "alumni_service",
    ],
    modules: ["institution_config", "faculties", "departments", "courses", "accommodation", "transport", "campus_navigation", "alumni"],
    accessRoles: ["oracle", "university_admin", "operations_staff"],
  },
  {
    id: "community_circle",
    name: "Community Circle",
    codename: "Connect",
    icon: Users,
    color: "text-info",
    bg: "bg-info/10",
    purpose: "Social and community",
    capabilities: [
      "Quad", "Connect", "Study Circle", "Messaging", "Voice",
      "Video", "Stories", "Live", "Clubs", "Events", "Marketplace feed",
    ],
    description:
      "Manages social capabilities: Quad feed, messaging, study circles, voice and video rooms, stories, live sessions, clubs, events, and the marketplace social feed. UNIBUD is an education platform with social capabilities — education always takes priority over entertainment.",
    domains: [
      "Quad — campus social feed, posts, discussions, polls",
      "Connect — friend suggestions, networking, mentorship",
      "Study Circle — study partners, accountability, project teams",
      "Messaging — direct messages, group chats, study group messages",
      "Voice — voice rooms, audio calls",
      "Video — video rooms, virtual study sessions",
      "Stories — ephemeral campus moments and highlights",
      "Live — live classes, live discussions, broadcasts",
      "Clubs — student organizations, societies, associations",
      "Events — campus events, workshops, career fairs",
      "Marketplace Feed — social marketplace browsing and engagement",
    ],
    managedAgents: ["pulse"],
    managedServices: [
      "community_service", "notification_service", "communication_service",
      "events_service",
    ],
    modules: ["quad", "connect", "messages", "communities", "clubs", "study_groups", "shorts", "stories", "events", "marketplace"],
    accessRoles: ["oracle", "operations_staff", "student", "future_student", "lecturer", "alumni"],
  },
  {
    id: "trust_shield",
    name: "Trust Shield",
    codename: "Protect",
    icon: ShieldCheck,
    color: "text-error",
    bg: "bg-error/10",
    purpose: "Security, trust, compliance",
    capabilities: [
      "Verification", "Permissions", "Identity", "Fraud detection",
      "Moderation", "Audit logs", "Privacy", "Compliance",
    ],
    description:
      "Guards platform integrity: verification (institution and lecturer identity), permissions, identity management, fraud detection, content moderation, audit logs, privacy, and compliance. Every action is auditable and compliant.",
    domains: [
      "Verification — institution verification, lecturer identity verification",
      "Permissions — role-based access control, permission matrix",
      "Identity — identity management, authentication, sessions",
      "Fraud Detection — suspicious activity monitoring, duplicate account detection",
      "Moderation — content moderation, policy enforcement, community standards",
      "Audit Logs — immutable audit trail for every platform action",
      "Privacy — data protection, consent management, data rights",
      "Compliance — regulatory alignment, policy enforcement",
    ],
    managedAgents: ["sentinel"],
    managedServices: [
      "moderation_service", "security_service", "verification_service",
      "audit_service", "compliance_service",
    ],
    modules: ["security", "audit_logs", "support", "reports", "verification"],
    accessRoles: ["oracle", "compliance_officer", "moderator", "senior_operator", "super_admin"],
  },
  {
    id: "the_architect",
    name: "The Architect",
    codename: "Architect",
    icon: Wrench,
    color: "text-purple",
    bg: "bg-purple/10",
    purpose: "Platform engineering",
    capabilities: [
      "Diagnostics", "Bug detection", "Configuration", "Performance",
      "Feature flags", "Deployment", "Monitoring", "Testing",
    ],
    description:
      "The platform engineering environment: bug detection, diagnostics, configuration, performance monitoring, feature flags, deployment management, monitoring, and automated testing. Responsible for institution templates, workflows, permissions, and system architecture.",
    domains: [
      "Diagnostics — system diagnostics and health checks",
      "Bug Detection — automated error detection and reporting",
      "Configuration — schema and config management",
      "Performance — real-time metrics and optimization",
      "Feature Flags — controlled rollout and A/B testing",
      "Deployment — release management and deployment settings",
      "Monitoring — system health and uptime monitoring",
      "Testing — regression, integration, and end-to-end testing",
    ],
    managedAgents: [],
    managedServices: ["architecture_service", "deployment_service", "testing_service"],
    modules: ["modules", "feature_flags", "system_health", "maintenance", "settings"],
    accessRoles: ["oracle", "super_admin", "developer", "executive"],
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
    "System priority: Trust Shield > Campus Central > Learning Studio > Community Circle > Architect",
    "Failed system operations trigger Oracle fallback to general knowledge",
    "All system-to-system transactions are logged to Audit Intelligence",
  ],
};

// ─── System Priority (for conflict resolution) ───────────────────────────────
export const SYSTEM_PRIORITY = [
  "trust_shield",
  "campus_central",
  "learning_studio",
  "community_circle",
  "the_architect",
];