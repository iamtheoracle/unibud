import { base44 } from "@/api/base44Client";

/**
 * Spark Communication Intelligence — powers the unified communication platform.
 * Summarizes, prioritizes, suggests replies, drafts, extracts action items,
 * translates, and protects against spam. Reuses the existing Conversation &
 * Message entities — no parallel data store.
 */

/** Heuristic prioritization of conversations (no LLM cost). */
export function prioritizeConversations(conversations, userId) {
  return [...(conversations || [])]
    .map((c) => {
      let score = 0;
      if (c.is_pinned) score += 30;
      if (c.is_muted) score -= 20;
      const me = (c.participants || []).find((p) => p.user_id === userId);
      const lastRead = me?.last_read_at;
      const lastAt = c.last_message_at || c.created_date;
      const hasUnread = lastRead && lastAt ? new Date(lastAt) > new Date(lastRead) : !!lastAt;
      if (hasUnread) score += 25;
      if (c.type === "direct") score += 12;
      if (c.type === "course" || c.type === "study_group") score += 8;
      if (["department", "faculty", "club"].includes(c.type)) score += 5;
      const ageHrs = lastAt ? (Date.now() - new Date(lastAt).getTime()) / 36e5 : 999;
      score += Math.max(0, 10 - ageHrs * 0.5);
      return { ...c, _score: score, _unread: hasUnread };
    })
    .sort((a, b) => b._score - a._score);
}

/** Unread conversations for digesting. */
export function unreadConversations(conversations, userId) {
  return prioritizeConversations(conversations, userId).filter((c) => c._unread);
}

/** Spark: summarize a single conversation's recent messages. */
export async function summarizeConversation(messages, conversation) {
  const recent = (messages || []).slice(-40).map((m) => `${m.author_name}: ${m.content || `[${m.type}]`}`);
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark, UNIBUD's communication intelligence. Summarize this conversation ("${conversation?.title || "chat"}").\n\n` +
      `Return JSON: { summary (2-4 sentences), action_items (up to 6, each a short task), key_decisions (up to 4), tone (one word), participants_to_follow_up (array of names) }.\n\nMessages:\n${recent.join("\n")}`,
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        action_items: { type: "array", items: { type: "string" } },
        key_decisions: { type: "array", items: { type: "string" } },
        tone: { type: "string" },
        participants_to_follow_up: { type: "array", items: { type: "string" } },
      },
    },
  });
  return res;
}

/** Spark: one-call digest of all unread chats. */
export async function summarizeUnreadDigest(unreadList) {
  const previews = unreadList.slice(0, 12).map((c) => ({
    title: c.title || "Direct chat",
    last: c.last_message?.content || "",
    from: c.last_message?.author_name || "",
    type: c.type,
  }));
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark. The user has ${previews.length} unread conversations. Give a calm, scannable digest.\n` +
      `Return JSON: { headline (one sentence overview), priorities (up to 5 items: {chat, why_important}), can_wait (array of chat titles that are low priority), suggested_first (the single chat to open first) }.\n\nUnread:\n${JSON.stringify(previews)}`,
    response_json_schema: {
      type: "object",
      properties: {
        headline: { type: "string" },
        priorities: { type: "array", items: { type: "object", properties: { chat: { type: "string" }, why_important: { type: "string" } } } },
        can_wait: { type: "array", items: { type: "string" } },
        suggested_first: { type: "string" },
      },
    },
  });
  return res;
}

/** Spark: suggest 3 short replies to the latest message. */
export async function suggestReplies(conversation, lastMessage, userName) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark helping ${userName || "the user"} reply in "${conversation?.title || "chat"}". ` +
      `The last message was from ${lastMessage?.author_name || "someone"}: "${lastMessage?.content || ""}".\n` +
      `Suggest 3 short, natural reply options (as the user). Return JSON { replies: [string, string, string] }.`,
    response_json_schema: { type: "object", properties: { replies: { type: "array", items: { type: "string" } } } },
  });
  return res?.replies || [];
}

/** Bud: draft a message from an intent (never sends automatically). */
export async function draftMessage(conversation, intent, userName) {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Bud, UNIBUD's companion. Draft a message for ${userName || "the user"} to send in "${conversation?.title || "chat"}".\n` +
      `Intent: "${intent}". Write in the user's voice, warm and concise. Return JSON { draft: string, alternative_tone: string }.`,
    response_json_schema: { type: "object", properties: { draft: { type: "string" }, alternative_tone: { type: "string" } } },
  });
  return res;
}

/** Spark: translate a message to a target language. */
export async function translateMessage(content, targetLang = "English") {
  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `Translate the following message to ${targetLang}. Return JSON { translation: string, detected_language: string }.\n\n"${content}"`,
    response_json_schema: { type: "object", properties: { translation: { type: "string" }, detected_language: { type: "string" } } },
  });
  return res;
}

/** Spark: semantic search across conversation previews. */
export async function smartSearchConversations(query, conversations) {
  const catalog = (conversations || []).map((c) => ({
    id: c.id, title: c.title || "Direct chat", type: c.type,
    last: c.last_message?.content || "", from: c.last_message?.author_name || "",
  }));
  const res = await base44.integrations.Core.InvokeLLM({
    prompt:
      `You are Spark. Rank the user's conversations by relevance to: "${query}". ` +
      `Return JSON { ranked_ids: [ids best-first], matched_topics: [up to 5] }.\n\nCatalog:\n${JSON.stringify(catalog.slice(0, 100))}`,
    response_json_schema: {
      type: "object",
      properties: {
        ranked_ids: { type: "array", items: { type: "string" } },
        matched_topics: { type: "array", items: { type: "string" } },
      },
    },
  });
  const ranked = res?.ranked_ids || [];
  const set = new Set(ranked);
  return [...ranked.map((id) => conversations.find((c) => c.id === id)).filter(Boolean),
    ...conversations.filter((c) => !set.has(c.id))];
}

/** Heuristic smart spam protection (no LLM cost). */
const SPAM_KEYWORDS = ["click here", "free money", "crypto giveaway", "win a prize", "send your details", "bit.ly", "claim now", "investment opportunity"];
export function detectSpam(message) {
  if (!message) return { spam: false, score: 0, reasons: [] };
  const text = (message.content || "").toLowerCase();
  const reasons = [];
  let score = 0;
  if (SPAM_KEYWORDS.some((k) => text.includes(k))) { reasons.push("promo keywords"); score += 40; }
  if (text === message.content && text.length > 30 && text === text.toUpperCase()) { reasons.push("all caps"); score += 15; }
  const links = (text.match(/https?:\/\//g) || []).length;
  if (links >= 3) { reasons.push("many links"); score += 25; }
  if (/\b(buy|sell|discount|offer|deal)\b/.test(text) && links > 0) { reasons.push("sales pitch"); score += 15; }
  return { spam: score >= 40, score, reasons };
}