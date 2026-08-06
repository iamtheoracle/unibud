/**
 * UNIBUD OS v4 — Realtime Integration Hooks
 *
 * Connects the Realtime Engine to the three Platform Core authorities:
 *   - Spark: triggers automations, reminders, workflows, cache invalidation
 *   - Orbit: receives and ranks new announcements, opportunities, events
 *   - Bud: proactively surfaces meaningful changes to the user
 *
 * References: AI Constitution — Spark, Orbit, Bud integration.
 *   "Spark never renders UI. Orbit never fabricates content. Bud never polls."
 */

import { realtimeEngine } from "./engine";
import { eventBus } from "@/lib/runtime/eventBus";
import { isHighPriorityEntity } from "./channels";

// ─── Spark Integration ────────────────────────────────────────────────────
// Spark receives realtime events and may trigger automations, reminders,
// workflows, indexing, and cache invalidation. Spark never renders UI.

realtimeEngine.registerIntegration({
  id: "spark",
  handler: (payload) => {
    // Emit targeted events for Spark's automation engine to pick up
    const meaningfulEntities = [
      "Assignment", "Exam", "Grade", "TaskManagement", "Notification",
      "StudySession", "StudentAchievement",
    ];

    const hasMeaningful = payload.entities.some((e) => meaningfulEntities.includes(e));
    if (hasMeaningful) {
      eventBus.publish({
        type: "spark:realtime-event",
        category: "automation",
        payload: {
          entities: payload.entities,
          domains: payload.domains,
          context: payload.context,
          timestamp: payload.timestamp,
        },
      });
    }
  },
});

// ─── Orbit Integration ────────────────────────────────────────────────────
// Orbit receives new announcements, scholarships, opportunities, campus events,
// and verified news. Orbit ranks and distributes them. Orbit never fabricates.

realtimeEngine.registerIntegration({
  id: "orbit",
  handler: (payload) => {
    const orbitEntities = [
      "StaffAnnouncement", "EmergencyNotice", "Opportunity", "CampusEvent",
      "ExternalContent", "AcademicCalendarEvent", "ExamSchedule",
      "Scholarship",
    ];

    const orbitRelevant = payload.entities.filter((e) => orbitEntities.includes(e));
    if (orbitRelevant.length > 0) {
      eventBus.publish({
        type: "orbit:new-content",
        category: "discovery",
        payload: {
          entities: orbitRelevant,
          timestamp: payload.timestamp,
        },
      });
    }
  },
});

// ─── Bud Integration ──────────────────────────────────────────────────────
// Bud listens for important changes and proactively surfaces insights.
// Bud never polls — it reacts to realtime events.

realtimeEngine.registerIntegration({
  id: "bud",
  handler: (payload) => {
    // Define which entity changes Bud should react to
    const budTriggers = {
      Grade: "grade_changed",
      Assignment: "assignment_changed",
      Exam: "exam_changed",
      StudentAchievement: "achievement_earned",
      StudySession: "study_activity",
      Notification: "notification_received",
      EmergencyNotice: "emergency_alert",
      TimetableEntry: "timetable_changed",
      Scholarship: "scholarship_available",
      StaffAnnouncement: "announcement_received",
    };

    for (const entity of payload.entities) {
      const trigger = budTriggers[entity];
      if (!trigger) continue;

      // Check context priority — only surface high-priority events in the active context
      const isHighPriority = isHighPriorityEntity(entity, payload.context);

      eventBus.publish({
        type: `bud:${trigger}`,
        category: "bud",
        payload: {
          entity,
          trigger,
          highPriority: isHighPriority,
          context: payload.context,
          timestamp: payload.timestamp,
        },
      });
    }
  },
});