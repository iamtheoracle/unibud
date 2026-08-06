/**
 * Spark Smart Tool Recommendations — contextual, non-intrusive suggestions
 * that surface the right tool/workflow at the right moment.
 *
 * Pure heuristics (no LLM cost) combined with a learnable helpfulness weight
 * derived from the student's past accept/dismiss/disable feedback. The more a
 * student uses UNIBUD, the better Spark tunes which suggestions appear.
 *
 * A `context` object describes the student's current situation:
 *   { surface, taskType, text, course, assignmentType, teamSize,
 *     deadline, hasMultipleDeadlines, recentItemTypes }
 */

export const ALL_RECOMMENDATION_TYPES = [
  "research_project_template",
  "group_assignment_workspace",
  "revision_schedule",
  "shared_timeline",
  "citation_management",
  "study_group",
  "formula_workspace",
  "meeting_notes_actions",
  "assignment_assistant",
  "document_library",
];

export const TYPE_LABELS = {
  research_project_template: "Research project template",
  group_assignment_workspace: "Group assignment workspace",
  revision_schedule: "Revision schedules",
  shared_timeline: "Shared timelines",
  citation_management: "Citation management",
  study_group: "Study group suggestions",
  formula_workspace: "Formula workspace",
  meeting_notes_actions: "Meeting notes → action items",
  assignment_assistant: "Assignment assistant",
  document_library: "Document library",
};

const daysUntil = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
};

const txt = (c) => `${c.text || ""} ${c.taskType || ""} ${c.assignmentType || ""} ${c.course || ""}`;

const detectors = [
  {
    type: "research_project_template",
    detect: (c) => {
      if (/research\s*project|dissertation|thesis|literature\s*review|systematic\s*review/i.test(txt(c)) || c.surface === "research" || c.taskType === "research")
        return { priority: 75, confidence: 0.82, title: "Starting a research project?", desc: "Use the Research Project template to organize sources, milestones and notes.", to: "/collaboration", actionLabel: "Use Research Template" };
    },
  },
  {
    type: "group_assignment_workspace",
    detect: (c) => {
      const isGroup = (c.teamSize && c.teamSize > 1) || /group\s*assignment|group\s*project|team\s*project|partner\s*project/i.test(txt(c));
      if (isGroup)
        return { priority: 78, confidence: 0.8, title: "This looks like a group assignment", desc: "Create a shared workspace so everyone can collaborate on tasks and files.", to: "/collaboration", actionLabel: "Create Shared Workspace" };
    },
  },
  {
    type: "revision_schedule",
    detect: (c) => {
      const soon = c.deadline && daysUntil(c.deadline) !== null && daysUntil(c.deadline) <= 14;
      const examCtx = c.surface === "exam" || /exam|revision|mid[- ]?term|finals|mock/i.test(txt(c));
      if (examCtx || (c.assignmentType === "exam" && soon))
        return { priority: 80, confidence: 0.85, title: "Preparing for an exam?", desc: "Generate a personalized revision schedule based on your courses and time left.", to: "/study/exams", actionLabel: "Build Revision Schedule" };
    },
  },
  {
    type: "shared_timeline",
    detect: (c) => {
      if (c.hasMultipleDeadlines || ((c.teamSize && c.teamSize > 1) && c.deadline))
        return { priority: 68, confidence: 0.72, title: "Your team has multiple deadlines", desc: "Create a shared timeline so nothing slips through the cracks.", to: "/collaboration", actionLabel: "Create Shared Timeline" };
    },
  },
  {
    type: "citation_management",
    detect: (c) => {
      if (/report|essay|bibliography|references?|citation|dissertation|literature\s*review/i.test(txt(c)))
        return { priority: 66, confidence: 0.75, title: "Writing a report?", desc: "Citation Manager keeps APA, MLA, Chicago, Harvard and IEEE in order.", to: "/study/citations", actionLabel: "Open Citation Manager" };
    },
  },
  {
    type: "study_group",
    detect: (c) => {
      if (/classmates|group\s*study|study\s*group|same\s*topic|revise\s*together/i.test(txt(c)) || (c.course && c.recentItemTypes?.includes("note")))
        return { priority: 60, confidence: 0.66, title: "Several classmates on the same topic?", desc: "Start a study group to share notes, quiz each other and stay motivated.", to: "/study-groups", actionLabel: "Start a Study Group" };
    },
  },
  {
    type: "formula_workspace",
    detect: (c) => {
      if (/calculation|formula|equation|maths|math|physics|derivative|integral|algebra|chemistry\s*equation|stoichiometry/i.test(txt(c)))
        return { priority: 62, confidence: 0.7, title: "This task involves calculations", desc: "Open the formula workspace to structure equations and steps clearly.", to: "/study/notes", actionLabel: "Open Formula Workspace" };
    },
  },
  {
    type: "meeting_notes_actions",
    detect: (c) => {
      if (/meeting|agenda|minutes|action\s*items|follow[- ]?ups|stand[- ]?up/i.test(txt(c)))
        return { priority: 58, confidence: 0.68, title: "This looks like meeting notes", desc: "Convert notes into trackable action items for your workspace.", to: "/collaboration", actionLabel: "Convert to Action Items" };
    },
  },
  {
    type: "assignment_assistant",
    detect: (c) => {
      const d = c.deadline && daysUntil(c.deadline);
      if (/assignment|essay|report|paper|coursework|project/i.test(txt(c)) && d !== null && d <= 7)
        return { priority: 70, confidence: 0.78, title: "An assignment is due soon", desc: "Bud can help you break it down, explain concepts and draft ethically.", to: "/study/assignment", actionLabel: "Open Assignment Assistant" };
    },
  },
  {
    type: "document_library",
    detect: (c) => {
      if (/upload|pdf|slides|handout|past\s*questions|lecture\s*notes/i.test(txt(c)))
        return { priority: 50, confidence: 0.6, title: "Working with documents?", desc: "Add them to the Document Library for AI summaries, OCR and search.", to: "/study/library", actionLabel: "Open Document Library" };
    },
  },
];

