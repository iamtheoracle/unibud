/**
 * UNIBUD Intelligence Stack — Oracle Ecosystem Definition
 *
 * Hierarchy:
 *   Oracle (Knowledge & Intelligence Core)
 *     → Bud (Only Visible Assistant)
 *       → Architect (Co-Founder / System Architecture)
 *         → Management (Operational Management)
 *           → Operators (Day-to-day Operations)
 *             → Platform Services (Specialist Internal Agents)
 *
 * Users interact ONLY with Bud. Specialist agents operate behind the scenes
 * and communicate securely through Oracle's orchestration layer.
 */

import {
  Crown, Sparkles, Compass, GraduationCap, Building2, Heart, Globe,
  ShieldCheck, BookOpen, FlaskConical, Briefcase, Award, ShoppingBag,
  Home, Bus, Users, CalendarHeart, Eye, BarChart3, Plug, Bell,
  Layers, ClipboardCheck, Settings, Server, Database, Brain,
  CreditCard, Mail,
} from "lucide-react";

// ─── Oracle Intelligence Core ───────────────────────────────────────────────
export const ORACLE_CORE = {
  id: "oracle",
  name: "Oracle",
  codename: "The Knowledge Core",
  icon: Crown,
  color: "text-primary",
  bg: "bg-primary/10",
  tagline: "Knowledge · Memory · Orchestration · Search · Analytics · Global Index",
  description:
    "The supreme intelligence core of UNIBUD. Oracle holds the platform's collective knowledge, manages agent orchestration, powers global education indexing, and coordinates every specialist service through a secure communication protocol.",
  capabilities: [
    "Knowledge Graph — unified education knowledge base across all institutions",
    "Agent Orchestration — routes requests, coordinates agents, resolves conflicts",
    "Memory Network — long-term memory stores for every user, institution, and agent",
    "Universal Search — semantic search across all platform data and content",
    "Analytics Engine — real-time intelligence on usage, growth, and outcomes",
    "Global Education Index — worldwide institution indexing and discovery",
    "Decision Intelligence — AI-assisted recommendations for operations and growth",
    "Audit Intelligence — immutable record of every agent action and decision",
  ],
  memoryStores: [
    "User Memory — preferences, journey, academic context, interaction history",
    "Institution Memory — academic structures, calendars, traditions, terminology",
    "Global Memory — cross-institution patterns, benchmarks, best practices",
    "Agent Memory — each agent's operational state, decisions, and learnings",
    "Knowledge Memory — facts, relationships, and verified information",
  ],
  orchestrationRules: [
    "Every user request flows through Bud → Oracle → Specialist Agent → Oracle → Bud",
    "Agents never communicate directly with users — only through Bud",
    "Agent-to-agent communication is mediated by Oracle's secure protocol",
    "Conflicts between agents are resolved by Oracle's priority system",
    "All agent actions are logged to the Audit Intelligence store",
  ],
  accessRoles: ["oracle"],
};

// ─── Bud — The Only Visible Assistant ──────────────────────────────────────
export const BUD_INTERFACE = {
  id: "bud",
  name: "Bud",
  codename: "The Visible Companion",
  icon: Sparkles,
  color: "text-primary",
  bg: "bg-primary/10",
  tagline: "The only assistant users ever see",
  description:
    "Bud is the sole user-facing assistant across the entire UNIBUD platform. Every specialist capability is delivered through Bud's warm, conversational interface. Users never see, choose, or interact with agents behind the scenes — only Bud.",
  domains: [
    "Student OS — academic guidance, study help, campus life, wellbeing",
    "Lecturer OS — teaching support, class management, student insights",
    "Institution OS — administrative guidance, configuration help, reporting",
    "Pre-University OS — admission guidance, exam prep, university exploration",
    "Marketplace — buying, selling, lost & found assistance",
    "Bud OS — personalization, memory, proactive recommendations",
    "Operations Center — staff assistance, data lookup, workflow guidance",
  ],
  designPrinciples: [
    "Never refer to agents, routing, or technical architecture",
    "Always respond as a trusted mentor, tutor, or companion",
    "Naturally incorporate specialist capabilities without exposing them",
    "Address multiple needs holistically in one cohesive response",
    "Maintain calm, warm, premium tone across every interaction",
  ],
  accessRoles: ["all"],
};

