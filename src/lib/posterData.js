/**
 * UNIBUD Master Poster Data
 *
 * Complete platform definition for the three master architecture posters.
 * Poster 1 — Platform Architecture (technical layer)
 * Poster 2 — User Experience (everything users see)
 * Poster 3 — Ecosystem (everything connected)
 */

import {
  GraduationCap, BookOpen, Building2, Compass, Users, Baby,
  Trophy, Sparkles, MessageSquare, Mic, Camera, PenTool,
  CalendarCheck, FileText, ScanText, FlaskConical, Code2,
  Layers, Brain, Home, ShoppingBag, Bus, UtensilsCrossed,
  CalendarHeart, Briefcase, Award, Library, CalendarClock,
  ClipboardList, DollarSign, UserCog, FlaskConical as Flask,
  BarChart3, CheckSquare, Globe, MapPin, CreditCard,
  Mail, Cloud, Plug, Smartphone, UserPlus, GraduationCap as Grad,
  Package, Users as UsersIcon, Trophy as TrophyIcon, Handshake,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// OPERATING SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════
export const OPERATING_SYSTEMS = [
  {
    id: "student_os",
    name: "Student OS",
    codename: "Student",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/10",
    tagline: "The complete student lifecycle",
    description: "From first day to graduation — courses, assignments, exams, GPA, library, timetable, campus life, social, career, and Bud.",
    modules: ["Campus", "Quad", "Connect", "Study Circle", "Library", "Timetable", "Exams", "GPA", "Marketplace", "Housing", "Transport", "Food", "Clubs", "Events", "Career", "Scholarships", "Bud"],
    route: "/",
  },
  {
    id: "lecturer_os",
    name: "Lecturer OS",
    codename: "Lecturer",
    icon: BookOpen,
    color: "text-info",
    bg: "bg-info/10",
    tagline: "Teaching, grading, and student insights",
    description: "Course management, live classes, attendance, assignment grading, lecture recordings, student analytics, and office hours.",
    modules: ["Courses", "Live Classes", "Attendance", "Assignments", "Grading", "Recordings", "Materials", "Student Insights", "Office Hours", "Announcements"],
    route: "/portal",
  },
  {
    id: "institution_os",
    name: "Institution OS",
    codename: "Institution",
    icon: Building2,
    color: "text-purple",
    bg: "bg-purple/10",
    tagline: "University administration and governance",
    description: "Faculties, departments, programmes, admissions, finance, staff, library, research, analytics, approvals, and institution configuration.",
    modules: ["Faculties", "Departments", "Programmes", "Admissions", "Finance", "Staff", "Library", "Research", "Analytics", "Approvals"],
    route: "/portal",
  },
  {
    id: "pre_university_os",
    name: "Pre-University OS",
    codename: "Future",
    icon: Compass,
    color: "text-success",
    bg: "bg-success/10",
    tagline: "From discovery to enrollment",
    description: "University exploration, application tracking, exam preparation, admission guidance, readiness assessment, and seamless transition to student.",
    modules: ["University Discovery", "Application Tracker", "Exam Prep", "Admission Guidance", "Readiness Score", "Campus Preview", "Bud Mentor"],
    route: "/future-student-onboarding",
  },
  {
    id: "parent_experience",
    name: "Parent Experience",
    codename: "Parent",
    icon: Users,
    color: "text-warning",
    bg: "bg-warning/10",
    tagline: "Stay connected to your child's journey",
    description: "Academic progress visibility, fee payments, attendance monitoring, event participation, and direct communication with institution.",
    modules: ["Academic Progress", "Fee Payment", "Attendance", "Events", "Messaging", "Notifications", "Grades"],
    route: "/",
  },
  {
    id: "alumni_experience",
    name: "Alumni Experience",
    codename: "Alumni",
    icon: Trophy,
    color: "text-error",
    bg: "bg-error/10",
    tagline: "Lifelong connection after graduation",
    description: "Alumni network, mentorship opportunities, career advancement, events, giving back, and continued access to campus resources.",
    modules: ["Alumni Network", "Mentorship", "Career Hub", "Events", "Giving Back", "Campus Access", "Networking"],
    route: "/",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// BUD CAPABILITIES
// ═══════════════════════════════════════════════════════════════════════════
export const BUD_CAPABILITIES = [
  { name: "Chat", icon: MessageSquare, color: "text-primary", bg: "bg-primary/10", description: "Conversational guidance across every topic" },
  { name: "Voice", icon: Mic, color: "text-info", bg: "bg-info/10", description: "Natural voice interactions and TTS" },
  { name: "Camera", icon: Camera, color: "text-purple", bg: "bg-purple/10", description: "Visual understanding and photo analysis" },
  { name: "Whiteboard", icon: PenTool, color: "text-success", bg: "bg-success/10", description: "Interactive visual explanations" },
  { name: "Study Planner", icon: CalendarCheck, color: "text-warning", bg: "bg-warning/10", description: "Personalized study schedules" },
  { name: "PDF", icon: FileText, color: "text-info", bg: "bg-info/10", description: "Document reading and summarization" },
  { name: "OCR", icon: ScanText, color: "text-error", bg: "bg-error/10", description: "Extract text from images and handwriting" },
  { name: "Research", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10", description: "Academic research assistance" },
  { name: "Coding", icon: Code2, color: "text-success", bg: "bg-success/10", description: "Programming help and code review" },
  { name: "Flashcards", icon: Layers, color: "text-primary", bg: "bg-primary/10", description: "Auto-generated study flashcards" },
  { name: "Memory", icon: Brain, color: "text-warning", bg: "bg-warning/10", description: "Persistent context across conversations" },
];

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT EXPERIENCE MODULES
// ═══════════════════════════════════════════════════════════════════════════
export const STUDENT_EXPERIENCE = [
  { name: "Campus", icon: Home, color: "text-primary", bg: "bg-primary/10", description: "Academic command center — dashboard, schedule, announcements" },
  { name: "Quad", icon: MessageSquare, color: "text-info", bg: "bg-info/10", description: "Campus social feed — posts, stories, polls, trends" },
  { name: "Connect", icon: Users, color: "text-success", bg: "bg-success/10", description: "People, groups, opportunities, networking" },
  { name: "Study Circle", icon: Users, color: "text-purple", bg: "bg-purple/10", description: "Study partners, accountability, project teams" },
  { name: "Library", icon: Library, color: "text-info", bg: "bg-info/10", description: "Books, journals, past questions, digital resources" },
  { name: "Timetable", icon: CalendarClock, color: "text-warning", bg: "bg-warning/10", description: "Class schedules, calendar sync, reminders" },
  { name: "Exams", icon: ClipboardList, color: "text-error", bg: "bg-error/10", description: "Exam schedules, revision tracking, results" },
  { name: "GPA", icon: BarChart3, color: "text-primary", bg: "bg-primary/10", description: "Grade tracking, CGPA projection, analytics" },
  { name: "Marketplace", icon: ShoppingBag, color: "text-warning", bg: "bg-warning/10", description: "Buy, sell, trade — campus marketplace" },
  { name: "Housing", icon: Home, color: "text-success", bg: "bg-success/10", description: "Accommodation listings, hostel portal" },
  { name: "Transport", icon: Bus, color: "text-info", bg: "bg-info/10", description: "Shuttle schedules, ride sharing, commute" },
  { name: "Food", icon: UtensilsCrossed, color: "text-warning", bg: "bg-warning/10", description: "Campus dining, meal plans, food delivery" },
  { name: "Clubs", icon: Users, color: "text-purple", bg: "bg-purple/10", description: "Student organizations, societies, associations" },
  { name: "Events", icon: CalendarHeart, color: "text-primary", bg: "bg-primary/10", description: "Campus events, workshops, career fairs" },
  { name: "Career", icon: Briefcase, color: "text-info", bg: "bg-info/10", description: "Jobs, internships, CV builder, interviews" },
  { name: "Scholarships", icon: Award, color: "text-success", bg: "bg-success/10", description: "Discovery, eligibility, applications" },
  { name: "Bud", icon: Sparkles, color: "text-primary", bg: "bg-primary/10", description: "AI companion — always with you" },
];

// ═══════════════════════════════════════════════════════════════════════════
// INSTITUTION EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════
export const INSTITUTION_EXPERIENCE = [
  { name: "Faculties", icon: Building2, color: "text-purple", bg: "bg-purple/10", description: "Faculty management and structure" },
  { name: "Departments", icon: Layers, color: "text-info", bg: "bg-info/10", description: "Department organization and programmes" },
  { name: "Programmes", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10", description: "Academic programme management" },
  { name: "Admissions", icon: ClipboardList, color: "text-info", bg: "bg-info/10", description: "Application processing and admission workflow" },
  { name: "Finance", icon: DollarSign, color: "text-success", bg: "bg-success/10", description: "Revenue, billing, fees, financial oversight" },
  { name: "Staff", icon: UserCog, color: "text-warning", bg: "bg-warning/10", description: "Lecturer and staff management" },
  { name: "Library", icon: Library, color: "text-info", bg: "bg-info/10", description: "Institution library and resource management" },
  { name: "Research", icon: Flask, color: "text-purple", bg: "bg-purple/10", description: "Research projects, publications, funding" },
  { name: "Analytics", icon: BarChart3, color: "text-info", bg: "bg-info/10", description: "Institution-wide analytics and insights" },
  { name: "Approvals", icon: CheckSquare, color: "text-error", bg: "bg-error/10", description: "Approval queues and workflow management" },
];

// ═══════════════════════════════════════════════════════════════════════════
// ORACLE KNOWLEDGE NETWORK
// ═══════════════════════════════════════════════════════════════════════════
export const KNOWLEDGE_NETWORK = [
  { name: "Countries", icon: Globe, count: "195+", color: "text-primary", bg: "bg-primary/10", description: "Global education standards per country" },
  { name: "Universities", icon: Building2, count: "10K+", color: "text-purple", bg: "bg-purple/10", description: "Indexed institutions worldwide" },
  { name: "Courses", icon: BookOpen, count: "300K+", color: "text-info", bg: "bg-info/10", description: "Course catalog across institutions" },
  { name: "Lecturers", icon: UserCog, count: "500K+", color: "text-warning", bg: "bg-warning/10", description: "Verified faculty profiles" },
  { name: "Scholarships", icon: Award, count: "1M+", color: "text-success", bg: "bg-success/10", description: "Global scholarship opportunities" },
  { name: "Jobs", icon: Briefcase, count: "50K+", color: "text-info", bg: "bg-info/10", description: "Internships and career opportunities" },
  { name: "Research", icon: FlaskConical, count: "100K+", color: "text-purple", bg: "bg-purple/10", description: "Publications and projects" },
  { name: "Libraries", icon: Library, count: "5K+", color: "text-info", bg: "bg-info/10", description: "Digital and physical library resources" },
  { name: "Marketplace", icon: ShoppingBag, count: "Live", color: "text-warning", bg: "bg-warning/10", description: "Campus marketplace across institutions" },
];

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════════════
export const INTEGRATIONS = [
  { name: "Google", icon: Globe, category: "Productivity", color: "text-info", description: "Workspace, Calendar, Drive, Gmail" },
  { name: "Apple", icon: Smartphone, category: "Platform", color: "text-foreground", description: "iOS, Sign in with Apple, Apple Wallet" },
  { name: "Microsoft", icon: Globe, category: "Productivity", color: "text-info", description: "Office 365, Teams, OneDrive" },
  { name: "WhatsApp", icon: MessageSquare, category: "Communication", color: "text-success", description: "WhatsApp Business API for notifications" },
  { name: "Gmail", icon: Mail, category: "Communication", color: "text-error", description: "Email delivery and OAuth" },
  { name: "Maps", icon: MapPin, category: "Navigation", color: "text-warning", description: "Campus maps and location services" },
  { name: "Stripe", icon: CreditCard, category: "Payments", color: "text-purple", description: "Global payment processing" },
  { name: "Flutterwave", icon: CreditCard, category: "Payments", color: "text-warning", description: "African payment processing" },
  { name: "Paystack", icon: CreditCard, category: "Payments", color: "text-info", description: "Nigerian payment processing" },
  { name: "Calendar", icon: CalendarClock, category: "Productivity", color: "text-primary", description: "Google Calendar sync" },
  { name: "Cloud Storage", icon: Cloud, category: "Infrastructure", color: "text-info", description: "File storage and CDN" },
  { name: "LMS Providers", icon: Plug, category: "Education", color: "text-success", description: "Learning Management System integration" },
];

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN FLOWS / USER JOURNEYS
// ═══════════════════════════════════════════════════════════════════════════
export const SCREEN_FLOWS = [
  {
    id: "signup",
    name: "Sign Up",
    icon: UserPlus,
    color: "text-primary",
    steps: ["Splash", "Welcome", "Language", "Create Account", "Verify OTP", "Create PIN", "Biometric", "Home"],
  },
  {
    id: "admissions",
    name: "Admissions",
    icon: ClipboardList,
    color: "text-info",
    steps: ["Explore Universities", "Check Requirements", "Apply", "Track Application", "Receive Offer", "Accept", "Enroll", "Verify Identity"],
  },
  {
    id: "student_journey",
    name: "Student Journey",
    icon: GraduationCap,
    color: "text-success",
    steps: ["Onboarding", "First Day", "Attend Classes", "Assignments", "Exams", "Results", "Next Semester", "Graduation"],
  },
  {
    id: "lecturer_journey",
    name: "Lecturer Journey",
    icon: BookOpen,
    color: "text-purple",
    steps: ["Onboarding", "Course Setup", "Upload Materials", "Live Classes", "Grade Assignments", "Track Attendance", "Post Results", "End Semester"],
  },
  {
    id: "institution_journey",
    name: "Institution Journey",
    icon: Building2,
    color: "text-warning",
    steps: ["Outreach", "Onboarding", "Configure Structure", "Import Data", "Verify Staff", "Go Live", "Monitor", "Optimize"],
  },
  {
    id: "marketplace",
    name: "Marketplace Purchase",
    icon: ShoppingBag,
    color: "text-warning",
    steps: ["Browse", "Search", "View Item", "Chat Seller", "Negotiate", "Pay", "Arrange Delivery", "Review"],
  },
  {
    id: "study_circle",
    name: "Study Circle",
    icon: Users,
    color: "text-info",
    steps: ["Find Partners", "Create Group", "Set Goals", "Study Together", "Share Notes", "Track Progress", "Celebrate", "Maintain Streak"],
  },
  {
    id: "graduation",
    name: "Graduation",
    icon: Trophy,
    color: "text-error",
    steps: ["Final Exams", "Clear Results", "Apply for Graduation", "Convocation", "Receive Certificate", "Alumni Transition", "Update Profile", "Stay Connected"],
  },
  {
    id: "alumni",
    name: "Alumni",
    icon: Handshake,
    color: "text-primary",
    steps: ["Graduate", "Join Alumni Network", "Update Profile", "Find Mentees", "Attend Events", "Give Back", "Network", "Mentor"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ORACLE INTELLIGENCE FLOW
// ═══════════════════════════════════════════════════════════════════════════
export const ORACLE_INTELLIGENCE_FLOW = [
  { step: 1, name: "Student", icon: GraduationCap, color: "text-primary", description: "Student asks Bud a question" },
  { step: 2, name: "Bud", icon: Sparkles, color: "text-primary", description: "Bud receives and understands the request" },
  { step: 3, name: "Oracle", icon: Brain, color: "text-primary", description: "Oracle routes to the right specialist system" },
  { step: 4, name: "Learning Studio", icon: BookOpen, color: "text-info", description: "Academic intelligence processes the request" },
  { step: 5, name: "Campus Central", icon: Building2, color: "text-warning", description: "Institution context enriches the response" },
  { step: 6, name: "Community Circle", icon: Users, color: "text-info", description: "Social and community context added" },
  { step: 7, name: "Results", icon: Trophy, color: "text-success", description: "Bud delivers a complete, contextual answer" },
];