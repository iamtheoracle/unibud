import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { hasUnreadMessages, deriveCategory } from "@/components/messaging/messagingConstants";

export const ORBIT_TABS = [
  { key: "all", label: "All" },
  { key: "friends", label: "Friends" },
  { key: "communities", label: "Communities" },
  { key: "academic", label: "Academic" },
  { key: "marketplace", label: "Marketplace" },
  { key: "requests", label: "Requests" },
  { key: "archived", label: "Archived" },
];

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
          !c.is_request &&
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

  const { data: requests } = useQuery({
    queryKey: ["conversations-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Conversation.list("-last_message_at", 200);
      return all.filter(
        (c) =>
          c.is_request &&
          c.participants?.some((p) => p.user_id === user.id)
      );
    },
    enabled: !!user && filter === "requests",
    refetchInterval: 30000,
  });

  useEffect(() => {
    const unsubscribe = base44.entities.Conversation.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversations-archived"] });
      queryClient.invalidateQueries({ queryKey: ["conversations-requests"] });
    });
    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
    return unsubscribe;
  }, [queryClient]);

  const baseList = filter === "archived" ? (archived || []) : filter === "requests" ? (requests || []) : (conversations || []);

  const filtered = baseList.filter((c) => {
    if (filter === "archived" || filter === "requests") return true;
    if (filter === "friends") return deriveCategory(c) === "friend";
    if (filter === "communities") return deriveCategory(c) === "community";
    if (filter === "academic") return deriveCategory(c) === "academic";
    if (filter === "marketplace") return deriveCategory(c) === "marketplace";
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
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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

  const acceptRequest = useCallback(
    (id) => updateConversation(id, { is_request: false }),
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
    acceptRequest,
  };
}