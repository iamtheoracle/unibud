/**
 * UNIBUD OS v4 — Academic Module Registry
 *
 * Registers all academic capabilities as shared modules so they can be
 * consumed by Campus (and other experiences) without duplication.
 *
 * Each module maps to a Platform Core entity and is governed by an AI authority.
 * References: Phase 6 Campus Migration, Shared Module Constitution.
 */

import { registerModule } from "./moduleRegistry";

const ACADEMIC_MODULES = [
  { id: "timetable", name: "Timetable", category: "academic", authority: "Scribe", entity: "TimetableEntry", requiresContext: true },
  { id: "courses", name: "Courses", category: "academic", authority: "Scribe", entity: "Course", requiresContext: true },
  { id: "assignments", name: "Assignments", category: "academic", authority: "Scribe", entity: "Assignment", requiresContext: true },
  { id: "gpa", name: "GPA", category: "academic", authority: "Analyst", entity: "StudentRecord", requiresContext: true },
  { id: "grades", name: "Grades", category: "academic", authority: "Scribe", entity: "Grade", requiresContext: true },
  { id: "results", name: "Results", category: "academic", authority: "Scribe", entity: "StudentGrade", requiresContext: false },
  { id: "attendance", name: "Attendance", category: "academic", authority: "Scribe", entity: "AttendanceRecord", requiresContext: true },
  { id: "notes", name: "Notes", category: "academic", authority: "Scribe", entity: "Note", requiresContext: false },
  { id: "flashcards", name: "Flashcards", category: "academic", authority: "Scribe", entity: "Flashcard", requiresContext: false },
  { id: "projects", name: "Projects", category: "academic", authority: "Scribe", entity: "Project", requiresContext: false },
  { id: "research", name: "Research", category: "academic", authority: "Scholar", entity: "ResearchProject", requiresContext: true },
  { id: "scholarships", name: "Scholarships", category: "academic", authority: "Scholar", entity: "Scholarship", requiresContext: true },
  { id: "exams", name: "Exams", category: "academic", authority: "Scribe", entity: "ExamSchedule", requiresContext: true },
  { id: "study-sessions", name: "Study Sessions", category: "academic", authority: "Scribe", entity: "StudySession", requiresContext: false },
  { id: "calendar", name: "Calendar", category: "academic", authority: "Scribe", entity: "CalendarEvent", requiresContext: true },
];

// Register each academic module with Campus as the primary consumer
ACADEMIC_MODULES.forEach((mod) => {
  registerModule({
    ...mod,
    consumers: ["campus"],
    hasDemoData: false,
  });
});

export { ACADEMIC_MODULES };