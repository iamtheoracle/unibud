/**
 * UNIBUD Dashboard System — role registry.
 * Each role shares the same design language but uses different widgets.
 * Build a dashboard by mapping these widget types to DashboardWidget instances.
 */
export const ROLE_DASHBOARDS = {
  student: {
    title: "Campus",
    subtitle: "Your academic day at a glance",
    widgets: ["greeting", "cgpa", "today", "deadlines", "pulse", "bud"],
  },
  institution: {
    title: "Institution Console",
    subtitle: "Manage academics, students and verification",
    widgets: ["enrollment", "departments", "announcements", "verification", "staffing", "health"],
  },
  lecturer: {
    title: "Teaching",
    subtitle: "Classes, materials and grading",
    widgets: ["classes", "submissions", "materials", "analytics", "schedule", "feedback"],
  },
  operator: {
    title: "Operations",
    subtitle: "Tasks and assignments",
    widgets: ["queue", "status", "campus", "performance", "evidence", "bud"],
  },
  management: {
    title: "Management",
    subtitle: "Oversight and approvals",
    widgets: ["kpis", "approvals", "reports", "audit", "staffing", "health"],
  },
  architect: {
    title: "Architect",
    subtitle: "Modules and system design",
    widgets: ["modules", "schema", "feature-flags", "health", "audit", "config"],
  },
  oracle: {
    title: "Oracle",
    subtitle: "Intelligence and governance",
    widgets: ["insights", "agents", "audit", "security", "health", "bud"],
  },
};