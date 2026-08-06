import {
  Camera, Headphones, Film, Newspaper, Trophy, Gamepad2,
  Briefcase, GraduationCap, MessageCircle, Calendar, ShoppingBag, Target,
  Youtube, Globe, BookOpen, Tv, Video, Radio,
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
 * - vibe: visual personality ("cinematic", "energetic", "immersive", etc.)
 * - sources: trusted external platforms with "Open on [Platform]" links
 * - isAcademic: if true, Bud appears as a built-in study companion
 *
 * Orbit discovers and organizes. Orbit never fabricates content.
 * Students discuss real content from trusted sources inside UNIBUD.
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
    vibe: "visual",
    isAcademic: false,
    sources: [
      { name: "YouTube", label: "Open on YouTube", url: "https://www.youtube.com", icon: Youtube },
      { name: "Instagram", label: "Open on Instagram", url: "https://www.instagram.com", icon: Camera },
      { name: "Behance", label: "Open on Behance", url: "https://www.behance.net", icon: Globe },
      { name: "TikTok", label: "Open on TikTok", url: "https://www.tiktok.com", icon: Video },
    ],
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
    vibe: "immersive",
    isAcademic: false,
    sources: [
      { name: "Spotify", label: "Open on Spotify", url: "https://open.spotify.com", icon: Headphones },
      { name: "Apple Music", label: "Open on Apple Music", url: "https://music.apple.com", icon: Headphones },
      { name: "YouTube Music", label: "Open on YouTube", url: "https://music.youtube.com", icon: Youtube },
      { name: "SoundCloud", label: "Open on SoundCloud", url: "https://soundcloud.com", icon: Radio },
    ],
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
    vibe: "cinematic",
    isAcademic: false,
    sources: [
      { name: "YouTube", label: "Open on YouTube", url: "https://www.youtube.com/results?search_query=official+trailer", icon: Youtube },
      { name: "Netflix", label: "Open on Netflix", url: "https://www.netflix.com", icon: Tv },
      { name: "Disney+", label: "Open on Disney+", url: "https://www.disneyplus.com", icon: Tv },
      { name: "Crunchyroll", label: "Open on Crunchyroll", url: "https://www.crunchyroll.com", icon: Tv },
      { name: "IMDb", label: "Open on IMDb", url: "https://www.imdb.com", icon: Globe },
    ],
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
    vibe: "editorial",
    isAcademic: false,
    sources: [
      { name: "BBC News", label: "Open on BBC News", url: "https://www.bbc.co.uk/news", icon: Newspaper },
      { name: "Reuters", label: "Open on Reuters", url: "https://www.reuters.com", icon: Newspaper },
      { name: "The Guardian", label: "Open on The Guardian", url: "https://www.theguardian.com", icon: Newspaper },
      { name: "Google News", label: "Open on Google News", url: "https://news.google.com", icon: Globe },
    ],
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
    vibe: "energetic",
    isAcademic: false,
    sources: [
      { name: "BBC Sport", label: "Open on BBC Sport", url: "https://www.bbc.co.uk/sport", icon: Trophy },
      { name: "ESPN", label: "Open on ESPN", url: "https://www.espn.com", icon: Trophy },
      { name: "FIFA", label: "Open on FIFA", url: "https://www.fifa.com", icon: Trophy },
      { name: "NBA", label: "Open on NBA", url: "https://www.nba.com", icon: Trophy },
      { name: "Premier League", label: "Open on Premier League", url: "https://www.premierleague.com", icon: Trophy },
    ],
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
    vibe: "interactive",
    isAcademic: false,
    sources: [
      { name: "Steam", label: "Open on Steam", url: "https://store.steampowered.com", icon: Gamepad2 },
      { name: "Epic Games", label: "Open on Epic Games", url: "https://www.epicgames.com", icon: Gamepad2 },
      { name: "Twitch", label: "Open on Twitch", url: "https://www.twitch.tv", icon: Video },
      { name: "IGN", label: "Open on IGN", url: "https://www.ign.com", icon: Globe },
    ],
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
    vibe: "professional",
    isAcademic: false,
    sources: [
      { name: "LinkedIn", label: "Open on LinkedIn", url: "https://www.linkedin.com", icon: Briefcase },
      { name: "Indeed", label: "Open on Indeed", url: "https://www.indeed.com", icon: Briefcase },
      { name: "Glassdoor", label: "Open on Glassdoor", url: "https://www.glassdoor.com", icon: Briefcase },
    ],
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
    vibe: "scholarly",
    isAcademic: true,
    sources: [
      { name: "Google Scholar", label: "Open on Google Scholar", url: "https://scholar.google.com", icon: BookOpen },
      { name: "ResearchGate", label: "Open on ResearchGate", url: "https://www.researchgate.net", icon: BookOpen },
      { name: "arXiv", label: "Open on arXiv", url: "https://arxiv.org", icon: BookOpen },
      { name: "JSTOR", label: "Open on JSTOR", url: "https://www.jstor.org", icon: BookOpen },
    ],
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
    vibe: "conversational",
    isAcademic: false,
    sources: [
      { name: "Reddit", label: "Open on Reddit", url: "https://www.reddit.com", icon: MessageCircle },
      { name: "Quora", label: "Open on Quora", url: "https://www.quora.com", icon: MessageCircle },
    ],
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
    vibe: "festive",
    isAcademic: false,
    sources: [
      { name: "Eventbrite", label: "Open on Eventbrite", url: "https://www.eventbrite.com", icon: Calendar },
      { name: "Meetup", label: "Open on Meetup", url: "https://www.meetup.com", icon: Calendar },
    ],
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
    vibe: "commerce",
    isAcademic: false,
    sources: [],
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
    vibe: "competitive",
    isAcademic: false,
    sources: [],
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