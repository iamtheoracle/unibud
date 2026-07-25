/**
 * Social Intelligence Engine — pure sub-engines powering the unified social
 * layer. Each engine is a small function over aggregated data:
 *   Identity · PermissionManager · SocialConnectors · FeedAggregator ·
 *   Trend · Recommendation · Notification · Event · Opportunity · Creator ·
 *   Safety · AIPersonalization
 */

export const SOCIAL_CONNECTORS = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "x", label: "X" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "discord", label: "Discord" },
  { key: "reddit", label: "Reddit" },
  { key: "youtube", label: "YouTube" },
  { key: "telegram", label: "Telegram" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "threads", label: "Threads" },
  { key: "pinterest", label: "Pinterest" },
  { key: "snapchat", label: "Snapchat" },
];

export function identityEngine(user, connections) {
  const granted = Object.keys(connections || {}).filter((k) => connections[k]);
  const interests = user?.data?.interests || user?.interests || [];
  return { id: user?.id, name: user?.full_name, interests, connections: granted };
}

export function permissionEngine(connections) {
  const granted = Object.keys(connections || {}).filter((k) => connections[k]);
  return {
    granted,
    canAggregate: granted.length > 0,
    canShare: true,
    revoked: Object.keys(connections || {}).filter((k) => !connections[k]),
  };
}

export function feedAggregator(sources) {
  const all = [];
  (sources || []).forEach((s) => (s.items || []).forEach((it) => all.push({ ...it, _type: s.type, _score: 0 })));
  return all.sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
}

const ENGAGE = (x) => (x.likes || 0) + (x.comments_count || 0) + (x.shares || 0);

export function trendEngine(feed) {
  const now = Date.now();
  return [...(feed || [])]
    .map((x) => ({ ...x, _score: ENGAGE(x) * (1 + 1 / (1 + (now - new Date(x.created_date || 0)) / 86400000)) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 12);
}

export function recommendationEngine(feed, identity) {
  const ints = (identity?.interests || []).map((s) => String(s).toLowerCase());
  return [...(feed || [])]
    .map((x) => {
      const text = `${x.title || ""} ${x.content || ""} ${x.description || ""} ${x.subject || ""}`.toLowerCase();
      let score = ENGAGE(x);
      ints.forEach((t) => { if (text.includes(t)) score += 5; });
      return { ...x, _score: score };
    })
    .sort((a, b) => b._score - a._score);
}

export function eventEngine(events) {
  const today = new Date().toISOString().split("T")[0];
  return [...(events || [])].filter((x) => x.date && x.date >= today).sort((a, b) => (a.date || "").localeCompare(b.date || "")).slice(0, 10);
}

export function opportunityEngine(opps, scholarships) {
  return [
    ...(opps || []).map((x) => ({ ...x, _kind: "opportunity" })),
    ...(scholarships || []).map((x) => ({ ...x, _kind: "scholarship" })),
  ];
}

export function creatorEngine(posts) {
  const map = {};
  (posts || []).forEach((p) => {
    const a = p.author_name || p.created_by_name || "Unknown";
    if (!map[a]) map[a] = { author: a, likes: 0, posts: 0 };
    map[a].likes += p.likes || 0;
    map[a].posts += 1;
  });
  return Object.values(map).sort((a, b) => b.likes - a.likes).slice(0, 8);
}

const SCAM = /(free\s+money|giveaway|claim\s+now|double\s+your|crypto\s+investment|urgent.{0,10}pay|click\s+here|bit\.ly|wa\.me\/\d|send\s+\d|investment\s+scheme)/i;
export function safetyEngine(feed) {
  return (feed || [])
    .filter((x) => SCAM.test(`${x.title || ""} ${x.content || ""} ${x.description || ""}`))
    .map((x) => ({ ...x, _flag: "suspicious" }));
}

export function notificationEngine({ feed, events, opportunities }) {
  const n = [];
  (opportunities || []).slice(0, 3).forEach((o) => n.push({ id: o.id, type: "opportunity", text: `New ${o.title || "opportunity"}` }));
  eventEngine(events).slice(0, 2).forEach((e) => n.push({ id: e.id, type: "event", text: `Upcoming: ${e.title || e.name || "event"}` }));
  (feed || []).slice(0, 2).forEach((f) => n.push({ id: f.id, type: "feed", text: `New ${f._type || "post"}: ${(f.title || f.content || "").slice(0, 40)}` }));
  return n.slice(0, 6);
}

export function personalizationEngine(feed, identity) {
  return recommendationEngine(feed, identity).slice(0, 15);
}