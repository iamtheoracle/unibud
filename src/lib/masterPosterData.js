/**
 * UNIBUD Master Ecosystem Poster Data
 * Complete platform definition — no fake records.
 * Every section from the master poster specification.
 */

import {
  BookOpen, Building2, Building, Users, ShieldCheck, Layers, Plug, Settings,
  MousePointerClick, Workflow, MessageSquare, Bell, Search, Zap,
  Fingerprint, Component, FileText, Image as ImageIcon, BarChart3, Palette, Code2,
  TrendingUp, Lock, Settings2, Flag, Clock,
  GraduationCap, Compass, Trophy, Crown,
  LayoutDashboard, Library, CalendarClock, Calendar, ClipboardList, PenTool, FlaskConical,
  ShoppingBag, Home, Bus, UtensilsCrossed, CalendarHeart, Briefcase, Award,
  Store, MessageCircle, Phone, Video, User, Sparkles,
  Mic, Eye, ScanText, Languages, CalendarCheck, Accessibility, Brain, HeartHandshake,
  DollarSign, Monitor, Heart, CheckCircle2,
  ClipboardCheck, BadgeCheck, ScrollText, FileBarChart, SlidersHorizontal, Activity,
  HeartPulse,
  Megaphone, Radio, AlarmClock, ShieldAlert,
  Globe, MapPin, UserCog, Handshake,
  Github, Linkedin, Mail, Cloud, CreditCard, Smartphone,
  Layout, Clipboard,
  Database, Server, HardDrive, KeyRound, ListOrdered, Archive,
  LifeBuoy, GitBranch, Gauge,
  UserPlus,
} from "lucide-react";

const PALETTE = [
  { color: "text-primary", bg: "bg-primary/10" },
  { color: "text-info", bg: "bg-info/10" },
  { color: "text-success", bg: "bg-success/10" },
  { color: "text-purple", bg: "bg-purple/10" },
  { color: "text-warning", bg: "bg-warning/10" },
  { color: "text-error", bg: "bg-error/10" },
];

function mod(items) {
  return items.map((item, i) => ({ ...item, ...PALETTE[i % PALETTE.length] }));
}

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM ARCHITECTURE — Oracle Systems
// ═══════════════════════════════════════════════════════════════════════════
export const ORACLE_SYSTEMS = mod([
  { name: "Learning Studio", icon: BookOpen },
  { name: "Campus Central", icon: Building2 },
  { name: "Community Circle", icon: Users },
  { name: "Trust Shield", icon: ShieldCheck },
  { name: "Architect", icon: Layers },
  { name: "Integration Bridge", icon: Plug },
  { name: "Operations Center", icon: Settings },
]);

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM ENGINES — 17 interconnected engines
// ═══════════════════════════════════════════════════════════════════════════
export const PLATFORM_ENGINES = mod([
  { name: "Interaction Engine", icon: MousePointerClick },
  { name: "Workflow Engine", icon: Workflow },
  { name: "Communication Engine", icon: MessageSquare },
  { name: "Notification Engine", icon: Bell },
  { name: "Search Engine", icon: Search },
  { name: "Automation Engine", icon: Zap },
  { name: "Identity Engine", icon: Fingerprint },
  { name: "Component Engine", icon: Component },
  { name: "Forms Engine", icon: FileText },
  { name: "Media Engine", icon: ImageIcon },
  { name: "Reporting Engine", icon: BarChart3 },
  { name: "Rendering Engine", icon: Palette },
  { name: "Code Execution Engine", icon: Code2 },
  { name: "Analytics Engine", icon: TrendingUp },
  { name: "Permission Engine", icon: Lock },
  { name: "Configuration Engine", icon: Settings2 },
  { name: "Security Engine", icon: ShieldCheck },
]);

// ═══════════════════════════════════════════════════════════════════════════
// USER OPERATING SYSTEMS — 7 experiences
// ═══════════════════════════════════════════════════════════════════════════
export const USER_OPERATING_SYSTEMS = mod([
  { name: "Student OS", icon: GraduationCap },
  { name: "Lecturer OS", icon: BookOpen },
  { name: "Institution OS", icon: Building2 },
  { name: "Pre-University OS", icon: Compass },
  { name: "Alumni Experience", icon: Trophy },
  { name: "Founder / Operations", icon: Crown },
]);

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT EXPERIENCE — 27 modules
// ═══════════════════════════════════════════════════════════════════════════
export const STUDENT_EXPERIENCE = mod([
  { name: "Campus", icon: LayoutDashboard },
  { name: "Quad", icon: MessageSquare },
  { name: "Connect", icon: Users },
  { name: "Study Circle", icon: BookOpen },
  { name: "Library", icon: Library },
  { name: "Courses", icon: GraduationCap },
  { name: "Timetable", icon: CalendarClock },
  { name: "Assignments", icon: ClipboardList },
  { name: "GPA Dashboard", icon: TrendingUp },
  { name: "Flashcards", icon: Layers },
  { name: "Whiteboard", icon: PenTool },
  { name: "Research", icon: FlaskConical },
  { name: "Marketplace", icon: ShoppingBag },
  { name: "Housing", icon: Home },
  { name: "Transport", icon: Bus },
  { name: "Food", icon: UtensilsCrossed },
  { name: "Events", icon: CalendarHeart },
  { name: "Clubs", icon: Users },
  { name: "Careers", icon: Briefcase },
  { name: "Scholarships", icon: Award },
  { name: "Student Businesses", icon: Store },
  { name: "Messages", icon: MessageCircle },
  { name: "Voice Calls", icon: Phone },
  { name: "Video Calls", icon: Video },
  { name: "Notifications", icon: Bell },
  { name: "Profile", icon: User },
  { name: "Bud", icon: Sparkles },
]);