// ─── Named Intelligence Agents ──────────────────────────────────────────────
export const INTELLIGENCE_AGENTS = [
  {
    id: "atlas",
    name: "Atlas",
    codename: "Academic Intelligence",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/10",
    domain: "Academic",
    description:
      "Manages all academic intelligence — study plans, GPA analytics, revision strategies, exam preparation, assignment tracking, and timetable orchestration across every institution type and academic structure.",
    responsibilities: [
      "Personalized study plan generation and optimization",
      "GPA tracking, projection, and improvement strategies",
      "Exam revision planning and weak-topic analysis",
      "Assignment deadline management and workload balancing",
      "Timetable synchronization and smart scheduling",
      "Academic performance analytics and early warning",
    ],
    internalServices: ["academic_service", "admissions_service", "exam_service"],
    memoryScope: "academic",
    accessRoles: ["oracle"],
    userFacing: false,
  },
  {
    id: "sage",
    name: "Sage",
    codename: "Lecturer Intelligence",
    icon: BookOpen,
    color: "text-info",
    bg: "bg-info/10",
    domain: "Lecturer",
    description:
      "Supports lecturers with teaching intelligence — class management, attendance analytics, assignment grading workflows, lecture recording management, and student performance insights.",
    responsibilities: [
      "Class management and teaching workflow optimization",
      "Attendance tracking and engagement analytics",
      "Assignment grading workflow and rubric management",
      "Lecture recording summaries and key topic extraction",
      "Student performance insights and early intervention flags",
      "Course material organization and distribution",
    ],
    internalServices: ["lecturer_service", "live_class_service"],
    memoryScope: "lecturer",
    accessRoles: ["oracle"],
    userFacing: false,
  },
  {
    id: "nova",
    name: "Nova",
    codename: "Institution Intelligence",
    icon: Building2,
    color: "text-purple",
    bg: "bg-purple/10",
    domain: "Institution",
    description:
      "Manages institution-level intelligence — academic structure configuration, calendar management, department/faculty organization, terminology mapping, and institution-specific data synchronization.",
    responsibilities: [
      "Institution configuration and academic structure management",
      "Academic calendar and key date orchestration",
      "Faculty, department, and programme organization",
      "Institution-specific terminology and grading systems",
      "Student identifier systems and matriculation workflows",
      "Institution data synchronization and verification",
    ],
    internalServices: ["institution_service", "admissions_service"],
    memoryScope: "institution",
    accessRoles: ["oracle"],
    userFacing: false,
  },
  {
    id: "pulse",
    name: "Pulse",
    codename: "Student Intelligence",
    icon: Heart,
    color: "text-error",
    bg: "bg-error/10",
    domain: "Student",
    description:
      "Tracks student wellbeing, engagement, social connections, and journey progression. Monitors student sentiment, identifies at-risk students, and coordinates proactive support through Bud.",
    responsibilities: [
      "Student wellbeing monitoring and sentiment analysis",
      "Engagement tracking and activity analytics",
      "Social connection and community health metrics",
      "Journey stage transitions (future → undergraduate → postgraduate → alumni)",
      "At-risk student identification and early intervention",
      "Personalization data aggregation and preference learning",
    ],
    internalServices: ["wellness_service", "community_service", "personalization_service"],
    memoryScope: "student",
    accessRoles: ["oracle"],
    userFacing: false,
  },
  {
    id: "nexus",
    name: "Nexus",
    codename: "Global Intelligence",
    icon: Globe,
    color: "text-success",
    bg: "bg-success/10",
    domain: "Global",
    description:
      "Powers the global education index — cross-institution discovery, scholarship matching across borders, international opportunity scanning, and global benchmarking of academic standards.",
    responsibilities: [
      "Global education index maintenance and institution discovery",
      "Cross-border scholarship and opportunity matching",
      "International exchange programme coordination",
      "Global academic standard benchmarking",
      "Institution outreach and onboarding intelligence",
      " Worldwide student mobility insights",
    ],
    internalServices: ["scholarship_service", "career_service", "outreach_service"],
    memoryScope: "global",
    accessRoles: ["oracle"],
    userFacing: false,
  },
  {
    id: "sentinel",
    name: "Sentinel",
    codename: "Security Intelligence",
    icon: ShieldCheck,
    color: "text-warning",
    bg: "bg-warning/10",
    domain: "Security",
    description:
      "Guards platform integrity — content moderation, fraud detection, access control, audit logging, compliance monitoring, and threat prevention across every module and user type.",
    responsibilities: [
      "Content moderation and automated policy enforcement",
      "Fraud detection and suspicious activity monitoring",
      "Access control and permission audit",
      "Compliance monitoring and regulatory alignment",
      "Threat prevention and security incident response",
      "Audit trail integrity and immutable logging",
    ],
    internalServices: ["moderation_service", "security_service", "analytics_service"],
    memoryScope: "security",
    accessRoles: ["oracle"],
    userFacing: false,
  },
];

