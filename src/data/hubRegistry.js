import {
  Camera, Headphones, Film, Newspaper, Trophy, Gamepad2,
  Briefcase, GraduationCap, MessageCircle, Calendar, ShoppingBag, Target,
} from "lucide-react";

/**
 * Hub Registry — 12 specialized community workspaces.
 *
 * Each hub borrows interaction patterns from familiar platforms but keeps
 * UNIBUD's own design system. These are NOT recreations of social media apps —
 * they are specialized community workspaces optimized for university life.
 *
 * Fields:
 * - entity: the base44 entity to query for feed content
 * - entityFilter: filter object for the entity query
 * - feedType: "grid" (visual) or "list" (text)
 * - budTip: contextual Bud suggestion shown in the hub
 */
export const HUB_REGISTRY = {
  creators: {
    id: "creators",
    label: "Creator Hub",
    icon: Camera,
    color: "340 75% 57%",
    tagline: "Visual stories from campus",
    description: "Photos, design, fashion, art, travel, food",
    categories: ["Photos", "Design", "Fashion", "Art", "Travel", "Food"],
    feedType: "grid",
    entity: "QuadPost",
    entityFilter: { type: "photo" },
    budTip: "I can recommend creators to follow based on your style.",
  },
  music: {
    id: "music",
    label: "Music Hub",
    icon: Headphones,
    color: "141 70% 48%",
    tagline: "Discover campus artists",
    description: "Music discovery, playlists, open mic events",
    categories: ["New Releases", "Campus Artists", "Trending", "Playlists", "Open Mic"],
    feedType: "grid",
    entity: "Podcast",
    entityFilter: {},
    budTip: "I can create playlists for your study sessions.",
  },
  movies_tv: {
    id: "movies_tv",
    label: "Movies Hub",
    icon: Film,
    color: "0 77% 52%",
    tagline: "Watch, review, discuss",
    description: "Movies, series, anime, reviews, watch parties",
    categories: ["Movies", "Series", "Anime", "K-Drama", "Reviews", "Watch Parties"],
    feedType: "grid",
    entity: "QuadPost",
    entityFilter: { type: "video" },
    budTip: "I can recommend movies based on what you've watched.",
  },
  news_tech: {
    id: "news_tech",
    label: "News Hub",
    icon: Newspaper,
    color: "210 40% 55%",
    tagline: "Campus and world news",
    description: "Headlines, breaking news, fact-checked stories",
    categories: ["Headlines", "Breaking", "Campus News", "Technology", "Business", "Science"],
    feedType: "list",
    entity: "FootballNews",
    entityFilter: {},
    budTip: "I can summarize long articles in seconds.",
  },
  sports: {
    id: "sports",
    label: "Sports Hub",
    icon: Trophy,
    color: "142 71% 45%",
    tagline: "Live scores and discussions",
    description: "Live scores, fixtures, tables, campus leagues",
    categories: ["Live", "Fixtures", "Tables", "Campus Leagues", "Highlights", "Teams"],
    feedType: "list",
    entity: "FootballMatch",
    entityFilter: {},
    budTip: "I can explain the stats behind every match.",
  },
  gaming: {
    id: "gaming",
    label: "Gaming Hub",
    icon: Gamepad2,
    color: "270 75% 60%",
    tagline: "Play, compete, connect",
    description: "Tournaments, squad finder, clips, leaderboards",
    categories: ["Featured", "Tournaments", "Squad Finder", "Clips", "Leaderboards"],
    feedType: "grid",
    entity: "QuadPost",
    entityFilter: {},
    budTip: "I can help you find squads and tournaments.",
  },
  careers: {
    id: "careers",
    label: "Career Hub",
    icon: Briefcase,
    color: "210 88% 45%",
    tagline: "Grow your career",
    description: "Internships, jobs, resume reviews, mentorship",
    categories: ["Internships", "Jobs", "Resume Reviews", "Networking", "Mentorship"],
    feedType: "list",
    entity: "Opportunity",
    entityFilter: {},
    budTip: "I can help prepare your CV and cover letters.",
  },
  academics: {
    id: "academics",
    label: "Academic Hub",
    icon: GraduationCap,
    color: "217 91% 60%",
    tagline: "Study communities",
    description: "Course discussions, notes, research, study rooms",
    categories: ["Courses", "Notes", "Research", "Past Questions", "Study Rooms", "Scholarships"],
    feedType: "list",
    entity: "Course",
    entityFilter: {},
    budTip: "I join every study session to help you learn.",
    isAcademic: true,
  },
  discussions: {
    id: "discussions",
    label: "Discussions",
    icon: MessageCircle,
    color: "16 90% 55%",
    tagline: "Long-form conversations",
    description: "Questions, answers, polls, community moderators",
    categories: ["Popular", "Questions", "Answers", "Polls", "Advice"],
    feedType: "list",
    entity: "QuadPost",
    entityFilter: { type: "question" },
    budTip: "I highlight the most useful answers for you.",
  },
  events: {
    id: "events",
    label: "Events Hub",
    icon: Calendar,
    color: "38 92% 50%",
    tagline: "What's happening on campus",
    description: "Concerts, workshops, seminars, club meetings",
    categories: ["Calendar", "Concerts", "Workshops", "Seminars", "Sports", "Club Meetings"],
    feedType: "list",
    entity: "CampusEvent",
    entityFilter: {},
    budTip: "I'll remind you before events you care about.",
  },
  marketplace: {
    id: "marketplace",
    label: "Marketplace",
    icon: ShoppingBag,
    color: "142 71% 45%",
    tagline: "Buy and sell on campus",
    description: "Featured products, nearby sellers, student deals",
    categories: ["Featured", "Nearby", "Categories", "Trusted Sellers", "Deals"],
    feedType: "grid",
    entity: "MarketplaceListing",
    entityFilter: {},
    budTip: "I check listings to keep you safe from scams.",
  },
  challenge: {
    id: "challenge",
    label: "Challenge Hub",
    icon: Target,
    color: "0 84% 60%",
    tagline: "Friendly competition",
    description: "Daily challenges, weekly challenges, rewards, rankings",
    categories: ["Active", "Daily", "Weekly", "Rewards", "Rankings", "Badges"],
    feedType: "list",
    entity: "Challenge",
    entityFilter: {},
    budTip: "I encourage you to participate and earn rewards.",
  },
};

export const HUB_LIST = Object.values(HUB_REGISTRY);

/** Hubs matching the student's selected interest IDs. */
export function getHubsForInterests(interestIds = []) {
  return interestIds.map((id) => HUB_REGISTRY[id]).filter(Boolean);
}

/** Hubs not in the student's interests (shown in "Explore" section). */
export function getOtherHubs(interestIds = []) {
  return HUB_LIST.filter((h) => !interestIds.includes(h.id));
}