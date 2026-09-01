import { useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useTypingStatus(conversationId, user) {
  const timeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const setTyping = useCallback(
    (typing) => {
      if (!conversationId || !user) return;

      if (typing && !isTypingRef.current) {
        isTypingRef.current = true;
        base44.entities.Conversation.update(conversationId, {
          typing: {
            user_id: user.id,
            name: user.full_name || user.email || "Someone",
            timestamp: new Date().toISOString(),
          },
        }).catch(() => {});
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (typing) {
        timeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          base44.entities.Conversation.update(conversationId, {
            typing: null,
          }).catch(() => {});
        }, 4000);
      } else {
        isTypingRef.current = false;
        base44.entities.Conversation.update(conversationId, {
          typing: null,
        }).catch(() => {});
      }
    },
    [conversationId, user]
  );

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isTypingRef.current && conversationId) {
      base44.entities.Conversation.update(conversationId, {
        typing: null,
      }).catch(() => {});
    }
  }, [conversationId]);

  return { setTyping, cleanup };
}