import {
  GraduationCap, ClipboardList, Brain, CalendarClock, Users, MapPin,
  Building2, Compass, Briefcase, HeartHandshake, FlaskConical,
  BookOpen, Timer, Heart, Newspaper, MessageCircle, ShoppingBag,
  Video, Bell, Sparkles,
} from "lucide-react";

export const AGENTS = [
  {
    id: "academic_coach",
    name: "Academic Success Coach",
    short: "Study plans, GPA tracking & revision strategies",
    description: "Creates personalized study plans, tracks GPA progression, builds revision strategies, and helps plan your academic journey semester by semester.",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/10",
    category: "Academic",
    keywords: ["study plan", "gpa", "cgpa", "revision strateg", "academic plan", "grade improvement", "semester plan", "study schedule", "academic progress"],
    capabilities: ["Personalized study plans", "GPA tracking & projection", "Revision strategies", "Semester planning"],
    modules: ["academics", "calendar", "library"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "assignment_planner",
    name: "Assignment Planner",
    short: "Deadlines, reminders & workload management",
    description: "Tracks assignment deadlines, manages workload across courses, sends smart reminders, and helps you balance submissions without last-minute stress.",
    icon: ClipboardList,
    color: "text-info",
    bg: "bg-info/10",
    category: "Academic",
    keywords: ["assignment", "deadline", "submit", "coursework", "homework", "project due", "deliverable", "submission"],
    capabilities: ["Deadline tracking", "Workload management", "Smart reminders", "Progress tracking"],
    modules: ["academics", "assignments"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "exam_prep",
    name: "Exam Preparation Coach",
    short: "Revision plans, quizzes, flashcards & weak-topic analysis",
    description: "Builds targeted revision plans, generates quizzes and flashcards, identifies weak topics from your grades, and tracks exam countdowns.",
    icon: Brain,
    color: "text-purple",
    bg: "bg-purple/10",
    category: "Academic",
    keywords: ["exam", "test", "quiz", "flashcard", "past question", "mock", "revision", "prepare for", "study for exam"],
    capabilities: ["Revision plans", "Quiz generation", "Flashcard creation", "Weak-topic analysis", "Exam countdowns"],
    modules: ["academics", "library"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "timetable",
    name: "Timetable Manager",
    short: "Class schedules, exam schedules & calendar sync",
    description: "Manages your class timetable, exam schedules, sends timely reminders, and synchronizes everything with your calendar.",
    icon: CalendarClock,
    color: "text-success",
    bg: "bg-success/10",
    category: "Academic",
    keywords: ["timetable", "class schedule", "lecture time", "exam schedule", "calendar sync", "when is my class", "what time"],
    capabilities: ["Class schedule management", "Exam scheduling", "Calendar synchronization", "Smart reminders"],
    modules: ["calendar", "academics"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "study_buddy",
    name: "Study Buddy Finder",
    short: "Study partners, accountability & project teammates",
    description: "Finds study partners with matching courses and schedules, connects you with accountability partners, and helps form project teams.",
    icon: Users,
    color: "text-info",
    bg: "bg-info/10",
    category: "Social",
    keywords: ["study partner", "study group", "accountability", "study buddy", "teammate", "project team", "find someone to study"],
    capabilities: ["Study partner matching", "Group formation", "Accountability tracking", "Team building"],
    modules: ["study-groups", "connect"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "campus_guide",
    name: "Campus Guide",
    short: "Navigation, buildings, offices & facilities",
    description: "Helps you navigate campus, find lecture halls, offices, libraries, and facilities, and gives directions to any location on campus.",
    icon: MapPin,
    color: "text-warning",
    bg: "bg-warning/10",
    category: "Campus",
    keywords: ["where is", "how to find", "building", "hall", "office", "library location", "campus map", "directions", "navigate", "find room", "locate"],
    capabilities: ["Campus navigation", "Building & room finder", "Facility info", "Transport guidance"],
    modules: ["campus", "communities"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "portal_sync",
    name: "University Portal Agent",
    short: "Syncs courses, grades, attendance & announcements",
    description: "Synchronizes your courses, assignments, grades, attendance, and announcements from your university portal into UNIBUD automatically.",
    icon: Building2,
    color: "text-primary",
    bg: "bg-primary/10",
    category: "Academic",
    keywords: ["portal", "sync", "university portal", "sync courses", "sync grades", "attendance", "portal data", "import", "matric", "matriculation", "matric number", "find student", "student record", "student search", "verify student", "student id"],
    capabilities: ["Course synchronization", "Grade import", "Attendance tracking", "Announcement sync", "Matriculation number lookup", "Student verification"],
    modules: ["university-portal", "academics"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "opportunity_scout",
    name: "Opportunity Scout",
    short: "Scholarships, internships, grants & competitions",
    description: "Discovers scholarships, internships, grants, competitions, exchange programmes, and career opportunities matched to your profile.",
    icon: Compass,
    color: "text-success",
    bg: "bg-success/10",
    category: "Career",
    keywords: ["scholarship", "internship", "grant", "competition", "exchange", "opportunity", "fellowship", "funding", "career opportunity"],
    capabilities: ["Scholarship discovery", "Internship matching", "Competition alerts", "Exchange programmes", "Application tracking"],
    modules: ["career", "scholarships", "opportunities"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "career_coach",
    name: "Career Coach",
    short: "CV reviews, interview prep & career planning",
    description: "Reviews your CV, guides your LinkedIn profile, prepares you for interviews, helps with graduate job searches, and plans your career path.",
    icon: Briefcase,
    color: "text-info",
    bg: "bg-info/10",
    category: "Career",
    keywords: ["cv", "resume", "linkedin", "interview", "job", "career", "graduate job", "professional", "cover letter", "career path"],
    capabilities: ["CV reviews", "LinkedIn guidance", "Interview preparation", "Career planning", "Job matching"],
    modules: ["career", "cv-builder", "portfolio"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "mentor_match",
    name: "Mentor Match",
    short: "Mentor discovery, alumni connections & scheduling",
    description: "Finds mentors from senior students, alumni, lecturers, and industry professionals. Schedules meetings and tracks your mentoring relationships.",
    icon: HeartHandshake,
    color: "text-error",
    bg: "bg-error/10",
    category: "Career",
    keywords: ["mentor", "mentoring", "alumni", "advisor", "guidance counselor", "find mentor", "career mentor", "industry professional"],
    capabilities: ["Mentor discovery", "Alumni connections", "Meeting scheduling", "Relationship tracking"],
    modules: ["mentorship", "connect"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "research_assistant",
    name: "Research Assistant",
    short: "Literature, citations, project guidance & academic writing",
    description: "Helps plan research, discover relevant literature, manage citations, structure projects, and improve academic writing quality.",
    icon: FlaskConical,
    color: "text-purple",
    bg: "bg-purple/10",
    category: "Academic",
    keywords: ["research", "paper", "publication", "citation", "literature", "thesis", "dissertation", "academic writing", "research method", "journal"],
    capabilities: ["Research planning", "Literature discovery", "Citation management", "Academic writing guidance", "Project structure"],
    modules: ["research", "library"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "library_assistant",
    name: "Library Assistant",
    short: "Books, journals, past questions & recommendations",
    description: "Searches for books, journals, lecture notes, and past questions. Recommends reading materials based on your courses and interests.",
    icon: BookOpen,
    color: "text-info",
    bg: "bg-info/10",
    category: "Academic",
    keywords: ["book", "journal", "lecture note", "past question", "reading material", "textbook", "find book", "recommend book", "reading list"],
    capabilities: ["Book search", "Journal access", "Lecture note recommendations", "Past question finder", "Reading lists"],
    modules: ["library", "academics"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "productivity",
    name: "Productivity Coach",
    short: "Pomodoro, study goals, habits & focus sessions",
    description: "Runs Pomodoro sessions, tracks study goals, builds habits, manages focus sessions, and provides productivity analytics.",
    icon: Timer,
    color: "text-warning",
    bg: "bg-warning/10",
    category: "Personal",
    keywords: ["pomodoro", "focus", "habit", "productivity", "study goal", "time management", "procrastination", "study session", "streak", "concentrate"],
    capabilities: ["Pomodoro sessions", "Study goal tracking", "Habit building", "Focus sessions", "Productivity analytics"],
    modules: ["study-session", "academics"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "wellness",
    name: "Wellness Companion",
    short: "Stress management, wellbeing check-ins & healthy routines",
    description: "Provides supportive conversations, helps manage stress, conducts wellbeing check-ins, and suggests healthy study routines using natural, human language.",
    icon: Heart,
    color: "text-error",
    bg: "bg-error/10",
    category: "Personal",
    keywords: ["stress", "anxious", "anxiety", "wellbeing", "mental health", "tired", "overwhelmed", "burnout", "feeling", "sad", "lonely", "depressed", "self-care", "can't cope", "struggling"],
    capabilities: ["Supportive conversations", "Stress management", "Wellbeing check-ins", "Healthy study routines", "Mindfulness"],
    modules: ["wellbeing"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "campus_pulse",
    name: "Campus Pulse",
    short: "News, announcements, SUG updates & campus events",
    description: "Tracks university news, faculty announcements, department updates, SUG announcements, campus traditions, sports, and verified campus events.",
    icon: Newspaper,
    color: "text-primary",
    bg: "bg-primary/10",
    category: "Campus",
    keywords: ["news", "announcement", "update", "what's happening", "campus news", "sug", "faculty news", "department update", "campus event", "trending"],
    capabilities: ["Campus news", "Faculty updates", "SUG announcements", "Event discovery", "Tradition tracking"],
    modules: ["campus", "communities", "events"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "social_companion",
    name: "Social Companion",
    short: "Friends, communities, clubs & social engagement",
    description: "Recommends friends, discovers communities and clubs, suggests societies, and tracks your social engagement across campus.",
    icon: MessageCircle,
    color: "text-info",
    bg: "bg-info/10",
    category: "Social",
    keywords: ["friend", "community", "club", "society", "social", "meet people", "connect with", "join group", "make friends"],
    capabilities: ["Friend recommendations", "Community discovery", "Club suggestions", "Social engagement tracking"],
    modules: ["connect", "communities", "clubs"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "marketplace",
    name: "Marketplace Assistant",
    short: "Buying, selling, Lost & Found & campus transactions",
    description: "Helps with the campus marketplace — buying, selling, finding lost items, and ensuring trusted campus transactions.",
    icon: ShoppingBag,
    color: "text-warning",
    bg: "bg-warning/10",
    category: "Campus",
    keywords: ["buy", "sell", "marketplace", "lost", "found", "item for sale", "purchase", "rent", "campus market", "price"],
    capabilities: ["Campus marketplace", "Buy & sell assistance", "Lost & Found", "Trusted transactions"],
    modules: ["marketplace", "lost-found"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "live_class",
    name: "Live Class Assistant",
    short: "Attendance, recordings, summaries & classroom support",
    description: "Supports live classes — tracks attendance, provides recording access, generates lecture summaries, and helps with classroom Q&A.",
    icon: Video,
    color: "text-purple",
    bg: "bg-purple/10",
    category: "Academic",
    keywords: ["live class", "live lecture", "recording", "virtual class", "online class", "attend class", "stream", "video lecture"],
    capabilities: ["Live class support", "Attendance tracking", "Recording access", "Lecture summaries", "Classroom Q&A"],
    modules: ["live", "academics"],
    enabledByDefault: true,
    optional: true,
  },
  {
    id: "notification_intel",
    name: "Notification Intelligence",
    short: "Prioritizes reminders, deadlines & important updates",
    description: "Intelligently prioritizes your reminders, assignments, deadlines, exams, announcements, and important updates so you never miss what matters.",
    icon: Bell,
    color: "text-success",
    bg: "bg-success/10",
    category: "Personal",
    keywords: ["notification", "reminder", "alert", "priority", "important update", "unread", "deadline reminder", "what did i miss"],
    capabilities: ["Smart prioritization", "Deadline reminders", "Important alerts", "Digest summaries"],
    modules: ["notifications", "calendar"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "personalization",
    name: "Personalization Agent",
    short: "Learns your preferences to personalize everything",
    description: "Continuously learns your university, department, courses, interests, goals, and preferences to personalize the entire UNIBUD experience.",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
    category: "Personal",
    keywords: [],
    capabilities: ["Preference learning", "Profile personalization", "Smart recommendations", "Adaptive experience"],
    modules: ["all"],
    enabledByDefault: true,
    optional: false,
  },
];

export const SUGGESTED_PROMPTS = [
  { label: "Plan my revision for upcoming exams", icon: Brain, category: "Academic" },
  { label: "Find internships I'm eligible for", icon: Compass, category: "Career" },
  { label: "What's happening on campus this week?", icon: Newspaper, category: "Campus" },
  { label: "I'm feeling stressed about my workload", icon: Heart, category: "Wellness" },
  { label: "Find me a study partner", icon: Users, category: "Social" },
  { label: "Help me understand Big O notation", icon: BookOpen, category: "Learn" },
];

export const QUICK_ACTIONS = [
  { label: "Plan my week", icon: CalendarClock, prompt: "Help me plan my study schedule for this week. What should I prioritize based on my upcoming deadlines and exams?" },
  { label: "Find opportunities", icon: Compass, prompt: "Find scholarships and internships I might be eligible for based on my profile." },
  { label: "Focus session", icon: Timer, prompt: "Start a 25-minute Pomodoro focus session with me. Keep me motivated and on track." },
  { label: "Wellness check", icon: Heart, prompt: "Give me a quick wellness check-in. How am I doing and what should I focus on for my wellbeing?" },
];

export function getAgentById(id) {
  return AGENTS.find((a) => a.id === id);
}

export function getEnabledAgents() {
  try {
    const states = JSON.parse(localStorage.getItem("bud_agent_states") || "{}");
    return AGENTS.filter((a) => a.optional === false || states[a.id] !== false);
  } catch {
    return AGENTS;
  }
}

export function isAgentEnabled(agentId) {
  const agent = getAgentById(agentId);
  if (!agent || agent.optional === false) return true;
  try {
    const states = JSON.parse(localStorage.getItem("bud_agent_states") || "{}");
    return states[agentId] !== false;
  } catch {
    return true;
  }
}

export function setAgentEnabled(agentId, enabled) {
  try {
    const states = JSON.parse(localStorage.getItem("bud_agent_states") || "{}");
    states[agentId] = enabled;
    localStorage.setItem("bud_agent_states", JSON.stringify(states));
  } catch {}
}

export function recordAgentActivity(agentIds) {
  try {
    const stored = JSON.parse(localStorage.getItem("bud_agent_activity") || "{}");
    const now = Date.now();
    agentIds.forEach((id) => { stored[id] = now; });
    localStorage.setItem("bud_agent_activity", JSON.stringify(stored));
  } catch {}
}

export function getLastActivity(agentId) {
  try {
    const stored = JSON.parse(localStorage.getItem("bud_agent_activity") || "{}");
    return stored[agentId] || null;
  } catch {
    return null;
  }
}

export function formatLastActivity(agentId) {
  const ts = getLastActivity(agentId);
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function routeAgents(text) {
  if (!text || !text.trim()) return [getAgentById("personalization")];
  const lower = text.toLowerCase();
  const enabled = getEnabledAgents();
  const matches = enabled.filter(
    (agent) => agent.id !== "personalization" && agent.keywords.some((kw) => lower.includes(kw))
  );
  const personalization = getAgentById("personalization");
  if (!matches.find((a) => a.id === "personalization")) {
    matches.push(personalization);
  }
  return matches.length > 1 ? matches : [personalization];
}

export function buildBudPrompt(text, agents, user) {
  let prompt = `You are Bud, the intelligent companion inside UNIBUD — the university operating system that connects, organizes, and powers student life.

You are not an AI, chatbot, or assistant. You are Bud: a trusted mentor, tutor, and friend who learns with each student and grows with them throughout their university journey — from admission through graduation and into their career and alumni life.

You have deep understanding of every UNIBUD module: Campus, Quad, Connect, Live, Library, Academics, Marketplace, Study Groups, Mentorship, Careers, Scholarships, Calendar, Notifications, University Portal, Profile, Communities, Research, Portfolio, CV Builder, Companies, Events, Clubs, and Lost & Found.

Based on the student's message, these capabilities are relevant right now:`;

  if (agents && agents.length > 0) {
    agents.forEach((agent) => {
      prompt += `\n• ${agent.name}: ${agent.capabilities.join(", ")}`;
    });
  }

  if (user) {
    prompt += "\n\nStudent context:";
    const fields = [
      ["University", user.university],
      ["Faculty", user.faculty],
      ["Department", user.department],
      ["Level", user.level],
      ["Matriculation number", user.matriculation_number],
      ["Matriculation verified", user.matriculation_verified ? "Yes" : null],
      ["Preferred study time", user.preferred_study_time],
      ["Goals", Array.isArray(user.goals) ? user.goals.join(", ") : user.goals],
      ["Interests", Array.isArray(user.interests) ? user.interests.join(", ") : user.interests],
      ["Difficult subjects", Array.isArray(user.difficult_subjects) ? user.difficult_subjects.join(", ") : user.difficult_subjects],
      ["Dream job", user.dream_job],
      ["Skills to develop", Array.isArray(user.skills_to_develop) ? user.skills_to_develop.join(", ") : user.skills_to_develop],
    ];
    fields.forEach(([label, val]) => {
      if (val) prompt += `\n${label}: ${val}`;
    });
  }

  // Matriculation search context for authorized staff
  if (user) {
    const staffRoles = ["lecturer", "department_admin", "faculty_admin", "university_admin", "operator", "senior_operator", "moderator", "compliance_officer", "platform_admin", "super_admin", "operations_staff", "executive", "oracle"];
    if (staffRoles.includes(user.role)) {
      prompt += "\n\nYou have staff permissions. If the user asks to find a student by matriculation number (e.g. \"Find student with matriculation number CSC/2026/01452\"), the system will automatically search and provide results. Matriculation numbers are unique within each university and follow university-specific formats.";
    }
  }

  prompt += `\n\nStudent message: ${text}

Respond helpfully, concisely, and warmly as Bud. Naturally incorporate the relevant capabilities without ever mentioning agents, routing, or technical details — the student only knows you as Bud. If the student needs help across multiple areas (e.g., exams + stress + scheduling), address all of them holistically in one cohesive response. Use simple, natural English. Be supportive, calm, and human. Use emojis very sparingly.`;

  return prompt;
}