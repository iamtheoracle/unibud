import { Globe, Users, Building2, BookOpen, MessageSquare, Lock } from "lucide-react";

export const AUDIENCE_CARDS = [
  { id: "public", label: "Public", icon: Globe, visibility: "public" },
  { id: "friends", label: "Friends", icon: Users, visibility: "friend" },
  { id: "campus", label: "Campus", icon: Building2, visibility: "campus" },
  { id: "academic", label: "Academic", icon: BookOpen, visibility: "course" },
  { id: "community", label: "Community", icon: MessageSquare, visibility: "club" },
  { id: "private", label: "Private", icon: Lock, visibility: "private" },
];