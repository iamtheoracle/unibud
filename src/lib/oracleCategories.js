import {
  GraduationCap, MapPin, BookOpen, Users, Briefcase,
  ShoppingBag, Timer, Heart,
} from "lucide-react";

/**
 * The 8 Oracle+ capability categories visible to students.
 * Bud automatically activates the right specialist agents behind the scenes.
 * Students never choose agents — only Bud does.
 */
export const ORACLE_CATEGORIES = [
  {
    id: "academic",
    label: "Academic",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/10",
    description: "Studying, assignments, exams, GPA, revision plans, flashcards & timetable.",
    agentIds: ["academic_coach", "assignment_planner", "exam_prep", "timetable", "portal_sync"],
    prompts: [
      "Build me a revision plan for my upcoming exams",
      "What's my current GPA projection?",
      "Create flashcards for my toughest course",
      "When is my next class?",
    ],
  },
  {
    id: "campus",
    label: "Campus",
    icon: MapPin,
    color: "text-warning",
    bg: "bg-warning/10",
    description: "Campus navigation, announcements, traditions, weather, events & services.",
    agentIds: ["campus_guide", "campus_pulse"],
    prompts: [
      "What's happening on campus this week?",
      "Where is the Engineering building?",
      "Any campus announcements I missed?",
      "What's the weather like today?",
    ],
  },
  {
    id: "learning",
    label: "Learning",
    icon: BookOpen,
    color: "text-info",
    bg: "bg-info/10",
    description: "Library, lecture notes, research papers, live classes, summaries & citations.",
    agentIds: ["library_assistant", "research_assistant", "live_class"],
    prompts: [
      "Summarize my last lecture recording",
      "Find past questions for my course",
      "Help me cite this research paper",
      "Explain Big O notation simply",
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: Users,
    color: "text-info",
    bg: "bg-info/10",
    description: "Study groups, classmates, clubs, societies, mentorship, alumni & networking.",
    agentIds: ["study_buddy", "social_companion"],
    prompts: [
      "Find me a study partner",
      "Which clubs match my interests?",
      "Connect me with a mentor",
      "Who's in my study group?",
    ],
  },
  {
    id: "career",
    label: "Career",
    icon: Briefcase,
    color: "text-success",
    bg: "bg-success/10",
    description: "Internships, scholarships, competitions, CV building & interview prep.",
    agentIds: ["opportunity_scout", "career_coach", "mentor_match"],
    prompts: [
      "Find internships I'm eligible for",
      "Review my CV",
      "Prepare me for an interview",
      "What scholarships match my profile?",
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: ShoppingBag,
    color: "text-warning",
    bg: "bg-warning/10",
    description: "Buying, selling, Lost & Found, student services & trusted transactions.",
    agentIds: ["marketplace"],
    prompts: [
      "Show me items for sale near campus",
      "I lost my student ID — help me find it",
      "What's trending in the marketplace?",
      "How do I list an item for sale?",
    ],
  },
  {
    id: "productivity",
    label: "Productivity",
    icon: Timer,
    color: "text-warning",
    bg: "bg-warning/10",
    description: "Calendars, reminders, deadlines, study goals, Pomodoro, habits & tasks.",
    agentIds: ["productivity", "notification_intel"],
    prompts: [
      "Plan my study week",
      "Start a 25-minute focus session",
      "What deadlines do I have this week?",
      "Help me build a study habit",
    ],
  },
  {
    id: "personal",
    label: "Personal",
    icon: Heart,
    color: "text-error",
    bg: "bg-error/10",
    description: "Profile, recommendations, wellbeing, portal sync, settings & insights.",
    agentIds: ["wellness", "personalization"],
    prompts: [
      "I'm feeling stressed about my workload",
      "Give me a wellness check-in",
      "What do you know about me so far?",
      "Recommend something for my wellbeing",
    ],
  },
];

export function getCategoryById(id) {
  return ORACLE_CATEGORIES.find((c) => c.id === id);
}