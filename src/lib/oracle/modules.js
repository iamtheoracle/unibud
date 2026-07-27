import {
  LayoutDashboard, Building2, Boxes, Users, Bot, ShieldCheck, Plug, Activity, ScrollText, Search, Network, Gauge, Radar,
} from "lucide-react";

export const ORACLE_MODULES = [
  { id: "dashboard", label: "Dashboard", group: "Overview", icon: LayoutDashboard, desc: "Platform-wide command center — real-time health, activity and revenue." },
  { id: "registry", label: "Live Registry", group: "Overview", icon: Radar, desc: "Mission-control live metrics across students, academics, AI, platform, community, institutions and system — every value flows from the registry." },
  { id: "search", label: "Global Search", group: "Overview", icon: Search, desc: "Universal search across users, institutions, payments, logs and settings." },
  { id: "institutions", label: "Institution Registry", group: "Platform", icon: Building2, desc: "Onboard, verify, suspend and manage every institution." },
  { id: "products", label: "Product Registry", group: "Platform", icon: Boxes, desc: "My Realm product registry — versions, environments, modules and release channels." },
  { id: "users", label: "User Governance", group: "Governance", icon: Users, desc: "Global administration of platform admins, staff, students, parents and developers." },
  { id: "ai", label: "AI Governance", group: "Governance", icon: Bot, desc: "Monitor Bud, Spark, AI usage, cost, models, prompt logs and rate limits." },
  { id: "ai-monitor", label: "AI Monitoring", group: "Governance", icon: Gauge, desc: "AI architecture monitoring — health scores, resource utilization, bottlenecks and split recommendations for Bud, Spark and all internal AI services." },
  { id: "security", label: "Security Center", group: "Governance", icon: ShieldCheck, desc: "Global security monitoring — logins, threats, devices, API keys and audit." },
  { id: "integrations", label: "Integration Center", group: "Infrastructure", icon: Plug, desc: "External services — payments, banking, KYC, email, SMS, cloud, analytics, AI." },
  { id: "providers", label: "Provider Hub", group: "Infrastructure", icon: Network, desc: "Provider Integration Hub — registry, adapters, health, webhooks, secrets and API logs across every provider group." },
  { id: "monitoring", label: "Monitoring", group: "Infrastructure", icon: Activity, desc: "Real-time API latency, database, queues, background jobs, errors and storage." },
  { id: "audit", label: "Audit Center", group: "Compliance", icon: ScrollText, desc: "Immutable system-wide audit log with filtering, searching and export." },
];

export const moduleById = (id) => ORACLE_MODULES.find((m) => m.id === id);