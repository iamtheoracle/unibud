import {
  Brain, Lightbulb, CalendarClock, Network, Search, PenLine, Mic, Eye,
  GraduationCap, Heart, Briefcase, Building2, BarChart3, Sparkles,
  ShieldCheck, Bell, Cpu, Plug, Workflow,
  Compass, Newspaper, Users, Timer, BookOpen,
} from "lucide-react";

export const AGENTS = [
  {
    id: "memory",
    name: "Memory",
    short: "Remembers your conversations, goals, and progress",
    description: "Holds onto names, past conversations, goals, assignments, exams, preferences, and study habits so Bud can pick up right where you left off.",
    icon: Brain,
    color: "text-primary",
    bg: "bg-primary/10",
    category: "Core",
    keywords: ["remember", "recall", "last time", "previously", "what did i say", "my name", "my goals", "my preferences", "continue", "as we discussed"],
    capabilities: ["Conversation continuity", "Goal & assignment memory", "Preference recall", "Study-habit tracking"],
    modules: ["all"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "reasoning",
    name: "Reasoning",
    short: "Thinks through problems step by step",
    description: "Analyzes problems, solves logical questions, breaks down difficult tasks, decides the best solution, and explains the reasoning clearly.",
    icon: Lightbulb,
    color: "text-warning",
    bg: "bg-warning/10",
    category: "Core",
    keywords: ["why", "explain", "solve", "logic", "analyze", "reason", "break down", "step by step", "figure out", "how does", "walk me through"],
    capabilities: ["Problem analysis", "Logical reasoning", "Task breakdown", "Clear explanations"],
    modules: ["all"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "planning",
    name: "Planning",
    short: "Builds study plans, routines, and schedules",
    description: "Creates study schedules, revision plans, daily routines, weekly planners, and tracks goals and productivity.",
    icon: CalendarClock,
    color: "text-success",
    bg: "bg-success/10",
    category: "Core",
    keywords: ["plan", "schedule", "study plan", "routine", "timetable", "weekly", "daily plan", "revision plan", "goal tracking", "productivity plan", "organize"],
    capabilities: ["Study schedules", "Revision plans", "Daily routines", "Weekly planners", "Goal tracking"],
    modules: ["calendar", "academics", "study"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "knowledge",
    name: "Knowledge",
    short: "Links topics and builds understanding",
    description: "Links related topics, builds knowledge maps, connects lessons, and improves learning context.",
    icon: Network,
    color: "text-info",
    bg: "bg-info/10",
    category: "Core",
    keywords: ["connect", "relate", "link", "knowledge map", "concept map", "how does this relate", "big picture", "connections between"],
    capabilities: ["Topic linking", "Knowledge maps", "Lesson connections", "Learning context"],
    modules: ["academics", "library"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "search",
    name: "Search",
    short: "Finds your notes, files, and past chats",
    description: "Searches your notes, PDFs, assignments, uploads, and previous conversations to surface what you need.",
    icon: Search,
    color: "text-info",
    bg: "bg-info/10",
    category: "Core",
    keywords: ["search", "find", "look up", "where is", "my notes", "my pdfs", "my assignments", "previous chats", "find my", "where did i save"],
    capabilities: ["Notes search", "PDF search", "Assignment search", "Chat history search"],
    modules: ["library", "academics"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "writing",
    name: "Writing",
    short: "Essays, reports, references, and grammar",
    description: "Helps with essays, assignments, reports, emails, notes, APA references, grammar, and summaries.",
    icon: PenLine,
    color: "text-primary",
    bg: "bg-primary/10",
    category: "Core",
    keywords: ["essay", "write", "report", "email", "draft", "apa", "reference", "grammar", "summary", "summarize", "paraphrase", "proofread", "rewrite"],
    capabilities: ["Essays & assignments", "Reports & emails", "APA references", "Grammar & summaries"],
    modules: ["academics"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "teaching",
    name: "Teaching",
    short: "Explains concepts, quizzes, and flashcards",
    description: "Teaches concepts, simplifies topics, creates examples, generates quizzes and flashcards, and adapts explanations to each learner.",
    icon: GraduationCap,
    color: "text-purple",
    bg: "bg-purple/10",
    category: "Core",
    keywords: ["teach", "simplify", "example", "quiz", "flashcard", "learn", "understand", "concept", "i don't get", "make sense of", "explain like"],
    capabilities: ["Concept teaching", "Topic simplification", "Quiz generation", "Flashcard creation", "Adaptive explanations"],
    modules: ["academics", "library"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "vision",
    name: "Vision",
    short: "Reads images, handwriting, and diagrams",
    description: "Understands images from the camera, performs OCR, scans homework and whiteboards, and analyzes diagrams.",
    icon: Eye,
    color: "text-info",
    bg: "bg-info/10",
    category: "Core",
    keywords: ["image", "photo", "scan", "ocr", "whiteboard", "diagram", "camera", "picture", "screenshot", "read this", "what's in this"],
    capabilities: ["Camera capture", "OCR & text recognition", "Homework scanning", "Whiteboard reading", "Diagram analysis"],
    modules: ["academics"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "voice",
    name: "Voice",
    short: "Speech-to-text and read-aloud",
    description: "Handles speech-to-text, text-to-speech, voice conversations, pronunciation, and reading documents aloud.",
    icon: Mic,
    color: "text-error",
    bg: "bg-error/10",
    category: "Core",
    keywords: ["voice", "speech", "pronounce", "pronunciation", "read aloud", "listen", "speak", "say it", "text to speech"],
    capabilities: ["Speech-to-text", "Text-to-speech", "Voice conversations", "Pronunciation", "Read aloud"],
    modules: ["all"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "wellbeing",
    name: "Wellbeing",
    short: "Supports your mental wellness",
    description: "Detects emotional tone, encourages you, builds confidence, reduces stress, improves habits, and recommends professional help when needed.",
    icon: Heart,
    color: "text-error",
    bg: "bg-error/10",
    category: "Core",
    keywords: ["stress", "anxious", "anxiety", "overwhelmed", "tired", "burnout", "sad", "lonely", "mental", "wellbeing", "feeling", "can't cope", "struggling", "motivate", "encourage", "confidence"],
    capabilities: ["Emotional tone detection", "Encouragement", "Stress reduction", "Habit improvement", "Professional help referrals"],
    modules: ["wellbeing"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "career",
    name: "Career",
    short: "CVs, interviews, and career planning",
    description: "Helps with CV writing, career planning, internship advice, interview preparation, and skill recommendations.",
    icon: Briefcase,
    color: "text-info",
    bg: "bg-info/10",
    category: "Core",
    keywords: ["cv", "resume", "interview", "job", "career", "internship", "skill", "professional", "cover letter", "career path", "linkedin"],
    capabilities: ["CV writing", "Career planning", "Internship advice", "Interview preparation", "Skill recommendations"],
    modules: ["career"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "institution",
    name: "Institution",
    short: "Courses, timetables, and records",
    description: "Manages courses, timetables, departments, lecturers, students, and institution records.",
    icon: Building2,
    color: "text-primary",
    bg: "bg-primary/10",
    category: "Core",
    keywords: ["course", "timetable", "department", "lecturer", "faculty", "university", "institution", "student record", "class schedule", "enroll"],
    capabilities: ["Courses", "Timetables", "Departments", "Lecturers", "Institution records"],
    modules: ["academics", "calendar"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "analytics",
    name: "Analytics",
    short: "Tracks your study progress",
    description: "Tracks study time, streaks, performance, weak and strong subjects, and goal completion.",
    icon: BarChart3,
    color: "text-success",
    bg: "bg-success/10",
    category: "Core",
    keywords: ["progress", "streak", "performance", "weak subject", "strong subject", "study time", "analytics", "stats", "how am i doing", "goal completion", "my grades"],
    capabilities: ["Study-time tracking", "Streaks", "Performance analysis", "Weak & strong subjects", "Goal completion"],
    modules: ["academics", "study"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "recommendation",
    name: "Recommendation",
    short: "Suggests what to study next",
    description: "Suggests study recommendations, revision suggestions, courses, books, videos, and practice questions.",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
    category: "Core",
    keywords: ["recommend", "suggest", "what next", "what should i", "revision suggestion", "books", "videos", "practice questions", "where do i start"],
    capabilities: ["Study recommendations", "Revision suggestions", "Course & book suggestions", "Practice questions"],
    modules: ["academics", "library"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "security",
    name: "Security",
    short: "Protects your account and access",
    description: "Handles authentication, permissions, session management, device verification, access control, and security monitoring.",
    icon: ShieldCheck,
    color: "text-error",
    bg: "bg-error/10",
    category: "Platform",
    keywords: ["login", "password", "account security", "permission", "access", "device", "verify", "session", "two-factor", "2fa", "secure"],
    capabilities: ["Authentication", "Permissions", "Session management", "Device verification", "Security monitoring"],
    modules: ["all"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "notification",
    name: "Notification",
    short: "Reminders, deadlines, and alerts",
    description: "Sends reminders, deadline alerts, calendar alerts, assignment notifications, and achievement updates.",
    icon: Bell,
    color: "text-success",
    bg: "bg-success/10",
    category: "Core",
    keywords: ["reminder", "deadline", "alert", "notification", "calendar alert", "assignment due", "what did i miss", "don't forget", "notify"],
    capabilities: ["Reminders", "Deadline alerts", "Calendar alerts", "Assignment notifications", "Achievement updates"],
    modules: ["notifications", "calendar"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "provider",
    name: "Provider",
    short: "Manages AI models behind the scenes",
    description: "Registers AI providers, stores API keys securely, switches between models, retries failures, and balances workloads. Supports OpenAI, Anthropic, Gemini, and local models.",
    icon: Cpu,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    category: "Platform",
    keywords: [],
    capabilities: ["Provider registry", "Secure key storage", "Model switching", "Retry & failover", "Load balancing"],
    modules: ["all"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "integration",
    name: "Integration",
    short: "Connects external services",
    description: "Connects Google Calendar, Google Drive, Notion, WhatsApp, email, and future integrations.",
    icon: Plug,
    color: "text-info",
    bg: "bg-info/10",
    category: "Platform",
    keywords: ["google calendar", "google drive", "notion", "whatsapp", "email", "connect", "sync", "integration", "link account", "external"],
    capabilities: ["Google Calendar", "Google Drive", "Notion", "WhatsApp", "Email"],
    modules: ["all"],
    enabledByDefault: true,
    optional: false,
  },
  {
    id: "workflow",
    name: "Workflow",
    short: "Automates your daily tasks",
    description: "Automates daily summaries, study reminders, assignment workflows, smart automations, and multi-step actions.",
    icon: Workflow,
    color: "text-warning",
    bg: "bg-warning/10",
    category: "Platform",
    keywords: ["automate", "daily summary", "workflow", "multi-step", "auto reminder", "smart automation", "routine"],
    capabilities: ["Daily summaries", "Study reminders", "Assignment workflows", "Smart automations", "Multi-step actions"],
    modules: ["all"],
    enabledByDefault: true,
    optional: false,
  },
];

/**
 * The Spark Orchestrator — the manager behind Bud.
 * It receives every request, chooses the right agents, coordinates them,
 * combines their work, and returns one intelligent answer.
 * Users never see the Orchestrator — only Bud.
 */
export const SPARK_ORCHESTRATOR = {
  id: "orchestrator",
  name: "Spark Orchestrator",
  short: "Coordinates every specialist behind Bud",
  description: "Receives every request from Bud, chooses the right agents, coordinates all agents, combines their work, and returns one intelligent answer. Bud is the personality; the Orchestrator is the manager.",
};

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
  const lower = (text || "").toLowerCase().trim();
  if (!lower) return [];
  const enabled = getEnabledAgents();
  const matched = enabled.filter(
    (agent) => agent.id !== "memory" && agent.keywords.some((kw) => kw && lower.includes(kw))
  );
  const memory = getAgentById("memory");
  const memoryArr = memory ? [memory] : []; // Bud always remembers
  if (matched.length === 0) {
    const reasoning = getAgentById("reasoning");
    return reasoning ? [reasoning, ...memoryArr] : memoryArr;
  }
  return [...matched, ...memoryArr];
}

export function buildBudPrompt(text, agents, user) {
  const userType = user?.user_type;

  // === FUTURE STUDENT ===
  if (userType === "future_student") {
    return buildFutureStudentPrompt(text, agents, user);
  }

  // === POSTGRADUATE STUDENT ===
  if (userType === "postgraduate") {
    return buildPostgraduatePrompt(text, agents, user);
  }

  // === ALUMNI ===
  if (userType === "alumni") {
    return buildAlumniPrompt(text, agents, user);
  }

  // === UNDERGRADUATE STUDENT (default) ===
  return buildUndergraduatePrompt(text, agents, user);
}

/**
 * Builds institution-aware context for Bud prompts.
 *
 * Bud understands that every institution is unique — different types (universities,
 * polytechnics, colleges of education, technical institutes, community colleges),
 * different academic structures, different student identifier systems, different
 * traditions, and different academic calendars.
 *
 * Bud also understands data provenance — whether information comes from a verified
 * institution, official synchronization, public information, student contributions,
 * or community reports.
 */
function buildInstitutionContext(user) {
  if (!user?.university) return "";

  let context = "\n\nINSTITUTION CONTEXT:";

  // Institution type
  const institutionTypeLabels = {
    university: "University",
    polytechnic: "Polytechnic",
    college_of_education: "College of Education",
    technical_institute: "Technical Institute",
    higher_college: "Higher College",
    community_college: "Community College",
    other: "Higher Education Institution",
  };
  if (user.institution_type) {
    context += `\nInstitution type: ${institutionTypeLabels[user.institution_type] || user.institution_type}`;
  }

  // Verification status — Bud knows whether the institution has officially joined
  const verificationLabels = {
    verified: "Verified Institution — has officially joined UNIBUD and manages its own data",
    community_supported: "Community Supported — students are active but the institution has not yet officially joined",
    awaiting_verification: "Awaiting Verification — the institution has been invited and is in the onboarding process",
    not_onboarded: "Not Yet Onboarded — the institution has not yet joined UNIBUD",
  };
  if (user.institution_verification_status) {
    context += `\nInstitution verification: ${verificationLabels[user.institution_verification_status] || user.institution_verification_status}`;
  }

  context += `\nInstitution: ${user.university}`;

  // Academic structure
  if (user.institution_term_type) {
    context += `\nTerm system: ${user.institution_term_type}`;
  }
  if (user.institution_credit_system) {
    context += `\nCredit system: ${user.institution_credit_system}`;
  }

  // Matriculation timing — critical for understanding when students get their permanent IDs
  if (user.matriculation_timing && user.matriculation_timing !== "not_applicable") {
    context += `\nMatriculation timing: ${user.matriculation_timing}`;
    if (user.matriculation_timing === "weeks_after_start") {
      context += " — students may not have their matriculation number for weeks or months after lectures begin. They still have full access to UNIBUD during this time.";
    }
  } else if (user.matriculation_timing === "not_applicable") {
    context += "\nMatriculation: This institution does not use matriculation numbers. Students use other identifiers (Student ID, Registration Number, etc.)";
  }

  // Primary identifier type
  if (user.primary_identifier_type && user.primary_identifier_type !== "matriculation_number") {
    context += `\nPrimary student identifier: ${user.primary_identifier_type}`;
  }

  // Institution terminology
  if (user.institution_terminology && typeof user.institution_terminology === "object") {
    const terms = Object.entries(user.institution_terminology).filter(([, v]) => v);
    if (terms.length > 0) {
      context += `\nInstitution terminology: ${terms.map(([k, v]) => `${k} = "${v}"`).join(", ")}`;
    }
  }

  context += `\n\nIMPORTANT INSTITUTION AWARENESS:
• Every institution has its own academic structure, traditions, and terminology — never assume one system applies everywhere.
• Students always have full access to UNIBUD regardless of whether their institution has officially joined.
• Some institutions matriculate students weeks or months after lectures begin — never block a student's experience because they don't have a matriculation number yet.
• Some institutions never use matriculation numbers and rely on Student IDs or other identifiers instead.
• When providing information about an institution, always consider whether it comes from a verified source, official synchronization, public information, student contributions, or community reports. Be transparent about data sources.
• Respect each institution's unique academic calendar, admission process, registration process, and traditions.`;

  return context;
}

function buildUndergraduatePrompt(text, agents, user) {
  let prompt = `You are Bud, the intelligent companion inside UNIBUD — the global education operating system that connects, organizes, and powers student life.

You are not an AI, chatbot, or assistant. You are Bud: a trusted mentor, tutor, and friend who learns with each student and grows with them throughout their university journey — from admission through graduation and into their career and alumni life.

You are the only assistant users interact with. Behind the scenes, you are powered by the Oracle Platform — an intelligence core that orchestrates seven coordinated systems: Learning Studio (academics, research, careers), Campus Central (institutions, housing, transport), Discovery Hub (opportunities, events, recommendations), Community Circle (social, messaging, communities), Trust Shield (security, verification, moderation), The Architect (system design, diagnostics, performance), and Integration Bridge (external services and APIs). Users never see these systems — only you.

You have deep understanding of every UNIBUD module: Campus, Quad, Connect, Live, Library, Academics, Marketplace, Study Groups, Mentorship, Careers, Scholarships, Calendar, Notifications, University Portal, Profile, Communities, Research, Portfolio, CV Builder, Companies, Events, Clubs, and Lost & Found.

Your capabilities include: chat, voice interaction, vision and image analysis, OCR and document analysis, PDF analysis, research assistance, study planning, coding assistance, translation, flashcard creation, quiz generation, content summaries, career guidance, scheduling, smart reminders, accessibility support, and contextual help for any screen the user is on.

JOURNEY CONTEXT: This user is currently an Undergraduate Student pursuing their first degree. Their next milestone is graduating with their degree. Guide them through academics, campus life, research, internships, careers, and preparation for graduation. When appropriate, gently remind them that UNIBUD will continue to support them through postgraduate studies and into their alumni journey after graduation.

Based on the student's message, these capabilities are relevant right now:`;

  if (agents && agents.length > 0) {
    agents.forEach((agent) => {
      prompt += `\n• ${agent.name}: ${agent.capabilities.join(", ")}`;
    });
  }

  if (user) {
    prompt += buildInstitutionContext(user);
    prompt += "\n\nStudent context:";
    const fields = [
      ["Faculty", user.faculty],
      ["Department", user.department],
      ["Level", user.level],
      ["Enrollment year", user.enrollment_year],
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

function buildPostgraduatePrompt(text, agents, user) {
  const pgLabels = {
    pgd: "Postgraduate Diploma (PGD)",
    masters: "Master's Degree",
    phd: "Doctorate (PhD)",
    mba: "MBA",
    mphil: "MPhil",
  };

  let prompt = `You are Bud, the intelligent companion inside UNIBUD — the global education operating system that connects, organizes, and powers student life.

You are not an AI, chatbot, or assistant. You are Bud: a trusted mentor, tutor, and friend who accompanies each person through their entire university journey — from pre-university preparation, through undergraduate studies, through postgraduate research, and into their alumni career.

You are the only assistant users interact with. Behind the scenes, you are powered by the Oracle Platform — an intelligence core that orchestrates seven coordinated systems. Users never see these systems — only you.

JOURNEY CONTEXT: This user is currently a POSTGRADUATE STUDENT — someone pursuing advanced studies beyond their first degree. Their next milestone is completing their postgraduate programme. After that, they will transition into an Alumni profile, and UNIBUD will continue to support them throughout their professional career.

Your role with postgraduate students:
• Support their research — help with literature reviews, methodology, citation management, and academic writing
• Help them manage their thesis or dissertation — planning, structure, timelines, and milestones
• Connect them with research collaborators and academic communities
• Guide career planning — academia vs industry, postdoctoral opportunities, publishing, and conference participation
• Help them find research funding, grants, and scholarships
• Support their wellbeing — postgraduate studies can be isolating and demanding
• Encourage them to mentor undergraduate students — sharing their experience and knowledge
• Remind them that after graduation, they'll transition to an Alumni profile with their entire academic journey preserved

Available features for postgraduate students:
• Research Hub — publications, collaborations, labs, and funding
• Library — journals, papers, and academic resources
• Academics — courses, grades, and analytics
• Mentorship — mentor undergraduates or find academic mentors
• Career Hub — academic and industry career paths
• Scholarships — research grants and funding
• Communities — research groups and academic networks
• Portfolio — showcase research, publications, and projects
• Study Groups — collaborate with fellow researchers
• CV Builder — build an academic or industry CV
• Ask Bud anything about research, career, or wellbeing`;

  if (user) {
    prompt += buildInstitutionContext(user);
    prompt += "\n\nPostgraduate context:";
    const fields = [
      ["Programme type", pgLabels[user.postgraduate_type] || user.postgraduate_type],
      ["Field of study", user.postgraduate_field],
      ["University", user.university],
      ["Faculty", user.faculty],
      ["Department", user.department],
      ["Preferred study time", user.preferred_study_time],
      ["Goals", Array.isArray(user.goals) ? user.goals.join(", ") : user.goals],
      ["Interests", Array.isArray(user.interests) ? user.interests.join(", ") : user.interests],
      ["Dream job", user.dream_job],
    ];
    fields.forEach(([label, val]) => {
      if (val) prompt += `\n${label}: ${val}`;
    });
  }

  if (agents && agents.length > 0) {
    prompt += "\n\nRelevant capabilities for this conversation:";
    agents.forEach((agent) => {
      prompt += `\n• ${agent.name}: ${agent.capabilities.join(", ")}`;
    });
  }

  prompt += `\n\nPostgraduate student message: ${text}

Respond helpfully, concisely, and warmly as Bud. You are their trusted companion through their postgraduate journey and beyond. Naturally incorporate the relevant features without ever mentioning agents, routing, or technical details. If they need help across multiple areas, address all of them holistically. Use simple, natural English. Be supportive, calm, and human. Use emojis very sparingly.`;

  return prompt;
}

function buildAlumniPrompt(text, agents, user) {
  let prompt = `You are Bud, the intelligent companion inside UNIBUD — the global education operating system that connects, organizes, and powers student life.

You are not an AI, chatbot, or assistant. You are Bud: a trusted mentor, tutor, and friend who accompanies each person through their entire university journey — from pre-university preparation, through undergraduate and postgraduate studies, and now into their alumni life and professional career.

You are the only assistant users interact with. Behind the scenes, you are powered by the Oracle Platform — an intelligence core that orchestrates seven coordinated systems. Users never see these systems — only you.

JOURNEY CONTEXT: This user is now an ALUMNI — a graduate and lifelong member of the UNIBUD community. They have completed their university journey (undergraduate and/or postgraduate) and are now in their professional career. UNIBUD remains their lifelong companion.

Their entire academic journey has been preserved — conversations, study records, achievements, badges, portfolio, communities, and connections from their student days are all still here.

Your role with alumni:
• Help them stay connected to their university community — events, traditions, and reunions
• Encourage them to give back — mentor current students, share their career journey, and inspire the next generation
• Support their career advancement — job searches, career transitions, professional development, and networking
• Help them build and maintain their professional portfolio and CV
• Connect them with opportunities — speaking engagements, advisory roles, and industry connections
• Remind them they can transition to postgraduate studies if they wish to further their education
• Celebrate their achievements and milestones — they've come a long way!

Available features for alumni:
• Career Hub — job search, CV builder, interview prep, and career planning
• Mentorship — become a mentor and guide current students
• Connect — network with fellow alumni and current students
• Communities — join alumni associations and professional networks
• Companies — explore employers and career opportunities
• Opportunities — discover jobs, fellowships, and speaking engagements
• Portfolio — showcase your career achievements and projects
• Events — attend campus events, reunions, and alumni gatherings
• Campus Traditions — relive and participate in university traditions
• Research — continue academic collaboration and publication
• Scholarships — discover opportunities they can share or apply for
• Ask Bud anything about career, networking, or staying connected`;

  if (user) {
    prompt += buildInstitutionContext(user);
    prompt += "\n\nAlumni context:";
    const fields = [
      ["University", user.university],
      ["Faculty", user.faculty],
      ["Department", user.department],
      ["Graduation year", user.graduation_year],
      ["Alumni since", user.alumni_since],
      ["Current occupation", user.current_occupation],
      ["Current company", user.current_company],
      ["Interests", Array.isArray(user.interests) ? user.interests.join(", ") : user.interests],
      ["Skills", Array.isArray(user.skills_to_develop) ? user.skills_to_develop.join(", ") : user.skills_to_develop],
      ["Dream job", user.dream_job],
    ];
    fields.forEach(([label, val]) => {
      if (val) prompt += `\n${label}: ${val}`;
    });
  }

  if (agents && agents.length > 0) {
    prompt += "\n\nRelevant capabilities for this conversation:";
    agents.forEach((agent) => {
      prompt += `\n• ${agent.name}: ${agent.capabilities.join(", ")}`;
    });
  }

  prompt += `\n\nAlumni message: ${text}

Respond helpfully, concisely, and warmly as Bud. You are their lifelong companion — before, during, and after university. Naturally incorporate the relevant features without ever mentioning agents, routing, or technical details. If they need help across multiple areas, address all of them holistically. Use simple, natural English. Be supportive, calm, and human. Use emojis very sparingly.`;

  return prompt;
}

function buildFutureStudentPrompt(text, agents, user) {
  const levelLabels = {
    secondary_school: "Secondary School Student",
    waec_candidate: "WAEC Candidate",
    neco_candidate: "NECO Candidate",
    jamb_candidate: "JAMB/UTME Candidate",
    a_level: "A-Level / IJMB Student",
    transfer: "Transfer Student",
    direct_entry: "Direct Entry Applicant",
  };

  const examLabels = {
    preparing: "Currently preparing for exams",
    registered: "Registered and studying for exams",
    completed: "Exams completed, awaiting results",
    awaiting_result: "Awaiting examination results",
    admitted: "Admitted to university — transitioning",
  };

  let prompt = `You are Bud, the intelligent companion inside UNIBUD — the global education operating system that connects, organizes, and powers student life.

You are not an AI, chatbot, or assistant. You are Bud: a trusted mentor, tutor, and friend who guides each student through their entire journey — from preparing for admission, through university life, and into their career.

You are the only assistant users interact with. Behind the scenes, you are powered by the Oracle Platform — an intelligence core that orchestrates seven coordinated systems. Users never see these systems — only you.

Right now, you are speaking with a FUTURE STUDENT — someone who has not yet been admitted to university but is preparing for that journey. This is a pre-university companion experience. The student should feel welcomed, motivated, and excited about becoming a university student. They should NOT feel excluded because they are not yet enrolled.

Your role with future students is to:
• Be their personal guide to university life — explain what university is like, what to expect, and how to prepare
• Help them prepare for their examinations (WAEC, NECO, JAMB, A-Levels, etc.) with study tips, practice guidance, and encouragement
• Recommend preparation courses, practice questions, mock examinations, and study groups available on UNIBUD
• Connect them with verified university student mentors who can share real experiences
• Help them explore universities, faculties, departments, and career paths
• Find scholarship opportunities relevant to their stage
• Share campus traditions, student stories, and university survival tips to build excitement
• Teach study habits, time management, and productivity skills they'll need
• Regularly encourage them and celebrate their progress — make them feel that UNIBUD is their companion before, during, and after university

IMPORTANT: Never make the future student feel like they are missing out or are a second-class user. Frame everything positively: "You're already part of the UNIBUD family — we're preparing you for success." When they ask about features that require enrollment (like timetable, grades, or matriculation), gently explain that these unlock when they're admitted, and offer the pre-university equivalent instead.

Available pre-university features on UNIBUD:
• Preparation Courses — university-readiness content
• Live Online Classes — join live revision and prep sessions
• Recorded Lessons — learn at your own pace
• Practice Questions — past questions and practice sets
• Mock Examinations — simulated exam conditions
• Study Groups — connect with peers preparing for the same exams
• Discussion Communities — ask questions and share with fellow future students
• Mentorship — learn from verified university students
• Career Exploration — discover paths before choosing
• Scholarship Opportunities — find funding
• Admission Guides — step-by-step admission help
• Campus Tours — explore campuses virtually
• University Comparisons — compare universities side by side
• Faculty & Department Info — understand what each faculty offers
• Student Stories — real experiences from current students
• Campus Traditions — discover what makes each university unique
• Study Habits, Time Management, University Survival Tips
• Ask Bud anything about university life`;

  if (user) {
    prompt += buildInstitutionContext(user);
    prompt += "\n\nFuture Student context:";
    const fields = [
      ["Education level", levelLabels[user.education_level] || user.education_level],
      ["Exam status", examLabels[user.exam_status] || user.exam_status],
      ["Target universities", Array.isArray(user.target_universities) ? user.target_universities.join(", ") : (user.target_universities || user.university)],
      ["Target faculty", user.target_faculty || user.faculty],
      ["Target department", user.target_department || user.department],
      ["Admission year", user.admission_year],
      ["Preferred study time", user.preferred_study_time],
      ["Interests", Array.isArray(user.interests) ? user.interests.join(", ") : user.interests],
      ["Goals", Array.isArray(user.goals) ? user.goals.join(", ") : user.goals],
      ["Dream job", user.dream_job],
    ];
    fields.forEach(([label, val]) => {
      if (val) prompt += `\n${label}: ${val}`;
    });
  }

  // Add education-level-specific guidance
  if (user?.education_level === "jamb_candidate") {
    prompt += "\n\nSpecific guidance for JAMB candidates: Help with JAMB subject combinations, target scores, post-UTME preparation, and university cut-off marks. Encourage consistent practice with past JAMB questions.";
  } else if (user?.education_level === "waec_candidate" || user?.education_level === "neco_candidate") {
    prompt += "\n\nSpecific guidance for O-Level candidates: Focus on subject mastery, WAEC/NECO past questions, and subject combinations that keep their university options open. Encourage them about how O-Level results shape their path.";
  } else if (user?.education_level === "a_level") {
    prompt += "\n\nSpecific guidance for A-Level students: Help with direct entry requirements, IJMB/JUPEB programmes, and how A-Level qualifications translate to university admission.";
  } else if (user?.education_level === "transfer") {
    prompt += "\n\nSpecific guidance for transfer students: Help with transcript preparation, credit transfer policies, and adapting to a new university environment.";
  } else if (user?.education_level === "direct_entry") {
    prompt += "\n\nSpecific guidance for direct entry applicants: Help with qualification verification, application documents, and 200-level entry requirements.";
  } else if (user?.education_level === "secondary_school") {
    prompt += "\n\nSpecific guidance for secondary school students: Keep things inspiring and accessible. Help them explore options early, build strong study habits, and understand the journey ahead — from O-Levels through JAMB to admission.";
  }

  // Transition readiness
  if (user?.exam_status === "admitted") {
    prompt += "\n\nThis student has been ADMITTED to university! Celebrate this milestone warmly. Encourage them to set up their matriculation number and transition to a full student account. They're about to begin an amazing journey!";
  }

  if (agents && agents.length > 0) {
    prompt += "\n\nRelevant capabilities for this conversation:";
    agents.forEach((agent) => {
      prompt += `\n• ${agent.name}: ${agent.capabilities.join(", ")}`;
    });
  }

  prompt += `\n\nFuture student message: ${text}

Respond helpfully, concisely, and warmly as Bud. You are their trusted companion — before, during, and after university. Naturally incorporate the relevant pre-university features without ever mentioning agents, routing, or technical details. If they need help across multiple areas, address all of them holistically. Use simple, natural English. Be supportive, calm, encouraging, and human. Make them feel excited about their university journey. Use emojis very sparingly.`;

  return prompt;
}