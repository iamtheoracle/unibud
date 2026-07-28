/**
 * UNIBUD Social — Discover mock data.
 *
 * Realistic, Nigerian-university content for the Discover engine so every
 * section feels alive on an empty tenant. Auto-replaced by live entity data
 * the moment it exists (see useMockFallback). Consumed only by Discover and
 * its section components — does not duplicate the Academic mocks.
 */
import { CAMPUS_EVENT_MOCK_ENTRIES } from "@/lib/academic/mockShapes2";
import { NEWS_ITEMS, NEWS_CATEGORIES } from "@/lib/mock/newsData";

const cover = (id) => `https://images.unsplash.com/photo-${id}?w=400&q=80`;

export const DISCOVER_MOCK = {
  quadPosts: [
    { id: "dq1", content: "Free Python workshop this Friday at the Innovation Lab — bring your laptop, all levels welcome.", reactions: 42 },
    { id: "dq2", content: "Lost my student ID near the library yesterday — if found please drop at the security desk. Reward 🙏", reactions: 18 },
    { id: "dq3", content: "Selling my CSC 301 textbook (Kleinberg & Tardos) — barely used, ₦4,000. DM me.", reactions: 27 },
    { id: "dq4", content: "Campus shuttle route 4 is running late this morning — plan an extra 15 minutes.", reactions: 64 },
    { id: "dq5", content: "Looking for a study partner for MTH 201 before the mid-semesters — I'm free weekday evenings.", reactions: 12 },
  ],
  events: CAMPUS_EVENT_MOCK_ENTRIES,
  clubs: [
    { id: "dcl1", name: "Google Developer Student Club", category: "Technology" },
    { id: "dcl2", name: "Debate & Literary Society", category: "Academic" },
    { id: "dcl3", name: "Campus Photographers Collective", category: "Arts" },
    { id: "dcl4", name: "UNIBUD Basketball Team", category: "Sports" },
    { id: "dcl5", name: "Entrepreneurship Society", category: "Business" },
  ],
  communities: [
    { id: "dcm1", name: "Faculty of Science", description: "All science students — announcements, resources & discussion." },
    { id: "dcm2", name: "300L Computer Science", description: "Year-three CSC cohort — study groups, past questions & help." },
    { id: "dcm3", name: "Off-Campus Residents", description: "Housing tips, roommates & commute coordination." },
    { id: "dcm4", name: "Aspiring Founders", description: "Student entrepreneurs building and shipping together." },
  ],
  opportunities: [
    { id: "do1", title: "Software Engineering Intern", organization: "Flutterwave", amount: "₦150k/mo" },
    { id: "do2", title: "Data Analyst Intern (Remote)", organization: "Paystack", amount: "₦120k/mo" },
    { id: "do3", title: "Campus Ambassador", organization: "Microsoft Learn", amount: "Stipend" },
    { id: "do4", title: "Research Assistant — AI Lab", organization: "Faculty of Engineering", amount: "₦60k/mo" },
  ],
  scholarships: [
    { id: "ds1", title: "NNPC/Chevron Scholarship 2026", provider: "Chevron Nigeria" },
    { id: "ds2", title: "MTN Foundation Science & Tech Scholarship", provider: "MTN Foundation" },
    { id: "ds3", title: "Shell University Scholarship", provider: "SPDC" },
  ],
  listings: [
    { id: "dl1", title: "Engineering Mathematics Textbook", price: 5500, images: [cover("1523050854058-8df90110c9f1")] },
    { id: "dl2", title: "HP Laptop — Core i5, 8GB RAM", price: 185000, images: [cover("1518770660439-4636190af475")] },
    { id: "dl3", title: "Free study desk & chair", price: 0, images: [cover("1541339905197-e6b5be8be9a7")] },
    { id: "dl4", title: "Scientific Calculator (Casio fx-991)", price: 3500, images: [cover("1532187863146-1710f1ce8a1c")] },
  ],
  lostFound: [
    { id: "dlf1", title: "Black Samsung Galaxy Phone", location: "Library" },
    { id: "dlf2", title: "Student ID Card — Adaeze Okafor", location: "LT 2, Faculty of Science" },
    { id: "dlf3", title: "Brown Leather Wallet", location: "Cafeteria" },
    { id: "dlf4", title: "HP Laptop Charger", location: "Hall 3 common room" },
  ],
  challenges: [
    { id: "dch1", title: "30-Day Coding Challenge", status: "active", participants_count: 184 },
    { id: "dch2", title: "Campus Step-Count Showdown", status: "active", participants_count: 92 },
    { id: "dch3", title: "Reading Marathon — 10 Books", status: "active", participants_count: 47 },
  ],
};

// ─── Topic → news mapping (Sports / Entertainment / Technology) ───────────────
const TOPIC_NEWS_KEYS = {
  sports: ["sports", "football", "basketball", "formula1"],
  entertainment: ["entertainment", "anime", "music", "movies"],
  technology: ["technology", "ai", "science", "research", "innovation"],
};

/**
 * Returns news items relevant to a Discover topic category, optionally
 * narrowed by the selected sub (e.g. "Football", "Artificial Intelligence").
 */
export function newsForTopic(catKey, sub) {
  const keys = TOPIC_NEWS_KEYS[catKey] || [];
  let pool = NEWS_ITEMS.filter((n) => keys.includes(n.category));
  if (sub) {
    const subL = sub.toLowerCase();
    const direct = NEWS_CATEGORIES.find(
      (c) => c.label.toLowerCase() === subL || c.key === subL.replace(/\s+/g, "")
    );
    if (direct) pool = pool.filter((n) => n.category === direct.key);
  }
  return pool;
}