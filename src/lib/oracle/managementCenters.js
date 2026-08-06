/**
 * UNIBUD Platform Administration — Four Management Centers
 *
 * Oracle coordinates every administrative workflow.
 * Bud is available throughout as an intelligent operational assistant.
 * Each center receives its own Bud-powered workspace.
 *
 * 1. Founder Workspace — strategic leadership
 * 2. Platform Operations — operate the platform
 * 3. Trust & Operations — protect the platform
 * 4. Experience & Business — operate every product
 *
 * Oracle determines which specialist agents are required.
 * Those agents complete the work. The Founder never manually
 * assigns work to specialist agents.
 */

import {
  Crown, Settings, ShieldCheck, LayoutGrid,
} from "lucide-react";

export const MANAGEMENT_CENTERS = [
  {
    id: "founder",
    name: "Founder Workspace",
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    path: "/oracle",
    description: "Strategic leadership — Oracle coordinates all platform intelligence for the Founder.",
    budRole: "Executive insights, roadmap, strategic planning, global search, decision support",
    coordinatesAgents: ["oracle", "spark", "lens", "atlas"],
    capabilities: [
      "Platform insights & executive reporting",
      "Product roadmap & strategic planning",
      "Cross-platform analytics",
      "AI recommendations for leadership",
      "Global search across all data",
      "Decision support & forecasting",
    ],
    accessRoles: ["super_admin", "oracle", "executive"],
    workspaceRoute: "/oracle",
  },
  {
    id: "platform-ops",
    name: "Platform Operations",
    icon: Settings,
    color: "text-info",
    bg: "bg-info/10",
    path: "/oracle",
    description: "Operate the platform — Oracle coordinates Orbit, Forge, Pulse and Sentinel.",
    budRole: "System configuration, infrastructure guidance, diagnostics, operational assistance",
    coordinatesAgents: ["orbit", "forge", "pulse", "sentinel"],
    capabilities: [
      "System configuration & infrastructure",
      "Institutions & user governance",
      "Permissions & access management",
      "Integrations & APIs",
      "Releases & deployment monitoring",
      "Diagnostics & system health",
    ],
    accessRoles: ["super_admin", "platform_admin", "oracle", "developer"],
    workspaceRoute: "/oracle",
  },
  {
    id: "trust-ops",
    name: "Trust & Operations",
    icon: ShieldCheck,
    color: "text-warning",
    bg: "bg-warning/10",
    path: "/operator",
    description: "Protect the platform — Oracle coordinates Sentinel, Pulse and Atlas.",
    budRole: "Verification, moderation guidance, fraud investigation, compliance assistance",
    coordinatesAgents: ["sentinel", "pulse", "atlas"],
    capabilities: [
      "Identity verification & trust scoring",
      "Content moderation & policy enforcement",
      "Fraud investigations",
      "Compliance & regulatory alignment",
      "Security & incident response",
      "Audit logs & risk analysis",
    ],
    accessRoles: ["super_admin", "platform_admin", "moderator", "compliance_officer", "senior_operator"],
    workspaceRoute: "/operator",
  },
  {
    id: "experience-business",
    name: "Experience & Business",
    icon: LayoutGrid,
    color: "text-success",
    bg: "bg-success/10",
    path: "/finance",
    description: "Operate every product — Oracle coordinates Orbit, Spark, Lens, Atlas and Forge.",
    budRole: "Product operations, revenue insights, growth analytics, campaign management",
    coordinatesAgents: ["orbit", "spark", "lens", "atlas", "forge"],
    capabilities: [
      "Square, Campus, Quad, Connect operations",
      "Marketplace & Wallet management",
      "Research & Communities oversight",
      "Revenue & growth analytics",
      "Campaigns & engagement",
      "Product analytics across all modules",
    ],
    accessRoles: ["super_admin", "platform_admin", "finance_manager", "executive"],
    workspaceRoute: "/finance",
  },
];

// ─── Every management center includes these intelligent capabilities ───────
export const CENTER_CAPABILITIES = [
  "AI dashboard",
  "Operational dashboard",
  "Analytics",
  "Reports",
  "Tasks",
  "Approvals",
  "Notifications",
  "Search",
  "Knowledge",
  "Automation",
  "Audit logs",
  "Activity timeline",
  "Role-based permissions",
];

// ─── Helpers ──────────────────────────────────────────────────────────────
export function getCenterById(id) {
  return MANAGEMENT_CENTERS.find((c) => c.id === id);
}

export function getCenterForRole(role) {
  return MANAGEMENT_CENTERS.find((c) => c.accessRoles.includes(role));
}

export function canAccessCenter(role, centerId) {
  if (role === "super_admin" || role === "oracle") return true;
  const center = getCenterById(centerId);
  if (!center) return false;
  return center.accessRoles.includes(role);
}