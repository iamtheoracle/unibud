import {
  GraduationCap, Music, Film, Trophy, Gamepad2, Newspaper,
  Briefcase, DollarSign, Cpu, Camera, Palette, PenLine,
  Mic, Headphones, BookOpen, Heart, Sparkles, Shirt,
  UtensilsCrossed, Plane, MapPin, Landmark, HandHeart,
  Globe, ShoppingBag, Lightbulb, FlaskConical, PartyPopper,
  Target, Users, Calendar,
} from "lucide-react";

/**
 * Universal Content Categories — the organization system across UNIBUD.
 * Every piece of content belongs to one or more categories.
 * Orbit uses these to power discovery, recommendations, search,
 * communities, notifications, and creation.
 *
 * Never fabricate categories. Never assign content to a category
 * it doesn't genuinely belong to.
 */
export const CONTENT_CATEGORIES = [
  { id: "academic",          label: "Academic",         icon: GraduationCap,  color: "217 91% 60%" },
  { id: "music",             label: "Music",            icon: Music,          color: "141 70% 48%" },
  { id: "movies_tv",         label: "Movies & TV",      icon: Film,           color: "0 77% 52%" },
  { id: "sports",            label: "Sports",           icon: Trophy,         color: "142 71% 45%" },
  { id: "gaming",            label: "Gaming",           icon: Gamepad2,       color: "270 75% 60%" },
  { id: "news",              label: "News",             icon: Newspaper,      color: "210 40% 55%" },
  { id: "careers",           label: "Careers",          icon: Briefcase,      color: "210 88% 45%" },
  { id: "business",          label: "Business",         icon: DollarSign,     color: "142 71% 45%" },
  { id: "technology",        label: "Technology",       icon: Cpu,            color: "217 91% 60%" },
  { id: "photography",       label: "Photography",      icon: Camera,         color: "340 75% 57%" },
  { id: "art",               label: "Art & Design",     icon: Palette,        color: "270 75% 60%" },
  { id: "writing",           label: "Writing",          icon: PenLine,        color: "210 40% 55%" },
  { id: "podcasts",          label: "Podcasts",         icon: Mic,            color: "340 75% 57%" },
  { id: "audio",             label: "Audio",            icon: Headphones,     color: "141 70% 48%" },
  { id: "books",             label: "Books",            icon: BookOpen,       color: "38 92% 50%" },
  { id: "faith",             label: "Faith",            icon: Heart,           color: "0 77% 52%" },
  { id: "lifestyle",         label: "Lifestyle",        icon: Sparkles,       color: "251 90% 67%" },
  { id: "fashion",           label: "Fashion",          icon: Shirt,          color: "340 75% 57%" },
  { id: "food",              label: "Food",             icon: UtensilsCrossed, color: "38 92% 50%" },
  { id: "travel",            label: "Travel",           icon: Plane,          color: "200 80% 50%" },
  { id: "campus_life",       label: "Campus Life",      icon: MapPin,         color: "142 71% 45%" },
  { id: "student_government",label: "Student Gov",      icon: Landmark,       color: "217 91% 60%" },
  { id: "volunteering",      label: "Volunteering",     icon: HandHeart,      color: "142 71% 45%" },
  { id: "culture",           label: "Culture",          icon: Globe,          color: "200 80% 50%" },
  { id: "marketplace",       label: "Marketplace",      icon: ShoppingBag,    color: "142 71% 45%" },
  { id: "entrepreneurship",  label: "Entrepreneurship", icon: Lightbulb,      color: "38 92% 50%" },
  { id: "research",          label: "Research",         icon: FlaskConical,   color: "217 91% 60%" },
  { id: "events",            label: "Events",           icon: PartyPopper,    color: "38 92% 50%" },
  { id: "challenges",        label: "Challenges",       icon: Target,         color: "0 84% 60%" },
  { id: "communities",       label: "Communities",      icon: Users,          color: "251 90% 67%" },
];

export const CATEGORY_MAP = Object.fromEntries(CONTENT_CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id) {
  return CATEGORY_MAP[id];
}

/**
 * Discovery tabs — the subset of categories shown as tabs in the
 * Orbit Discovery Feed, plus "For You" (always first).
 */