// ═══════════════════════════════════════════════════════════════════════════
// BUD AI CAPABILITIES — 17 capabilities
// ═══════════════════════════════════════════════════════════════════════════
export const BUD_CAPABILITIES = mod([
  { name: "Chat", icon: MessageSquare },
  { name: "Voice", icon: Mic },
  { name: "Vision", icon: Eye },
  { name: "OCR", icon: ScanText },
  { name: "PDF Analysis", icon: FileText },
  { name: "Coding Assistant", icon: Code2 },
  { name: "Study Planner", icon: CalendarCheck },
  { name: "Flashcards", icon: Layers },
  { name: "Translation", icon: Languages },
  { name: "Summaries", icon: FileText },
  { name: "Whiteboard", icon: PenTool },
  { name: "Research Assistant", icon: FlaskConical },
  { name: "Career Coach", icon: Briefcase },
  { name: "Memory", icon: Brain },
  { name: "Recommendations", icon: Sparkles },
  { name: "Accessibility", icon: Accessibility },
  { name: "Personal Assistance", icon: HeartHandshake },
]);

// ═══════════════════════════════════════════════════════════════════════════
// INSTITUTION EXPERIENCE — 17 modules
// ═══════════════════════════════════════════════════════════════════════════
export const INSTITUTION_EXPERIENCE = mod([
  { name: "Admissions", icon: ClipboardList },
  { name: "Faculties", icon: Building2 },
  { name: "Departments", icon: Layers },
  { name: "Programmes", icon: GraduationCap },
  { name: "Finance", icon: DollarSign },
  { name: "Human Resources", icon: Users },
  { name: "Library", icon: Library },
  { name: "ICT", icon: Monitor },
  { name: "Estates", icon: Building },
  { name: "Student Affairs", icon: Heart },
  { name: "Research", icon: FlaskConical },
  { name: "Quality Assurance", icon: CheckCircle2 },
  { name: "Procurement", icon: ShoppingBag },
  { name: "Security", icon: ShieldCheck },
  { name: "Alumni", icon: Trophy },
  { name: "Reports", icon: FileBarChart },
  { name: "Analytics", icon: BarChart3 },
]);

// ═══════════════════════════════════════════════════════════════════════════
// OPERATIONS CENTER — 16 modules
// ═══════════════════════════════════════════════════════════════════════════
export const OPERATIONS_CENTER = mod([
  { name: "Founder", icon: Crown },
  { name: "Architect", icon: Layers },
  { name: "Management", icon: ClipboardCheck },
  { name: "Operators", icon: Settings },
  { name: "Institution Admin", icon: Building2 },
  { name: "Monitoring", icon: Activity },
  { name: "Moderation", icon: Eye },
  { name: "Verification", icon: BadgeCheck },
  { name: "Security", icon: ShieldCheck },
  { name: "Audit Logs", icon: ScrollText },
  { name: "Reports", icon: FileBarChart },
  { name: "Analytics", icon: BarChart3 },
  { name: "Automation", icon: Zap },
  { name: "Feature Flags", icon: Flag },
  { name: "System Health", icon: HeartPulse },
  { name: "Platform Controls", icon: SlidersHorizontal },
]);

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNICATION FLOW — 8 channels through Bud
// ═══════════════════════════════════════════════════════════════════════════
export const COMMUNICATION_FLOW = mod([
  { name: "Real-time Messaging", icon: MessageCircle },
  { name: "Voice Calls", icon: Phone },
  { name: "Video Calls", icon: Video },
  { name: "Announcements", icon: Megaphone },
  { name: "Broadcasts", icon: Radio },
  { name: "Study Rooms", icon: Users },
  { name: "Notifications", icon: Bell },
  { name: "AI Conversations", icon: Sparkles },
]);

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION CENTER — 12 categories
// ═══════════════════════════════════════════════════════════════════════════
export const NOTIFICATION_CENTER = mod([
  { name: "Assignments", icon: ClipboardList },
  { name: "Deadlines", icon: AlarmClock },
  { name: "Scholarships", icon: Award },
  { name: "Grades", icon: TrendingUp },
  { name: "Approvals", icon: CheckCircle2 },
  { name: "Reminders", icon: Bell },
  { name: "Security Alerts", icon: ShieldAlert },
  { name: "Marketplace Updates", icon: ShoppingBag },
  { name: "Housing Requests", icon: Home },
  { name: "Transport Alerts", icon: Bus },
  { name: "Institution Announcements", icon: Megaphone },
  { name: "Bud Suggestions", icon: Sparkles },
]);

