import {
  School, Compass, CalendarDays, BookCheck, FlaskConical, Trophy,
  FolderCheck, Crown, Briefcase, Award, GraduationCap, HeartHandshake, Sparkles,
} from "lucide-react";

export const TIMELINE_TYPES = [
  { key: "admission", label: "Admission", icon: School },
  { key: "orientation", label: "Orientation", icon: Compass },
  { key: "semester_started", label: "Semester Started", icon: CalendarDays },
  { key: "course_completed", label: "Course Completed", icon: BookCheck },
  { key: "research_published", label: "Research Published", icon: FlaskConical },
  { key: "competition_won", label: "Competition Won", icon: Trophy },
  { key: "project_completed", label: "Project Completed", icon: FolderCheck },
  { key: "leadership_role", label: "Leadership Role", icon: Crown },
  { key: "internship", label: "Internship", icon: Briefcase },
  { key: "award", label: "Award", icon: Award },
  { key: "scholarship", label: "Scholarship", icon: GraduationCap },
  { key: "graduation", label: "Graduation", icon: GraduationCap },
  { key: "alumni", label: "Alumni", icon: HeartHandshake },
  { key: "custom", label: "Milestone", icon: Sparkles },
];

export function getTypeMeta(key) {
  return TIMELINE_TYPES.find((t) => t.key === key) || TIMELINE_TYPES.find((t) => t.key === "custom");
}