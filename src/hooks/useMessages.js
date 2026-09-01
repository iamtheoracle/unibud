import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";

const PAGE_SIZE = 30;

export function useMessages(conversationId, user) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const scrollRef = useRef(null);
  const pendingSend = useRef(false);

  // Initial load
  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    setMessages([]);
    setHasMore(true);

    base44.entities.Message
      .filter({ conversation_id: conversationId, is_deleted: { $ne: true } }, "-created_date", PAGE_SIZE)
      .then((fetched) => {
        setMessages(fetched.reverse());
        setHasMore(fetched.length === PAGE_SIZE);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));

    // Mark as read
    if (user) {
      markAsReadInternal(conversationId, user);
    }
  }, [conversationId, user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversationId) return;

      if (event.type === "create") {
        setMessages((prev) => {
          if (prev.some((m) => m.id === event.data.id)) return prev;
          if (event.data.is_deleted) return prev;
          return [...prev, event.data];
        });
        if (event.data.author_id !== user?.id && user) {
          markAsReadInternal(conversationId, user);
        }
      } else if (event.type === "update") {
        setMessages((prev) =>
          prev.map((m) => (m.id === event.data.id ? event.data : m))
        );
      } else if (event.type === "delete") {
        setMessages((prev) => prev.filter((m) => m.id !== event.data.id));
      }
    });
    return unsubscribe;
  }, [conversationId, user?.id]);

  const markAsReadInternal = async (convId, currentUser) => {
    try {
      const conv = await base44.entities.Conversation.get(convId);
      if (!conv) return;
      const now = new Date().toISOString();
      const participants = (conv.participants || []).map((p) =>
        p.user_id === currentUser.id ? { ...p, last_read_at: now } : p
      );
      await base44.entities.Conversation.update(convId, { participants });

      const unread = await base44.entities.Message.filter(
        { conversation_id: convId, author_id: { $ne: currentUser.id } },
        "-created_date",
        50
      );
      const toUpdate = unread
        .filter((m) => !(m.read_by || []).includes(currentUser.id))
        .map((m) => ({
          id: m.id,
          read_by: [...(m.read_by || []), currentUser.id],
        }));
      if (toUpdate.length > 0) {
        await base44.entities.Message.bulkUpdate(toUpdate);
      }
    } catch {
      // Silent fail
    }
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    const oldestDate = messages[0]?.created_date;
    try {
      const older = await base44.entities.Message.filter(
        {
          conversation_id: conversationId,
          is_deleted: { $ne: true },
          created_date: { $lt: oldestDate },
        },
        "-created_date",
        PAGE_SIZE
      );
      setMessages((prev) => [...older.reverse(), ...prev]);
      setHasMore(older.length === PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, messages, loadingMore, hasMore]);

  const sendMessage = useCallback(
    async (content, type = "text", extra = {}) => {
      if (!conversationId || !user || pendingSend.current) return;
      if (type === "text" && !content?.trim()) return;

      pendingSend.current = true;
      const tempId = "temp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      const now = new Date().toISOString();

      const optimistic = {
        id: tempId,
        conversation_id: conversationId,
        content: content || "",
        type,
        author_name: user.full_name || user.email || "You",
        author_image: user.avatar_url || user.image || "",
        author_id: user.id,
        author_role: "student",
        created_date: now,
        reactions: {},
        read_by: [user.id],
        status: "pending",
        reply_to_id: replyTo?.id || null,
        reply_to_content: replyTo?.content || null,
        reply_to_author: replyTo?.author_name || null,
        ...extra,
      };

      setMessages((prev) => [...prev, optimistic]);
      setReplyTo(null);

      try {
        const created = await base44.entities.Message.create({
          conversation_id: conversationId,
          content: content || "",
          type,
          author_name: user.full_name || user.email || "You",
          author_image: user.avatar_url || user.image || "",
          author_id: user.id,
          author_role: "student",
          read_by: [user.id],
          reply_to_id: replyTo?.id || null,
          reply_to_content: replyTo?.content || null,
          reply_to_author: replyTo?.author_name || null,
          ...extra,
        });

        setMessages((prev) => prev.map((m) => (m.id === tempId ? created : m)));

        const preview =
          type === "text"
            ? content
            : type === "image"
            ? "📷 Photo"
            : type === "voice_note"
            ? "🎤 Voice note"
            : type === "video"
            ? "🎥 Video"
            : type === "document"
            ? "📄 Document"
            : type === "file"
            ? "📎 File"
            : type === "link"
            ? "🔗 Link"
            : type === "location"
            ? "📍 Location"
            : "📎 Attachment";

        await base44.entities.Conversation.update(conversationId, {
          last_message: {
            content: preview,
            author_name: user.full_name || "You",
            author_id: user.id,
            type,
            created_at: created.created_date,
          },
          last_message_at: created.created_date,
        });
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
        );
      } finally {
        pendingSend.current = false;
      }
    },
    [conversationId, user, replyTo]
  );

  const retrySend = useCallback(
    async (messageId) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: "pending" } : m))
      );
      try {
        const created = await base44.entities.Message.create({
          conversation_id: msg.conversation_id,
          content: msg.content,
          type: msg.type,
          media_url: msg.media_url,
          file_name: msg.file_name,
          file_size: msg.file_size,
          duration_seconds: msg.duration_seconds,
          author_name: msg.author_name,
          author_image: msg.author_image,
          author_id: msg.author_id,
          author_role: msg.author_role,
          read_by: [user.id],
          reply_to_id: msg.reply_to_id,
          reply_to_content: msg.reply_to_content,
          reply_to_author: msg.reply_to_author,
        });
        setMessages((prev) => prev.map((m) => (m.id === messageId ? created : m)));
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, status: "failed" } : m))
        );
      }
    },
    [messages, user]
  );

  const editMessage = useCallback(
    async (messageId, newContent) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: newContent, is_edited: true, edited_at: new Date().toISOString() }
            : m
        )
      );
      setEditingId(null);
      try {
        await base44.entities.Message.update(messageId, {
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString(),
        });
      } catch {
        // Revert handled by subscription
      }
    },
    []
  );

  const deleteMessage = useCallback(
    async (messageId) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      try {
        await base44.entities.Message.delete(messageId);
      } catch {
        // May reappear via subscription
      }
    },
    []
  );

  const reactToMessage = useCallback(
    async (messageId, emoji) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      const reactions = { ...(msg.reactions || {}) };
      const voters = reactions[emoji] || [];
      if (voters.includes(user?.id)) {
        reactions[emoji] = voters.filter((u) => u !== user?.id);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...voters, user?.id];
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
      );

      try {
        await base44.entities.Message.update(messageId, { reactions });
      } catch {
        // Revert via subscription
      }
    },
    [messages, user]
  );

  const pinMessage = useCallback(
    async (messageId) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      const newPinned = !msg.is_pinned;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_pinned: newPinned } : m))
      );
      try {
        await base44.entities.Message.update(messageId, { is_pinned: newPinned });
      } catch {
        // Revert via subscription
      }
    },
    [messages]
  );

  const markAsRead = useCallback(() => {
    if (user && conversationId) markAsReadInternal(conversationId, user);
  }, [conversationId, user]);

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    sendMessage,
    retrySend,
    editMessage,
    deleteMessage,
    reactToMessage,
    pinMessage,
    markAsRead,
    replyTo,
    setReplyTo,
    editingId,
    setEditingId,
    scrollRef,
  };
}