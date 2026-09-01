import {
  Briefcase, GraduationCap, Building2, HeartHandshake, FlaskConical,
  Code2, Trophy, Rocket, Users, Calendar, MapPin, Clock, DollarSign,
  Bookmark, CheckCircle2, ExternalLink, Award, BookOpen, FileText,
  Microscope, Beaker, PenTool, Camera, Video, FileCode, BadgeCheck,
  Globe, Building, Landmark, Heart, Sparkles, Star,
} from "lucide-react";

export const CAREER_TYPES = {
  internship: { label: "Internship", icon: Briefcase, color: "text-info", bg: "bg-info/10" },
  graduate_job: { label: "Graduate Job", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  campus_job: { label: "Campus Job", icon: Building2, color: "text-success", bg: "bg-success/10" },
  volunteer: { label: "Volunteer", icon: HeartHandshake, color: "text-error", bg: "bg-error/10" },
  research_assistant: { label: "Research Assistant", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10" },
  industrial_training: { label: "Industrial Training", icon: Building2, color: "text-warning", bg: "bg-warning/10" },
  freelance: { label: "Freelance", icon: Code2, color: "text-info", bg: "bg-info/10" },
  competition: { label: "Competition", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
  startup: { label: "Startup", icon: Rocket, color: "text-warning", bg: "bg-warning/10" },
  career_fair: { label: "Career Fair", icon: Users, color: "text-success", bg: "bg-success/10" },
};

export const SCHOLARSHIP_TYPES = {
  university: { label: "University", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  government: { label: "Government", icon: Landmark, color: "text-info", bg: "bg-info/10" },
  ngo: { label: "NGO", icon: Heart, color: "text-success", bg: "bg-success/10" },
  international: { label: "International", icon: Globe, color: "text-purple", bg: "bg-purple/10" },
  research_grant: { label: "Research Grant", icon: FlaskConical, color: "text-warning", bg: "bg-warning/10" },
  travel_grant: { label: "Travel Grant", icon: MapPin, color: "text-info", bg: "bg-info/10" },
  innovation_grant: { label: "Innovation Grant", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  merit: { label: "Merit", icon: Award, color: "text-primary", bg: "bg-primary/10" },
  need_based: { label: "Need-Based", icon: HeartHandshake, color: "text-error", bg: "bg-error/10" },
  athletic: { label: "Athletic", icon: Trophy, color: "text-success", bg: "bg-success/10" },
  departmental: { label: "Departmental", icon: BookOpen, color: "text-info", bg: "bg-info/10" },
};

export const RESEARCH_TYPES = {
  research_group: { label: "Research Group", icon: Users, color: "text-primary", bg: "bg-primary/10" },
  publication: { label: "Publication", icon: FileText, color: "text-info", bg: "bg-info/10" },
  project: { label: "Project", icon: Beaker, color: "text-purple", bg: "bg-purple/10" },
  collaboration: { label: "Collaboration", icon: HeartHandshake, color: "text-success", bg: "bg-success/10" },
  laboratory: { label: "Laboratory", icon: Microscope, color: "text-warning", bg: "bg-warning/10" },
  funding: { label: "Funding", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  event: { label: "Event", icon: Calendar, color: "text-info", bg: "bg-info/10" },
  competition: { label: "Competition", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
  thesis: { label: "Thesis", icon: BookOpen, color: "text-purple", bg: "bg-purple/10" },
  dissertation: { label: "Dissertation", icon: GraduationCap, color: "text-info", bg: "bg-info/10" },
};

export const COMPANY_TYPES = {
  tech: { label: "Technology", icon: Code2, color: "text-info", bg: "bg-info/10" },
  finance: { label: "Finance", icon: DollarSign, color: "text-success", bg: "bg-success/10" },
  healthcare: { label: "Healthcare", icon: Heart, color: "text-error", bg: "bg-error/10" },
  education: { label: "Education", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  manufacturing: { label: "Manufacturing", icon: Building, color: "text-warning", bg: "bg-warning/10" },
  consulting: { label: "Consulting", icon: Briefcase, color: "text-purple", bg: "bg-purple/10" },
  media: { label: "Media", icon: Video, color: "text-info", bg: "bg-info/10" },
  telecommunications: { label: "Telecom", icon: Globe, color: "text-primary", bg: "bg-primary/10" },
  agriculture: { label: "Agriculture", icon: Beaker, color: "text-success", bg: "bg-success/10" },
  energy: { label: "Energy", icon: Sparkles, color: "text-warning", bg: "bg-warning/10" },
  government: { label: "Government", icon: Landmark, color: "text-info", bg: "bg-info/10" },
  ngo: { label: "NGO", icon: Heart, color: "text-error", bg: "bg-error/10" },
  startup: { label: "Startup", icon: Rocket, color: "text-primary", bg: "bg-primary/10" },
  research_lab: { label: "Research Lab", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10" },
  university: { label: "University", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  other: { label: "Other", icon: Building2, color: "text-muted-foreground", bg: "bg-muted" },
};

export const PORTFOLIO_TYPES = {
  project: { label: "Project", icon: Beaker, color: "text-primary", bg: "bg-primary/10" },
  research: { label: "Research", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10" },
  design: { label: "Design", icon: PenTool, color: "text-info", bg: "bg-info/10" },
  programming: { label: "Programming", icon: FileCode, color: "text-success", bg: "bg-success/10" },
  photography: { label: "Photography", icon: Camera, color: "text-warning", bg: "bg-warning/10" },
  writing: { label: "Writing", icon: FileText, color: "text-info", bg: "bg-info/10" },
  video: { label: "Video", icon: Video, color: "text-error", bg: "bg-error/10" },
  document: { label: "Document", icon: FileText, color: "text-muted-foreground", bg: "bg-muted" },
  certificate: { label: "Certificate", icon: Award, color: "text-primary", bg: "bg-primary/10" },
  achievement: { label: "Achievement", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
  presentation: { label: "Presentation", icon: Users, color: "text-info", bg: "bg-info/10" },
  other: { label: "Other", icon: Sparkles, color: "text-muted-foreground", bg: "bg-muted" },
};

export const COMPANY_SIZES = {
  startup: "Startup (1-10)",
  small: "Small (11-50)",
  medium: "Medium (51-200)",
  large: "Large (201-1000)",
  enterprise: "Enterprise (1000+)",
};

export function getIcon(iconName) {
  const icons = {
    Briefcase, GraduationCap, Building2, HeartHandshake, FlaskConical,
    Code2, Trophy, Rocket, Users, Calendar, MapPin, Clock, DollarSign,
    Bookmark, CheckCircle2, ExternalLink, Award, BookOpen, FileText,
    Microscope, Beaker, PenTool, Camera, Video, FileCode, BadgeCheck,
    Globe, Building, Landmark, Heart, Sparkles, Star,
  };
  return icons[iconName] || Sparkles;
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Closed";
  if (diffDays === 0) return "Closes today";
  if (diffDays === 1) return "Closes tomorrow";
  if (diffDays <= 7) return `${diffDays} days left`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
}

export function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}