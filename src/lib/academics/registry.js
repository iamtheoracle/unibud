import {
  CalendarDays, ClipboardList, FolderKanban, NotebookPen, TrendingUp,
  CalendarCheck, FileText, CalendarRange, FileSignature, ScrollText,
  CalendarClock, Users, UserSquare, Building2, ListTodo, FileBarChart,
} from "lucide-react";

/**
 * Academic Registry — source of truth for every academic experience.
 * Maps each to its existing route, or flags `live:false` when its dedicated
 * home is still being built (Course Registration, Lecturer Directory, Dept Hub).
 */
export const ACADEMIC_CATEGORIES = [
  { key: "agenda", title: "Unified Agenda", desc: "Every deadline in one timeline", icon: ListTodo, to: "/agenda", live: true, color: "217 91% 60%" },
  { key: "timetable", title: "Timetable", desc: "Your weekly academic rhythm", icon: CalendarDays, to: "/timetable", live: true, color: "217 91% 60%" },
  { key: "assignments", title: "Assignment Manager", desc: "Track & conquer every task", icon: ClipboardList, to: "/assignments", live: true, color: "262 83% 58%" },
  { key: "projects", title: "Project Manager", desc: "Collaborate & ship", icon: FolderKanban, to: "/projects", live: true, color: "142 71% 45%" },
  { key: "notes", title: "Smart Notes", desc: "Capture knowledge that lasts", icon: NotebookPen, to: "/notes", live: true, color: "38 92% 50%" },
  { key: "results", title: "GPA / CGPA Tracker", desc: "Results & performance", icon: TrendingUp, to: "/academics/results", live: true, color: "262 83% 58%" },
  { key: "report", title: "Summary Report", desc: "Your full semester at a glance", icon: FileBarChart, to: "/academics/report", live: true, color: "262 83% 58%" },
  { key: "attendance", title: "Attendance", desc: "Never miss your threshold", icon: CalendarCheck, to: "/attendance", live: true, color: "142 71% 45%" },
  { key: "exams", title: "Exams", desc: "Prepare & perform", icon: FileText, to: "/exams", live: true, color: "0 72% 51%" },
  { key: "calendar", title: "Academic Calendar", desc: "Term dates & deadlines", icon: CalendarRange, to: "/calendar", live: true, color: "217 91% 60%" },
  { key: "registration", title: "Course Registration", desc: "Enroll for the semester", icon: FileSignature, to: null, live: false, color: "262 83% 58%" },
  { key: "planner", title: "Study Planner", desc: "Smart study sessions", icon: CalendarClock, to: "/study-sessions", live: true, color: "38 92% 50%" },
  { key: "studygroups", title: "Study Groups", desc: "Learn together", icon: Users, to: "/study-groups", live: true, color: "142 71% 45%" },
  { key: "lecturers", title: "Lecturer Directory", desc: "Find your faculty", icon: UserSquare, to: null, live: false, color: "217 91% 60%" },
  { key: "department", title: "Department Hub", desc: "Your department, unified", icon: Building2, to: null, live: false, color: "262 83% 58%" },
];

export const ACADEMIC_GROUPS = [
  { key: "plan", label: "Plan", items: ["agenda", "timetable", "calendar", "planner", "registration"] },
  { key: "work", label: "Work", items: ["assignments", "projects", "notes"] },
  { key: "perform", label: "Perform", items: ["results", "report", "attendance", "exams"] },
  { key: "community", label: "Community", items: ["studygroups", "lecturers", "department"] },
];