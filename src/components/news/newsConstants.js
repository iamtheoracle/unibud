export const NEWS_SUBCATEGORIES = [
  { id: "campus", label: "Campus", tags: ["campus", "university", "school"] },
  { id: "education", label: "Education", tags: ["education", "learning", "study"] },
  { id: "scholarships", label: "Scholarships", tags: ["scholarship", "grant"] },
  { id: "research", label: "Research", tags: ["research", "academic"] },
  { id: "technology", label: "Technology", tags: ["technology", "tech", "innovation"] },
  { id: "ai", label: "AI", tags: ["ai", "artificial-intelligence", "ml", "machine-learning"] },
  { id: "programming", label: "Programming", tags: ["programming", "coding", "development"] },
  { id: "business", label: "Business", tags: ["business", "entrepreneurship"] },
  { id: "finance", label: "Finance", tags: ["finance", "money", "economy"] },
  { id: "startups", label: "Startups", tags: ["startup", "venture"] },
  { id: "sports", label: "Sports", tags: ["sports", "football", "basketball"] },
  { id: "entertainment", label: "Entertainment", tags: ["entertainment", "celebrity"] },
  { id: "science", label: "Science", tags: ["science", "scientific"] },
  { id: "health", label: "Health", tags: ["health", "wellness", "medical"] },
  { id: "world", label: "World", tags: ["world", "international", "global"] },
  { id: "faith", label: "Faith", tags: ["faith", "religion", "spiritual"] },
];

export function matchSubcategory(article) {
  const tags = (article.hashtags || []).map((t) => t.toLowerCase().replace("#", ""));
  if (!tags.length) return null;
  for (const sub of NEWS_SUBCATEGORIES) {
    if (sub.tags.some((tag) => tags.includes(tag))) return sub;
  }
  return null;
}

export function estimateReadingTime(content) {
  const words = (content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function normalizeArticle(post) {
  const content = post.content || "";
  const firstLine = content.split("\n")[0]?.trim() || "";
  const title = firstLine.slice(0, 120) || "News Update";
  const body = content.slice(firstLine.length).trim();
  return {
    id: post.id,
    title,
    body,
    content,
    image: post.media_urls?.[0] || post.link_preview?.image_url || null,
    source: post.author_name || "Campus",
    created_date: post.created_date,
    hashtags: post.hashtags || [],
    url: post.link_preview?.url || null,
  };
}