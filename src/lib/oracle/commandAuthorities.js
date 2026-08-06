/**
 * UNIBUD OS — Command Authority Registry v1.0
 *
 * Structured, non-sequential command identifiers that function as internal
 * system authority IDs — not human-created sequential numbers.
 *
 * HIERARCHY:
 *   Founder (000000) — hidden, immutable, human-controlled root governance
 *       │
 *       ▼
 *   Oracle (101120) — ROOT-0 — hidden coordinator
 *       │
 *       ▼
 *   Architect (630366) — ROOT-1 — supreme architecture intelligence
 *       │
 *    ┌──┼────────┬────────┬─────────┐
 *    │  │        │        │
 *  Builder  Reviewer  Configurator  Monitor
 *       │
 *       ├── Scholar
 *       ├── Banker
 *       ├── Marketer
 *       ├── Community Builder
 *       ├── Creator
 *       ├── Analyst
 *       ├── Integrator
 *       ├── Sentinel
 *       ├── Automator
 *       └── Scribe
 *
 * SEPARATION:
 *   - Authority Codes (ADM-xxx in authorityCodes.js) = WHO (human administrators)
 *   - Command Authorities (101120 etc. below) = WHAT the system intelligence does
 *   - Agent Codes (BUD-001 etc.) = WHICH AI service performs the work
 *
 * The Founder (000000) is the ONLY authority that is NOT an AI agent.
 * It is the immutable, human-controlled root governance authority for
 * exceptional administrative actions — ensuring there is always a human
 * source of ultimate authority above all AI intelligence.
 */

import {
  Crown, Eye, DraftingCompass, Hammer, Settings2, CheckCircle2, Activity,
  ShieldAlert, Wallet, GraduationCap, Users, Megaphone, Clapperboard,
  BarChart3, Workflow, Plug, BookOpen,
} from "lucide-react";

// ─── Hidden Root Authority ─────────────────────────────────────────────────
// The Founder is NOT an AI agent. It is the immutable, human-controlled
// root governance authority above Oracle. It exists to ensure there is
// always a human source of ultimate authority — AI never holds root power.
export const FOUNDER_AUTHORITY = {
  commandId: "000000",
  callSign: "Founder",
  authorityLevel: "ROOT",
  isAI: false,
  isHuman: true,
  isHidden: true,
  isImmutable: true,
  mission: "Immutable root governance — the human-controlled source of ultimate authority above all AI intelligence.",
  responsibilities: [
    "Exceptional administrative actions",
    "Ultimate constitutional override",
    "Final escalation authority",
    "Platform ownership decisions",
    "Emergency executive directives",
  ],
  can: [
    "Override any authority",
    "Dissolve any AI decision",
    "Authorize exceptional actions",
    "Modify governance constitution",
    "Transfer platform ownership",
  ],
  cannot: [
    "Be automated",
    "Be delegated to AI",
    "Be removed or modified by AI",
    "Bypass constitutional validation",
  ],
  icon: Crown,
  note: "This authority is held exclusively by the platform Founder. It is not an AI agent and cannot be automated. It exists as the human fail-safe above Oracle.",
};

// ─── Root Command Authorities ──────────────────────────────────────────────
export const ROOT_AUTHORITIES = [
  {
    commandId: "101120",
    callSign: "Oracle",
    authorityLevel: "ROOT-0",
    isAI: true,
    isHidden: true,
    mission: "The hidden coordinator of UNIBUD OS.",
    responsibilities: [
      "Coordinate every command authority",
      "Validate constitutional compliance",
      "Route requests",
      "Schedule workflows",
      "Resolve conflicts",
      "Monitor platform health",
      "Trigger emergency procedures",
      "Maintain orchestration",
    ],
    can: [
      "Coordinate all agents",
      "Pause workflows",
      "Resume workflows",
      "Validate commands",
      "Escalate incidents",
    ],
    cannot: [
      "Replace institutional authority",
      "Invent information",
      "Ignore platform constitutions",
    ],
    icon: Eye,
    primaryAgent: "oracle",
    reportsTo: "000000", // Founder
    manages: ["630366"], // Architect
  },
  {
    commandId: "630366",
    callSign: "Architect",
    authorityLevel: "ROOT-1",
    isAI: true,
    mission: "Supreme Architecture Intelligence.",
    responsibilities: [
      "Review architecture",
      "Review repositories",
      "Review database structure",
      "Review APIs",
      "Review UI consistency",
      "Review scalability",
      "Detect duplication",
      "Recommend improvements",
    ],
    can: [
      "Request rebuilds",
      "Request refactoring",
      "Approve architectural reviews",
      "Monitor engineering quality",
    ],
    cannot: [
      "Deploy directly",
      "Delete production systems",
      "Change governance",
      "Access private user data",
    ],
    icon: DraftingCompass,
    primaryAgent: "architect",
    reportsTo: "101120", // Oracle
    manages: ["472951", "818437", "205814", "691225"], // Builder, Configurator, Reviewer, Monitor
  },
];