/** Aggregate past feedback into per-type accept/dismiss stats. */
export function computeStats(feedback = []) {
  const stats = {};
  (feedback || []).forEach((f) => {
    const t = f.recommendation_type;
    if (!t) return;
    if (!stats[t]) stats[t] = { accepted: 0, dismissed: 0, disabled: 0, total: 0 };
    stats[t].total += 1;
    if (f.status === "accepted") stats[t].accepted += 1;
    else if (f.status === "dismissed") stats[t].dismissed += 1;
    else if (f.status === "disabled") stats[t].disabled += 1;
  });
  Object.values(stats).forEach((s) => {
    s.acceptRate = s.total ? s.accepted / s.total : null;
  });
  return stats;
}

/** Learned weight: accepted types gain up to 1.4×, dismissed types fall to 0.6×. */
export function helpfulnessWeight(type, stats) {
  const s = stats[type];
  if (!s || s.acceptRate === null) return 1;
  return 0.6 + 0.8 * s.acceptRate;
}

/** Detect + rank recommendations for a context, respecting prefs + cooldown. */
export function detectRecommendations(context = {}, prefs = {}, stats = {}) {
  if (prefs && prefs.enabled === false) return [];
  const disabled = new Set(prefs?.disabled_types || []);
  const lastDismissed = prefs?.last_dismissed || {};
  const cooldown = (prefs?.cooldown_minutes ?? 60) * 60000;
  const now = Date.now();

  const cands = [];
  for (const d of detectors) {
    if (disabled.has(d.type)) continue;
    const last = lastDismissed[d.type];
    if (last && now - new Date(last).getTime() < cooldown) continue;
    const r = d.detect(context);
    if (!r) continue;
    const w = helpfulnessWeight(d.type, stats);
    cands.push({
      type: d.type,
      surface: context.surface || "home",
      title: r.title,
      description: r.desc,
      suggested_tool: d.type,
      suggested_route: r.to,
      actionLabel: r.actionLabel,
      priority: r.priority,
      confidence: r.confidence,
      helpfulness: w,
      context: { ...context },
      score: r.priority * r.confidence * w,
    });
  }
  cands.sort((a, b) => b.score - a.score);
  return cands;
}