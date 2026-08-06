import {
  Camera, Sparkles, Newspaper, PlayCircle, Briefcase,
  MessageCircle, Gamepad2, Film, Trophy, Headphones, GraduationCap,
} from "lucide-react";

/**
 * Interest categories — inspired by familiar content platforms, but these
 * are interest tags only. They do NOT connect to any external platform.
 * They simply help students tell Bud what they enjoy so Bud can recommend
 * the right communities.
 */
export const INTEREST_CATEGORIES = [
  {
    id: "creators",
    label: "Creators",
    icon: Camera,
    color: "340 75% 57%",
    description: "Photography, lifestyle, fashion, travel, food, art",
    interests: ["Photography", "Lifestyle", "Fashion", "Travel", "Food", "Art"],
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Sparkles,
    color: "181 90% 47%",
    description: "Trending, comedy, dance, short videos, viral topics",
    interests: ["Trending", "Comedy", "Dance", "Short Videos", "Viral Topics", "Challenges"],
  },
  {
    id: "news_tech",
    label: "News & Tech",
    icon: Newspaper,
    color: "210 40% 55%",
    description: "News, politics, technology, business, science, finance",
    interests: ["News", "Politics", "Technology", "Business", "Science", "Finance"],
  },
  {
    id: "education",
    label: "Education",
    icon: PlayCircle,
    color: "0 84% 60%",
    description: "Education, podcasts, tutorials, reviews, documentaries",
    interests: ["Education", "Podcasts", "Tutorials", "Reviews", "Documentaries"],
  },
  {
    id: "careers",
    label: "Careers",
    icon: Briefcase,
    color: "210 88% 45%",
    description: "Careers, internships, entrepreneurship, networking",
    interests: ["Careers", "Internships", "Entrepreneurship", "Networking", "Professional Development"],
  },
  {
    id: "discussions",
    label: "Discussions",
    icon: MessageCircle,
    color: "16 90% 55%",
    description: "Discussions, communities, questions, advice, hobbies",
    interests: ["Discussions", "Questions", "Advice", "Hobbies"],
  },
  {
    id: "gaming",
    label: "Gaming",
    icon: Gamepad2,
    color: "270 75% 60%",
    description: "Console, mobile, PC, esports",
    interests: ["Console", "Mobile", "PC", "Esports"],
  },
  {
    id: "movies_tv",
    label: "Movies & TV",
    icon: Film,
    color: "0 77% 52%",
    description: "Movies, series, anime, K-Drama, Nollywood, Hollywood",
    interests: ["Movies", "Series", "Anime", "K-Drama", "Nollywood", "Hollywood"],
  },
  {
    id: "sports",
    label: "Sports",
    icon: Trophy,
    color: "142 71% 45%",
    description: "Football, basketball, F1, tennis, athletics, fitness",
    interests: ["Football", "Basketball", "Formula 1", "Tennis", "Athletics", "Fitness"],
  },
  {
    id: "music",
    label: "Music",
    icon: Headphones,
    color: "141 70% 48%",
    description: "Afrobeats, hip-hop, R&B, amapiano, gospel, classical",
    interests: ["Afrobeats", "Hip-Hop", "R&B", "Amapiano", "Gospel", "Classical", "Choirs", "Instruments"],
  },
  {
    id: "academics",
    label: "Academics",
    icon: GraduationCap,
    color: "217 91% 60%",
    description: "Assignments, research, scholarships, study groups",
    interests: ["Assignments", "Research", "Scholarships", "Study Groups", "Past Questions", "Exam Preparation"],
  },
];