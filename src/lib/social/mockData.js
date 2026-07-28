/**
 * UNIBUD Social — realistic mock data for the Social ecosystem.
 *
 * Covers every social domain the ecosystem owns: profiles, posts, comments,
 * communities, clubs, organizations, messaging, following, reactions, media,
 * live activity, and discover. Used as a fallback when real entity data is
 * unavailable (demo mode / empty tenant) until real content exists.
 *
 * Context: a Nigerian campus (UNIBUD's primary market).
 */

const img = (id) => `https://images.unsplash.com/photo-${id}?w=400&q=80`;

// ─── Student & community profiles ───────────────────────────────────────────
export const SOCIAL_PROFILES_MOCK = [
  { id: "p1", full_name: "Adaeze Okafor", handle: "Computer Science · 300L", avatar_url: img("1494790108377-be9c29b29330"), is_verified: true, university: "University of Benin", bio: "Building things that matter. CS @ UNIBEN.", followers: 312, following: 184, posts: 47 },
  { id: "p2", full_name: "Chidi Nwosu", handle: "Mechanical Eng · 200L", avatar_url: img("1500648767791-00dcc994a43e"), is_verified: false, university: "University of Benin", bio: "Future robotics engineer ⚙️", followers: 208, following: 91, posts: 23 },
  { id: "p3", full_name: "Fatima Bello", handle: "Law · 400L", avatar_url: img("1438761681033-6461ffad8d80"), is_verified: true, university: "University of Benin", bio: "Justice Advocate | Moot Court 2025", followers: 540, following: 120, posts: 64 },
  { id: "p4", full_name: "Tunde Ajayi", handle: "Mass Comm · 100L", avatar_url: img("1507003211169-0a1dd7228f2d"), is_verified: false, university: "University of Benin", bio: "Storyteller. Campus radio host 🎙️", followers: 132, following: 210, posts: 18 },
  { id: "p5", full_name: "Dr. Ibrahim Sani", handle: "Physics Department · Lecturer", avatar_url: img("1560250097-0b93528c311a"), is_verified: true, university: "University of Benin", bio: "Quantum mechanics enthusiast. Office hours Thursdays.", followers: 1200, following: 40, posts: 12 },
];

// ─── Posts (QuadPost shape) ──────────────────────────────────────────────────
const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

export const SOCIAL_POSTS_MOCK = [
  {
    id: "s1", author_name: "Adaeze Okafor", author_handle: "Computer Science · 300L",
    author_image: img("1494790108377-be9c29b29330"), is_verified: true,
    content: "Just finished building my first full-stack project for CSC 301! Shoutout to Dr. Adeyemi for the amazing Data Structures lectures. Anyone interested in collaborating on the next assignment? #CSC301 #Teamwork",
    media_urls: [img("1517694712202-14dd9538aa97")], media_types: ["image"], type: "photo",
    reactions: { like: 18, celebrate: 4, love: 2, insightful: 1 }, likes_count: 25, comments_count: 8, shares_count: 3,
    created_date: minsAgo(60), university: "University of Benin",
  },
  {
    id: "s2", author_name: "Dr. Ibrahim Sani", author_handle: "Physics Department · Lecturer",
    author_image: img("1560250097-0b93528c311a"), is_verified: true,
    content: "Quantum Mechanics (PHY 203) extra tutorial session this Friday at 3PM in Lab 3. Bring your problem sets. All students welcome! #PHY203 #Tutorial",
    type: "event", reactions: { like: 32, celebrate: 8, helpful: 5, insightful: 3 }, likes_count: 48, comments_count: 12, shares_count: 8,
    created_date: minsAgo(120), university: "University of Benin",
  },
  {
    id: "s3", author_name: "UNIBUD Chess Club", author_handle: "Official Club",
    author_image: img("1529626455594-4ff0802cfb7e"), is_verified: true,
    content: "Inter-University Chess Championship this Saturday! Registration closes tomorrow. Top 3 winners get certificates and cash prizes. Sign up at the Student Centre. #ChessChampionship #InterUniversity",
    type: "club_update", reactions: { like: 20, celebrate: 8, love: 3 }, likes_count: 31, comments_count: 5, shares_count: 12,
    created_date: minsAgo(180), university: "University of Benin",
  },
  {
    id: "s4", author_name: "Fatima Bello", author_handle: "Law · 400L",
    author_image: img("1438761681033-6461ffad8d80"), is_verified: true,
    content: "Won the National Moot Court Championship today! 🏆 Grateful to my teammates and our coach. Hard work pays. #MootCourt #LawStudentLife",
    media_urls: [img("1521587760476-6c12a4b040da"), img("1517248135467-4c7edcad9954")], media_types: ["image", "image"], type: "achievement",
    reactions: { like: 64, celebrate: 22, love: 14, insightful: 6 }, likes_count: 106, comments_count: 19, shares_count: 11,
    created_date: minsAgo(240), university: "University of Benin",
  },
  {
    id: "s5", author_name: "Chidi Nwosu", author_handle: "Mechanical Eng · 200L",
    author_image: img("1500648767791-00dcc994a43e"), is_verified: false,
    content: "Our robotics team just got the arm to pick up the cup! 🦾 3 weeks of calibration finally paying off. Big thanks to everyone in the Robotics Club who stayed late.",
    media_urls: [img("1581091226825-a6a2a8a02a89")], media_types: ["image"], type: "photo",
    reactions: { like: 41, celebrate: 12, love: 5, funny: 2 }, likes_count: 60, comments_count: 7, shares_count: 4,
    created_date: minsAgo(320), university: "University of Benin",
  },
];