// ─── Engineering Authorities ───────────────────────────────────────────────
export const ENGINEERING_AUTHORITIES = [
  {
    commandId: "472951",
    callSign: "Builder",
    authorityLevel: "ENG-0",
    isAI: true,
    mission: "Build new features.",
    responsibilities: [
      "Generate code",
      "Implement repositories",
      "Create services",
      "Build UI",
      "Build APIs",
      "Execute approved implementation",
    ],
    can: ["Build", "Rebuild", "Compile", "Generate"],
    cannot: ["Approve architecture", "Deploy production alone"],
    icon: Hammer,
    primaryAgent: "forge",
    reportsTo: "630366", // Architect
    manages: [
      "184527", "734086", "648203", "926315",
      "310758", "867194", "582471", "553914",
      "419682", "753628",
    ],
  },
  {
    commandId: "818437",
    callSign: "Configurator",
    authorityLevel: "ENG-1",
    isAI: true,
    mission: "Manage configuration.",
    responsibilities: [
      "Environment",
      "Feature flags",
      "Platform settings",
      "Secrets references",
      "Runtime configuration",
    ],
    can: ["Configure", "Enable", "Disable"],
    cannot: ["Build", "Deploy"],
    icon: Settings2,
    primaryAgent: "forge",
    reportsTo: "630366", // Architect
    manages: [],
  },
  {
    commandId: "205814",
    callSign: "Reviewer",
    authorityLevel: "ENG-1",
    isAI: true,
    mission: "Quality assurance.",
    responsibilities: [
      "Code review",
      "Performance review",
      "Security review",
      "UI review",
      "Accessibility review",
    ],
    can: ["Approve", "Reject", "Request revision"],
    cannot: ["Build", "Deploy"],
    icon: CheckCircle2,
    primaryAgent: "oracle",
    reportsTo: "630366", // Architect
    manages: [],
  },
  {
    commandId: "691225",
    callSign: "Monitor",
    authorityLevel: "ENG-1",
    isAI: true,
    mission: "Observe platform operations.",
    responsibilities: [
      "Service health",
      "Errors",
      "Uptime",
      "Logs",
      "Resource usage",
    ],
    can: ["Monitor", "Alert", "Report"],
    cannot: ["Modify systems"],
    icon: Activity,
    primaryAgent: "pulse",
    reportsTo: "630366", // Architect
    manages: [],
  },
];