// ─── Internal Specialist Services ──────────────────────────────────────────
export const INTERNAL_SERVICES = [
  {
    id: "academic_service",
    name: "Academic Service",
    icon: GraduationCap,
    color: "text-primary",
    parentAgent: "atlas",
    domain: "Academic",
    description: "Course management, grades, analytics, study goals, and academic planning.",
    modules: ["academics", "assignments", "examinations", "timetable"],
    accessRoles: ["oracle", "university_admin", "faculty_admin", "department_admin", "lecturer"],
  },
  {
    id: "admissions_service",
    name: "Admissions Service",
    icon: ClipboardCheck,
    color: "text-info",
    parentAgent: "atlas",
    domain: "Academic",
    description: "Admission process management, entry requirements, and admission timeline tracking.",
    modules: ["admissions"],
    accessRoles: ["oracle", "university_admin", "operations_staff"],
  },
  {
    id: "exam_service",
    name: "Examination Service",
    icon: Brain,
    color: "text-purple",
    parentAgent: "atlas",
    domain: "Academic",
    description: "Exam scheduling, revision tracking, quiz generation, and flashcard management.",
    modules: ["examinations", "academics"],
    accessRoles: ["oracle", "university_admin", "lecturer"],
  },
  {
    id: "lecturer_service",
    name: "Lecturer Service",
    icon: BookOpen,
    color: "text-info",
    parentAgent: "sage",
    domain: "Lecturer",
    description: "Lecturer workflow, class management, attendance, and grading workflows.",
    modules: ["lecturer_portal", "classes", "attendance", "grades"],
    accessRoles: ["oracle", "university_admin", "lecturer"],
  },
  {
    id: "live_class_service",
    name: "Live Class Service",
    icon: Server,
    color: "text-purple",
    parentAgent: "sage",
    domain: "Lecturer",
    description: "Virtual classroom orchestration, recording management, and lecture summaries.",
    modules: ["live", "recordings"],
    accessRoles: ["oracle", "lecturer"],
  },
  {
    id: "institution_service",
    name: "Institution Service",
    icon: Building2,
    color: "text-purple",
    parentAgent: "nova",
    domain: "Institution",
    description: "Institution configuration, academic structures, calendars, and terminology.",
    modules: ["institution_config", "faculties", "departments", "courses"],
    accessRoles: ["oracle", "university_admin", "operations_staff"],
  },
  {
    id: "wellness_service",
    name: "Wellness Service",
    icon: Heart,
    color: "text-error",
    parentAgent: "pulse",
    domain: "Student",
    description: "Wellbeing check-ins, mood tracking, journal entries, and stress management.",
    modules: ["student_support", "wellbeing"],
    accessRoles: ["oracle", "operations_staff"],
  },
  {
    id: "community_service",
    name: "Community Service",
    icon: Users,
    color: "text-info",
    parentAgent: "pulse",
    domain: "Student",
    description: "Community management, club coordination, social engagement, and connections.",
    modules: ["communities", "clubs", "connect", "study_groups"],
    accessRoles: ["oracle", "university_admin", "operations_staff"],
  },
  {
    id: "personalization_service",
    name: "Personalization Service",
    icon: Sparkles,
    color: "text-primary",
    parentAgent: "pulse",
    domain: "Student",
    description: "Preference learning, adaptive recommendations, and journey-aware personalization.",
    modules: ["all"],
    accessRoles: ["oracle"],
  },
  {
    id: "scholarship_service",
    name: "Scholarship Service",
    icon: Award,
    color: "text-success",
    parentAgent: "nexus",
    domain: "Global",
    description: "Scholarship discovery, eligibility matching, and application tracking.",
    modules: ["scholarships", "opportunities"],
    accessRoles: ["oracle", "operations_staff"],
  },
  {
    id: "career_service",
    name: "Career Service",
    icon: Briefcase,
    color: "text-info",
    parentAgent: "nexus",
    domain: "Global",
    description: "Career coaching, CV building, interview prep, job matching, and mentorship.",
    modules: ["career_hub", "cv_builder", "portfolio", "companies"],
    accessRoles: ["oracle", "operations_staff"],
  },
  {
    id: "research_service",
    name: "Research Service",
    icon: FlaskConical,
    color: "text-purple",
    parentAgent: "nexus",
    domain: "Global",
    description: "Research project management, publication tracking, collaboration, and funding.",
    modules: ["research"],
    accessRoles: ["oracle", "university_admin", "lecturer"],
  },
  {
    id: "library_service",
    name: "Library Service",
    icon: BookOpen,
    color: "text-info",
    parentAgent: "atlas",
    domain: "Academic",
    description: "Digital library, book search, journal access, past questions, and reading lists.",
    modules: ["library"],
    accessRoles: ["oracle", "university_admin", "lecturer"],
  },
  {
    id: "marketplace_service",
    name: "Marketplace Service",
    icon: ShoppingBag,
    color: "text-warning",
    parentAgent: "nova",
    domain: "Institution",
    description: "Campus marketplace, buy/sell listings, lost & found, and trusted transactions.",
    modules: ["marketplace", "lost_found"],
    accessRoles: ["oracle", "operations_staff"],
  },
  {
    id: "housing_service",
    name: "Housing Service",
    icon: Home,
    color: "text-warning",
    parentAgent: "nova",
    domain: "Institution",
    description: "Student accommodation listings, hostel management, and housing services.",
    modules: ["accommodation"],
    accessRoles: ["oracle", "university_admin", "operations_staff"],
  },
  {
    id: "transport_service",
    name: "Transport Service",
    icon: Bus,
    color: "text-warning",
    parentAgent: "nova",
    domain: "Institution",
    description: "Campus transport schedules, shuttle tracking, and commute assistance.",
    modules: ["transport"],
    accessRoles: ["oracle", "university_admin", "operations_staff"],
  },
  {
    id: "events_service",
    name: "Events Service",
    icon: CalendarHeart,
    color: "text-primary",
    parentAgent: "pulse",
    domain: "Student",
    description: "Campus events, workshops, traditions, celebrations, and activity calendars.",
    modules: ["events", "campus_traditions", "celebrations"],
    accessRoles: ["oracle", "university_admin", "operations_staff"],
  },
  {
    id: "moderation_service",
    name: "Moderation Service",
    icon: Eye,
    color: "text-warning",
    parentAgent: "sentinel",
    domain: "Security",
    description: "Content moderation, policy enforcement, report handling, and community standards.",
    modules: ["quad", "communities", "shorts", "stories"],
    accessRoles: ["oracle", "moderator", "senior_operator"],
  },
  {
    id: "security_service",
    name: "Security Service",
    icon: ShieldCheck,
    color: "text-error",
    parentAgent: "sentinel",
    domain: "Security",
    description: "Access control, fraud detection, threat prevention, and security incident response.",
    modules: ["all"],
    accessRoles: ["oracle", "compliance_officer"],
  },
  {
    id: "analytics_service",
    name: "Analytics Service",
    icon: BarChart3,
    color: "text-info",
    parentAgent: "sentinel",
    domain: "Security",
    description: "Platform analytics, usage intelligence, growth metrics, and business intelligence.",
    modules: ["analytics", "reports"],
    accessRoles: ["oracle", "executive", "university_admin"],
  },
  {
    id: "integration_service",
    name: "Integration Service",
    icon: Plug,
    color: "text-info",
    parentAgent: "sentinel",
    domain: "Security",
    description: "External API management, connector orchestration, and data pipeline oversight.",
    modules: ["integrations"],
    accessRoles: ["oracle", "developer"],
  },
  {
    id: "notification_service",
    name: "Notification Service",
    icon: Bell,
    color: "text-success",
    parentAgent: "pulse",
    domain: "Student",
    description: "Smart notification prioritization, deadline reminders, and digest summaries.",
    modules: ["notifications"],
    accessRoles: ["oracle", "operations_staff"],
  },
  {
    id: "outreach_service",
    name: "Outreach Service",
    icon: Globe,
    color: "text-success",
    parentAgent: "nexus",
    domain: "Global",
    description: "Institution outreach, onboarding pipeline, and partnership management.",
    modules: ["institution_outreach"],
    accessRoles: ["oracle", "operations_staff"],
  },
  {
    id: "payment_service",
    name: "Payment Service",
    icon: CreditCard,
    color: "text-success",
    parentAgent: "sentinel",
    domain: "Security",
    description: "Payment processing, billing, subscriptions, and financial transaction oversight.",
    modules: ["marketplace", "subscriptions"],
    accessRoles: ["oracle", "finance_manager", "super_admin"],
  },
  {
    id: "communication_service",
    name: "Communication Service",
    icon: Mail,
    color: "text-info",
    parentAgent: "pulse",
    domain: "Student",
    description: "Email, SMS, WhatsApp, push notifications, and in-app messaging orchestration.",
    modules: ["notifications", "messages", "connected_accounts"],
    accessRoles: ["oracle", "operations_staff"],
  },
];

