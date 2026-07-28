import {
  ShoppingBag, CalendarDays, Users, Trophy, Store, UtensilsCrossed,
  Search, BookMarked, Briefcase, Award, GraduationCap, FlaskConical, Dumbbell,
  BookOpen, CalendarClock, ClipboardList, FileText, CalendarCheck, TrendingUp, Megaphone, Video, FolderKanban,
} from "lucide-react";

/**
 * Campus Registry — the single source of truth for every campus experience.
 * Each entry maps to its existing UNIBUD route (or is flagged `live:false` when
 * its dedicated home is still being built). Adding a section = adding an entry.
 *
 * `context` tags each entry as "academic" or "social" so the Campus hub can
 * filter by the student's active context (Academic | Social). This is
 * organizational only — no feature is removed.
 */
export const CAMPUS_CATEGORIES = [
  // ── Academic ──
  { key: "classes", title: "Classes", desc: "Your courses & modules", icon: BookOpen, to: "/courses", live: true, color: "217 91% 60%", context: "academic", group: "learn" },
  { key: "timetable", title: "Timetable", desc: "Your weekly schedule", icon: CalendarClock, to: "/timetable", live: true, color: "217 91% 60%", context: "academic", group: "learn" },
  { key: "livestream", title: "Lecture Streaming", desc: "Live & recorded classes", icon: Video, to: "/academics", live: true, color: "262 83% 58%", context: "academic", group: "learn" },
  { key: "assignments", title: "Assignments", desc: "Tasks & submissions", icon: ClipboardList, to: "/assignments", live: true, color: "38 92% 50%", context: "academic", group: "learn" },
  { key: "projects", title: "Projects", desc: "Course & group projects", icon: FolderKanban, to: "/projects", live: true, color: "262 83% 58%", context: "academic", group: "learn" },
  { key: "exams", title: "Exams", desc: "Schedule & preparation", icon: FileText, to: "/exams", live: true, color: "0 72% 51%", context: "academic", group: "learn" },
  { key: "attendance", title: "Attendance", desc: "Track your presence", icon: CalendarCheck, to: "/attendance", live: true, color: "142 71% 45%", context: "academic", group: "learn" },
  { key: "gpa", title: "GPA & Results", desc: "Grades & performance", icon: TrendingUp, to: "/academics/results", live: true, color: "142 71% 45%", context: "academic", group: "learn" },
  { key: "library", title: "Library", desc: "Books, resources & research", icon: BookMarked, to: "/study/library", live: true, color: "142 71% 45%", context: "academic", group: "resources" },
  { key: "research", title: "Research", desc: "Projects, labs & publications", icon: FlaskConical, to: "/research", live: true, color: "142 71% 45%", context: "academic", group: "resources" },
  { key: "academic-calendar", title: "Academic Calendar", desc: "Term dates & deadlines", icon: CalendarDays, to: "/calendar", live: true, color: "217 91% 60%", context: "academic", group: "resources" },
  { key: "academic-announcements", title: "Academic Announcements", desc: "Official notices", icon: Megaphone, to: "/communication", live: true, color: "262 83% 58%", context: "academic", group: "resources" },
  { key: "scholarships", title: "Scholarships", desc: "Funding for your studies", icon: Award, to: "/scholarships", live: true, color: "38 92% 50%", context: "academic", group: "growth" },
  { key: "internships", title: "Internships", desc: "Build real experience", icon: GraduationCap, to: "/opportunities", live: true, color: "217 91% 60%", context: "academic", group: "growth" },
  { key: "opportunities", title: "Opportunities", desc: "Jobs, gigs & more", icon: Briefcase, to: "/opportunities", live: true, color: "262 83% 58%", context: "academic", group: "growth" },

  // ── Social ──
  { key: "clubs", title: "Clubs & Societies", desc: "Find your community", icon: Users, to: "/clubs", live: true, color: "142 71% 45%", context: "social", group: "community" },
  { key: "organizations", title: "Student Organizations", desc: "Unions, gov & associations", icon: Trophy, to: "/student-government", live: true, color: "262 83% 58%", context: "social", group: "community" },
  { key: "events", title: "Campus Events", desc: "What's happening on campus", icon: CalendarDays, to: "/events", live: true, color: "217 91% 60%", context: "social", group: "community" },
  { key: "marketplace", title: "Marketplace", desc: "Buy, sell & trade on campus", icon: ShoppingBag, to: "/marketplace", live: true, color: "262 83% 58%", context: "social", group: "lifestyle" },
  { key: "businesses", title: "Campus Businesses", desc: "Verified campus vendors", icon: Store, to: "/companies", live: true, color: "38 92% 50%", context: "social", group: "lifestyle" },
  { key: "food", title: "Food & Restaurants", desc: "Eat well around campus", icon: UtensilsCrossed, to: null, live: false, color: "0 72% 51%", context: "social", group: "lifestyle" },
  { key: "sports", title: "Sports", desc: "Teams, fixtures & results", icon: Dumbbell, to: null, live: false, color: "0 72% 51%", context: "social", group: "lifestyle" },
  { key: "lostfound", title: "Lost & Found", desc: "Recover what's yours", icon: Search, to: "/lost-found", live: true, color: "217 91% 60%", context: "social", group: "help" },
];

/**
 * Sub-groups (secondary navigation) scoped per context. The Campus hub shows
 * the sub-group chips for the active context, then filters entries by the
 * selected sub-group. Preserves discoverability without clutter.
 */
export const CAMPUS_GROUPS = [
  { key: "learn", label: "Learn", context: "academic", items: ["classes", "timetable", "livestream", "assignments", "projects", "exams", "attendance", "gpa"] },
  { key: "resources", label: "Resources", context: "academic", items: ["library", "research", "academic-calendar", "academic-announcements"] },
  { key: "growth", label: "Growth", context: "academic", items: ["scholarships", "internships", "opportunities"] },
  { key: "community", label: "Community", context: "social", items: ["clubs", "organizations", "events"] },
  { key: "lifestyle", label: "Lifestyle", context: "social", items: ["marketplace", "businesses", "food", "sports"] },
  { key: "help", label: "Help", context: "social", items: ["lostfound"] },
];

export const findCampusEntry = (key) => CAMPUS_CATEGORIES.find((c) => c.key === key);