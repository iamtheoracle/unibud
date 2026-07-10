import {
  Camera, Video, Type, Sparkles, BookOpen, Trophy, FolderKanban,
  Calendar, Users, Award, FlaskConical, GraduationCap,
} from "lucide-react";

export const STORY_TYPES = [
  { id: "photo", label: "Photo", icon: Camera, color: "hsl(var(--unibud-green))" },
  { id: "video", label: "Video", icon: Video, color: "hsl(var(--unibud-blue))" },
  { id: "text", label: "Text", icon: Type, color: "hsl(var(--unibud-gold))" },
  { id: "campus_moment", label: "Campus Moment", icon: Sparkles, color: "hsl(var(--unibud-purple))" },
  { id: "study_session", label: "Study Session", icon: BookOpen, color: "hsl(var(--unibud-green))" },
  { id: "achievement", label: "Achievement", icon: Trophy, color: "hsl(var(--unibud-gold))" },
  { id: "project", label: "Project", icon: FolderKanban, color: "hsl(var(--unibud-blue))" },
  { id: "event", label: "Event", icon: Calendar, color: "hsl(var(--unibud-red))" },
  { id: "club", label: "Club", icon: Users, color: "hsl(var(--unibud-blue))" },
  { id: "competition", label: "Competition", icon: Award, color: "hsl(var(--unibud-orange))" },
  { id: "research", label: "Research", icon: FlaskConical, color: "hsl(var(--unibud-purple))" },
  { id: "graduation", label: "Graduation", icon: GraduationCap, color: "hsl(var(--unibud-gold))" },
];

export const HIGHLIGHT_CATEGORIES = [
  { id: "academic", label: "Academic", icon: BookOpen, color: "hsl(var(--unibud-blue))" },
  { id: "projects", label: "Projects", icon: FolderKanban, color: "hsl(var(--unibud-green))" },
  { id: "campus", label: "Campus", icon: Sparkles, color: "hsl(var(--unibud-purple))" },
  { id: "research", label: "Research", icon: FlaskConical, color: "hsl(var(--unibud-purple))" },
  { id: "competitions", label: "Competitions", icon: Award, color: "hsl(var(--unibud-orange))" },
  { id: "travel", label: "Travel", icon: Camera, color: "hsl(var(--unibud-green))" },
  { id: "memories", label: "Memories", icon: Sparkles, color: "hsl(var(--unibud-gold))" },
  { id: "leadership", label: "Leadership", icon: Users, color: "hsl(var(--unibud-blue))" },
  { id: "graduation", label: "Graduation", icon: GraduationCap, color: "hsl(var(--unibud-gold))" },
];

export const TEXT_BACKGROUNDS = [
  "linear-gradient(135deg, #1C1C20, #131316)",
  "linear-gradient(135deg, #6D28D9, #A78BFA)",
  "linear-gradient(135deg, #6D28D9, #3B82F6)",
  "linear-gradient(135deg, #10B981, #14B8A6)",
  "linear-gradient(135deg, #DC2626, #F59E0B)",
  "linear-gradient(135deg, #131316, #1C1C20)",
  "#3B82F6",
  "#6D28D9",
  "#10B981",
  "#6D28D9",
  "#DC2626",
  "#1C1C20",
];

export const STORY_DURATION_DEFAULT = 5;
export const STORY_EXPIRY_HOURS = 24;

export function getStoryType(typeId) {
  return STORY_TYPES.find((t) => t.id === typeId) || STORY_TYPES[0];
}

export function getHighlightCategory(catId) {
  return HIGHLIGHT_CATEGORIES.find((c) => c.id === catId) || HIGHLIGHT_CATEGORIES[2];
}

export function computeExpiry(date = new Date()) {
  const expiry = new Date(date);
  expiry.setHours(expiry.getHours() + STORY_EXPIRY_HOURS);
  return expiry.toISOString();
}