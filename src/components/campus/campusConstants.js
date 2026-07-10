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

export const COMMUNITY_TYPES = {
  university: { label: "University", icon: "Building2", color: "217 89% 53%" },
  faculty: { label: "Faculty", icon: "Landmark", color: "262 83% 58%" },
  department: { label: "Department", icon: "Network", color: "142 72% 29%" },
  programme: { label: "Programme", icon: "GraduationCap", color: "38 92% 50%" },
  level: { label: "Level", icon: "TrendingUp", color: "0 73% 51%" },
  course: { label: "Course", icon: "BookOpen", color: "217 89% 53%" },
  class: { label: "Class", icon: "Users", color: "262 83% 58%" },
  club: { label: "Club", icon: "Trophy", color: "38 92% 50%" },
  research_group: { label: "Research Group", icon: "FlaskConical", color: "142 72% 29%" },
  project_team: { label: "Project Team", icon: "Target", color: "0 73% 51%" },
  sports_team: { label: "Sports Team", icon: "Trophy", color: "38 92% 50%" },
  sug: { label: "Student Union", icon: "Crown", color: "46 65% 52%" },
  hostel: { label: "Hostel", icon: "Home", color: "262 83% 58%" },
  interest_group: { label: "Interest Group", icon: "Sparkles", color: "142 72% 29%" },
  faculty_association: { label: "Faculty Association", icon: "Landmark", color: "262 83% 58%" },
  department_association: { label: "Dept Association", icon: "Network", color: "142 72% 29%" },
  class_representative: { label: "Class Rep", icon: "Shield", color: "46 65% 52%" },
};

export const EVENT_TYPES = {
  career_fair: { label: "Career Fair", icon: "Briefcase", color: "217 89% 53%" },
  sports: { label: "Sports", icon: "Trophy", color: "38 92% 50%" },
  convocation: { label: "Convocation", icon: "GraduationCap", color: "46 65% 52%" },
  orientation: { label: "Orientation", icon: "Compass", color: "142 72% 29%" },
  hackathon: { label: "Hackathon", icon: "Code", color: "262 83% 58%" },
  research_conference: { label: "Research Conference", icon: "FlaskConical", color: "142 72% 29%" },
  competition: { label: "Competition", icon: "Trophy", color: "0 73% 51%" },
  club_meeting: { label: "Club Meeting", icon: "Users", color: "262 83% 58%" },
  guest_lecture: { label: "Guest Lecture", icon: "Mic", color: "217 89% 53%" },
  department_seminar: { label: "Department Seminar", icon: "BookOpen", color: "142 72% 29%" },
  workshop: { label: "Workshop", icon: "Wrench", color: "38 92% 50%" },
  social: { label: "Social", icon: "PartyPopper", color: "262 83% 58%" },
  cultural: { label: "Cultural", icon: "Globe", color: "0 73% 51%" },
  other: { label: "Event", icon: "Calendar", color: "46 65% 52%" },
};

export const CLUB_CATEGORIES = {
  programming: { label: "Programming", icon: "Code", color: "262 83% 58%" },
  robotics: { label: "Robotics", icon: "Bot", color: "217 89% 53%" },
  photography: { label: "Photography", icon: "Camera", color: "142 72% 29%" },
  entrepreneurship: { label: "Entrepreneurship", icon: "Rocket", color: "38 92% 50%" },
  music: { label: "Music", icon: "Music", color: "262 83% 58%" },
  debate: { label: "Debate", icon: "Mic", color: "0 73% 51%" },
  sports: { label: "Sports", icon: "Trophy", color: "38 92% 50%" },
  volunteer: { label: "Volunteer", icon: "HeartHandshake", color: "142 72% 29%" },
  innovation: { label: "Innovation", icon: "Lightbulb", color: "46 65% 52%" },
  research: { label: "Research", icon: "FlaskConical", color: "142 72% 29%" },
  drama: { label: "Drama", icon: "Clapperboard", color: "262 83% 58%" },
  dance: { label: "Dance", icon: "Music", color: "217 89% 53%" },
  journalism: { label: "Journalism", icon: "Newspaper", color: "0 73% 51%" },
  gaming: { label: "Gaming", icon: "Gamepad2", color: "262 83% 58%" },
  art: { label: "Art", icon: "Palette", color: "142 72% 29%" },
  literary: { label: "Literary", icon: "BookOpen", color: "38 92% 50%" },
  science: { label: "Science", icon: "Atom", color: "217 89% 53%" },
  other: { label: "Other", icon: "Users", color: "46 65% 52%" },
};

export const LOST_FOUND_CATEGORIES = {
  electronics: { label: "Electronics", icon: "Smartphone", color: "217 89% 53%" },
  books: { label: "Books", icon: "BookOpen", color: "142 72% 29%" },
  documents: { label: "Documents", icon: "FileText", color: "38 92% 50%" },
  clothing: { label: "Clothing", icon: "Shirt", color: "262 83% 58%" },
  accessories: { label: "Accessories", icon: "Watch", color: "0 73% 51%" },
  keys: { label: "Keys", icon: "Key", color: "46 65% 52%" },
  wallet: { label: "Wallet", icon: "Wallet", color: "142 72% 29%" },
  phone: { label: "Phone", icon: "Smartphone", color: "217 89% 53%" },
  laptop: { label: "Laptop", icon: "Laptop", color: "262 83% 58%" },
  id_card: { label: "ID Card", icon: "CreditCard", color: "0 73% 51%" },
  bag: { label: "Bag", icon: "Package", color: "38 92% 50%" },
  jewelry: { label: "Jewelry", icon: "Gem", color: "46 65% 52%" },
  other: { label: "Other", icon: "Package", color: "142 72% 29%" },
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