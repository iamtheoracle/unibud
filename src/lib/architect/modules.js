import {
  LayoutDashboard, Boxes, ClipboardList, Workflow, BarChart3, ShieldCheck,
  Zap, BellRing, FileBarChart, Code2, Palette, Bot, FolderGit2,
} from "lucide-react";

export const ARCHITECT_MODULES = [
  { id: "workspace", label: "Workspace", group: "Workspace", icon: FolderGit2, desc: "Projects, recent changes, published & draft configurations, activity timeline." },
  { id: "entities", label: "Entity Builder", group: "Builders", icon: Boxes, desc: "Visual builder for platform entities — fields, relationships, validation, enums." },
  { id: "forms", label: "Form Builder", group: "Builders", icon: ClipboardList, desc: "Drag-and-drop form builder with conditional fields, sections and validation." },
  { id: "workflows", label: "Workflow Builder", group: "Builders", icon: Workflow, desc: "Visual workflow canvas — approvals, reviews, escalations, automation, timers." },
  { id: "dashboards", label: "Dashboard Builder", group: "Builders", icon: BarChart3, desc: "Build dashboards visually — charts, KPI cards, tables, calendars, AI summaries." },
  { id: "automations", label: "Automation Builder", group: "Builders", icon: Zap, desc: "Visual automation — triggers, actions, delays, webhooks." },
  { id: "roles", label: "Role Builder", group: "Governance", icon: ShieldCheck, desc: "Create custom roles — permissions, menus, routes, CRUD rights, feature access." },
  { id: "notifications", label: "Notification Builder", group: "Governance", icon: BellRing, desc: "Notification templates — in-app, email, SMS, push with variables & localization." },
  { id: "reports", label: "Report Builder", group: "Output", icon: FileBarChart, desc: "Generate reports — tables, charts, CSV, Excel, PDF, scheduled reports." },
  { id: "api", label: "API Builder", group: "Output", icon: Code2, desc: "Manage integrations — REST endpoints, webhooks, API keys, rate limits, logs." },
  { id: "themes", label: "Theme Builder", group: "Design", icon: Palette, desc: "Customize colors, typography, logos, icons, branding, institution themes." },
  { id: "ai", label: "AI Builder", group: "Design", icon: Bot, desc: "Configure Bud & Spark — prompt templates, actions, permissions, routing, context." },
];

export const moduleById = (id) => ARCHITECT_MODULES.find((m) => m.id === id);