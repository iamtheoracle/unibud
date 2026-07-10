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
  "linear-gradient(135deg, #1a1a2e, #16213e)",
  "linear-gradient(135deg, #D4AF37, #F59E0B)",
  "linear-gradient(135deg, #7C3AED, #2563EB)",
  "linear-gradient(135deg, #16A34A, #0D9488)",
  "linear-gradient(135deg, #DC2626, #F59E0B)",
  "linear-gradient(135deg, #000000, #1F1F1F)",
  "#2563EB",
  "#7C3AED",
  "#16A34A",
  "#D4AF37",
  "#DC2626",
  "#000000",
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