// University Journey — the complete lifecycle from pre-university through alumni life.
// Every UNIBUD account belongs to one of four stages. Bud adapts the entire experience accordingly.

import {
  Rocket, GraduationCap, BookOpen, Award, Briefcase,
  Compass, HeartHandshake, Users, Sparkles, Trophy,
  Star, MapPin, Building2, FlaskConical, Brain, Target,
} from "lucide-react";

export const JOURNEY_STAGES = {
  future_student: {
    value: "future_student",
    label: "Future Student",
    short: "Future",
    description: "Preparing for university admission",
    icon: Rocket,
    color: "text-primary",
    bg: "bg-primary/10",
    badge: "bg-primary/10 text-primary",
    nextStage: "student",
    nextMilestone: "Gaining admission to university",
    encouragement: "You're already part of the UNIBUD family — we're preparing you for success.",
  },
  student: {
    value: "student",
    label: "Undergraduate Student",
    short: "Undergrad",
    description: "Pursuing your first degree",
    icon: GraduationCap,
    color: "text-info",
    bg: "bg-info/10",
    badge: "bg-info/10 text-info",
    nextStage: "postgraduate",
    nextMilestone: "Graduating with your degree",
    encouragement: "You're building the foundation of your future — keep going!",
  },
  postgraduate: {
    value: "postgraduate",
    label: "Postgraduate Student",
    short: "Postgrad",
    description: "Advanced studies beyond your first degree",
    icon: FlaskConical,
    color: "text-purple",
    bg: "bg-purple/10",
    badge: "bg-purple/10 text-purple",
    nextStage: "alumni",
    nextMilestone: "Completing your postgraduate programme",
    encouragement: "You're advancing knowledge and pushing boundaries — remarkable!",
  },
  alumni: {
    value: "alumni",
    label: "Alumni",
    short: "Alumni",
    description: "A graduate and lifelong member of the UNIBUD community",
    icon: Award,
    color: "text-success",
    bg: "bg-success/10",
    badge: "bg-success/10 text-success",
    nextStage: null,
    nextMilestone: null,
    encouragement: "Your journey continues — stay connected, mentor the next generation, and keep growing.",
  },
};

export const JOURNEY_ORDER = ["future_student", "student", "postgraduate", "alumni"];

export function getJourneyStage(userType) {
  return JOURNEY_STAGES[userType] || JOURNEY_STAGES.student;
}

export function getJourneyStageForUser(user) {
  return getJourneyStage(user?.user_type);
}

export function getNextStage(currentType) {
  const stage = JOURNEY_STAGES[currentType];
  if (!stage || !stage.nextStage) return null;
  return JOURNEY_STAGES[stage.nextStage];
}

export function getJourneyMilestone(user) {
  const stage = getJourneyStageForUser(user);
  if (stage.nextMilestone) {
    return {
      label: stage.nextMilestone,
      nextStage: stage.nextStage,
      nextStageLabel: getNextStage(user?.user_type)?.label || null,
    };
  }
  return null;
}

// Bud's stage summary — used in system prompts and UI banners
export function getBudStageSummary(user) {
  const stage = getJourneyStageForUser(user);
  const milestone = getJourneyMilestone(user);
  let summary = `You are currently a ${stage.label}. ${stage.description}.`;
  if (milestone) {
    summary += ` Your next milestone is ${milestone.label}.`;
  } else {
    summary += ` ${stage.encouragement}`;
  }
  return summary;
}

