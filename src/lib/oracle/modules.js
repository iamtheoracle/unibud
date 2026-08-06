import {
  LayoutDashboard, Building2, Boxes, Users, Bot, ShieldCheck, Plug, Activity, ScrollText, Search, Network, Gauge, Radar,
  BarChart3,
  Wallet,
  Cpu,
  ListChecks,
  Crown,
  Brain,
} from "lucide-react";

export const ORACLE_MODULES = [
  { id: "intelligence", label: "Oracle Intelligence", group: "Overview", icon: Brain, desc: "Autonomous coordination network — platform health scanning, agent orchestration, and AI-generated recommendations with full execution standards." },
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
  { id: "content", label: "Content Intelligence", group: "Intelligence", icon: BarChart3, desc: "Platform-wide content & engagement analytics across posts, shorts, podcasts and marketplace." },
  { id: "finance", label: "Financial Intelligence", group: "Intelligence", icon: Wallet, desc: "Revenue, collection health, refunds, wallet flow and marketplace performance across the platform." },
  { id: "collaboration", label: "Collaboration Intelligence", group: "Intelligence", icon: Users, desc: "Participation, task throughput, workspace health and community activity across Spark collaboration." },
  { id: "spark-agents", label: "Spark Agent Registry", group: "Intelligence", icon: Cpu, desc: "Configuration-driven registry of all specialist agents — enable, disable and reorder without code changes." },
  { id: "spark-observability", label: "Spark Observability", group: "Infrastructure", icon: Activity, desc: "Execution logs, success rates, agent usage and latency across the multi-agent orchestration engine." },
  { id: "task-intelligence", label: "Task Intelligence", group: "Intelligence", icon: ListChecks, desc: "Team productivity, completion rates, workload distribution and project health across the Spark task system." },
  { id: "executive", label: "Executive Authority", group: "Governance", icon: Crown, desc: "Verify your authority code to activate Executive Mode — Oracle coordinates specialist agents for authorized platform operations." },
];

export const moduleById = (id) => ORACLE_MODULES.find((m) => m.id === id);