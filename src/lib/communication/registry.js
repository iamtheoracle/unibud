import {
  MessageSquare, MessagesSquare, Users, GraduationCap, Building2,
  Landmark, Trophy, Bell, CirclePlay, Video, Hash,
} from "lucide-react";

/**
 * Communication Registry — source of truth for every communication surface.
 * Maps each to its existing route, or flags `live:false` (Voice & Video Calls).
 */
export const COMM_CATEGORIES = [
  { key: "dm", title: "Direct Messages", desc: "Private one-to-one chats", icon: MessageSquare, to: "/messages", live: true, color: "217 91% 60%" },
  { key: "groupchats", title: "Group Chats", desc: "Conversations with many", icon: MessagesSquare, to: "/messages", live: true, color: "262 83% 58%" },
  { key: "communities", title: "Communities", desc: "Discover & join spaces", icon: Users, to: "/communities", live: true, color: "142 71% 45%" },
  { key: "studygroups", title: "Study Groups", desc: "Learn together", icon: GraduationCap, to: "/study-groups", live: true, color: "38 92% 50%" },
  { key: "classgroups", title: "Class Groups", desc: "Your course cohorts", icon: Hash, to: "/communities", live: true, color: "217 91% 60%" },
  { key: "departmentgroups", title: "Department Groups", desc: "Department-wide chats", icon: Building2, to: "/communities", live: true, color: "262 83% 58%" },
  { key: "facultygroups", title: "Faculty Groups", desc: "Faculty-wide spaces", icon: Landmark, to: "/communities", live: true, color: "142 71% 45%" },
  { key: "clubchats", title: "Club & Org Chats", desc: "Your societies & clubs", icon: Trophy, to: "/clubs", live: true, color: "38 92% 50%" },
  { key: "announcements", title: "Announcements", desc: "Official updates", icon: Bell, to: "/notifications", live: true, color: "0 72% 51%" },
  { key: "stories", title: "Stories", desc: "Share your day", icon: CirclePlay, to: "/quad", live: true, color: "262 83% 58%" },
  { key: "calls", title: "Voice & Video Calls", desc: "Talk face-to-face", icon: Video, to: null, live: false, color: "217 91% 60%" },
];

export const COMM_GROUPS = [
  { key: "direct", label: "Direct", items: ["dm", "groupchats", "calls"] },
  { key: "social", label: "Social", items: ["stories", "communities", "clubchats"] },
  { key: "academic", label: "Academic Groups", items: ["studygroups", "classgroups", "departmentgroups", "facultygroups"] },
  { key: "broadcast", label: "Broadcast", items: ["announcements"] },
];