// ─── Comments ───────────────────────────────────────────────────────────────
export const SOCIAL_COMMENTS_MOCK = {
  s1: [
    { id: "c1", post_id: "s1", author_name: "Chidi Nwosu", author_image: img("1500648767791-00dcc994a43e"), content: "Count me in! I'll start on the tree rotations tonight.", created_date: minsAgo(55) },
    { id: "c2", post_id: "s1", author_name: "Dr. Ibrahim Sani", author_image: img("1560250097-0b93528c311a"), content: "Great work, Adaeze. Keep it up!", created_date: minsAgo(40) },
  ],
  s2: [
    { id: "c3", post_id: "s2", author_name: "Tunde Ajayi", author_image: img("1507003211169-0a1dd7228f2d"), content: "Will the recording be uploaded for those who can't attend?", created_date: minsAgo(110) },
  ],
};

// ─── Communities ────────────────────────────────────────────────────────────
export const SOCIAL_COMMUNITIES_MOCK = [
  { id: "cm1", name: "CSC 301 Study Group", description: "Collaborative learning for Data Structures & Algorithms.", members_count: 84, category: "Academic", cover_url: img("1456513080510-7bf3a84b82f8"), is_private: false },
  { id: "cm2", name: "UNIBEN Tech Circle", description: "Builders, hackers & founders on campus.", members_count: 312, category: "Technology", cover_url: img("1518770660439-4636190af475"), is_private: false },
  { id: "cm3", name: "Law Students Forum", description: "Moot court prep, case discussions & networking.", members_count: 156, category: "Academic", cover_url: img("1505664194779-8befce4ed7f3"), is_private: false },
  { id: "cm4", name: "JAMB 2026 Aspirants", description: "Prep, tips & moral support for prospective students.", members_count: 540, category: "Admissions", cover_url: img("1523050854058-8df90110c9f1"), is_private: false },
];

// ─── Clubs ───────────────────────────────────────────────────────────────────
export const SOCIAL_CLUBS_MOCK = [
  { id: "cl1", name: "UNIBUD Chess Club", category: "Strategy & Games", members_count: 64, cover_url: img("1529626455594-4ff0802cfb7e"), is_official: true, description: "Weekly matches + inter-university championships." },
  { id: "cl2", name: "Drama Society", category: "Arts & Culture", members_count: 48, cover_url: img("1503095396549-807759245b35"), is_official: true, description: "Stage productions every semester." },
  { id: "cl3", name: "Robotics Club", category: "Technology", members_count: 39, cover_url: img("1581091226825-a6a2a8a02a89"), is_official: false, description: "Building robots & entering competitions." },
  { id: "cl4", name: "Debate Club", category: "Academic", members_count: 52, cover_url: img("1517248135467-4c7edcad9954"), is_official: true, description: "Sharpening arguments, one round at a time." },
];

// ─── Organizations (student government bodies & associations) ─────────────────
export const SOCIAL_ORGANIZATIONS_MOCK = [
  { id: "o1", name: "Student Union Government (SUG)", type: "student_government", members_count: 28, cover_url: img("1517248135467-4c7edcad9954"), description: "The representative voice of UNIBUD students." },
  { id: "o2", name: "NANS UNIBUD Chapter", type: "association", members_count: 14, cover_url: img("1503095396549-807759245b35"), description: "National Association of Nigerian Students." },
  { id: "o3", name: "IEEE Student Branch", type: "association", members_count: 41, cover_url: img("1518770660439-4636190af475"), description: "Engineering students advancing technology for humanity." },
];

// ─── Messaging (conversations) ─────────────────────────────────────────────
export const SOCIAL_CONVERSATIONS_MOCK = [
  { id: "cv1", name: "Chidi Nwosu", avatar_url: img("1500648767791-00dcc994a43e"), last_message: "See you at the robotics lab?", last_at: minsAgo(8), unread: 2, is_group: false },
  { id: "cv2", name: "CSC 301 Study Group", avatar_url: img("1456513080510-7bf3a84b82f8"), last_message: "Dr. Adeyemi posted hints for the assignment", last_at: minsAgo(35), unread: 5, is_group: true },
  { id: "cv3", name: "Fatima Bello", avatar_url: img("1438761681033-6461ffad8d80"), last_message: "Congratulations again on the moot court!", last_at: minsAgo(180), unread: 0, is_group: false },
];