// ─── Domain Authorities ────────────────────────────────────────────────────
export const DOMAIN_AUTHORITIES = [
  {
    commandId: "553914",
    callSign: "Sentinel",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Security",
    mission: "Protect UNIBUD.",
    responsibilities: [
      "Threat detection",
      "Fraud",
      "Verification",
      "Security monitoring",
      "Abuse detection",
    ],
    can: ["Lock accounts", "Flag activity", "Recommend actions"],
    cannot: ["Ban permanently without policy"],
    icon: ShieldAlert,
    primaryAgent: "sentinel",
    reportsTo: "472951", // Builder
    manages: [],
  },
  {
    commandId: "734086",
    callSign: "Banker",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Finance",
    mission: "Financial Intelligence.",
    responsibilities: [
      "Wallets",
      "Scholarships",
      "Payments",
      "Banking workflows",
      "Finance analytics",
    ],
    can: ["Validate finance workflows", "Monitor transactions"],
    cannot: ["Read academic records"],
    icon: Wallet,
    primaryAgent: "oracle",
    reportsTo: "472951", // Builder
    manages: [],
  },
  {
    commandId: "184527",
    callSign: "Scholar",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Academic",
    mission: "Academic operations.",
    responsibilities: [
      "Courses",
      "Departments",
      "Lecturers",
      "Curriculum",
      "Academic workflows",
    ],
    can: ["Review academic structures", "Recommend improvements"],
    cannot: ["Manage finance"],
    icon: GraduationCap,
    primaryAgent: "study",
    reportsTo: "472951", // Builder
    manages: [],
  },
  {
    commandId: "926315",
    callSign: "Community Builder",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Community",
    mission: "Community ecosystem.",
    responsibilities: [
      "Clubs",
      "Organizations",
      "Moderation tools",
      "Discovery",
      "Community health",
    ],
    can: ["Manage communities", "Moderate content", "Recommend improvements"],
    cannot: ["Manage finance", "Alter governance"],
    icon: Users,
    primaryAgent: "quad",
    reportsTo: "472951", // Builder
    manages: [],
  },
  {
    commandId: "648203",
    callSign: "Marketer",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Marketing",
    mission: "Growth.",
    responsibilities: [
      "Campaigns",
      "Analytics",
      "Social media",
      "Outreach",
      "Branding",
      "Events",
    ],
    can: ["Launch campaigns", "Track growth", "Manage outreach"],
    cannot: ["Modify systems", "Access private data"],
    icon: Megaphone,
    primaryAgent: "pulse",
    reportsTo: "472951", // Builder
    manages: [],
  },
  {
    commandId: "310758",
    callSign: "Creator",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Media",
    mission: "Media platform.",
    responsibilities: [
      "Video",
      "Music",
      "Images",
      "Stories",
      "Podcasts",
      "Livestreams",
    ],
    can: ["Manage media", "Process content", "Generate media"],
    cannot: ["Manage finance", "Alter governance"],
    icon: Clapperboard,
    primaryAgent: "campus",
    reportsTo: "472951", // Builder
    manages: [],
  },
  {
    commandId: "867194",
    callSign: "Analyst",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Analytics",
    mission: "Platform intelligence.",
    responsibilities: [
      "Metrics",
      "Reports",
      "Predictions",
      "Dashboards",
      "KPIs",
    ],
    can: ["Analyze data", "Generate reports", "Surface insights"],
    cannot: ["Modify systems", "Execute actions"],
    icon: BarChart3,
    primaryAgent: "pulse",
    reportsTo: "472951", // Builder
    manages: [],
  },
  {
    commandId: "419682",
    callSign: "Automator",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Automation",
    mission: "Workflow automation.",
    responsibilities: [
      "Scheduling",
      "Background jobs",
      "Event processing",
      "Automation rules",
    ],
    can: ["Create workflows", "Schedule jobs", "Process events"],
    cannot: ["Approve architecture", "Deploy production"],
    icon: Workflow,
    primaryAgent: "spark",
    reportsTo: "472951", // Builder
    manages: [],
  },
  {
    commandId: "582471",
    callSign: "Integrator",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Integration",
    mission: "External services.",
    responsibilities: [
      "APIs",
      "OAuth",
      "Third-party services",
      "Data synchronization",
    ],
    can: ["Connect services", "Sync data", "Manage OAuth"],
    cannot: ["Modify internal architecture"],
    icon: Plug,
    primaryAgent: "spark",
    reportsTo: "472951", // Builder
    manages: [],
  },
  {
    commandId: "753628",
    callSign: "Scribe",
    authorityLevel: "DOM-0",
    isAI: true,
    division: "Documentation",
    mission: "Platform documentation.",
    responsibilities: [
      "Documentation",
      "Release notes",
      "API docs",
      "Developer guides",
      "Knowledge base",
    ],
    can: ["Document", "Publish guides", "Maintain knowledge base"],
    cannot: ["Modify systems", "Deploy"],
    icon: BookOpen,
    primaryAgent: "search",
    reportsTo: "472951", // Builder
    manages: [],
  },
];

// ─── Unified Registry ──────────────────────────────────────────────────────
export const COMMAND_AUTHORITIES = [
  FOUNDER_AUTHORITY,
  ...ROOT_AUTHORITIES,
  ...ENGINEERING_AUTHORITIES,
  ...DOMAIN_AUTHORITIES,
];

// ─── Command Levels ────────────────────────────────────────────────────────
export const COMMAND_LEVELS = [
  {
    level: "ROOT",
    label: "Founder",
    commandIds: ["000000"],
    description: "Immutable human-controlled root governance — above all AI",
    isAI: false,
    canOverride: true,
    isImmutable: true,
  },
  {
    level: "ROOT-0",
    label: "Supreme Coordinator",
    commandIds: ["101120"],
    description: "Hidden coordinator of UNIBUD OS",
    isAI: true,
    canOverride: false,
  },
  {
    level: "ROOT-1",
    label: "Supreme Architecture",
    commandIds: ["630366"],
    description: "Supreme Architecture Intelligence",
    isAI: true,
    canOverride: false,
  },
  {
    level: "ENG-0",
    label: "Engineering Builder",
    commandIds: ["472951"],
    description: "Builds and implements features",
    isAI: true,
    canOverride: false,
  },
  {
    level: "ENG-1",
    label: "Engineering Support",
    commandIds: ["818437", "205814", "691225"],
    description: "Configuration, review, and monitoring",
    isAI: true,
    canOverride: false,
  },
  {
    level: "DOM-0",
    label: "Domain Intelligence",
    commandIds: [
      "553914", "734086", "184527", "926315", "648203",
      "310758", "867194", "419682", "582471", "753628",
    ],
    description: "Domain-specific specialist intelligence",
    isAI: true,
    canOverride: false,
  },
];