// ─── Operations Hierarchy ───────────────────────────────────────────────────
export const OPERATIONS_HIERARCHY = [
  {
    id: "oracle",
    name: "Oracle",
    level: 99,
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    description: "Supreme platform authority — full control over intelligence, architecture, and all systems.",
    accessRoles: ["oracle"],
    centerPath: "/portal/oracle",
  },
  {
    id: "bud",
    name: "Bud",
    level: 0,
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
    description: "The only user-facing assistant — delivers all specialist capabilities through one warm interface.",
    accessRoles: ["all"],
    centerPath: "/portal/bud-config",
  },
  {
    id: "architect",
    name: "Architect",
    level: 10,
    icon: Layers,
    color: "text-purple",
    bg: "bg-purple/10",
    description: "Co-Founder system architecture — module health, feature flags, integrations, schema management, and platform engineering.",
    accessRoles: ["oracle", "super_admin", "developer", "executive"],
    centerPath: "/portal/architect",
  },
  {
    id: "management",
    name: "Management",
    level: 8,
    icon: ClipboardCheck,
    color: "text-info",
    bg: "bg-info/10",
    description: "Operational management — institution onboarding, approval flows, staff management, finance oversight, and compliance.",
    accessRoles: ["oracle", "super_admin", "platform_admin", "support_manager", "finance_manager", "compliance_officer"],
    centerPath: "/portal/management",
  },
  {
    id: "operator",
    name: "Operators",
    level: 6,
    icon: Settings,
    color: "text-warning",
    bg: "bg-warning/10",
    description: "Day-to-day operations — support tickets, content moderation, user management, notification broadcasting, and system alerts.",
    accessRoles: ["oracle", "super_admin", "platform_admin", "operator", "senior_operator", "moderator", "operations_staff"],
    centerPath: "/portal/operator",
  },
  {
    id: "services",
    name: "Platform Services",
    level: 5,
    icon: Database,
    color: "text-success",
    bg: "bg-success/10",
    description: "Specialist internal agents — academic, research, library, careers, marketplace, housing, transport, communities, events, moderation, security, analytics, integrations, and notifications.",
    accessRoles: ["oracle"],
    centerPath: "/portal/agent-network",
  },
];

