/**
 * UNIBUD Oracle Knowledge Network — Global Education Intelligence Graph
 *
 * The Knowledge Network is the global intelligence layer.
 * It is not a collection of websites — it is a structured registry
 * of trusted knowledge sources connected into one searchable graph.
 *
 * Nodes: countries, institutions, campuses, faculties, departments,
 * programmes, courses, lecturers, researchers, students, alumni,
 * scholarships, research, publications, libraries, housing, transport,
 * marketplace, careers, jobs, events, communities, clubs, and partnerships.
 */

import {
  Globe, Building2, MapPin, Layers, BookOpen, GraduationCap,
  Users, UserCheck, Award, FlaskConical, FileText, Library,
  Home, Bus, ShoppingBag, Briefcase, CalendarHeart, MessageCircle,
  Handshake,
} from "lucide-react";

export const KNOWLEDGE_NODES = [
  { id: "country", label: "Countries", icon: Globe, color: "text-primary", bg: "bg-primary/10", searchable: true, count: 195 },
  { id: "city", label: "Cities", icon: MapPin, color: "text-info", bg: "bg-info/10", searchable: true, count: 0 },
  { id: "institution", label: "Institutions", icon: Building2, color: "text-warning", bg: "bg-warning/10", searchable: true, count: 0 },
  { id: "campus", label: "Campuses", icon: MapPin, color: "text-warning", bg: "bg-warning/10", searchable: true, count: 0 },
  { id: "faculty", label: "Faculties", icon: Layers, color: "text-purple", bg: "bg-purple/10", searchable: true, count: 0 },
  { id: "department", label: "Departments", icon: BookOpen, color: "text-info", bg: "bg-info/10", searchable: true, count: 0 },
  { id: "programme", label: "Programmes", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10", searchable: true, count: 0 },
  { id: "course", label: "Courses", icon: BookOpen, color: "text-info", bg: "bg-info/10", searchable: true, count: 0 },
  { id: "lecturer", label: "Lecturers", icon: UserCheck, color: "text-info", bg: "bg-info/10", searchable: true, count: 0, permissionScoped: true },
  { id: "researcher", label: "Researchers", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10", searchable: true, count: 0, permissionScoped: true },
  { id: "student", label: "Students", icon: Users, color: "text-info", bg: "bg-info/10", searchable: true, count: 0, permissionScoped: true },
  { id: "alumni", label: "Alumni", icon: Users, color: "text-success", bg: "bg-success/10", searchable: true, count: 0, permissionScoped: true },
  { id: "scholarship", label: "Scholarships", icon: Award, color: "text-success", bg: "bg-success/10", searchable: true, count: 0 },
  { id: "research", label: "Research", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10", searchable: true, count: 0 },
  { id: "publication", label: "Publications", icon: FileText, color: "text-info", bg: "bg-info/10", searchable: true, count: 0 },
  { id: "library", label: "Libraries", icon: Library, color: "text-info", bg: "bg-info/10", searchable: true, count: 0 },
  { id: "housing", label: "Housing", icon: Home, color: "text-warning", bg: "bg-warning/10", searchable: true, count: 0 },
  { id: "transport", label: "Transport", icon: Bus, color: "text-warning", bg: "bg-warning/10", searchable: true, count: 0 },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, color: "text-warning", bg: "bg-warning/10", searchable: true, count: 0 },
  { id: "career", label: "Careers", icon: Briefcase, color: "text-info", bg: "bg-info/10", searchable: true, count: 0 },
  { id: "job", label: "Jobs", icon: Briefcase, color: "text-success", bg: "bg-success/10", searchable: true, count: 0 },
  { id: "event", label: "Events", icon: CalendarHeart, color: "text-primary", bg: "bg-primary/10", searchable: true, count: 0 },
  { id: "community", label: "Communities", icon: MessageCircle, color: "text-info", bg: "bg-info/10", searchable: true, count: 0 },
  { id: "club", label: "Clubs", icon: Users, color: "text-info", bg: "bg-info/10", searchable: true, count: 0 },
  { id: "partnership", label: "Partnerships", icon: Handshake, color: "text-success", bg: "bg-success/10", searchable: true, count: 0 },
];

export const KNOWLEDGE_SOURCE_TYPES = [
  "education", "research", "scholarships", "governments",
  "international_organizations", "news", "social_platforms",
  "health", "maps", "weather", "transport", "finance",
  "developer_resources", "ai_platforms", "sports", "media",
  "entertainment", "travel",
];

export const TRUST_LEVELS = [
  { id: "verified", label: "Verified", description: "Officially verified by UNIBUD or authorized institution", color: "text-success" },
  { id: "trusted", label: "Trusted", description: "From a known, reputable source with established track record", color: "text-info" },
  { id: "community", label: "Community", description: "Contributed by students or community members", color: "text-warning" },
  { id: "unverified", label: "Unverified", description: "Not yet verified — use with caution", color: "text-error" },
];

export const SEARCH_CATEGORIES = [
  "Countries", "Cities", "Institutions", "Departments", "Courses",
  "Organizations", "Scholarships", "Research", "Services",
  "Knowledge Sources", "Users",
];

export function getKnowledgeNodeById(id) {
  return KNOWLEDGE_NODES.find((n) => n.id === id);
}

export function getSearchableNodes() {
  return KNOWLEDGE_NODES.filter((n) => n.searchable);
}

export function getPermissionScopedNodes() {
  return KNOWLEDGE_NODES.filter((n) => n.permissionScoped);
}