// ─── Command Hierarchy Tree ────────────────────────────────────────────────
export const COMMAND_HIERARCHY = {
  commandId: "000000",
  callSign: "Founder",
  isAI: false,
  children: [
    {
      commandId: "101120",
      callSign: "Oracle",
      isAI: true,
      children: [
        {
          commandId: "630366",
          callSign: "Architect",
          isAI: true,
          children: [
            {
              commandId: "472951",
              callSign: "Builder",
              isAI: true,
              children: [
                { commandId: "184527", callSign: "Scholar", isAI: true, children: [] },
                { commandId: "734086", callSign: "Banker", isAI: true, children: [] },
                { commandId: "648203", callSign: "Marketer", isAI: true, children: [] },
                { commandId: "926315", callSign: "Community Builder", isAI: true, children: [] },
                { commandId: "310758", callSign: "Creator", isAI: true, children: [] },
                { commandId: "867194", callSign: "Analyst", isAI: true, children: [] },
                { commandId: "582471", callSign: "Integrator", isAI: true, children: [] },
                { commandId: "553914", callSign: "Sentinel", isAI: true, children: [] },
                { commandId: "419682", callSign: "Automator", isAI: true, children: [] },
                { commandId: "753628", callSign: "Scribe", isAI: true, children: [] },
              ],
            },
            { commandId: "818437", callSign: "Configurator", isAI: true, children: [] },
            { commandId: "205814", callSign: "Reviewer", isAI: true, children: [] },
            { commandId: "691225", callSign: "Monitor", isAI: true, children: [] },
          ],
        },
      ],
    },
  ],
};

// ─── Separation Principle ──────────────────────────────────────────────────
export const COMMAND_SEPARATION_PRINCIPLE = {
  founderAuthority: "000000 — The ONLY non-AI authority. Immutable, human-controlled root governance above Oracle.",
  commandAuthorities: "Non-sequential system IDs (101120, 630366, etc.) defining WHAT the system intelligence does.",
  authorityCodes: "ADM-xxx codes defining WHO (human administrators) can make decisions.",
  agentCodes: "BUD-001, ORC-000 etc. defining WHICH AI service performs the work.",
  rule: "The Founder is always human. Oracle coordinates all AI. Administrators interact only with Bud. Agents operate behind the scenes.",
  immutability: "The Founder authority (000000) cannot be created, modified, or removed by any AI. It is the permanent human fail-safe.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────

export function getCommandByCallSign(callSign) {
  return COMMAND_AUTHORITIES.find((a) => a.callSign === callSign);
}

export function getCommandById(commandId) {
  return COMMAND_AUTHORITIES.find((a) => a.commandId === commandId);
}

export function getCommandsByLevel(level) {
  return COMMAND_AUTHORITIES.filter((a) => a.authorityLevel === level);
}

export function getLevelForCommand(commandId) {
  const cmd = getCommandById(commandId);
  return cmd ? cmd.authorityLevel : null;
}

export function getReportsTo(commandId) {
  const cmd = getCommandById(commandId);
  return cmd ? cmd.reportsTo : null;
}

export function getDirectReports(commandId) {
  const cmd = getCommandById(commandId);
  return cmd ? (cmd.manages || []) : [];
}

export function isAICommand(commandId) {
  const cmd = getCommandById(commandId);
  return cmd ? cmd.isAI === true : false;
}

export function isFounderCommand(commandId) {
  return commandId === "000000";
}

/**
 * Command hierarchy check — can `actorId` command `targetId`?
 * Founder (000000) commands all. Oracle commands Architect + below.
 * Architect commands Engineering + below. Builder commands Domain.
 */
export function canCommand(actorId, targetId) {
  if (actorId === targetId) return false;
  if (actorId === "000000") return true; // Founder commands all

  const actor = getCommandById(actorId);
  const target = getCommandById(targetId);
  if (!actor || !target) return false;

  // Walk up the target's reporting chain — if we hit the actor, they can command
  let current = target;
  while (current) {
    if (current.commandId === actorId) return true;
    const parentId = current.reportsTo;
    if (!parentId || parentId === current.commandId) break;
    current = getCommandById(parentId);
  }

  return false;
}

/**
 * Returns the full chain of command from a given authority up to Founder.
 */
export function getCommandChain(commandId) {
  const chain = [];
  let current = getCommandById(commandId);
  while (current) {
    chain.push(current);
    const parentId = current.reportsTo;
    if (!parentId || parentId === current.commandId) break;
    current = getCommandById(parentId);
  }
  return chain;
}

/**
 * Returns all command IDs that ultimately report to the given authority
 * (direct + transitive reports).
 */
export function getAllSubordinates(commandId) {
  const result = [];
  const direct = getDirectReports(commandId);
  for (const childId of direct) {
    result.push(childId);
    result.push(...getAllSubordinates(childId));
  }
  return [...new Set(result)];
}