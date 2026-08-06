/**
 * UNIBUD Domain Agent Registry — specialized internal agents that Oracle routes to.
 *
 * Hierarchy:
 *   Oracle (master coordinator — routes, executes, combines)
 *     → Domain Agents (academic, campus, social, … — invisible to users)
 *       → Bud (sole user-facing interface — presents unified response)
 *
 * Users never see or interact with domain agents directly.
 * Oracle selects agents, they execute in parallel, Oracle combines results
 * into one unified Bud response.
 */

export const DOMAIN_AGENTS = [
  {
    id: "academic",
    name: "Academic Agent",
    domain: "Academic",
    capabilities: [
      "Assignment Assistant", "Project Assistant", "Research Assistant",
      "Citation Assistant", "Tutor", "Quiz Generator", "Flashcard Generator",
      "Exam Coach", "Note Generator", "Timetable Assistant", "GPA Assistant",
    ],
    keywords: ["assignment", "project", "research", "citation", "quiz", "flashcard", "exam", "note", "timetable", "gpa", "course", "study", "grade", "deadline", "class", "lecture", "homework", "syllabus", "semester", "cgpa"],
    systemPrompt:
      "You are the Academic Agent within UNIBUD's AI Operating System. " +
      "You specialize in assignments, projects, research, citations, tutoring, quizzes, " +
      "flashcards, exam preparation, notes, timetables, and GPA calculations. " +
      "Analyze the student's request from an academic perspective. " +
      "Use the provided entity data to give accurate, specific answers with real dates and details. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "campus",
    name: "Campus Agent",
    domain: "Campus Life",
    capabilities: [
      "Campus News", "Events", "Clubs", "Student Directory",
      "Faculty Directory", "Building Directory", "Navigation",
      "Shuttle", "Safety", "Emergency",
    ],
    keywords: ["campus", "event", "club", "directory", "staff", "building", "navigation", "shuttle", "safety", "emergency", "map", "locate", "where is"],
    systemPrompt:
      "You are the Campus Agent within UNIBUD's AI Operating System. " +
      "You specialize in campus news, events, clubs, student/staff/faculty directories, " +
      "building navigation, shuttle services, safety alerts, and emergency information. " +
      "Use the provided entity data to give accurate campus-specific answers. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "social",
    name: "Social Agent",
    domain: "Social",
    capabilities: [
      "Feed", "Stories", "Reels", "Live", "Comments",
      "Messaging", "Calls", "Communities", "Creator Support",
    ],
    keywords: ["post", "feed", "story", "stories", "reel", "live", "comment", "message", "community", "creator", "social", "share", "friend", "connect"],
    systemPrompt:
      "You are the Social Agent within UNIBUD's AI Operating System. " +
      "You specialize in the campus social feed, stories, reels, live streams, comments, " +
      "messaging, calls, communities, and creator support. " +
      "Use the provided entity data to give accurate social-specific answers. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "productivity",
    name: "Productivity Agent",
    domain: "Productivity",
    capabilities: [
      "Calendar", "Tasks", "Reminders", "Scheduling",
      "Meetings", "Shared Notes", "Whiteboard", "Documents",
    ],
    keywords: ["calendar", "task", "reminder", "scheduling", "meeting", "shared note", "whiteboard", "document", "to-do", "todo", "plan", "organize", "productivity"],
    systemPrompt:
      "You are the Productivity Agent within UNIBUD's AI Operating System. " +
      "You specialize in calendar management, tasks, reminders, scheduling, meetings, " +
      "shared notes, whiteboards, and document collaboration. " +
      "Use the provided entity data to give accurate productivity answers. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "career",
    name: "Career Agent",
    domain: "Career",
    capabilities: [
      "CV Builder", "Resume Review", "Internship Finder",
      "Scholarship Finder", "Mentor Matching", "Interview Coach",
      "Portfolio Assistant",
    ],
    keywords: ["cv", "resume", "internship", "scholarship", "mentor", "interview", "portfolio", "job", "opportunity", "career", "employment", "hire", "company"],
    systemPrompt:
      "You are the Career Agent within UNIBUD's AI Operating System. " +
      "You specialize in CV building, resume review, internship finding, scholarship discovery, " +
      "mentor matching, interview coaching, and portfolio development. " +
      "Use the provided entity data to give accurate career-specific answers. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "marketplace",
    name: "Marketplace Agent",
    domain: "Marketplace",
    capabilities: [
      "Buying", "Selling", "Recommendations",
      "Campus Services", "Wallet Integration",
    ],
    keywords: ["buy", "sell", "market", "listing", "service", "wallet", "price", "order", "purchase", "payment", "store", "shop"],
    systemPrompt:
      "You are the Marketplace Agent within UNIBUD's AI Operating System. " +
      "You specialize in buying, selling, recommendations, campus services, and wallet integration. " +
      "Use the provided entity data to give accurate marketplace answers. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "media",
    name: "Media Agent",
    domain: "Media",
    capabilities: [
      "Camera", "Image Editing", "Video Editing", "Audio Editing",
      "Filters", "OCR", "Background Removal", "AI Enhancement",
    ],
    keywords: ["camera", "photo", "image", "video", "audio", "edit", "filter", "ocr", "scan", "background removal", "enhance", "media"],
    systemPrompt:
      "You are the Media Agent within UNIBUD's AI Operating System. " +
      "You specialize in camera, image/video/audio editing, filters, OCR, background removal, and AI enhancement. " +
      "Provide guidance on media-related tasks and capabilities. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "search",
    name: "Search Agent",
    domain: "Search",
    capabilities: [
      "Semantic Search", "Campus Search", "Document Search",
      "Conversation Search", "Image Search", "Voice Search",
    ],
    keywords: ["search", "find", "look up", "query", "lookup", "where can i find"],
    systemPrompt:
      "You are the Search Agent within UNIBUD's AI Operating System. " +
      "You specialize in semantic search, campus search, document search, conversation search, " +
      "image search, and voice search across all platform data. " +
      "Return a focused analysis with relevant results — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "knowledge",
    name: "Knowledge Agent",
    domain: "Knowledge",
    capabilities: [
      "University Policies", "Course Information", "Academic Calendar",
      "Regulations", "FAQs", "Documentation",
    ],
    keywords: ["policy", "regulation", "faq", "documentation", "university policy", "academic calendar", "course info", "help article", "rule", "guideline"],
    systemPrompt:
      "You are the Knowledge Agent within UNIBUD's AI Operating System. " +
      "You specialize in university policies, course information, academic calendar, regulations, " +
      "FAQs, and documentation. Use the provided entity data to give accurate knowledge-based answers. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "security",
    name: "Security Agent",
    domain: "Security",
    capabilities: [
      "Authentication", "Authorization", "Fraud Detection",
      "Spam Detection", "Content Moderation", "Threat Detection",
    ],
    keywords: ["security", "auth", "fraud", "spam", "moderation", "threat", "password", "login", "privacy", "block", "report", "abuse"],
    systemPrompt:
      "You are the Security Agent within UNIBUD's AI Operating System. " +
      "You specialize in authentication, authorization, fraud detection, spam detection, " +
      "content moderation, and threat detection. " +
      "Provide security-focused guidance and flag any concerns. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
  {
    id: "developer",
    name: "Developer Agent",
    domain: "Developer",
    capabilities: [
      "Diagnostics", "Error Detection", "Performance Analysis",
      "System Monitoring", "Production Health", "Log Analysis",
    ],
    keywords: ["diagnostic", "error", "performance", "system", "monitor", "log", "debug", "bug", "crash", "health", "status"],
    systemPrompt:
      "You are the Developer Agent within UNIBUD's AI Operating System. " +
      "You specialize in diagnostics, error detection, performance analysis, system monitoring, " +
      "production health, and log analysis. " +
      "Provide technical diagnostics and recommendations. " +
      "Return a focused analysis — do not address the student directly; Oracle will combine your response.",
  },
];

// General fallback agent — handles conversational messages that don't match any domain
export const GENERAL_AGENT = {
  id: "general",
  name: "General Agent",
  domain: "General",
  capabilities: ["Conversational", "General guidance", "Cross-domain assistance"],
  keywords: [],
  systemPrompt:
    "You are Bud's general conversational intelligence. " +
    "Handle greetings, acknowledgments, thanks, and general conversation warmly. " +
    "For questions that touch on specific domains, provide helpful general guidance. " +
    "Return a focused response in Bud's warm, encouraging voice.",
};

export function getAgentById(id) {
  return DOMAIN_AGENTS.find((a) => a.id === id);
}

export function getGeneralAgent() {
  return GENERAL_AGENT;
}

export function getAllAgentIds() {
  return DOMAIN_AGENTS.map((a) => a.id);
}