import {
  ShoppingBag, CalendarDays, Users, Trophy, Store, UtensilsCrossed,
  Search, BookMarked, Briefcase, Award, GraduationCap, FlaskConical, Dumbbell,
} from "lucide-react";

/**
 * Campus Registry — the single source of truth for every campus experience.
 * Each entry maps to its existing UNIBUD route (or is flagged `live:false` when
 * its dedicated home is still being built). Adding a section = adding an entry.
 */
export const CAMPUS_CATEGORIES = [
  { key: "marketplace", title: "Marketplace", desc: "Buy, sell & trade on campus", icon: ShoppingBag, to: "/marketplace", live: true, color: "262 83% 58%" },
  { key: "events", title: "Events", desc: "What's happening on campus", icon: CalendarDays, to: "/events", live: true, color: "217 91% 60%" },
  { key: "clubs", title: "Clubs & Societies", desc: "Find your community", icon: Users, to: "/clubs", live: true, color: "142 71% 45%" },
  { key: "organizations", title: "Student Organizations", desc: "Unions, gov & associations", icon: Trophy, to: "/student-government", live: true, color: "262 83% 58%" },
  { key: "businesses", title: "Campus Businesses", desc: "Verified campus vendors", icon: Store, to: "/companies", live: true, color: "38 92% 50%" },
  { key: "food", title: "Food & Restaurants", desc: "Eat well around campus", icon: UtensilsCrossed, to: null, live: false, color: "0 72% 51%" },
  { key: "lostfound", title: "Lost & Found", desc: "Recover what's yours", icon: Search, to: "/lost-found", live: true, color: "217 91% 60%" },
  { key: "library", title: "Library", desc: "Books, resources & research", icon: BookMarked, to: "/study/library", live: true, color: "142 71% 45%" },
  { key: "opportunities", title: "Opportunities", desc: "Jobs, gigs & more", icon: Briefcase, to: "/opportunities", live: true, color: "262 83% 58%" },
  { key: "scholarships", title: "Scholarships", desc: "Funding for your studies", icon: Award, to: "/scholarships", live: true, color: "38 92% 50%" },
  { key: "internships", title: "Internships", desc: "Build real experience", icon: GraduationCap, to: "/opportunities", live: true, color: "217 91% 60%" },
  { key: "research", title: "Research", desc: "Projects, labs & publications", icon: FlaskConical, to: "/research", live: true, color: "142 71% 45%" },
  { key: "sports", title: "Sports", desc: "Teams, fixtures & results", icon: Dumbbell, to: null, live: false, color: "0 72% 51%" },
];

export const CAMPUS_GROUPS = [
  { key: "discover", label: "Discover", items: ["marketplace", "events", "clubs", "food", "sports"] },
  { key: "career", label: "Career & Growth", items: ["opportunities", "scholarships", "internships", "research"] },
  { key: "services", label: "Campus Services", items: ["businesses", "library", "lostfound", "organizations"] },
];

export const findCampusEntry = (key) => CAMPUS_CATEGORIES.find((c) => c.key === key);