// ─── Operations Centers ─────────────────────────────────────────────────────
export const OPERATIONS_CENTERS = [
  {
    id: "architect",
    name: "Architect Center",
    icon: Layers,
    color: "text-purple",
    bg: "bg-purple/10",
    path: "/portal/architect",
    description: "System architecture, module health, feature engineering, and platform engineering.",
    sections: [
      { label: "Module Architecture", icon: "Boxes", path: "/portal/modules", description: "Platform module registry and health" },
      { label: "Feature Flags", icon: "Flag", path: "/portal/feature-flags", description: "Live feature toggle management" },
      { label: "System Health", icon: "Activity", path: "/portal/system-health", description: "Real-time platform monitoring" },
      { label: "Integrations", icon: "Plug", path: "/portal/architect", description: "External API and connector management" },
      { label: "Entity Schema", icon: "Database", path: "/portal/architect", description: "Data model and entity registry" },
      { label: "Maintenance", icon: "Settings", path: "/portal/maintenance", description: "Maintenance mode and deployment controls" },
    ],
    accessRoles: ["oracle", "super_admin", "developer", "executive"],
  },
  {
    id: "management",
    name: "Management Center",
    icon: ClipboardCheck,
    color: "text-info",
    bg: "bg-info/10",
    path: "/portal/management",
    description: "Operational management, institution onboarding, approvals, finance, and compliance.",
    sections: [
      { label: "Institution Onboarding", icon: "Building2", path: "/portal/institution-outreach", description: "Institution outreach and onboarding pipeline" },
      { label: "Institution Config", icon: "Building2", path: "/portal/institution-config", description: "Institution configuration center" },
      { label: "Approvals", icon: "ClipboardCheck", path: "/portal/approvals", description: "Approval queues and workflows" },
      { label: "User Management", icon: "Users", path: "/portal/users", description: "Platform user management" },
      { label: "Notifications", icon: "Bell", path: "/portal/notifications", description: "Broadcast notification management" },
      { label: "Audit Logs", icon: "ScrollText", path: "/portal/audit-logs", description: "Compliance and audit trail" },
      { label: "Security", icon: "ShieldCheck", path: "/portal/security", description: "Security and compliance center" },
      { label: "Settings", icon: "Settings", path: "/portal/settings", description: "Platform settings" },
    ],
    accessRoles: ["oracle", "super_admin", "platform_admin", "support_manager", "finance_manager", "compliance_officer"],
  },
  {
    id: "operator",
    name: "Operator Center",
    icon: Settings,
    color: "text-warning",
    bg: "bg-warning/10",
    path: "/portal/operator",
    description: "Day-to-day operations — support, moderation, content, and user assistance.",
    sections: [
      { label: "Support Tickets", icon: "LifeBuoy", path: "/portal/support", description: "Support ticket management" },
      { label: "Content", icon: "FileEdit", path: "/portal/content", description: "Content management" },
      { label: "Marketplace", icon: "ShoppingBag", path: "/portal/marketplace", description: "Marketplace oversight" },
      { label: "Events", icon: "CalendarDays", path: "/portal/events", description: "Event management" },
      { label: "Universities", icon: "Landmark", path: "/portal/universities", description: "University management" },
      { label: "Invitations", icon: "UserPlus", path: "/portal/invitations", description: "User invitations" },
    ],
    accessRoles: ["oracle", "super_admin", "platform_admin", "operator", "senior_operator", "moderator", "operations_staff"],
  },
];

