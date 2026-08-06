import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { hasUnreadMessages } from "@/components/messaging/messagingConstants";
import { prioritizeConversations, unreadConversations } from "./sparkComm";

const KEY = ["comm", "unified-inbox"];

/** Unified Smart Inbox — loads all conversations for the user, prioritized
 * by Spark heuristics, with unread digest and local search. Reuses the
 * existing Conversation entity (no parallel store). */
export function useSmartInbox() {
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: conversations, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const all = await base44.entities.Conversation.list("-last_message_at", 200);
      return all.filter((c) => !c.is_archived && c.participants?.some((p) => p.user_id === user?.id));
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const prioritized = useMemo(() => prioritizeConversations(conversations || [], user?.id), [conversations, user?.id]);
  const unread = useMemo(() => unreadConversations(conversations || [], user?.id), [conversations, user?.id]);
  const unreadCount = useMemo(
    () => (conversations || []).filter((c) => hasUnreadMessages(c, user?.id)).length,
    [conversations, user?.id]
  );

  const localSearch = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return prioritized;
    return (conversations || []).filter((c) => {
      const hay = [c.title, c.last_message?.content, c.last_message?.author_name, c.type].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  };

  return { user, conversations: prioritized, unread, unreadCount, isLoading, localSearch };
}