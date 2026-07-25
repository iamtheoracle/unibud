import {
  Home, FilePlus2, ClipboardList, Workflow, BarChart3, FileBarChart, Menu,
  Palette, BellRing, Bot, ShieldCheck, Boxes, History,
} from "lucide-react";

export const ARCHITECT_MODULES = [
  { id: "home", label: "Home", group: "Overview", icon: Home, desc: "Recent projects, drafts, published changes, pending reviews, platform components, activity timeline." },
  { id: "versions", label: "Version Control", group: "Overview", icon: History, desc: "Draft, published, previous versions, rollback and change history." },
  { id: "pages", label: "Page Builder", group: "Builders", icon: FilePlus2, desc: "Build pages visually with drag & drop — sections, cards, tabs, tables, charts. Desktop, tablet & mobile." },
  { id: "forms", label: "Form Builder", group: "Builders", icon: ClipboardList, desc: "Create forms visually — validation, conditional fields, required fields, dynamic options." },
  { id: "workflows", label: "Workflow Builder", group: "Builders", icon: Workflow, desc: "Visual workflow designer — start, decisions, approvals, rejections, loops, delays, API calls." },
  { id: "dashboards", label: "Dashboard Builder", group: "Builders", icon: BarChart3, desc: "Build dashboards — KPI cards, tables, charts, timelines, heatmaps, leaderboards." },
  { id: "reports", label: "Report Builder", group: "Builders", icon: FileBarChart, desc: "Create reports — filters, charts, tables, grouping, export, scheduling." },
  { id: "menus", label: "Menu Builder", group: "Platform", icon: Menu, desc: "Sidebar, top & mobile navigation plus quick actions with role-based visibility." },
  { id: "themes", label: "Theme Builder", group: "Platform", icon: Palette, desc: "Colors, typography, icons, logos, branding, radius, shadows, spacing — institution-specific." },
  { id: "components", label: "Component Library", group: "Platform", icon: Boxes, desc: "Reusable components — buttons, inputs, cards, charts, tables, forms, modals, tabs." },
  { id: "permissions", label: "Permission Builder", group: "Platform", icon: ShieldCheck, desc: "Visual RBAC editor — roles, permissions, access rules, feature access, institution policies." },
  { id: "notifications", label: "Notification Builder", group: "Platform", icon: BellRing, desc: "Email, SMS, push & in-app templates with variables and localization." },
  { id: "ai", label: "AI Builder", group: "Intelligence", icon: Bot, desc: "Configure Bud — personality, tone, prompt templates, policies, safety rules, response templates." },
];

export const moduleById = (id) => ARCHITECT_MODULES.find((m) => m.id === id);