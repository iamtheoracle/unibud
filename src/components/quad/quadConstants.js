import React from "react";
import {
  PenLine, Image, Video, FileText, StickyNote, BarChart3, Calendar,
  HelpCircle, ShoppingBag, Search, Trophy, Users, FlaskConical, BookOpen,
  Building2, Layers, User, Globe, MessageSquare, Bookmark, Link,
} from "lucide-react";

export const REACTIONS = [
  { id: "like", label: "Like", emoji: "👍", color: "hsl(var(--unibud-blue))" },
  { id: "celebrate", label: "Celebrate", emoji: "🎉", color: "hsl(var(--unibud-gold))" },
  { id: "helpful", label: "Helpful", emoji: "💡", color: "hsl(var(--unibud-orange))" },
  { id: "insightful", label: "Insightful", emoji: "🤔", color: "hsl(var(--unibud-purple))" },
  { id: "funny", label: "Funny", emoji: "😄", color: "hsl(var(--unibud-green))" },
  { id: "love", label: "Love", emoji: "❤️", color: "hsl(var(--unibud-red))" },
];

export const POST_TYPES = [
  { id: "text", label: "Post", icon: PenLine, color: "hsl(var(--foreground))" },
  { id: "photo", label: "Photo", icon: Image, color: "hsl(var(--unibud-green))" },
  { id: "video", label: "Video", icon: Video, color: "hsl(var(--unibud-blue))" },
  { id: "document", label: "Document", icon: FileText, color: "hsl(var(--unibud-orange))" },
  { id: "note", label: "Note", icon: StickyNote, color: "hsl(var(--unibud-gold))" },
  { id: "poll", label: "Poll", icon: BarChart3, color: "hsl(var(--unibud-purple))" },
  { id: "event", label: "Event", icon: Calendar, color: "hsl(var(--unibud-red))" },
  { id: "question", label: "Question", icon: HelpCircle, color: "hsl(var(--unibud-blue))" },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, color: "hsl(var(--unibud-green))" },
  { id: "lost_found", label: "Lost & Found", icon: Search, color: "hsl(var(--unibud-orange))" },
  { id: "achievement", label: "Achievement", icon: Trophy, color: "hsl(var(--unibud-gold))" },
  { id: "club_update", label: "Club Update", icon: Users, color: "hsl(var(--unibud-blue))" },
  { id: "research", label: "Research", icon: FlaskConical, color: "hsl(var(--unibud-purple))" },
  { id: "study_resource", label: "Study Resource", icon: BookOpen, color: "hsl(var(--unibud-green))" },
];

export const VISIBILITY_OPTIONS = [
  { id: "campus", label: "Campus", icon: Building2 },
  { id: "department", label: "Department", icon: Layers },
  { id: "course", label: "Course", icon: BookOpen },
  { id: "study_group", label: "Study Group", icon: Users },
  { id: "club", label: "Club", icon: Users },
  { id: "friend", label: "Friend", icon: User },
  { id: "public", label: "Public", icon: Globe },
];

export const SHARE_TARGETS = [
  { id: "campus", label: "Campus", icon: Building2 },
  { id: "department", label: "Department", icon: Layers },
  { id: "course", label: "Course", icon: BookOpen },
  { id: "study_group", label: "Study Group", icon: Users },
  { id: "club", label: "Club", icon: Users },
  { id: "friend", label: "Friend", icon: User },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "copy_link", label: "Copy Link", icon: Link },
];

export const MAX_POST_LENGTH = 2000;
export const PAGE_SIZE = 8;

export function getPostType(typeId) {
  return POST_TYPES.find((t) => t.id === typeId) || POST_TYPES[0];
}

export function formatCount(n) {
  if (!n || n === 0) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 10) return "now";
  if (seconds < 60) return seconds + "s";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h";
  const days = Math.floor(hours / 24);
  if (days < 7) return days + "d";
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return weeks + "w";
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(/#[\w]+/g);
  return matches ? matches.map((m) => m.slice(1).toLowerCase()) : [];
}

export function extractMentions(text) {
  if (!text) return [];
  const matches = text.match(/@[\w.]+/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

export function renderRichContent(text) {
  if (!text) return null;
  const parts = text.split(/(\s+)/);
  return parts.map((part, i) => {
    if (part.match(/^#[\w]+/)) {
      return React.createElement("span", { key: i, className: "text-primary font-semibold" }, part);
    }
    if (part.match(/^@[\w.]+/)) {
      return React.createElement("span", { key: i, className: "text-info font-semibold" }, part);
    }
    if (part.match(/^https?:\/\//)) {
      return React.createElement("span", { key: i, className: "text-info underline" }, part);
    }
    return part;
  });
}

export function getUserReaction(entityId) {
  try {
    const data = localStorage.getItem("quad_reactions");
    if (!data) return null;
    const map = JSON.parse(data);
    return map[entityId] || null;
  } catch {
    return null;
  }
}

export function setUserReaction(entityId, reaction) {
  try {
    const data = localStorage.getItem("quad_reactions") || "{}";
    const map = JSON.parse(data);
    if (reaction) map[entityId] = reaction;
    else delete map[entityId];
    localStorage.setItem("quad_reactions", JSON.stringify(map));
  } catch {}
}

export function isBookmarked(postId) {
  try {
    const data = localStorage.getItem("quad_bookmarks");
    if (!data) return false;
    return JSON.parse(data).includes(postId);
  } catch {
    return false;
  }
}

export function toggleBookmarkLocal(postId) {
  try {
    const data = localStorage.getItem("quad_bookmarks") || "[]";
    const arr = JSON.parse(data);
    const idx = arr.indexOf(postId);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(postId);
    localStorage.setItem("quad_bookmarks", JSON.stringify(arr));
    return idx < 0;
  } catch {
    return false;
  }
}