export const DISCOVERY_TABS = [
  { id: "foryou",       label: "For You",       icon: Sparkles,       color: "251 90% 67%" },
  { id: "communities",  label: "Communities",   icon: Users,          color: "251 90% 67%" },
  { id: "events",       label: "Events",        icon: Calendar,       color: "38 92% 50%" },
  { id: "music",        label: "Music",         icon: Music,          color: "141 70% 48%" },
  { id: "sports",       label: "Sports",        icon: Trophy,         color: "142 71% 45%" },
  { id: "movies_tv",    label: "Movies & TV",   icon: Film,           color: "0 77% 52%" },
  { id: "gaming",       label: "Gaming",        icon: Gamepad2,       color: "270 75% 60%" },
  { id: "news",         label: "News",          icon: Newspaper,      color: "210 40% 55%" },
  { id: "technology",   label: "Technology",    icon: Cpu,            color: "217 91% 60%" },
  { id: "academic",     label: "Academics",     icon: GraduationCap,  color: "217 91% 60%" },
  { id: "careers",      label: "Careers",       icon: Briefcase,      color: "210 88% 45%" },
  { id: "business",     label: "Business",      icon: DollarSign,     color: "142 71% 45%" },
  { id: "photography",  label: "Photography",   icon: Camera,         color: "340 75% 57%" },
  { id: "fashion",      label: "Fashion",       icon: Shirt,          color: "340 75% 57%" },
  { id: "faith",        label: "Faith",         icon: Heart,           color: "0 77% 52%" },
  { id: "campus_life",  label: "Campus Life",   icon: MapPin,         color: "142 71% 45%" },
  { id: "marketplace",  label: "Marketplace",   icon: ShoppingBag,    color: "142 71% 45%" },
];

/**
 * Category keyword map — maps category IDs to keywords used for
 * matching content (tags, type, category, name fields).
 */
const CATEGORY_KEYWORDS = {
  music: ["music", "musician", "band", "choir", "afrobeat", "rap", "hip hop"],
  sports: ["sports", "football", "basketball", "athletics", "sport", "soccer", "volleyball"],
  movies_tv: ["movie", "film", "cinema", "tv", "series", "anime", "drama", "k-drama"],
  gaming: ["gaming", "game", "esports", "tournament"],
  news: ["news", "journalism", "media", "headline"],
  technology: ["technology", "tech", "programming", "coding", "robotics", "ai", "software", "innovation"],
  academic: ["academic", "study", "course", "research", "faculty", "department", "programme", "lecture"],
  careers: ["career", "job", "internship", "professional", "resume", "cv", "interview"],
  business: ["business", "entrepreneur", "finance", "startup", "investment", "money"],
  photography: ["photography", "photo", "camera"],
  fashion: ["fashion", "style", "design", "model"],
  faith: ["faith", "religious", "christian", "muslim", "fellowship", "church", "mosque"],
  campus_life: ["campus", "lifestyle", "social", "hostel", "dorm", "student life"],
  communities: ["community", "group", "society", "club"],
  events: ["event", "concert", "workshop", "seminar", "fair", "festival"],
  marketplace: ["marketplace", "sell", "buy", "listing", "product", "sale"],
};

/**
 * Checks if an item matches a content category.
 * Uses tags, type, category, and name fields for matching.
 * Never fabricates matches — only returns true if real keywords match.
 */
export function matchesCategory(item, categoryId) {
  if (!categoryId || categoryId === "foryou") return true;

  // "communities", "events", "marketplace" are entity-type tabs, not category tabs
  if (categoryId === "communities") return true;
  if (categoryId === "events") return true;
  if (categoryId === "marketplace") return true;

  const keywords = CATEGORY_KEYWORDS[categoryId];
  if (!keywords) return true;

  const tags = (item.tags || []).map((t) => (typeof t === "string" ? t.toLowerCase() : ""));
  const category = (item.category || "").toLowerCase();
  const type = (item.type || "").toLowerCase();
  const name = (item.name || item.title || "").toLowerCase();

  return (
    tags.some((t) => keywords.some((k) => t.includes(k))) ||
    keywords.some((k) => category.includes(k) || type.includes(k) || name.includes(k))
  );
}