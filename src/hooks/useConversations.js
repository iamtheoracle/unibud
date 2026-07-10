import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { hasUnreadMessages } from "@/components/messaging/messagingConstants";

export function useConversations(user) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Conversation.list("-last_message_at", 200);
      return all.filter(
        (c) =>
          !c.is_archived &&
          c.participants?.some((p) => p.user_id === user.id)
      );
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: archived } = useQuery({
    queryKey: ["conversations-archived", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Conversation.list("-last_message_at", 200);
      return all.filter(
        (c) =>
          c.is_archived &&
          c.participants?.some((p) => p.user_id === user.id)
      );
    },
    enabled: !!user && filter === "archived",
    refetchInterval: 30000,
  });

  useEffect(() => {
    const unsubscribe = base44.entities.Conversation.subscribe((event) => {
      queryClient.invalidateQueries(["conversations"]);
      queryClient.invalidateQueries(["conversations-archived"]);
    });
    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      queryClient.invalidateQueries(["conversations"]);
    });
    return unsubscribe;
  }, [queryClient]);

  const list = (filter === "archived" ? archived : conversations) || [];

  const filtered = list.filter((c) => {
    if (filter === "unread") return hasUnreadMessages(c, user?.id);
    if (filter === "groups") return c.type !== "direct";
    if (filter === "direct") return c.type === "direct";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_message_at || b.created_date || 0) - new Date(a.last_message_at || a.created_date || 0);
  });

  const updateConversation = useCallback(
    async (id, updates) => {
      await base44.entities.Conversation.update(id, updates);
      queryClient.invalidateQueries(["conversations"]);
    },
    [queryClient]
  );

  const togglePin = useCallback(
    (id, current) => updateConversation(id, { is_pinned: !current }),
    [updateConversation]
  );

  const toggleMute = useCallback(
    (id, current) => updateConversation(id, { is_muted: !current }),
    [updateConversation]
  );

  const toggleArchive = useCallback(
    (id, current) => updateConversation(id, { is_archived: !current }),
    [updateConversation]
  );

  return {
    conversations: sorted,
    isLoading,
    filter,
    setFilter,
    updateConversation,
    togglePin,
    toggleMute,
    toggleArchive,
  };
}