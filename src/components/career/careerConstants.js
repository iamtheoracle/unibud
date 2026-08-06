import {
  Briefcase, Trophy, GraduationCap, Globe, Award, Heart, Users, Code, FlaskConical, Building2,
  Presentation, FileText,
} from "lucide-react";

export const TYPE_META = {
  scholarship: { icon: GraduationCap, color: "success", label: "Scholarship" },
  internship: { icon: Briefcase, color: "information", label: "Internship" },
  job: { icon: Briefcase, color: "error", label: "Job" },
  graduate_job: { icon: Briefcase, color: "error", label: "Graduate Job" },
  campus_job: { icon: Building2, color: "warning", label: "Campus Job" },
  competition: { icon: Trophy, color: "gold", label: "Competition" },
  hackathon: { icon: Code, color: "gold", label: "Hackathon" },
  exchange: { icon: Globe, color: "information", label: "Exchange" },
  research: { icon: FlaskConical, color: "accent", label: "Research" },
  grant: { icon: Award, color: "success", label: "Grant" },
  fellowship: { icon: Award, color: "warning", label: "Fellowship" },
  volunteering: { icon: Heart, color: "success", label: "Volunteering" },
  mentorship: { icon: Users, color: "accent", label: "Mentorship" },
};

export const CATEGORIES = [
  { key: "all", label: "All", types: [] },
  { key: "internships", label: "Internships", types: ["internship"] },
  { key: "jobs", label: "Jobs", types: ["job", "graduate_job", "campus_job"] },
  { key: "scholarships", label: "Scholarships", types: ["scholarship", "grant", "fellowship"] },
  { key: "competitions", label: "Competitions", types: ["competition", "hackathon"] },
  { key: "volunteering", label: "Volunteering", types: ["volunteering"] },
  { key: "research", label: "Research", types: ["research"] },
];

export const CAREER_TYPES = {
  internship: { icon: Briefcase, label: "Internships", bg: "bg-information/10", color: "text-information" },
  graduate_job: { icon: Briefcase, label: "Graduate Jobs", bg: "bg-error/10", color: "text-error" },
  campus_job: { icon: Building2, label: "Campus Jobs", bg: "bg-warning/10", color: "text-warning" },
  research_assistant: { icon: FlaskConical, label: "Research", bg: "bg-accent/10", color: "text-accent" },
  industrial_training: { icon: Briefcase, label: "Industrial Training", bg: "bg-information/10", color: "text-information" },
  freelance: { icon: Briefcase, label: "Freelance", bg: "bg-accent/10", color: "text-accent" },
  startup: { icon: Briefcase, label: "Startup", bg: "bg-primary/10", color: "text-primary" },
  competition: { icon: Trophy, label: "Competitions", bg: "bg-gold/10", color: "text-gold" },
  volunteer: { icon: Heart, label: "Volunteering", bg: "bg-success/10", color: "text-success" },
  job: { icon: Briefcase, label: "Jobs", bg: "bg-error/10", color: "text-error" },
  hackathon: { icon: Code, label: "Hackathons", bg: "bg-gold/10", color: "text-gold" },
};

export const SCHOLARSHIP_TYPES = {
  merit: { icon: Award, label: "Merit", bg: "bg-success/10", color: "text-success" },
  need: { icon: Award, label: "Need-Based", bg: "bg-warning/10", color: "text-warning" },
  research: { icon: FlaskConical, label: "Research", bg: "bg-accent/10", color: "text-accent" },
  international: { icon: Globe, label: "International", bg: "bg-information/10", color: "text-information" },
  athletic: { icon: Trophy, label: "Athletic", bg: "bg-gold/10", color: "text-gold" },
};

export function formatRelativeTime(deadline) {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  if (diff < 0) return "Closed";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  if (days <= 7) return `${days} days left`;
  if (days <= 30) return `${Math.ceil(days / 7)}w left`;
  return `${Math.ceil(days / 30)}mo left`;
}

export const RESEARCH_TYPES = {
  project: { icon: FlaskConical, label: "Project", bg: "bg-accent/10", color: "text-accent" },
  thesis: { icon: GraduationCap, label: "Thesis", bg: "bg-success/10", color: "text-success" },
  publication: { icon: FileText, label: "Publication", bg: "bg-information/10", color: "text-information" },
  grant: { icon: Award, label: "Grant", bg: "bg-warning/10", color: "text-warning" },
  collaboration: { icon: Users, label: "Collaboration", bg: "bg-primary/10", color: "text-primary" },
};

export function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export const COMPANY_TYPES = {
  tech: { icon: Code, label: "Technology", bg: "bg-information/10", color: "text-information" },
  finance: { icon: Briefcase, label: "Finance", bg: "bg-success/10", color: "text-success" },
  healthcare: { icon: Heart, label: "Healthcare", bg: "bg-error/10", color: "text-error" },
  education: { icon: GraduationCap, label: "Education", bg: "bg-accent/10", color: "text-accent" },
  manufacturing: { icon: Building2, label: "Manufacturing", bg: "bg-warning/10", color: "text-warning" },
  consulting: { icon: Briefcase, label: "Consulting", bg: "bg-primary/10", color: "text-primary" },
  other: { icon: Building2, label: "Company", bg: "bg-muted/30", color: "text-muted-foreground" },
};

export const PORTFOLIO_TYPES = {
  project: { icon: Briefcase, label: "Project", bg: "bg-accent/10", color: "text-accent" },
  research: { icon: FlaskConical, label: "Research", bg: "bg-information/10", color: "text-information" },
  presentation: { icon: Presentation, label: "Presentation", bg: "bg-success/10", color: "text-success" },
  publication: { icon: FileText, label: "Publication", bg: "bg-warning/10", color: "text-warning" },
  design: { icon: Award, label: "Design", bg: "bg-primary/10", color: "text-primary" },
  video: { icon: Users, label: "Video", bg: "bg-accent/10", color: "text-accent" },
};

export const TRACKER_STATUSES = [
  { key: "interested", label: "Interested", color: "muted-foreground" },
  { key: "preparing", label: "Preparing", color: "warning" },
  { key: "applied", label: "Applied", color: "information" },
  { key: "interview", label: "Interview", color: "accent" },
  { key: "offered", label: "Offered", color: "success" },
  { key: "rejected", label: "Rejected", color: "error" },
  { key: "withdrawn", label: "Withdrawn", color: "muted-foreground" },
];