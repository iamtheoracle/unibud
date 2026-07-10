import {
  Lightbulb, BookOpen, Newspaper, FlaskConical, Zap, Code2,
  GraduationCap, Briefcase, Rocket, FolderKanban, Trophy, Users, Calendar,
} from "lucide-react";

export const SHORT_CATEGORIES = [
  { id: "study_tips", label: "Study Tips", icon: Lightbulb, color: "hsl(var(--unibud-gold))" },
  { id: "lecture_summary", label: "Lecture Summary", icon: BookOpen, color: "hsl(var(--unibud-blue))" },
  { id: "campus_news", label: "Campus News", icon: Newspaper, color: "hsl(var(--unibud-red))" },
  { id: "research", label: "Research", icon: FlaskConical, color: "hsl(var(--unibud-purple))" },
  { id: "innovation", label: "Innovation", icon: Zap, color: "hsl(var(--unibud-orange))" },
  { id: "coding", label: "Coding", icon: Code2, color: "hsl(var(--unibud-blue))" },
  { id: "tutorial", label: "Tutorial", icon: GraduationCap, color: "hsl(var(--unibud-green))" },
  { id: "career_advice", label: "Career Advice", icon: Briefcase, color: "hsl(var(--unibud-blue))" },
  { id: "entrepreneurship", label: "Entrepreneurship", icon: Rocket, color: "hsl(var(--unibud-orange))" },
  { id: "student_project", label: "Student Project", icon: FolderKanban, color: "hsl(var(--unibud-green))" },
  { id: "competition", label: "Competition", icon: Trophy, color: "hsl(var(--unibud-gold))" },
  { id: "clubs", label: "Clubs", icon: Users, color: "hsl(var(--unibud-purple))" },
  { id: "events", label: "Events", icon: Calendar, color: "hsl(var(--unibud-red))" },
];

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const STORAGE_KEY = "unibud_short_reactions";
const BOOKMARK_KEY = "unibud_short_bookmarks";
const FOLLOW_KEY = "unibud_short_follows";

export function getShortCategory(catId) {
  return SHORT_CATEGORIES.find((c) => c.id === catId) || SHORT_CATEGORIES[6];
}

export function getShortReaction(videoId) {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data)[videoId] || null;
  } catch {
    return null;
  }
}

export function setShortReaction(videoId, reaction) {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || "{}";
    const map = JSON.parse(data);
    if (reaction) map[videoId] = reaction;
    else delete map[videoId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function isShortBookmarked(videoId) {
  try {
    const data = localStorage.getItem(BOOKMARK_KEY) || "[]";
    return JSON.parse(data).includes(videoId);
  } catch {
    return false;
  }
}

export function toggleShortBookmark(videoId) {
  try {
    const data = localStorage.getItem(BOOKMARK_KEY) || "[]";
    const arr = JSON.parse(data);
    const idx = arr.indexOf(videoId);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(videoId);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(arr));
    return idx < 0;
  } catch {
    return false;
  }
}

export function isFollowingCreator(creatorName) {
  try {
    const data = localStorage.getItem(FOLLOW_KEY) || "[]";
    return JSON.parse(data).includes(creatorName);
  } catch {
    return false;
  }
}

export function toggleFollowCreator(creatorName) {
  try {
    const data = localStorage.getItem(FOLLOW_KEY) || "[]";
    const arr = JSON.parse(data);
    const idx = arr.indexOf(creatorName);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(creatorName);
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(arr));
    return idx < 0;
  } catch {
    return false;
  }
}