// Stage-specific recommended actions for the journey banner
export function getStageRecommendations(user) {
  const type = user?.user_type;

  if (type === "future_student") {
    const recs = [];
    const level = user?.education_level;
    if (level === "jamb_candidate") {
      recs.push("Practice with JAMB past questions today");
      recs.push("Check your target university's cut-off mark");
    } else if (level === "waec_candidate" || level === "neco_candidate") {
      recs.push("Review past O-Level questions");
      recs.push("Verify your subject combinations");
    } else if (level === "secondary_school") {
      recs.push("Explore universities that match your interests");
      recs.push("Start building strong study habits");
    } else {
      recs.push("Explore university preparation resources");
      recs.push("Connect with a student mentor");
    }
    if (user?.exam_status === "admitted") {
      recs.length = 0;
      recs.push("Transition your account to a full student profile");
      recs.push("Set up your matriculation number");
    }
    return recs;
  }

  if (type === "student") {
    return [
      "Review your upcoming deadlines and exams",
      "Join a study group for your current courses",
      "Track your GPA and academic progress",
    ];
  }

  if (type === "postgraduate") {
    return [
      "Work on your research or thesis",
      "Find relevant academic publications",
      "Connect with research collaborators",
    ];
  }

  if (type === "alumni") {
    return [
      "Share your experience — mentor a current student",
      "Explore career opportunities and networking",
      "Stay connected with your university community",
    ];
  }

  return [];
}

// Alumni-specific categories for the alumni dashboard
export const ALUMNI_CATEGORIES = [
  { id: "mentorship", label: "Mentor Students", icon: HeartHandshake, color: "text-error", bg: "bg-error/10", path: "/mentorship" },
  { id: "career", label: "Career Hub", icon: Briefcase, color: "text-info", bg: "bg-info/10", path: "/career" },
  { id: "networking", label: "Networking", icon: Users, color: "text-primary", bg: "bg-primary/10", path: "/connect" },
  { id: "opportunities", label: "Opportunities", icon: Compass, color: "text-success", bg: "bg-success/10", path: "/opportunities" },
  { id: "events", label: "Campus Events", icon: Sparkles, color: "text-purple", bg: "bg-purple/10", path: "/events" },
  { id: "traditions", label: "Traditions", icon: Trophy, color: "text-warning", bg: "bg-warning/10", path: "/campus-traditions" },
  { id: "portfolio", label: "Portfolio", icon: Star, color: "text-info", bg: "bg-info/10", path: "/portfolio" },
  { id: "companies", label: "Companies", icon: Building2, color: "text-primary", bg: "bg-primary/10", path: "/companies" },
  { id: "research", label: "Research", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10", path: "/research" },
  { id: "scholarships", label: "Scholarships", icon: Award, color: "text-warning", bg: "bg-warning/10", path: "/scholarships" },
  { id: "communities", label: "Communities", icon: Users, color: "text-info", bg: "bg-info/10", path: "/communities" },
  { id: "campus", label: "Campus Life", icon: MapPin, color: "text-success", bg: "bg-success/10", path: "/campus-traditions" },
];

// Postgraduate-specific categories
export const POSTGRADUATE_CATEGORIES = [
  { id: "research", label: "Research Hub", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10", path: "/research" },
  { id: "library", label: "Library", icon: BookOpen, color: "text-info", bg: "bg-info/10", path: "/library" },
  { id: "academics", label: "Academics", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10", path: "/academics" },
  { id: "mentorship", label: "Mentorship", icon: HeartHandshake, color: "text-error", bg: "bg-error/10", path: "/mentorship" },
  { id: "career", label: "Career Hub", icon: Briefcase, color: "text-info", bg: "bg-info/10", path: "/career" },
  { id: "scholarships", label: "Funding", icon: Award, color: "text-warning", bg: "bg-warning/10", path: "/scholarships" },
  { id: "communities", label: "Communities", icon: Users, color: "text-info", bg: "bg-info/10", path: "/communities" },
  { id: "events", label: "Events", icon: Sparkles, color: "text-purple", bg: "bg-purple/10", path: "/events" },
  { id: "portfolio", label: "Portfolio", icon: Star, color: "text-info", bg: "bg-info/10", path: "/portfolio" },
  { id: "analytics", label: "Analytics", icon: Brain, color: "text-success", bg: "bg-success/10", path: "/academic-analytics" },
  { id: "study_groups", label: "Study Groups", icon: Users, color: "text-primary", bg: "bg-primary/10", path: "/study-groups" },
  { id: "goals", label: "Goals", icon: Target, color: "text-warning", bg: "bg-warning/10", path: "/academics" },
];