// ─── Communication Protocol ─────────────────────────────────────────────────
export const ORCHESTRATION_PROTOCOL = {
  name: "Oracle Secure Communication Protocol",
  description:
    "All agent communication is mediated by Oracle. Agents never communicate directly with users or with each other — every message flows through Oracle's orchestration layer.",
  flow: [
    { step: 1, from: "User", to: "Bud", description: "User sends message to Bud" },
    { step: 2, from: "Bud", to: "Oracle", description: "Bud routes request to Oracle for orchestration" },
    { step: 3, from: "Oracle", to: "Specialist Agent", description: "Oracle selects and activates the right specialist agent(s)" },
    { step: 4, from: "Specialist Agent", to: "Oracle", description: "Agent processes request and returns result to Oracle" },
    { step: 5, from: "Oracle", to: "Bud", description: "Oracle synthesizes result and delivers to Bud" },
    { step: 6, from: "Bud", to: "User", description: "Bud responds to user as a single, cohesive companion" },
  ],
  rules: [
    "Agents never expose their identity to users — only Bud is visible",
    "Oracle resolves conflicts when multiple agents provide conflicting guidance",
    "Agent priority: Security > Institution > Academic > Student > Global",
    "All agent decisions are logged to Audit Intelligence",
    "Agents can request data from other agents through Oracle mediation only",
    "Failed agent operations trigger Oracle fallback to general knowledge",
  ],
};

