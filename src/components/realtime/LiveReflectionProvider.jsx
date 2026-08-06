import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * LiveReflectionProvider — app-wide realtime reflection.
 *
 * Subscribes to the platform realtime channel for the core entities and, on
 * any remote create/update/delete, invalidates the React Query cache so every
 * active list/detail refetches and reflects the latest state. Events are
 * debounced so bursts coalesce into a single refresh.
 *
 * Render once inside the authenticated shell.
 */

const LIVE_ENTITIES = [
  "QuadPost",
  "QuadComment",
  "Message",
  "Conversation",
  "Community",
  "Club",
  "StudyGroup",
  "StudyGroupMessage",
  "TaskManagement",
  "TaskComment",
  "TaskActivity",
  "Notification",
  "CalendarEvent",
  "CampusEvent",
  "Assignment",
  "Exam",
  "Course",
  "CourseMaterial",
  "Grade",
  "StudentGrade",
  "AttendanceRecord",
  "WalletLedger",
  "FinancialTransaction",
  "MentorshipRequest",
  "BudConversation",
  "BudMemory",
  "Story",
  "ShortVideo",
  "PodcastEpisode",
  "CollaborationItem",
  "CollaborationComment",
];

const DEBOUNCE_MS = 700;

export default function LiveReflectionProvider() {
  const qc = useQueryClient();

  useEffect(() => {
    let timer = null;
    const schedule = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        qc.invalidateQueries();
      }, DEBOUNCE_MS);
    };

    const unsubs = LIVE_ENTITIES.map((name) => {
      const entity = base44.entities?.[name];
      if (!entity?.subscribe) return null;
      try {
        return entity.subscribe(() => schedule());
      } catch {
        return null;
      }
    }).filter(Boolean);

    return () => {
      unsubs.forEach((u) => u && u());
      if (timer) clearTimeout(timer);
    };
  }, [qc]);

  return null;
}