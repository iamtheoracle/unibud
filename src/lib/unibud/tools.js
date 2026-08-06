import {
  BookOpen, FolderKanban, NotebookPen, CalendarClock, Building2, Users,
} from "lucide-react";

/**
 * Static configuration — not intelligence.
 * Tags matched against stored goal tags to drive the "suggested next" pick.
 */
export const TOOL_DEFINITIONS = [
  {
    id: "assignments",
    name: "Assignments",
    description: "Track what's due and what's done.",
    tags: ["deadlines", "coursework", "grades"],
    icon: BookOpen,
    stat: "3 due this week",
    path: "/assignments",
  },
  {
    id: "projects",
    name: "Projects",
    description: "Longer-running work with milestones.",
    tags: ["coursework", "collaboration", "deadlines"],
    icon: FolderKanban,
    stat: "1 milestone Friday",
    path: "/fyp-hub",
  },
  {
    id: "smart_notes",
    name: "Smart Notes",
    description: "Notes that connect back to your courses.",
    tags: ["coursework", "study", "review"],
    icon: NotebookPen,
    stat: "12 notes this term",
    path: "/library",
  },
  {
    id: "study_plans",
    name: "Study Plans",
    description: "A sequenced plan for an exam or a subject.",
    tags: ["study", "review", "grades"],
    icon: CalendarClock,
    stat: "Chem exam in 6 days",
    path: "/study-session",
  },
  {
    id: "campus",
    name: "Campus",
    description: "Events, deadlines, and services at your school.",
    tags: ["campus_life", "community"],
    icon: Building2,
    stat: "2 events this week",
    path: "/",
  },
  {
    id: "connect",
    name: "Connect",
    description: "Study groups, mentors, and classmates.",
    tags: ["community", "collaboration"],
    icon: Users,
    stat: "1 group invite",
    path: "/connect",
  },
];