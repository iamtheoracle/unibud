/**
 * UNIBUD Platform Engines — Cross-cutting capabilities shared by all Oracle Systems
 *
 * Oracle Systems answer: "What part of the business does this belong to?"
 * Platform Engines answer: "How does the platform make it work?"
 *
 * Every Oracle System uses these engines. No engine belongs to a single system.
 *
 * Example flow — a student taps "Enroll":
 *   1. Interaction Engine captures the tap
 *   2. Workflow Engine validates prerequisites
 *   3. Trust Shield checks permissions
 *   4. Learning Studio performs the enrollment
 *   5. Communication Engine sends confirmation
 *   6. Operations Engine records logs
 *   7. Rendering Engine updates the UI
 *   8. Code Execution Engine coordinates API calls, state, and DB transaction
 */

import {
  MousePointerClick, Workflow, MessageSquare, Component,
  Settings2, Plug, Activity, Brain, Palette, Code2,
} from "lucide-react";

export const PLATFORM_ENGINES = [
  {
    id: "interaction_engine",
    name: "Interaction Engine",
    codename: "Interact",
    icon: MousePointerClick,
    color: "text-primary",
    bg: "bg-primary/10",
    layer: 1,
    purpose: "Controls every interaction",
    description:
      "Captures and routes every user interaction — clicks, taps, swipes, gestures, drag & drop, hover, keyboard shortcuts, voice commands, camera interactions, multi-touch, context menus, deep links, and navigation actions.",
    capabilities: [
      "Clicks", "Taps", "Swipes", "Gestures", "Drag & Drop",
      "Hover", "Keyboard shortcuts", "Voice commands",
      "Camera interactions", "Multi-touch", "Context menus",
      "Deep links", "Navigation actions",
    ],
    usedBy: ["all_systems"],
  },
  {
    id: "workflow_engine",
    name: "Workflow Engine",
    codename: "Flow",
    icon: Workflow,
    color: "text-info",
    bg: "bg-info/10",
    layer: 2,
    purpose: "Controls business processes",
    description:
      "Manages every business process: approval workflows, registration, admissions, course enrollment, purchases, marketplace transactions, housing applications, payments, research submissions, graduation, and alumni transitions.",
    capabilities: [
      "Approval workflows", "Registration", "Admissions",
      "Course enrollment", "Purchases", "Marketplace",
      "Housing", "Payments", "Research submissions",
      "Graduation", "Alumni transition",
    ],
    usedBy: ["learning_studio", "campus_central", "community_circle", "trust_shield"],
  },
  {
    id: "communication_engine",
    name: "Communication Engine",
    codename: "Comms",
    icon: MessageSquare,
    color: "text-success",
    bg: "bg-success/10",
    layer: 3,
    purpose: "Everything communication",
    description:
      "Powers every form of communication: chat, voice, video, email, push notifications, SMS, in-app notifications, announcements, broadcasts, live events, and study rooms.",
    capabilities: [
      "Chat", "Voice", "Video", "Email", "Push notifications",
      "SMS", "In-app notifications", "Announcements",
      "Broadcasts", "Live events", "Study Rooms",
    ],
    usedBy: ["community_circle", "learning_studio", "campus_central"],
  },
  {
    id: "component_engine",
    name: "Component Engine",
    codename: "UI",
    icon: Component,
    color: "text-purple",
    bg: "bg-purple/10",
    layer: 4,
    purpose: "Controls UI components",
    description:
      "Manages every UI component: buttons, cards, tables, forms, charts, navigation, lists, modals, drawers, menus, search, filters, empty states, and loading states.",
    capabilities: [
      "Buttons", "Cards", "Tables", "Forms", "Charts",
      "Navigation", "Lists", "Modals", "Drawers", "Menus",
      "Search", "Filters", "Empty states", "Loading states",
    ],
    usedBy: ["all_systems"],
  },
  {
    id: "configuration_engine",
    name: "Configuration Engine",
    codename: "Config",
    icon: Settings2,
    color: "text-warning",
    bg: "bg-warning/10",
    layer: 5,
    purpose: "Everything configurable",
    description:
      "Manages everything configurable: feature flags, institution settings, themes, branding, permissions, academic calendars, localization, modules, policies, and integrations.",
    capabilities: [
      "Feature Flags", "Institution settings", "Themes",
      "Branding", "Permissions", "Academic calendars",
      "Localization", "Modules", "Policies", "Integrations",
    ],
    usedBy: ["the_architect", "campus_central", "trust_shield"],
  },
  {
    id: "integration_engine",
    name: "Integration Engine",
    codename: "Integrate",
    icon: Plug,
    color: "text-info",
    bg: "bg-info/10",
    layer: 6,
    purpose: "Everything external",
    description:
      "Manages all external connections: APIs, webhooks, OAuth, payment providers, maps, weather, calendar, learning systems, library systems, email, and SMS.",
    capabilities: [
      "APIs", "Webhooks", "OAuth", "Payment providers",
      "Maps", "Weather", "Calendar", "Learning systems",
      "Library systems", "Email", "SMS",
    ],
    usedBy: ["all_systems"],
  },
  {
    id: "operations_engine",
    name: "Operations Engine",
    codename: "Ops",
    icon: Activity,
    color: "text-error",
    bg: "bg-error/10",
    layer: 7,
    purpose: "Everything operational",
    description:
      "Handles operational concerns: monitoring, health, logs, analytics, scheduling, automation, jobs, queues, backups, disaster recovery, and performance.",
    capabilities: [
      "Monitoring", "Health", "Logs", "Analytics",
      "Scheduling", "Automation", "Jobs", "Queues",
      "Backups", "Disaster recovery", "Performance",
    ],
    usedBy: ["the_architect", "all_systems"],
  },
  {
    id: "intelligence_engine",
    name: "Intelligence Engine",
    codename: "Intel",
    icon: Brain,
    color: "text-primary",
    bg: "bg-primary/10",
    layer: 8,
    purpose: "Everything AI",
    description:
      "Powers all intelligence: Bud, Oracle, memory, recommendations, search, personalization, context, planning, and automation. This is the brain behind the platform.",
    capabilities: [
      "Bud", "Oracle", "Memory", "Recommendations",
      "Search", "Personalization", "Context",
      "Planning", "Automation",
    ],
    usedBy: ["oracle_core", "all_systems"],
  },
  {
    id: "rendering_engine",
    name: "Rendering Engine",
    codename: "Render",
    icon: Palette,
    color: "text-purple",
    bg: "bg-purple/10",
    layer: 9,
    purpose: "Everything visual",
    description:
      "Controls all visual output: themes, animations, responsive layouts, light/dark mode, typography, icons, illustrations, motion, and accessibility.",
    capabilities: [
      "Themes", "Animations", "Responsive layouts",
      "Light/Dark Mode", "Typography", "Icons",
      "Illustrations", "Motion", "Accessibility",
    ],
    usedBy: ["all_systems"],
  },
  {
    id: "code_execution_engine",
    name: "Code Execution Engine",
    codename: "Exec",
    icon: Code2,
    color: "text-success",
    bg: "bg-success/10",
    layer: 10,
    purpose: "Everything developers normally write manually",
    description:
      "Coordinates code execution: state management, event handling, API calls, validation, error handling, retry logic, background tasks, offline sync, caching, and database transactions.",
    capabilities: [
      "State management", "Event handling", "API calls",
      "Validation", "Error handling", "Retry logic",
      "Background tasks", "Offline sync", "Caching",
      "Database transactions",
    ],
    usedBy: ["all_systems"],
  },
];

// ─── Helper Functions ───────────────────────────────────────────────────────
export function getEngineById(id) {
  return PLATFORM_ENGINES.find((e) => e.id === id);
}

export function getEnginesUsedBySystem(systemId) {
  if (!systemId) return PLATFORM_ENGINES;
  return PLATFORM_ENGINES.filter(
    (e) => e.usedBy.includes("all_systems") || e.usedBy.includes(systemId)
  );
}

// ─── Example Flow ────────────────────────────────────────────────────────────
export const ENGINE_FLOW_EXAMPLE = {
  title: "Example: Student taps 'Enroll'",
  steps: [
    { engine: "interaction_engine", action: "Captures the tap" },
    { engine: "workflow_engine", action: "Validates prerequisites" },
    { system: "trust_shield", action: "Checks permissions" },
    { system: "learning_studio", action: "Performs enrollment" },
    { engine: "communication_engine", action: "Sends confirmation" },
    { engine: "operations_engine", action: "Records logs" },
    { engine: "rendering_engine", action: "Updates the UI" },
    { engine: "code_execution_engine", action: "Coordinates API calls, state, and DB transaction" },
  ],
};