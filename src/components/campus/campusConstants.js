import {
  Building2, Landmark, Network, GraduationCap, TrendingUp, BookOpen, Users, Trophy,
  FlaskConical, Target, Crown, Home, Sparkles, Shield, Briefcase, Code, Mic, Wrench,
  PartyPopper, Globe, Calendar, Bot, Camera, Rocket, Music, HeartHandshake, Lightbulb,
  Clapperboard, Newspaper, Gamepad2, Palette, Atom, Smartphone, FileText, Shirt, Watch, Key,
  Wallet, Laptop, CreditCard, Gem, Package, MapPin, Clock, UserPlus, QrCode, Share2, Bookmark,
} from "lucide-react";

export const ICON_MAP = {
  Building2, Landmark, Network, GraduationCap, TrendingUp, BookOpen, Users, Trophy,
  FlaskConical, Target, Crown, Home, Sparkles, Shield, Briefcase, Code, Mic, Wrench,
  PartyPopper, Globe, Calendar, Bot, Camera, Rocket, Music, HeartHandshake, Lightbulb,
  Clapperboard, Newspaper, Gamepad2, Palette, Atom, Smartphone, FileText, Shirt, Watch, Key,
  Wallet, Laptop, CreditCard, Gem, Package, MapPin, Clock, UserPlus, QrCode, Share2, Bookmark,
};

export function getIcon(name) {
  return ICON_MAP[name] || Users;
}

/* Official UNIBUD Color Palette (HSL strings for dynamic hsl() usage) */
const PURPLE = "262 83% 58%";   /* Royal Purple — primary */
const BLUE = "217 91% 60%";     /* Professional Blue — info */
const GREEN = "142 71% 45%";    /* Emerald Green — success */
const AMBER = "38 92% 50%";     /* Soft Amber — warning */
const RED = "0 72% 51%";       /* Modern Red — error */

export const COMMUNITY_TYPES = {
  university: { label: "University", icon: "Building2", color: BLUE },
  faculty: { label: "Faculty", icon: "Landmark", color: PURPLE },
  department: { label: "Department", icon: "Network", color: GREEN },
  programme: { label: "Programme", icon: "GraduationCap", color: AMBER },
  level: { label: "Level", icon: "TrendingUp", color: RED },
  course: { label: "Course", icon: "BookOpen", color: BLUE },
  class: { label: "Class", icon: "Users", color: PURPLE },
  club: { label: "Club", icon: "Trophy", color: AMBER },
  research_group: { label: "Research Group", icon: "FlaskConical", color: GREEN },
  project_team: { label: "Project Team", icon: "Target", color: RED },
  sports_team: { label: "Sports Team", icon: "Trophy", color: AMBER },
  sug: { label: "Student Union", icon: "Crown", color: PURPLE },
  hostel: { label: "Hostel", icon: "Home", color: PURPLE },
  interest_group: { label: "Interest Group", icon: "Sparkles", color: GREEN },
  faculty_association: { label: "Faculty Association", icon: "Landmark", color: PURPLE },
  department_association: { label: "Dept Association", icon: "Network", color: GREEN },
  class_representative: { label: "Class Rep", icon: "Shield", color: PURPLE },
};

export const EVENT_TYPES = {
  career_fair: { label: "Career Fair", icon: "Briefcase", color: BLUE },
  sports: { label: "Sports", icon: "Trophy", color: AMBER },
  convocation: { label: "Convocation", icon: "GraduationCap", color: PURPLE },
  orientation: { label: "Orientation", icon: "Compass", color: GREEN },
  hackathon: { label: "Hackathon", icon: "Code", color: PURPLE },
  research_conference: { label: "Research Conference", icon: "FlaskConical", color: GREEN },
  competition: { label: "Competition", icon: "Trophy", color: RED },
  club_meeting: { label: "Club Meeting", icon: "Users", color: PURPLE },
  guest_lecture: { label: "Guest Lecture", icon: "Mic", color: BLUE },
  department_seminar: { label: "Department Seminar", icon: "BookOpen", color: GREEN },
  workshop: { label: "Workshop", icon: "Wrench", color: AMBER },
  social: { label: "Social", icon: "PartyPopper", color: PURPLE },
  cultural: { label: "Cultural", icon: "Globe", color: RED },
  other: { label: "Event", icon: "Calendar", color: PURPLE },
};

export const CLUB_CATEGORIES = {
  programming: { label: "Programming", icon: "Code", color: PURPLE },
  robotics: { label: "Robotics", icon: "Bot", color: BLUE },
  photography: { label: "Photography", icon: "Camera", color: GREEN },
  entrepreneurship: { label: "Entrepreneurship", icon: "Rocket", color: AMBER },
  music: { label: "Music", icon: "Music", color: PURPLE },
  debate: { label: "Debate", icon: "Mic", color: RED },
  sports: { label: "Sports", icon: "Trophy", color: AMBER },
  volunteer: { label: "Volunteer", icon: "HeartHandshake", color: GREEN },
  innovation: { label: "Innovation", icon: "Lightbulb", color: PURPLE },
  research: { label: "Research", icon: "FlaskConical", color: GREEN },
  drama: { label: "Drama", icon: "Clapperboard", color: PURPLE },
  dance: { label: "Dance", icon: "Music", color: BLUE },
  journalism: { label: "Journalism", icon: "Newspaper", color: RED },
  gaming: { label: "Gaming", icon: "Gamepad2", color: PURPLE },
  art: { label: "Art", icon: "Palette", color: GREEN },
  literary: { label: "Literary", icon: "BookOpen", color: AMBER },
  science: { label: "Science", icon: "Atom", color: BLUE },
  other: { label: "Other", icon: "Users", color: PURPLE },
};

export const LOST_FOUND_CATEGORIES = {
  electronics: { label: "Electronics", icon: "Smartphone", color: BLUE },
  books: { label: "Books", icon: "BookOpen", color: GREEN },
  documents: { label: "Documents", icon: "FileText", color: AMBER },
  clothing: { label: "Clothing", icon: "Shirt", color: PURPLE },
  accessories: { label: "Accessories", icon: "Watch", color: RED },
  keys: { label: "Keys", icon: "Key", color: PURPLE },
  wallet: { label: "Wallet", icon: "Wallet", color: GREEN },
  phone: { label: "Phone", icon: "Smartphone", color: BLUE },
  laptop: { label: "Laptop", icon: "Laptop", color: PURPLE },
  id_card: { label: "ID Card", icon: "CreditCard", color: RED },
  bag: { label: "Bag", icon: "Package", color: AMBER },
  jewelry: { label: "Jewelry", icon: "Gem", color: PURPLE },
  other: { label: "Other", icon: "Package", color: GREEN },
};

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatEventDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatEventTime(timeStr) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes || "00"} ${ampm}`;
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date - now) / 86400000);
}