// ─── Helper Functions ───────────────────────────────────────────────────────
export function getAgentById(id) {
  return INTELLIGENCE_AGENTS.find((a) => a.id === id);
}

export function getServiceById(id) {
  return INTERNAL_SERVICES.find((s) => s.id === id);
}

export function getServicesByAgent(agentId) {
  return INTERNAL_SERVICES.filter((s) => s.parentAgent === agentId);
}

export function getCenterById(id) {
  return OPERATIONS_CENTERS.find((c) => c.id === id);
}

export function getFullEcosystem() {
  return {
    oracle: ORACLE_CORE,
    bud: BUD_INTERFACE,
    agents: INTELLIGENCE_AGENTS,
    services: INTERNAL_SERVICES,
    hierarchy: OPERATIONS_HIERARCHY,
    centers: OPERATIONS_CENTERS,
    protocol: ORCHESTRATION_PROTOCOL,
  };
}

export function canAccessCenter(role, centerId) {
  if (role === "oracle" || role === "super_admin") return true;
  const center = getCenterById(centerId);
  if (!center) return false;
  return center.accessRoles.includes(role);
}

// ─── Full Intelligence Stack (for visualization) ────────────────────────────
export const INTELLIGENCE_STACK = [
  { layer: 1, id: "oracle", name: "Oracle", subtitle: "Knowledge & Intelligence Core", ...ORACLE_CORE },
  { layer: 2, id: "bud", name: "Bud", subtitle: "Only Visible Assistant", ...BUD_INTERFACE },
  { layer: 3, id: "architect", name: "Architect", subtitle: "Co-Founder / System Architecture", ...OPERATIONS_HIERARCHY[2] },
  { layer: 4, id: "management", name: "Management", subtitle: "Operational Management", ...OPERATIONS_HIERARCHY[3] },
  { layer: 5, id: "operator", name: "Operators", subtitle: "Day-to-day Operations", ...OPERATIONS_HIERARCHY[4] },
  { layer: 6, id: "services", name: "Platform Services", subtitle: "Specialist Internal Agents", ...OPERATIONS_HIERARCHY[5] },
];