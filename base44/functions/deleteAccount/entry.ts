import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// Personal, user-scoped entities purged on account deletion (scoped by owner).
const PERSONAL_ENTITIES = [
  "Note", "BudMemory", "BudConversation", "StudentDocument", "WellnessEntry",
  "StudySession", "Flashcard", "QuizAttempt", "AttendanceRecord", "Grade",
  "Citation", "Project", "StudentGoal", "StudyGoal", "CalendarEvent",
  "ReminderPreference", "PortfolioItem", "Milestone", "StudentAchievement",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    const uid = user.id;
    const errors = [];

    for (const name of PERSONAL_ENTITIES) {
      try {
        await base44.asServiceRole.entities[name].deleteMany({ created_by_id: uid });
      } catch (e) {
        errors.push({ entity: name, error: String(e?.message || e) });
      }
    }

    try {
      await base44.asServiceRole.entities.User.delete(uid);
    } catch (e) {
      errors.push({ entity: "User", error: String(e?.message || e) });
    }

    return Response.json({ ok: true, errors });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || "Failed to delete account" }, { status: 500 });
  }
});