import {
  LayoutDashboard, Boxes, Settings, Wrench, Layers, BarChart3, Building2,
  Users, ShieldCheck, Bot, Cpu, ScrollText, Lock, Receipt, HardDrive, Key,
  Rocket, Bell, LifeBuoy, Flag, Plug, Activity,
} from "lucide-react";

export const ORACLE_MODULES = [
  { id: "oracle", label: "Oracle", group: "Overview", icon: LayoutDashboard, desc: "Platform command center." },
  { id: "architect", label: "Architect", group: "Centers", icon: Boxes, desc: "Design and evolve platform architecture." },
  { id: "management", label: "Management", group: "Centers", icon: Settings, desc: "Executive management center." },
  { id: "operator", label: "Operator", group: "Centers", icon: Wrench, desc: "Operations and task coordination." },
  { id: "modules", label: "Modules", group: "Platform", icon: Layers, desc: "Platform module registry." },
  { id: "analytics", label: "Platform Analytics", group: "Platform", icon: BarChart3, desc: "Platform-wide analytics." },
  { id: "institutions", label: "Institution Management", group: "Platform", icon: Building2, desc: "Onboard and manage institutions." },
  { id: "users", label: "User Management", group: "Platform", icon: Users, desc: "All platform users." },
  { id: "roles", label: "Role Management", group: "Platform", icon: ShieldCheck, desc: "Roles and permissions." },
  { id: "bud", label: "Bud Monitoring", group: "Platform", icon: Bot, desc: "Monitor Bud assistant health." },
  { id: "spark", label: "Spark Services", group: "Platform", icon: Cpu, desc: "Spark kernel services." },
  { id: "moderation", label: "Moderation", group: "Trust & Safety", icon: ShieldCheck, desc: "Content reports and moderation." },
  { id: "audit", label: "Audit Logs", group: "Trust & Safety", icon: ScrollText, desc: "Audit trail of platform actions." },
  { id: "security", label: "Security", group: "Trust & Safety", icon: Lock, desc: "Security center and access review." },
  { id: "billing", label: "Billing", group: "Infrastructure", icon: Receipt, desc: "Billing and subscriptions." },
  { id: "storage", label: "Storage", group: "Infrastructure", icon: HardDrive, desc: "File storage usage." },
  { id: "apikeys", label: "API Keys", group: "Infrastructure", icon: Key, desc: "API keys and secrets." },
  { id: "deployments", label: "Deployments", group: "Infrastructure", icon: Rocket, desc: "Deployment history." },
  { id: "notifications", label: "Notifications", group: "Operations", icon: Bell, desc: "Broadcast notifications." },
  { id: "support", label: "Support", group: "Operations", icon: LifeBuoy, desc: "Support tickets." },
  { id: "featureflags", label: "Feature Flags", group: "Operations", icon: Flag, desc: "Toggle platform features." },
  { id: "jobs", label: "Background Jobs", group: "Operations", icon: Cpu, desc: "Scheduled and background jobs." },
  { id: "integrations", label: "Integrations", group: "Operations", icon: Plug, desc: "Connected integrations." },
  { id: "health", label: "Health Monitoring", group: "Operations", icon: Activity, desc: "System health and uptime." },
];

export const moduleById = (id) => ORACLE_MODULES.find((m) => m.id === id);