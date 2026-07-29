/**
 * UNIBUD Administrative Authority Code Registry
 *
 * Authority Codes define WHO can make decisions and manage the platform.
 * Agent Codes (BUD-001, ORC-000, etc.) define WHICH AI service performs
 * the work. These two systems are kept separate for cleaner permissions,
 * auditing, and governance at enterprise scale.
 *
 * Administrators are PEOPLE. Agents are platform INTELLIGENCE that assist them.
 * Every administrator interacts only with Bud — agents operate behind the scenes.
 */

import {
  Crown, Shield, Settings, ShieldCheck, LayoutDashboard, Building2, GraduationCap,
  BookOpen, Users, Store, Headphones, Lock, Database, Newspaper, Wallet, Bot, Scroll,
  AlertTriangle,
} from "lucide-react";

// ─── Authority Codes ──────────────────────────────────────────────────────
export const AUTHORITY_CODES = [
  {
    code: "ADM-000",
    level: "A0",
    title: "Founder",
    icon: Crown,
    scope: "Full ownership of the platform",
    responsibilities: [
      "Strategy",
      "Governance",
      "Product direction",
      "Emergency override",
      "Executive decisions",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle"],
    managementCenter: "founder",
  },
  {
    code: "ADM-010",
    level: "A1",
    title: "Super Administrator",
    icon: Shield,
    scope: "Operates the entire platform",
    responsibilities: [
      "User management",
      "Institutions",
      "Platform settings",
      "Releases",
      "System configuration",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle", "forge", "sentinel", "pulse", "atlas"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-020",
    level: "A1",
    title: "Platform Administrator",
    icon: Settings,
    scope: "Manages global platform operations",
    responsibilities: [
      "Services",
      "Integrations",
      "Monitoring",
      "Operational health",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle", "pulse", "forge"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-030",
    level: "A1",
    title: "Trust Administrator",
    icon: ShieldCheck,
    scope: "Trust & safety operations",
    responsibilities: [
      "Verification",
      "Moderation",
      "Fraud investigations",
      "Abuse reports",
      "Compliance",
      "Audit reviews",
      "Security incidents",
    ],
    primaryAgent: "bud",
    supportingAgents: ["sentinel", "pulse"],
    managementCenter: "trust_operations",
  },
  {
    code: "ADM-040",
    level: "A1",
    title: "Experience Administrator",
    icon: LayoutDashboard,
    scope: "Manages experience surfaces",
    responsibilities: [
      "Square",
      "Campus",
      "Marketplace",
      "Wallet",
      "Connect",
      "Communities",
      "Content quality",
      "Feature operations",
    ],
    primaryAgent: "bud",
    supportingAgents: ["orbit", "spark", "pulse"],
    managementCenter: "experience_business",
  },
  {
    code: "ADM-050",
    level: "A2",
    title: "Institution Administrator",
    icon: Building2,
    scope: "Manages one university or institution",
    responsibilities: [
      "Faculties",
      "Departments",
      "Staff",
      "Students",
      "Institution settings",
    ],
    primaryAgent: "bud",
    supportingAgents: ["orbit", "atlas"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-060",
    level: "A2",
    title: "Faculty Administrator",
    icon: GraduationCap,
    scope: "Manages a faculty or college within an institution",
    responsibilities: [
      "Academic operations",
      "Faculty-level administration",
    ],
    primaryAgent: "bud",
    supportingAgents: ["orbit", "atlas"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-070",
    level: "A2",
    title: "Department Administrator",
    icon: BookOpen,
    scope: "Manages a department",
    responsibilities: [
      "Courses",
      "Lecturers",
      "Academic records",
      "Departmental announcements",
    ],
    primaryAgent: "bud",
    supportingAgents: ["orbit", "atlas"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-080",
    level: "A3",
    title: "Community Administrator",
    icon: Users,
    scope: "Manages a specific community, club, society, or organization",
    responsibilities: [
      "Members",
      "Moderation",
      "Events",
      "Posts",
    ],
    primaryAgent: "bud",
    supportingAgents: ["sentinel", "pulse"],
    managementCenter: "experience_business",
  },
  {
    code: "ADM-090",
    level: "A3",
    title: "Business Administrator",
    icon: Store,
    scope: "Manages marketplace businesses",
    responsibilities: [
      "Storefronts",
      "Products",
      "Orders",
      "Merchant operations",
    ],
    primaryAgent: "bud",
    supportingAgents: ["orbit", "pulse"],
    managementCenter: "experience_business",
  },
  {
    code: "ADM-100",
    level: "A3",
    title: "Support Administrator",
    icon: Headphones,
    scope: "Customer support and operational assistance",
    responsibilities: [
      "Customer support",
      "Tickets",
      "User assistance",
      "Account recovery",
      "Operational support",
    ],
    primaryAgent: "bud",
    supportingAgents: ["pulse", "atlas"],
    managementCenter: "trust_operations",
  },
  {
    code: "ADM-110",
    level: "A3",
    title: "Security Administrator",
    icon: Lock,
    scope: "Identity, authentication, and access control",
    responsibilities: [
      "Identity",
      "Authentication",
      "Permissions",
      "Access control",
      "Incident response",
      "Security policies",
    ],
    primaryAgent: "bud",
    supportingAgents: ["sentinel", "pulse"],
    managementCenter: "trust_operations",
  },
  {
    code: "ADM-120",
    level: "A3",
    title: "Data Administrator",
    icon: Database,
    scope: "Data governance and analytics",
    responsibilities: [
      "Data governance",
      "Analytics",
      "Reporting",
      "Backups",
      "Retention",
      "Exports",
      "Data quality",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle", "atlas", "pulse"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-130",
    level: "A3",
    title: "Content Administrator",
    icon: Newspaper,
    scope: "Editorial content management",
    responsibilities: [
      "News",
      "Announcements",
      "Featured content",
      "Media libraries",
      "Editorial review",
    ],
    primaryAgent: "bud",
    supportingAgents: ["orbit", "lens"],
    managementCenter: "experience_business",
  },
  {
    code: "ADM-140",
    level: "A3",
    title: "Finance Administrator",
    icon: Wallet,
    scope: "Financial operations",
    responsibilities: [
      "Wallet operations",
      "Billing",
      "Payouts",
      "Financial reports",
      "Transaction reviews",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle", "pulse"],
    managementCenter: "experience_business",
  },
  {
    code: "ADM-150",
    level: "A3",
    title: "AI Operations Administrator",
    icon: Bot,
    scope: "Oversees Bud and the agent ecosystem",
    responsibilities: [
      "AI quality",
      "Prompts",
      "Knowledge sources",
      "Agent health",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle", "spark", "atlas"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-160",
    level: "A4",
    title: "Audit Administrator",
    icon: Scroll,
    scope: "Reviews system logs and compliance",
    responsibilities: [
      "System logs",
      "Compliance",
      "Governance",
      "Operational history",
      "Change records",
    ],
    primaryAgent: "bud",
    supportingAgents: ["sentinel", "atlas", "pulse"],
    managementCenter: "trust_operations",
  },
  // ─── Executive Authority Expansion (OHO Directive) ───
  {
    code: "ADM-005",
    level: "A1",
    title: "Executive Administration",
    icon: Crown,
    scope: "Executive-level governance and strategic coordination",
    responsibilities: [
      "Executive governance",
      "Strategic coordination",
      "Cross-domain oversight",
      "Executive decisions",
      "Board reporting",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle", "forge", "sentinel", "pulse", "atlas"],
    managementCenter: "founder",
  },
  {
    code: "ADM-025",
    level: "A1",
    title: "Engineering Administration",
    icon: Settings,
    scope: "Technical architecture, deployments, and engineering operations",
    responsibilities: [
      "Technical architecture",
      "Deployments",
      "Engineering operations",
      "Infrastructure",
      "Technical debt management",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle", "forge", "pulse"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-035",
    level: "A1",
    title: "AI Administration",
    icon: Bot,
    scope: "AI behavior, agent ecosystem, and intelligence governance",
    responsibilities: [
      "AI behavior configuration",
      "Agent ecosystem health",
      "Intelligence governance",
      "Prompt management",
      "AI safety oversight",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle", "spark", "atlas"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-055",
    level: "A2",
    title: "Academic Administration",
    icon: GraduationCap,
    scope: "Academic operations, curriculum, and academic policy",
    responsibilities: [
      "Academic operations",
      "Curriculum management",
      "Academic policy",
      "Faculty coordination",
      "Academic standards",
    ],
    primaryAgent: "bud",
    supportingAgents: ["orbit", "atlas"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-145",
    level: "A3",
    title: "Banking Administration",
    icon: Wallet,
    scope: "Banking platform, wallets, cards, and financial services",
    responsibilities: [
      "Banking operations",
      "Wallet management",
      "Card services",
      "Financial compliance",
      "Transaction oversight",
    ],
    primaryAgent: "bud",
    supportingAgents: ["oracle", "pulse", "sentinel"],
    managementCenter: "experience_business",
  },
  {
    code: "ADM-165",
    level: "A3",
    title: "Operations Administration",
    icon: LayoutDashboard,
    scope: "Day-to-day platform operations and service management",
    responsibilities: [
      "Service operations",
      "Platform health",
      "Operational workflows",
      "Incident management",
      "Service reliability",
    ],
    primaryAgent: "bud",
    supportingAgents: ["pulse", "forge", "nexus"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-170",
    level: "A4",
    title: "Moderation",
    icon: ShieldCheck,
    scope: "Content moderation and community safety",
    responsibilities: [
      "Content moderation",
      "Community safety",
      "Abuse prevention",
      "Policy enforcement",
      "Report resolution",
    ],
    primaryAgent: "bud",
    supportingAgents: ["sentinel", "pulse"],
    managementCenter: "trust_operations",
  },
  {
    code: "ADM-175",
    level: "A4",
    title: "Maintenance",
    icon: Settings,
    scope: "System maintenance, updates, and scheduled downtime",
    responsibilities: [
      "Scheduled maintenance",
      "System updates",
      "Downtime management",
      "Maintenance windows",
      "System reliability",
    ],
    primaryAgent: "bud",
    supportingAgents: ["forge", "pulse"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-180",
    level: "A4",
    title: "Emergency Operations",
    icon: AlertTriangle,
    scope: "Emergency response, disaster recovery, and critical infrastructure recovery",
    responsibilities: [
      "Emergency Shutdown",
      "Disaster Recovery",
      "Rollback",
      "Incident Response",
      "Critical Infrastructure Recovery",
    ],
    primaryAgent: "bud",
    supportingAgents: ["sentinel", "forge", "pulse", "oracle"],
    managementCenter: "platform_operations",
  },
  {
    code: "ADM-185",
    level: "A4",
    title: "Compliance & Audit",
    icon: Scroll,
    scope: "Read-only governance, compliance, and audit inspection",
    responsibilities: [
      "Audit Logs",
      "Compliance Reports",
      "Governance",
      "Security Audits",
      "Read-only Inspection",
      "Regulatory Review",
    ],
    primaryAgent: "bud",
    supportingAgents: ["sentinel", "atlas", "pulse"],
    managementCenter: "trust_operations",
    readOnly: true,
  },
];

// ─── Authority Levels ────────────────────────────────────────────────────
export const AUTHORITY_LEVELS = [
  {
    level: "A0",
    label: "Founder",
    codes: ["ADM-000"],
    description: "Full ownership of the platform",
    canOverride: true,
  },
  {
    level: "A1",
    label: "Global Platform Authority",
    codes: ["ADM-005", "ADM-010", "ADM-020", "ADM-025", "ADM-030", "ADM-035", "ADM-040"],
    description: "Operates across the entire platform",
    canOverride: false,
  },
  {
    level: "A2",
    label: "Institutional Authority",
    codes: ["ADM-050", "ADM-055", "ADM-060", "ADM-070"],
    description: "Manages a specific institution, faculty, or department",
    canOverride: false,
  },
  {
    level: "A3",
    label: "Domain Authority",
    codes: ["ADM-080", "ADM-090", "ADM-100", "ADM-110", "ADM-120", "ADM-130", "ADM-140", "ADM-145", "ADM-150", "ADM-165"],
    description: "Manages a specific operational domain",
    canOverride: false,
  },
  {
    level: "A4",
    label: "Operational Authority",
    codes: ["ADM-160", "ADM-170", "ADM-175", "ADM-180", "ADM-185"],
    description: "Specialized delegated roles",
    canOverride: false,
  },
];

// ─── Authority → Agent Mapping ────────────────────────────────────────────
// Defines which agents assist each authority level.
// Administrators interact only with Bud — agents operate behind the scenes.
export const AUTHORITY_AGENT_MAPPING = {
  "ADM-000": {
    primaryInterface: "bud",
    oracleCoordinates: ["forge", "sentinel", "pulse", "atlas", "orbit", "spark", "lens"],
    note: "Founder is assisted by Bud, with Oracle coordinating all specialist agents as needed",
  },
  "ADM-010": {
    primaryInterface: "bud",
    oracleCoordinates: ["forge", "sentinel", "pulse", "atlas"],
    note: "Super Administrator is assisted by Bud, while Oracle coordinates Forge, Sentinel, Pulse, and Atlas as needed",
  },
  "ADM-020": {
    primaryInterface: "bud",
    oracleCoordinates: ["pulse", "forge"],
    note: "Platform Administrator is assisted by Bud, with Oracle coordinating Pulse and Forge",
  },
  "ADM-030": {
    primaryInterface: "bud",
    oracleCoordinates: ["sentinel", "pulse"],
    note: "Trust Administrator works primarily with Sentinel, but still interacts only with Bud",
  },
  "ADM-040": {
    primaryInterface: "bud",
    oracleCoordinates: ["orbit", "spark", "pulse"],
    note: "Experience Administrator is assisted by Bud, with Orbit handling design and Spark personalizing experiences",
  },
  "ADM-050": {
    primaryInterface: "bud",
    oracleCoordinates: ["orbit", "atlas"],
    note: "Institution Administrator is assisted by Bud, with Orbit handling academic workflows and Atlas providing institutional knowledge behind the scenes",
  },
  "ADM-060": {
    primaryInterface: "bud",
    oracleCoordinates: ["orbit", "atlas"],
    note: "Faculty Administrator is assisted by Bud, with Orbit managing academic operations",
  },
  "ADM-070": {
    primaryInterface: "bud",
    oracleCoordinates: ["orbit", "atlas"],
    note: "Department Administrator is assisted by Bud, with Orbit managing course operations",
  },
  "ADM-080": {
    primaryInterface: "bud",
    oracleCoordinates: ["sentinel", "pulse"],
    note: "Community Administrator is assisted by Bud, with Sentinel handling moderation",
  },
  "ADM-090": {
    primaryInterface: "bud",
    oracleCoordinates: ["orbit", "pulse"],
    note: "Business Administrator is assisted by Bud, with Orbit managing storefront design",
  },
  "ADM-100": {
    primaryInterface: "bud",
    oracleCoordinates: ["pulse", "atlas"],
    note: "Support Administrator is assisted by Bud, with Pulse routing tickets and Atlas providing knowledge",
  },
  "ADM-110": {
    primaryInterface: "bud",
    oracleCoordinates: ["sentinel", "pulse"],
    note: "Security Administrator is assisted by Bud, with Sentinel owning all security operations",
  },
  "ADM-120": {
    primaryInterface: "bud",
    oracleCoordinates: ["oracle", "atlas", "pulse"],
    note: "Data Administrator is assisted by Bud, with Oracle providing analytics intelligence",
  },
  "ADM-130": {
    primaryInterface: "bud",
    oracleCoordinates: ["orbit", "lens"],
    note: "Content Administrator is assisted by Bud, with Lens indexing and Orbit designing editorial surfaces",
  },
  "ADM-140": {
    primaryInterface: "bud",
    oracleCoordinates: ["oracle", "pulse"],
    note: "Finance Administrator is assisted by Bud, with Oracle providing financial intelligence",
  },
  "ADM-150": {
    primaryInterface: "bud",
    oracleCoordinates: ["oracle", "spark", "atlas"],
    note: "AI Operations Administrator is assisted by Bud, with Oracle monitoring agent health",
  },
  "ADM-160": {
    primaryInterface: "bud",
    oracleCoordinates: ["sentinel", "atlas", "pulse"],
    note: "Audit Administrator is assisted by Bud, with Sentinel providing audit logs and Atlas documenting governance",
  },
  "ADM-005": {
    primaryInterface: "bud",
    oracleCoordinates: ["oracle", "forge", "sentinel", "pulse", "atlas"],
    note: "Executive Administration is assisted by Bud, with Oracle coordinating all specialist agents for strategic decisions",
  },
  "ADM-025": {
    primaryInterface: "bud",
    oracleCoordinates: ["forge", "pulse", "nexus"],
    note: "Engineering Administration is assisted by Bud, with Forge owning technical architecture and Nexus managing integrations",
  },
  "ADM-035": {
    primaryInterface: "bud",
    oracleCoordinates: ["oracle", "spark", "atlas"],
    note: "AI Administration is assisted by Bud, with Oracle monitoring agent health and Spark optimizing intelligence",
  },
  "ADM-055": {
    primaryInterface: "bud",
    oracleCoordinates: ["orbit", "atlas", "spark"],
    note: "Academic Administration is assisted by Bud, with Orbit managing academic workflows and Atlas providing institutional knowledge",
  },
  "ADM-145": {
    primaryInterface: "bud",
    oracleCoordinates: ["oracle", "pulse", "sentinel"],
    note: "Banking Administration is assisted by Bud, with Oracle providing financial intelligence and Sentinel ensuring compliance",
  },
  "ADM-165": {
    primaryInterface: "bud",
    oracleCoordinates: ["pulse", "forge", "nexus"],
    note: "Operations Administration is assisted by Bud, with Pulse monitoring health and Forge managing infrastructure",
  },
  "ADM-170": {
    primaryInterface: "bud",
    oracleCoordinates: ["sentinel", "pulse"],
    note: "Moderation is assisted by Bud, with Sentinel handling content moderation and community safety",
  },
  "ADM-175": {
    primaryInterface: "bud",
    oracleCoordinates: ["forge", "pulse"],
    note: "Maintenance is assisted by Bud, with Forge executing updates and Pulse monitoring system health during maintenance",
  },
  "ADM-180": {
    primaryInterface: "bud",
    oracleCoordinates: ["sentinel", "forge", "pulse", "oracle"],
    note: "Emergency Operations is assisted by Bud, with Sentinel leading incident response, Forge managing recovery, and Pulse monitoring critical systems",
  },
  "ADM-185": {
    primaryInterface: "bud",
    oracleCoordinates: ["sentinel", "atlas", "pulse"],
    note: "Compliance & Audit is assisted by Bud, with Sentinel providing audit logs, Atlas documenting governance, and Pulse supplying operational metrics. Read-only authority.",
  },
};

// ─── Management Center Mapping ────────────────────────────────────────────
export const AUTHORITY_MANAGEMENT_CENTER = {
  "ADM-000": "founder",
  "ADM-010": "platform_operations",
  "ADM-020": "platform_operations",
  "ADM-030": "trust_operations",
  "ADM-040": "experience_business",
  "ADM-050": "platform_operations",
  "ADM-060": "platform_operations",
  "ADM-070": "platform_operations",
  "ADM-080": "experience_business",
  "ADM-090": "experience_business",
  "ADM-100": "trust_operations",
  "ADM-110": "trust_operations",
  "ADM-120": "platform_operations",
  "ADM-130": "experience_business",
  "ADM-140": "experience_business",
  "ADM-150": "platform_operations",
  "ADM-160": "trust_operations",
  "ADM-005": "founder",
  "ADM-025": "platform_operations",
  "ADM-035": "platform_operations",
  "ADM-055": "platform_operations",
  "ADM-145": "experience_business",
  "ADM-165": "platform_operations",
  "ADM-170": "trust_operations",
  "ADM-175": "platform_operations",
  "ADM-180": "platform_operations",
  "ADM-185": "trust_operations",
};

// ─── Separation Principle ────────────────────────────────────────────────
export const SEPARATION_PRINCIPLE = {
  authorityCodes: "Define WHO can make decisions and manage the platform (ADM-000 through ADM-160)",
  agentCodes: "Define WHICH AI service performs the work (BUD-001, ORC-000, ORB-101, etc.)",
  rule: "Administrators are people. Agents are platform intelligence that assist them. Every administrator interacts only with Bud — agents operate behind the scenes.",
  benefit: "Keeping these two systems separate makes permissions, auditing, and governance much cleaner for an enterprise-scale platform.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────
export function getAuthorityByCode(code) {
  return AUTHORITY_CODES.find((a) => a.code === code);
}

export function getAuthoritiesByLevel(level) {
  return AUTHORITY_CODES.filter((a) => a.level === level);
}

export function getLevelForCode(code) {
  const authority = getAuthorityByCode(code);
  return authority ? authority.level : null;
}

export function canOverride(code) {
  const level = getLevelForCode(code);
  return AUTHORITY_LEVELS.find((l) => l.level === level)?.canOverride || false;
}

export function getSupportingAgents(code) {
  return AUTHORITY_AGENT_MAPPING[code]?.oracleCoordinates || [];
}

export function getManagementCenter(code) {
  return AUTHORITY_MANAGEMENT_CENTER[code];
}

/**
 * Authority hierarchy check — can `actorCode` manage `targetCode`?
 * A0 can manage all. A1 can manage A2+. A2 can manage A3+. etc.
 */
export function canManage(actorCode, targetCode) {
  const actorLevel = getLevelForCode(actorCode);
  const targetLevel = getLevelForCode(targetCode);
  if (!actorLevel || !targetLevel) return false;

  // Founder overrides everything
  if (actorLevel === "A0") return true;

  // Same level — no hierarchy (unless founder)
  if (actorLevel === targetLevel) return false;

  // Actor must be higher authority (lower level number = higher authority)
  const levelOrder = ["A0", "A1", "A2", "A3", "A4"];
  return levelOrder.indexOf(actorLevel) < levelOrder.indexOf(targetLevel);
}