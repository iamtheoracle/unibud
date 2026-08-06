import {
  Sparkles, Building2, Dumbbell, Music, Cpu, Briefcase, Users, Flame,
} from "lucide-react";

/**
 * Discover categories — the fixed structure of the discovery engine.
 * Spark may reorder priority (adaptive ranking) but never destroys this
 * organization: sports stays in Sports, scholarships stay in Careers, etc.
 */
export const CATEGORIES = [
  {
    key: "foryou", label: "For You", icon: Sparkles, color: "primary",
  },
  {
    key: "campus", label: "Campus", icon: Building2, color: "information",
    links: [
      { label: "Communities", to: "/communities" },
      { label: "Clubs", to: "/clubs" },
      { label: "Events", to: "/events" },
      { label: "Lost & Found", to: "/lost-found" },
      { label: "Marketplace", to: "/marketplace" },
      { label: "Student Union", to: "/student-government" },
    ],
  },
  {
    key: "sports", label: "Sports", icon: Dumbbell, color: "error",
    subs: ["Football", "Basketball", "Formula 1", "Tennis", "Volleyball", "Athletics", "Esports", "Combat Sports", "Swimming"],
  },
  {
    key: "entertainment", label: "Entertainment", icon: Music, color: "warning",
    subs: ["Anime", "Movies", "Series", "Afrobeats", "Music", "Gaming", "Creators", "Podcasts", "Books"],
  },
  {
    key: "technology", label: "Technology", icon: Cpu, color: "information",
    subs: ["Artificial Intelligence", "Programming", "Cybersecurity", "Startups", "Science", "Research", "Engineering", "Hackathons", "Student Projects"],
  },
  {
    key: "careers", label: "Careers", icon: Briefcase, color: "success",
    links: [
      { label: "Career Hub", to: "/career" },
      { label: "Scholarships", to: "/scholarships" },
      { label: "Companies", to: "/companies" },
      { label: "CV Builder", to: "/cv-builder" },
      { label: "Portfolio", to: "/portfolio" },
      { label: "Competitions", to: "/challenges" },
    ],
  },
  {
    key: "social", label: "Social", icon: Users, color: "primary",
    links: [
      { label: "Communities", to: "/communities" },
      { label: "Study Groups", to: "/study-groups" },
      { label: "Mentorship", to: "/mentorship" },
      { label: "Find Friends", to: "/connect" },
    ],
  },
  {
    key: "trending", label: "Trending", icon: Flame, color: "error",
    subs: ["Campus", "Department", "Faculty", "University", "Nearby", "National", "Global"],
  },
];