// ─── Following (Follow entity shape) ─────────────────────────────────────────
export const SOCIAL_FOLLOWING_MOCK = [
  { id: "f1", target_type: "person", target_id: "p3", target_name: "Fatima Bello", target_meta: { avatar_url: img("1438761681033-6461ffad8d80"), subtitle: "Law · 400L" } },
  { id: "f2", target_type: "club", target_id: "cl1", target_name: "UNIBUD Chess Club", target_meta: { avatar_url: img("1529626455594-4ff0802cfb7e"), subtitle: "Official Club" } },
  { id: "f3", target_type: "community", target_id: "cm2", target_name: "UNIBEN Tech Circle", target_meta: { avatar_url: img("1518770660439-4636190af475"), subtitle: "312 members" } },
  { id: "f4", target_type: "person", target_id: "p5", target_name: "Dr. Ibrahim Sani", target_meta: { avatar_url: img("1560250097-0b93528c311a"), subtitle: "Physics · Lecturer" } },
];

// ─── Reactions (definitions) ─────────────────────────────────────────────────
export const SOCIAL_REACTIONS_MOCK = [
  { key: "like", label: "Like", emoji: "👍" },
  { key: "love", label: "Love", emoji: "❤️" },
  { key: "celebrate", label: "Celebrate", emoji: "🎉" },
  { key: "insightful", label: "Insightful", emoji: "💡" },
  { key: "helpful", label: "Helpful", emoji: "🤝" },
  { key: "funny", label: "Funny", emoji: "😄" },
];

// ─── Live activity stream ───────────────────────────────────────────────────
export const SOCIAL_LIVE_ACTIVITY_MOCK = [
  { id: "la1", type: "post", actor_name: "Adaeze Okafor", actor_image: img("1494790108377-be9c29b29330"), text: "shared a new project in CSC 301", target: "#CSC301", minutes_ago: 4 },
  { id: "la2", type: "join", actor_name: "Chidi Nwosu", actor_image: img("1500648767791-00dcc994a43e"), text: "joined the Robotics Club", target: "Robotics Club", minutes_ago: 12 },
  { id: "la3", type: "reaction", actor_name: "Fatima Bello", actor_image: img("1438761681033-6461ffad8d80"), text: "celebrated your moot court post", target: "", minutes_ago: 23 },
  { id: "la4", type: "follow", actor_name: "Tunde Ajayi", actor_image: img("1507003211169-0a1dd7228f2d"), text: "started following you", target: "", minutes_ago: 47 },
  { id: "la5", type: "event", actor_name: "Dr. Ibrahim Sani", actor_image: img("1560250097-0b93528c311a"), text: "scheduled a PHY 203 tutorial", target: "Fri 3PM · Lab 3", minutes_ago: 75 },
  { id: "la6", type: "comment", actor_name: "Chidi Nwosu", actor_image: img("1500648767791-00dcc994a43e"), text: "commented on your assignment post", target: "", minutes_ago: 96 },
];

// ─── Discover bundle (fallback shapes matching real entities) ───────────────
export const DISCOVER_MOCK_BUNDLE = {
  posts: SOCIAL_POSTS_MOCK,
  events: [
    { id: "ev1", title: "Inter-University Chess Championship", date: "2026-08-02", location: "Student Centre", cover_url: img("1529626455594-4ff0802cfb7e") },
    { id: "ev2", title: "PHY 203 Extra Tutorial", date: "2026-08-01", location: "Lab 3", cover_url: img("1560250097-0b93528c311a") },
  ],
  clubs: SOCIAL_CLUBS_MOCK,
  communities: SOCIAL_COMMUNITIES_MOCK,
  opportunities: [
    { id: "op1", title: "Software Engineering Intern — Paystack", company: "Paystack", type: "internship", deadline: "2026-08-20" },
    { id: "op2", title: "Google Africa Developer Scholarship", company: "Google", type: "scholarship", deadline: "2026-09-05" },
  ],
  scholarships: [
    { id: "sc1", title: "NNPC Scholarship 2026", provider: "NNPC", amount: "₦200,000", deadline: "2026-09-30" },
  ],
  listings: [
    { id: "ml1", title: "Engineering Drawing Board — like new", price: 4500, status: "active", cover_url: img("1517248135467-4c7edcad9954") },
  ],
  lostFound: [
    { id: "lf1", title: "Found: Student ID near Faculty of Science", status: "open", cover_url: img("1503095396549-807759245b35") },
  ],
  challenges: [
    { id: "ch1", title: "30-Day Coding Challenge", participants: 124, status: "active" },
  ],
};