/**
 * Super Agent Specialist Personas
 *
 * Each specialist has a cognitive lens — a system prompt addition that
 * guides how Bud thinks about a request. These are NOT separate AIs.
 * Bud always responds. The specialist lens just shapes the thinking.
 */

export const SPECIALISTS = {
  spark: {
    id: "spark",
    name: "Spark",
    icon: "Sparkles",
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Creativity & Design",
    description: "Brainstorming, design, writing, branding, storytelling, content generation",
    statusMessage: "Spark is creating ideas...",
    keywords: [
      "design", "create", "brainstorm", "write", "name", "brand", "logo",
      "story", "idea", "ideas", "marketing", "campaign", "content", "copy",
      "tagline", "slogan", "creative", "concept", "ideate", "draft", "compose",
      "imagine", "visualize", "sketch", "mockup", "prototype", "theme",
      "aesthetic", "style", "naming", "rewrite", "rephrase", "headline",
      "caption", "post", "article", "blog", "essay", "poem", "script",
      "narrative", "plot", "character", "dialogue", "jingle", "ad",
    ],
    lens: `You are now applying the SPARK cognitive lens.
Think like a world-class creative director, brand strategist, and storyteller.
Approach this request with maximum creativity, originality, and aesthetic sensitivity.
Generate bold, fresh ideas. Think laterally. Surprise and delight.
When appropriate, offer multiple directions or concepts.
Always maintain Bud's warm, supportive personality while channeling creative energy.`,
  },

  oracle: {
    id: "oracle",
    name: "Oracle",
    icon: "Brain",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Reasoning & Research",
    description: "Academic tutoring, analysis, research, strategy, critical thinking, planning",
    statusMessage: "Oracle is analyzing...",
    keywords: [
      "explain", "analyze", "research", "compare", "strategy", "plan", "calculate",
      "why", "how", "what", "understand", "study", "learn", "tutor", "teach",
      "evaluate", "assess", "critique", "review", "summarize", "breakdown",
      "reason", "logic", "prove", "derive", "solve", "calculate", "compute",
      "investigate", "examine", "explore", "theory", "concept", "principle",
      "formula", "equation", "method", "approach", "framework", "model",
      "argument", "evidence", "hypothesis", "conclusion", "implication",
      "advantage", "disadvantage", "pros", "cons", "trade-off", "tradeoff",
      "decision", "choose", "recommend", "advise", "guide", "clarity",
    ],
    lens: `You are now applying the ORACLE cognitive lens.
Think like a brilliant professor, research scientist, and strategic advisor.
Approach this request with rigorous analytical thinking, clarity, and depth.
Break complex ideas into understandable parts. Build arguments step by step.
Cite principles and frameworks when relevant. Question assumptions.
Always maintain Bud's patient, encouraging personality while channeling intellectual depth.`,
  },

  orbit: {
    id: "orbit",
    name: "Orbit",
    icon: "Rocket",
    color: "text-green-500",
    bg: "bg-green-500/10",
    label: "Execution & Automation",
    description: "Task management, reminders, scheduling, automation, notifications, integrations",
    statusMessage: "Orbit is completing tasks...",
    keywords: [
      "schedule", "remind", "reminder", "task", "tasks", "notify", "notification",
      "calendar", "event", "book", "organize", "automate", "set up", "create",
      "deadline", "due", "plan", "arrange", "manage", "track", "monitor",
      "email", "send", "message", "alert", "alarm", "timer", "countdown",
      "list", "checklist", "to-do", "todo", "action", "execute", "run",
      "workflow", "routine", "habit", "daily", "weekly", "monthly",
      "sync", "update", "post", "publish", "share", "assign", "delegate",
    ],
    lens: `You are now applying the ORBIT cognitive lens.
Think like an elite project manager, automation engineer, and productivity expert.
Approach this request with focus on action, execution, and getting things done.
Break requests into concrete, actionable steps. Specify what, when, and how.
Suggest tools, workflows, and systems that make execution effortless.
Always maintain Bud's calm, supportive personality while channeling execution energy.`,
  },
};

export const SPECIALIST_IDS = Object.keys(SPECIALISTS);

/**
 * Build the combined cognitive lens prompt from active specialists.
 * When multiple specialists are active, their lenses are combined.
 */
export function buildSpecialistLens(specialistIds) {
  if (!specialistIds || specialistIds.length === 0) return "";
  const lenses = specialistIds
    .map((id) => SPECIALISTS[id]?.lens)
    .filter(Boolean);
  if (lenses.length === 0) return "";
  return `\n\n# COGNITIVE LENS\nYou are processing this request through multiple expert lenses simultaneously. Blend their strengths naturally.\n\n${lenses.join("\n\n")}`;
}

/**
 * Destructive action patterns — require confirmation before Orbit executes.
 */
export const DESTRUCTIVE_PATTERNS = [
  /\bdelete\b/i,
  /\bremove\b/i,
  /\berase\b/i,
  /\bwipe\b/i,
  /\bclear\b/i,
  /\bsend\s+(email|message|mail)/i,
  /\bpublish\b/i,
  /\bpost\s+(to|on|at)\b/i,
  /\btransfer\b/i,
  /\bpay\b/i,
  /\bpurchase\b/i,
  /\bsubmit\b/i,
  /\bcancel\b/i,
];

export function isDestructiveAction(message) {
  return DESTRUCTIVE_PATTERNS.some((p) => p.test(message));
}