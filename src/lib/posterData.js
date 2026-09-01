/**
 * UNIBUD Master Poster Data — exact platform definition
 * No fake records. No placeholder stats.
 * Structure follows the four master posters exactly.
 */

import {
  Crown, Brain, Layers, Plug, Settings, Database, Server, Cloud, ShieldCheck,
  MousePointerClick, Workflow, MessageSquare, Bell, Search, Zap, Image,
  FileText, BarChart3, Palette, Code2, Fingerprint, Flag, Activity, HardDrive,
  Home, Users, Library, CalendarClock, ClipboardList, ShoppingBag, Bus,
  Briefcase, CalendarHeart, Award, MessageCircle,
  LayoutDashboard, BookOpen, CheckCircle2, ClipboardCheck, FlaskConical,
  Video, GraduationCap, Building2, DollarSign, UserCog, Compass, TrendingUp,
  Globe, MapPin, Trophy, Store, Handshake,
  Smartphone, Mail, CreditCard, Github, Linkedin, Monitor,
  Camera, Mic, ScanText, PenTool, CalendarCheck, Sparkles,
  UserPlus, Rocket, ArrowRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// POSTER 1 — PLATFORM BLUEPRINT
// ═══════════════════════════════════════════════════════════════════════════

export const ORACLE_SYSTEMS = [
  { name: "Learning Studio", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { name: "Campus Central", icon: Building2, color: "text-warning", bg: "bg-warning/10" },
  { name: "Community Circle", icon: Users, color: "text-info", bg: "bg-info/10" },
  { name: "Trust Shield", icon: ShieldCheck, color: "text-error", bg: "bg-error/10" },
  { name: "Architect", icon: Layers, color: "text-purple", bg: "bg-purple/10" },
];

export const PLATFORM_ENGINES = [
  { name: "Interaction", icon: MousePointerClick, color: "text-primary", bg: "bg-primary/10" },
  { name: "Workflow", icon: Workflow, color: "text-info", bg: "bg-info/10" },
  { name: "Communication", icon: MessageSquare, color: "text-success", bg: "bg-success/10" },
  { name: "Notifications", icon: Bell, color: "text-warning", bg: "bg-warning/10" },
  { name: "Search", icon: Search, color: "text-primary", bg: "bg-primary/10" },
  { name: "Automation", icon: Zap, color: "text-warning", bg: "bg-warning/10" },
  { name: "Intelligence", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
  { name: "Identity", icon: Fingerprint, color: "text-error", bg: "bg-error/10" },
  { name: "Media", icon: Image, color: "text-purple", bg: "bg-purple/10" },
  { name: "Forms", icon: FileText, color: "text-info", bg: "bg-info/10" },
  { name: "Reporting", icon: BarChart3, color: "text-success", bg: "bg-success/10" },
  { name: "Rendering", icon: Palette, color: "text-purple", bg: "bg-purple/10" },
  { name: "Code Execution", icon: Code2, color: "text-success", bg: "bg-success/10" },
];

export const PLATFORM_SERVICES = [
  { name: "Integration Bridge", icon: Plug, color: "text-info", bg: "bg-info/10" },
  { name: "Operations Center", icon: Settings, color: "text-error", bg: "bg-error/10" },
];

export const INFRASTRUCTURE = [
  { name: "PostgreSQL", icon: Database, color: "text-info", bg: "bg-info/10" },
  { name: "APIs", icon: Server, color: "text-success", bg: "bg-success/10" },
  { name: "Storage", icon: HardDrive, color: "text-warning", bg: "bg-warning/10" },
  { name: "Security", icon: ShieldCheck, color: "text-error", bg: "bg-error/10" },
  { name: "Analytics", icon: BarChart3, color: "text-info", bg: "bg-info/10" },
  { name: "Feature Flags", icon: Flag, color: "text-primary", bg: "bg-primary/10" },
  { name: "Monitoring", icon: Activity, color: "text-success", bg: "bg-success/10" },
  { name: "Cloud", icon: Cloud, color: "text-purple", bg: "bg-purple/10" },
];

// ═══════════════════════════════════════════════════════════════════════════
// POSTER 2 — THE UNIBUD EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════

export const STUDENT_OS = [
  { name: "Campus", icon: LayoutDashboard, color: "text-primary", bg: "bg-primary/10" },
  { name: "Quad", icon: MessageSquare, color: "text-info", bg: "bg-info/10" },
  { name: "Connect", icon: Users, color: "text-success", bg: "bg-success/10" },
  { name: "Study Circle", icon: BookOpen, color: "text-purple", bg: "bg-purple/10" },
  { name: "Library", icon: Library, color: "text-info", bg: "bg-info/10" },
  { name: "Timetable", icon: CalendarClock, color: "text-warning", bg: "bg-warning/10" },
  { name: "GPA", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  { name: "Exams", icon: ClipboardList, color: "text-error", bg: "bg-error/10" },
  { name: "Marketplace", icon: ShoppingBag, color: "text-warning", bg: "bg-warning/10" },
  { name: "Housing", icon: Home, color: "text-success", bg: "bg-success/10" },
  { name: "Transport", icon: Bus, color: "text-info", bg: "bg-info/10" },
  { name: "Jobs", icon: Briefcase, color: "text-info", bg: "bg-info/10" },
  { name: "Events", icon: CalendarHeart, color: "text-primary", bg: "bg-primary/10" },
  { name: "Scholarships", icon: Award, color: "text-success", bg: "bg-success/10" },
  { name: "Bud Chat", icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
];

export const LECTURER_OS = [
  { name: "Dashboard", icon: LayoutDashboard, color: "text-info", bg: "bg-info/10" },
  { name: "Courses", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { name: "Attendance", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  { name: "Grading", icon: ClipboardCheck, color: "text-warning", bg: "bg-warning/10" },
  { name: "Research", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10" },
  { name: "Live Classes", icon: Video, color: "text-error", bg: "bg-error/10" },
  { name: "Analytics", icon: BarChart3, color: "text-info", bg: "bg-info/10" },
];

export const INSTITUTION_OS = [
  { name: "Faculties", icon: Building2, color: "text-purple", bg: "bg-purple/10" },
  { name: "Departments", icon: Layers, color: "text-info", bg: "bg-info/10" },
  { name: "Admissions", icon: ClipboardList, color: "text-info", bg: "bg-info/10" },
  { name: "Finance", icon: DollarSign, color: "text-success", bg: "bg-success/10" },
  { name: "Staff", icon: UserCog, color: "text-warning", bg: "bg-warning/10" },
  { name: "Research", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10" },
  { name: "Library", icon: Library, color: "text-info", bg: "bg-info/10" },
  { name: "Analytics", icon: BarChart3, color: "text-info", bg: "bg-info/10" },
];

export const PRE_UNIVERSITY = [
  { name: "WAEC", icon: FileText, color: "text-info", bg: "bg-info/10" },
  { name: "NECO", icon: FileText, color: "text-info", bg: "bg-info/10" },
  { name: "JAMB", icon: FileText, color: "text-info", bg: "bg-info/10" },
  { name: "SAT", icon: FileText, color: "text-info", bg: "bg-info/10" },
  { name: "Career Guidance", icon: Compass, color: "text-success", bg: "bg-success/10" },
  { name: "University Finder", icon: Search, color: "text-primary", bg: "bg-primary/10" },
  { name: "Course Finder", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
];

export const BUD_INTERACTIONS = [
  { name: "Chat", icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
  { name: "Voice", icon: Mic, color: "text-info", bg: "bg-info/10" },
  { name: "Camera", icon: Camera, color: "text-purple", bg: "bg-purple/10" },
  { name: "PDF", icon: FileText, color: "text-info", bg: "bg-info/10" },
  { name: "OCR", icon: ScanText, color: "text-error", bg: "bg-error/10" },
  { name: "Whiteboard", icon: PenTool, color: "text-success", bg: "bg-success/10" },
  { name: "Flashcards", icon: Layers, color: "text-primary", bg: "bg-primary/10" },
  { name: "Study Planner", icon: CalendarCheck, color: "text-warning", bg: "bg-warning/10" },
];

// ═══════════════════════════════════════════════════════════════════════════
// POSTER 3 — GLOBAL EDUCATION ECOSYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export const ECOSYSTEM_HIERARCHY = [
  { name: "Countries", icon: Globe, color: "text-primary", bg: "bg-primary/10" },
  { name: "Universities", icon: Building2, color: "text-purple", bg: "bg-purple/10" },
  { name: "Campuses", icon: MapPin, color: "text-info", bg: "bg-info/10" },
  { name: "Faculties", icon: Building2, color: "text-warning", bg: "bg-warning/10" },
  { name: "Departments", icon: Layers, color: "text-info", bg: "bg-info/10" },
  { name: "Courses", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { name: "Lecturers", icon: UserCog, color: "text-warning", bg: "bg-warning/10" },
  { name: "Students", icon: GraduationCap, color: "text-success", bg: "bg-success/10" },
  { name: "Researchers", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10" },
  { name: "Alumni", icon: Trophy, color: "text-error", bg: "bg-error/10" },
];

export const ECOSYSTEM_CONNECTED = [
  { name: "Scholarships", icon: Award, color: "text-success", bg: "bg-success/10" },
  { name: "Housing", icon: Home, color: "text-success", bg: "bg-success/10" },
  { name: "Marketplace", icon: ShoppingBag, color: "text-warning", bg: "bg-warning/10" },
  { name: "Jobs", icon: Briefcase, color: "text-info", bg: "bg-info/10" },
  { name: "Libraries", icon: Library, color: "text-info", bg: "bg-info/10" },
  { name: "Research", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10" },
  { name: "Publications", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { name: "Transport", icon: Bus, color: "text-info", bg: "bg-info/10" },
  { name: "Student Businesses", icon: Store, color: "text-warning", bg: "bg-warning/10" },
  { name: "Clubs", icon: Users, color: "text-purple", bg: "bg-purple/10" },
  { name: "Communities", icon: Users, color: "text-info", bg: "bg-info/10" },
  { name: "Events", icon: CalendarHeart, color: "text-primary", bg: "bg-primary/10" },
  { name: "Partners", icon: Handshake, color: "text-success", bg: "bg-success/10" },
];

export const ECOSYSTEM_INTEGRATIONS = [
  { name: "Google", icon: Globe, category: "Productivity", color: "text-info", bg: "bg-info/10" },
  { name: "Apple", icon: Smartphone, category: "Platform", color: "text-foreground", bg: "bg-muted/40" },
  { name: "Microsoft", icon: Monitor, category: "Productivity", color: "text-info", bg: "bg-info/10" },
  { name: "GitHub", icon: Github, category: "Development", color: "text-foreground", bg: "bg-muted/40" },
  { name: "LinkedIn", icon: Linkedin, category: "Social", color: "text-info", bg: "bg-info/10" },
  { name: "Gmail", icon: Mail, category: "Communication", color: "text-error", bg: "bg-error/10" },
  { name: "WhatsApp Business", icon: MessageSquare, category: "Communication", color: "text-success", bg: "bg-success/10" },
  { name: "Google Maps", icon: MapPin, category: "Navigation", color: "text-warning", bg: "bg-warning/10" },
  { name: "Apple Maps", icon: MapPin, category: "Navigation", color: "text-foreground", bg: "bg-muted/40" },
  { name: "Stripe", icon: CreditCard, category: "Payments", color: "text-purple", bg: "bg-purple/10" },
  { name: "Flutterwave", icon: CreditCard, category: "Payments", color: "text-warning", bg: "bg-warning/10" },
  { name: "Paystack", icon: CreditCard, category: "Payments", color: "text-info", bg: "bg-info/10" },
  { name: "Cloud Storage", icon: Cloud, category: "Infrastructure", color: "text-info", bg: "bg-info/10" },
  { name: "Learning Platforms", icon: GraduationCap, category: "Education", color: "text-success", bg: "bg-success/10" },
];

// ═══════════════════════════════════════════════════════════════════════════
// POSTER 4 — SCREEN & WORKFLOW MAP
// ═══════════════════════════════════════════════════════════════════════════

export const STUDENT_JOURNEY = [
  { name: "Splash", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  { name: "Welcome", icon: Handshake, color: "text-info", bg: "bg-info/10" },
  { name: "Login / Sign Up", icon: UserPlus, color: "text-success", bg: "bg-success/10" },
  { name: "Institution Search", icon: Search, color: "text-warning", bg: "bg-warning/10" },
  { name: "Verification", icon: ShieldCheck, color: "text-error", bg: "bg-error/10" },
  { name: "Student OS", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  { name: "Campus", icon: LayoutDashboard, color: "text-primary", bg: "bg-primary/10" },
  { name: "Study Circle", icon: Users, color: "text-info", bg: "bg-info/10" },
  { name: "Bud", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  { name: "Library", icon: Library, color: "text-info", bg: "bg-info/10" },
  { name: "Marketplace", icon: ShoppingBag, color: "text-warning", bg: "bg-warning/10" },
  { name: "Housing", icon: Home, color: "text-success", bg: "bg-success/10" },
  { name: "Graduation", icon: Trophy, color: "text-error", bg: "bg-error/10" },
  { name: "Alumni", icon: Handshake, color: "text-success", bg: "bg-success/10" },
];

export const LECTURER_JOURNEY = [
  { name: "Onboarding", icon: UserPlus, color: "text-info", bg: "bg-info/10" },
  { name: "Dashboard", icon: LayoutDashboard, color: "text-info", bg: "bg-info/10" },
  { name: "Courses", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { name: "Live Classes", icon: Video, color: "text-error", bg: "bg-error/10" },
  { name: "Grading", icon: ClipboardCheck, color: "text-warning", bg: "bg-warning/10" },
  { name: "Analytics", icon: BarChart3, color: "text-info", bg: "bg-info/10" },
];

export const INSTITUTION_ADMIN_JOURNEY = [
  { name: "Outreach", icon: Globe, color: "text-success", bg: "bg-success/10" },
  { name: "Onboarding", icon: UserPlus, color: "text-info", bg: "bg-info/10" },
  { name: "Configure", icon: Settings, color: "text-warning", bg: "bg-warning/10" },
  { name: "Import Staff", icon: UserCog, color: "text-purple", bg: "bg-purple/10" },
  { name: "Go Live", icon: Rocket, color: "text-primary", bg: "bg-primary/10" },
  { name: "Monitor", icon: Activity, color: "text-success", bg: "bg-success/10" },
];

export const APPLICANT_JOURNEY = [
  { name: "Explore", icon: Search, color: "text-primary", bg: "bg-primary/10" },
  { name: "Exam Prep", icon: ClipboardList, color: "text-info", bg: "bg-info/10" },
  { name: "Apply", icon: FileText, color: "text-warning", bg: "bg-warning/10" },
  { name: "Track", icon: Activity, color: "text-info", bg: "bg-info/10" },
  { name: "Admission", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  { name: "Transition", icon: ArrowRight, color: "text-primary", bg: "bg-primary/10" },
];

export const OPERATIONS_JOURNEY = [
  { name: "Founder", icon: Crown, color: "text-primary", bg: "bg-primary/10" },
  { name: "Architect", icon: Layers, color: "text-purple", bg: "bg-purple/10" },
  { name: "Management", icon: ClipboardCheck, color: "text-info", bg: "bg-info/10" },
  { name: "Operators", icon: Settings, color: "text-warning", bg: "bg-warning/10" },
];