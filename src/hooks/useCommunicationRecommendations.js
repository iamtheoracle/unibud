import { useUnibudContext } from "@/lib/UnibudContext";
import { COMM_CATEGORIES } from "@/lib/communication/registry";

/**
 * useCommunicationRecommendations — Spark prioritization for conversations.
 * Ranks surfaces by real signals (unread messages, community activity) to
 * reduce notification overload and surface the right place to open first.
 */
export function useCommunicationRecommendations() {
  const ctx = useUnibudContext() || {};
  const score = (key) => {
    let s = 0;
    if (key === "dm") s += (ctx.unreadMessages || 0) * 1.2 + (ctx.conversations?.length || 0) * 0.1;
    if (key === "groupchats") s += (ctx.conversations?.length || 0) * 0.3 + 0.6;
    if (key === "communities" || key === "clubchats") s += (ctx.communityActivity || 0) * 0.5 + 0.8;
    if (key === "studygroups") s += 0.7;
    if (key === "announcements") s += 0.5;
    if (key === "stories") s += (ctx.quadPosts?.length || 0) * 0.2 + 0.4;
    return s;
  };
  return [...COMM_CATEGORIES]
    .map((c) => ({ key: c.key, s: score(c.key), live: c.live }))
    .filter((x) => x.live)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.key);
}