// ═══════════════════════════════════════════════════════════════════════════
// ORACLE KNOWLEDGE NETWORK — 19 nodes
// ═══════════════════════════════════════════════════════════════════════════
export const KNOWLEDGE_NETWORK = mod([
  { name: "Countries", icon: Globe },
  { name: "Universities", icon: Building2 },
  { name: "Campuses", icon: MapPin },
  { name: "Faculties", icon: Building2 },
  { name: "Departments", icon: Layers },
  { name: "Courses", icon: BookOpen },
  { name: "Lecturers", icon: UserCog },
  { name: "Students", icon: GraduationCap },
  { name: "Researchers", icon: FlaskConical },
  { name: "Libraries", icon: Library },
  { name: "Publications", icon: BookOpen },
  { name: "Scholarships", icon: Award },
  { name: "Jobs", icon: Briefcase },
  { name: "Marketplace", icon: ShoppingBag },
  { name: "Housing", icon: Home },
  { name: "Transport", icon: Bus },
  { name: "Communities", icon: Users },
  { name: "Alumni", icon: Trophy },
  { name: "Partners", icon: Handshake },
]);

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM INTEGRATIONS — 21 services
// ═══════════════════════════════════════════════════════════════════════════
export const PLATFORM_INTEGRATIONS = mod([
  { name: "Google", icon: Globe },
  { name: "Apple", icon: Smartphone },
  { name: "Microsoft", icon: Monitor },
  { name: "GitHub", icon: Github },
  { name: "LinkedIn", icon: Linkedin },
  { name: "Gmail", icon: Mail },
  { name: "Outlook", icon: Mail },
  { name: "WhatsApp Business", icon: MessageSquare },
  { name: "Google Maps", icon: MapPin },
  { name: "Apple Maps", icon: MapPin },
  { name: "Stripe", icon: CreditCard },
  { name: "Flutterwave", icon: CreditCard },
  { name: "Paystack", icon: CreditCard },
  { name: "Cloud Storage", icon: Cloud },
  { name: "Calendar", icon: Calendar },
  { name: "Zoom", icon: Video },
  { name: "Microsoft Teams", icon: Users },
  { name: "Moodle", icon: GraduationCap },
  { name: "Canvas", icon: Layout },
  { name: "Blackboard", icon: Clipboard },
  { name: "Institution APIs", icon: Plug },
]);

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM INFRASTRUCTURE — 18 components
// ═══════════════════════════════════════════════════════════════════════════
export const PLATFORM_INFRASTRUCTURE = mod([
  { name: "PostgreSQL", icon: Database },
  { name: "APIs", icon: Server },
  { name: "Secure Authentication", icon: Lock },
  { name: "Role-Based Access Control", icon: KeyRound },
  { name: "Feature Flags", icon: Flag },
  { name: "Search Indexing", icon: Search },
  { name: "Encryption", icon: ShieldCheck },
  { name: "Background Jobs", icon: Clock },
  { name: "Queues", icon: ListOrdered },
  { name: "Monitoring", icon: Activity },
  { name: "Analytics", icon: BarChart3 },
  { name: "Logging", icon: ScrollText },
  { name: "Storage", icon: HardDrive },
  { name: "Backups", icon: Archive },
  { name: "Disaster Recovery", icon: LifeBuoy },
  { name: "CI/CD", icon: GitBranch },
  { name: "Performance Optimization", icon: Gauge },
  { name: "Cloud Infrastructure", icon: Cloud },
]);

// ═══════════════════════════════════════════════════════════════════════════
// USER JOURNEY — 14 steps
// ═══════════════════════════════════════════════════════════════════════════
export const USER_JOURNEY = [
  { name: "Splash Screen", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  { name: "Welcome", icon: Handshake, color: "text-info", bg: "bg-info/10" },
  { name: "Sign Up", icon: UserPlus, color: "text-success", bg: "bg-success/10" },
  { name: "Institution Selection", icon: Search, color: "text-warning", bg: "bg-warning/10" },
  { name: "Verification", icon: ShieldCheck, color: "text-error", bg: "bg-error/10" },
  { name: "Student Dashboard", icon: LayoutDashboard, color: "text-primary", bg: "bg-primary/10" },
  { name: "Study Circle", icon: Users, color: "text-info", bg: "bg-info/10" },
  { name: "Bud Conversation", icon: MessageCircle, color: "text-success", bg: "bg-success/10" },
  { name: "Courses", icon: GraduationCap, color: "text-purple", bg: "bg-purple/10" },
  { name: "Assignments", icon: ClipboardList, color: "text-warning", bg: "bg-warning/10" },
  { name: "Marketplace", icon: ShoppingBag, color: "text-error", bg: "bg-error/10" },
  { name: "Housing", icon: Home, color: "text-primary", bg: "bg-primary/10" },
  { name: "Graduation", icon: Trophy, color: "text-warning", bg: "bg-warning/10" },
  { name: "Alumni", icon: Award, color: "text-success", bg: "bg-success/10" },
];