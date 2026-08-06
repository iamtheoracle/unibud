import React, { useEffect } from "react";
import { useContextSystem } from "@/lib/os/ContextProvider";
import { getContract } from "@/lib/os/experienceContract";
import CampusHome from "@/pages/campus/CampusHome";

/**
 * CampusExperience — the migrated Campus experience on the v4 OS runtime.
 *
 * This wrapper connects Campus to Platform Core without changing user-facing
 * functionality. The existing CampusHome page renders unchanged.
 *
 * Platform Core integration:
 *
 * • ContextProvider — Sets "academic" context when Campus is active so that
 *   Bud, Orbit, Spark, and the Realtime Engine prioritize academic modules.
 *
 * • Experience Contract — Campus declares its consumed modules, permissions,
 *   hidden services, and Platform Core hooks. The Constitutional Validator
 *   enforces full compliance.
 *
 * • Module Registry — Campus consumes 15 registered academic modules
 *   (timetable, courses, assignments, GPA, grades, results, attendance,
 *   notes, flashcards, projects, research, scholarships, exams, study
 *   sessions, calendar) rather than owning them. No duplicates.
 *
 * • Realtime Engine — Academic entities (Grade, Assignment, TimetableEntry,
 *   AttendanceRecord, CalendarEvent, StudentGrade) are synced by the
 *   RealtimeSyncProvider via the entitySyncRegistry. React Query caches are
 *   automatically invalidated on entity change. Campus updates instantly —
 *   no manual refresh anywhere.
 *
 * • Bud — Receives academic context (GPA, deadlines, exam dates) and
 *   proactively assists with overdue assignments, GPA changes, exam
 *   preparation, study recommendations, and scholarship opportunities.
 *   Bud remains floating and never becomes a Campus screen.
 *
 * • Orbit — Campus consumes Orbit discoveries for scholarships, research
 *   papers, university announcements, conferences, and competitions.
 *   Only verified information surfaces.
 *
 * • Spark — Handles background indexing, document processing, OCR, workflow
 *   execution, reminder automation, and cache invalidation for Campus.
 *   No UI ownership.
 *
 * Migration, not reconstruction. User-visible behavior is unchanged.
 */
export default function CampusExperience() {
  const { setContext } = useContextSystem();
  const contract = getContract("campus");

  // ContextProvider — set academic context when Campus is the active experience.
  // This signals Platform Core (Bud, Orbit, Spark, Realtime) to prioritize
  // academic modules: today's timetable, assignment deadlines, GPA trends,
  // upcoming exams, study streak, research, and academic recommendations.
  useEffect(() => {
    setContext("academic");
  }, [setContext]);

  // Render the existing Campus page — no functional changes.
  // All Platform Core integration is handled by the OS runtime layers
  // already mounted in AppShell (RealtimeSyncProvider, BudPresenceProvider,
  // VoiceProvider, SearchProvider, OSContextProvider).
  return <CampusHome />;
}