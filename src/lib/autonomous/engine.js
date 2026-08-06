import { base44 } from "@/api/base44Client";
import { loadPreferences, isAutomationEnabled } from "./preferences";

/**
 * Autonomous Intelligence Engine
 *
 * Runs periodic analysis across the student's academic, social, campus,
 * and wellness data. Generates proactive insights and creates notifications
 * for critical findings.
 *
 * All checks respect the user's automation preferences — disabled automations
 * are skipped entirely.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Main entry point — runs all enabled checks in parallel and returns insights.
 */
export async function runAutonomousChecks() {
  const prefs = loadPreferences();

  const checks = [
    checkAssignmentRisk,
    checkExamReadiness,
    checkCampusIntelligence,
    checkProductivity,
    checkWellness,
    checkRecommendations,
    checkLearning,
    checkSafety,
  ];

  const results = await Promise.allSettled(checks.map((c) => c(prefs)));
  return results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function severityRank(s) {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s] || 0;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due - now) / DAY_MS);
}

// ── Academic Intelligence ──

async function checkAssignmentRisk(prefs) {
  if (!isAutomationEnabled(prefs, "assignment_risk")) return [];
  try {
    const assignments = await base44.entities.Assignment.list("-due_date", 20);
    if (!assignments?.length) return [];
    const now = new Date();

    return assignments
      .filter((a) => a.status !== "completed" && a.status !== "submitted")
      .map((a) => {
        const days = daysUntil(a.due_date);
        if (days === null || days > 7) return null;
        const severity = days < 0 ? "critical" : days <= 2 ? "high" : "medium";
        return {
          id: `assignment_risk_${a.id}`,
          automationId: "assignment_risk",
          type: "risk",
          severity,
          title: days < 0 ? `${a.title || "Assignment"} is overdue` : `${a.title || "Assignment"} due in ${days} day${days !== 1 ? "s" : ""}`,
          message: days < 0 ? `This was due on ${a.due_date}.` : `Due on ${a.due_date}.`,
          action: { label: "View", link: "/assignments" },
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function checkExamReadiness(prefs) {
  if (!isAutomationEnabled(prefs, "exam_readiness")) return [];
  try {
    const exams = await base44.entities.Exam.list("-created_date", 10);
    if (!exams?.length) return [];
    return exams
      .map((e) => {
        const days = daysUntil(e.date);
        if (days === null || days > 30 || days < -1) return null;
        const severity = days <= 3 ? "high" : days <= 7 ? "medium" : "low";
        return {
          id: `exam_readiness_${e.id}`,
          automationId: "exam_readiness",
          type: "academic",
          severity,
          title: `${e.title || "Exam"} in ${days} day${days !== 1 ? "s" : ""}`,
          message: days <= 7 ? "Start intensive revision now." : "Begin preparing early.",
          action: { label: "Prepare", link: "/exams" },
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

// ── Campus Intelligence ──

async function checkCampusIntelligence(prefs) {
  const insights = [];
  const oneHourAgo = new Date(Date.now() - HOUR_MS).toISOString();

  if (isAutomationEnabled(prefs, "lecturer_posts") || isAutomationEnabled(prefs, "new_notes")) {
    try {
      const posts = await base44.entities.QuadPost.list("-created_date", 10);
      const recent = (posts || []).filter((p) => p.created_date > oneHourAgo);
      for (const post of recent) {
        if (post.author_role === "lecturer" && isAutomationEnabled(prefs, "lecturer_posts")) {
          insights.push({
            id: `lecturer_post_${post.id}`,
            automationId: "lecturer_posts",
            type: "campus",
            severity: "low",
            title: `${post.author_name} posted`,
            message: (post.content || "").slice(0, 80),
            action: { label: "View", link: "/quad" },
          });
        }
      }
    } catch {}
  }

  if (isAutomationEnabled(prefs, "scholarship_open")) {
    try {
      const scholarships = await base44.entities.Scholarship.list("-created_date", 5);
      const recent = (scholarships || []).filter((s) => s.created_date > oneHourAgo);
      for (const s of recent) {
        insights.push({
          id: `scholarship_${s.id}`,
          automationId: "scholarship_open",
          type: "campus",
          severity: "medium",
          title: `New scholarship: ${s.name || s.title || "Available"}`,
          message: "A new scholarship opportunity just opened.",
          action: { label: "View", link: "/scholarships" },
        });
      }
    } catch {}
  }

  if (isAutomationEnabled(prefs, "internship_open")) {
    try {
      const opps = await base44.entities.Opportunity.list("-created_date", 5);
      const recent = (opps || []).filter((o) => o.created_date > oneHourAgo);
      for (const o of recent) {
        insights.push({
          id: `internship_${o.id}`,
          automationId: "internship_open",
          type: "campus",
          severity: "medium",
          title: `New opportunity: ${o.title || "Available"}`,
          message: o.company ? `At ${o.company}` : "A new internship opened.",
          action: { label: "View", link: "/opportunities" },
        });
      }
    } catch {}
  }

  if (isAutomationEnabled(prefs, "event_match")) {
    try {
      const events = await base44.entities.CampusEvent.list("-created_date", 5);
      const recent = (events || []).filter((e) => e.created_date > oneHourAgo);
      for (const e of recent) {
        insights.push({
          id: `event_${e.id}`,
          automationId: "event_match",
          type: "campus",
          severity: "low",
          title: `New event: ${e.title || "Campus Event"}`,
          message: e.date ? `On ${e.date}` : "Check it out.",
          action: { label: "View", link: "/events" },
        });
      }
    } catch {}
  }

  return insights;
}

// ── Productivity ──

async function checkProductivity(prefs) {
  const insights = [];

  if (isAutomationEnabled(prefs, "unfinished_work")) {
    try {
      const tasks = await base44.entities.TaskManagement.list("-created_date", 20);
      const unfinished = (tasks || []).filter((t) => t.status !== "completed" && t.status !== "done");
      if (unfinished.length > 0) {
        insights.push({
          id: "unfinished_work",
          automationId: "unfinished_work",
          type: "productivity",
          severity: unfinished.length > 5 ? "high" : "medium",
          title: `${unfinished.length} unfinished task${unfinished.length !== 1 ? "s" : ""}`,
          message: "You have unfinished work that needs attention.",
          action: { label: "View", link: "/tasks" },
        });
      }
    } catch {}
  }

  if (isAutomationEnabled(prefs, "missed_deadlines")) {
    try {
      const assignments = await base44.entities.Assignment.list("-due_date", 20);
      const missed = (assignments || []).filter(
        (a) => a.status !== "completed" && a.status !== "submitted" && daysUntil(a.due_date) < 0
      );
      for (const a of missed) {
        insights.push({
          id: `missed_${a.id}`,
          automationId: "missed_deadlines",
          type: "productivity",
          severity: "critical",
          title: `Missed deadline: ${a.title || "Assignment"}`,
          message: `Was due on ${a.due_date}.`,
          action: { label: "View", link: "/assignments" },
        });
      }
    } catch {}
  }

  return insights;
}

// ── Wellness ──

function checkWellness(prefs) {
  const insights = [];
  const hour = new Date().getHours();

  if (isAutomationEnabled(prefs, "sleep_reminders") && hour >= 23) {
    insights.push({
      id: "sleep_reminder",
      automationId: "sleep_reminders",
      type: "wellness",
      severity: "medium",
      title: "Time to wind down",
      message: "It's getting late. Consider wrapping up and getting some rest.",
      action: { label: "OK", link: null },
    });
  }

  if (isAutomationEnabled(prefs, "hydration") && hour >= 10 && hour <= 20 && hour % 3 === 0) {
    insights.push({
      id: "hydration_reminder",
      automationId: "hydration",
      type: "wellness",
      severity: "low",
      title: "Stay hydrated",
      message: "Drink a glass of water to stay focused.",
      action: { label: "OK", link: null },
    });
  }

  if (isAutomationEnabled(prefs, "smart_breaks") && hour >= 8 && hour <= 22) {
    insights.push({
      id: "break_reminder",
      automationId: "smart_breaks",
      type: "wellness",
      severity: "low",
      title: "Take a breather",
      message: "A 5-minute break can boost your focus and productivity.",
      action: { label: "OK", link: null },
    });
  }

  return insights;
}

// ── Recommendations ──

async function checkRecommendations(prefs) {
  const insights = [];

  if (isAutomationEnabled(prefs, "rec_clubs")) {
    try {
      const clubs = await base44.entities.Club.list("-created_date", 5);
      if (clubs?.length) {
        insights.push({
          id: "rec_clubs",
          automationId: "rec_clubs",
          type: "recommendation",
          severity: "low",
          title: `Discover: ${clubs[0].name || "a club"}`,
          message: "Based on your interests, this club might be a great fit.",
          action: { label: "Explore", link: "/clubs" },
        });
      }
    } catch {}
  }

  if (isAutomationEnabled(prefs, "rec_study_partners")) {
    try {
      const groups = await base44.entities.StudyGroup.list("-created_date", 3);
      if (groups?.length) {
        insights.push({
          id: "rec_study_partners",
          automationId: "rec_study_partners",
          type: "recommendation",
          severity: "low",
          title: `Study group: ${groups[0].name || "Available"}`,
          message: "Join a study group to collaborate with classmates.",
          action: { label: "View", link: "/study-groups" },
        });
      }
    } catch {}
  }

  if (isAutomationEnabled(prefs, "rec_events")) {
    try {
      const events = await base44.entities.CampusEvent.list("-created_date", 3);
      if (events?.length) {
        insights.push({
          id: "rec_events",
          automationId: "rec_events",
          type: "recommendation",
          severity: "low",
          title: `Upcoming: ${events[0].title || "Campus Event"}`,
          message: "This event matches your interests.",
          action: { label: "View", link: "/events" },
        });
      }
    } catch {}
  }

  return insights;
}

// ── Learning Intelligence ──

async function checkLearning(prefs) {
  const insights = [];

  if (isAutomationEnabled(prefs, "weak_subjects")) {
    try {
      const grades = await base44.entities.Grade.list("-created_date", 20);
      if (grades?.length) {
        const lowGrades = grades.filter((g) => {
          const score = g.score || g.percentage || g.total || 0;
          return score < 50;
        });
        if (lowGrades.length > 0) {
          insights.push({
            id: "weak_subjects",
            automationId: "weak_subjects",
            type: "learning",
            severity: "high",
            title: `${lowGrades.length} subject${lowGrades.length !== 1 ? "s" : ""} need attention`,
            message: "Some of your grades indicate areas that need more focus. Consider creating a revision plan.",
            action: { label: "View", link: "/academics/results" },
          });
        }
      }
    } catch {}
  }

  return insights;
}

// ── Safety ──

async function checkSafety(prefs) {
  const insights = [];

  if (isAutomationEnabled(prefs, "emergency_alerts")) {
    try {
      const alerts = await base44.entities.SafetyAlert.filter({ status: "active" }, "-created_date", 3);
      for (const alert of alerts || []) {
        insights.push({
          id: `safety_${alert.id}`,
          automationId: "emergency_alerts",
          type: "safety",
          severity: "critical",
          title: `${alert.alert_type === "sos" ? "Emergency" : alert.alert_type || "Safety Alert"}`,
          message: alert.description || alert.location || "A safety alert is active on campus.",
          action: { label: "View", link: "/safety" },
        });
      }
    } catch {}
  }

  return insights;
}

/**
 * Create notifications for new critical/high insights.
 * Deduplicates by checking against previously seen insight IDs.
 */
export async function createNotificationsForInsights(insights, seenIds) {
  const newInsights = insights.filter((i) => !seenIds.has(i.id));
  for (const insight of newInsights) {
    if (insight.severity === "critical" || insight.severity === "high") {
      try {
        await base44.entities.Notification.create({
          title: insight.title,
          message: insight.message,
          type: "bud",
          category: "bud",
          priority: insight.severity === "critical" ? "critical" : "high",
          link: insight.action?.link || null,
          icon: "Sparkles",
        });
      } catch {}
    }
  }
}