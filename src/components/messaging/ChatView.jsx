import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Search, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import MessageActions from "./MessageActions";
import OraclePanel from "./OraclePanel";
import TypingIndicator from "./TypingIndicator";
import { useMessages } from "@/hooks/useMessages";
import { useTypingStatus } from "@/hooks/useTypingStatus";
import { isSameDay, formatDateDivider, getConversationDisplayTitle } from "./messagingConstants";

export default function ChatView({ conversationId, user, onBack }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: conversation, isLoading: loadingConv } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => base44.entities.Conversation.get(conversationId),
    enabled: !!conversationId && !!user,
    refetchInterval: 15000,
  });

  // Subscribe to conversation updates (for typing, last_message, etc.)
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.entities.Conversation.subscribe((event) => {
      if (event.data?.id === conversationId) {
        queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      }
    });
    return unsubscribe;
  }, [conversationId, queryClient]);

  const {
    messages, loading, loadingMore, hasMore, loadMore,
    sendMessage, editMessage, deleteMessage, reactToMessage,
    pinMessage, replyTo, setReplyTo, editingId, setEditingId,
  } = useMessages(conversationId, user);

  const { setTyping, cleanup: cleanupTyping } = useTypingStatus(conversationId, user);

  const [actionMessage, setActionMessage] = useState(null);
  const [oracleOpen, setOracleOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editValue, setEditValue] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && isAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Maintain scroll position after load-more
  useEffect(() => {
    if (!loadingMore && prevScrollHeightRef.current > 0 && scrollRef.current) {
      const newHeight = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTop = newHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [loadingMore]);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => cleanupTyping();
  }, [cleanupTyping]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (el.scrollTop < 60 && hasMore && !loadingMore) {
      prevScrollHeightRef.current = el.scrollHeight;
      loadMore();
    }

    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    isAtBottomRef.current = atBottom;
    setShowScrollButton(!atBottom && messages.length > 6);
  }, [hasMore, loadingMore, loadMore, messages.length]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  };

  const typingUser = conversation?.typing && conversation.typing.user_id !== user?.id
    ? conversation.typing
    : null;

  const handleCopy = () => {
    if (actionMessage?.content) {
      navigator.clipboard.writeText(actionMessage.content);
      toast({ title: "Copied to clipboard" });
    }
  };

  const handleForward = () => {
    if (actionMessage?.content) {
      navigator.clipboard.writeText(actionMessage.content);
      toast({ title: "Message copied — paste in a conversation to forward" });
    }
  };

  const handleTranslate = async (msg) => {
    if (!msg?.content) return "No text to translate.";
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate this message into clear, natural English. If it is already in English, return it unchanged. Reply with ONLY the translation, no explanation.\n\n"""${msg.content}"""`,
      });
      return typeof res === "string" ? res.trim() : String(res || "");
    } catch {
      return "Translation unavailable right now.";
    }
  };

  const handleReport = async () => {
    if (!actionMessage || !user) return;
    try {
      await base44.entities.ContentReport.create({
        content_type: "quad_post",
        content_id: actionMessage.id,
        reporter_name: user.full_name || user.email || "Anonymous",
        reporter_id: user.id,
        reason: "other",
        description: "Reported from messaging: " + (actionMessage.content || "").slice(0, 100),
      });
      toast({ title: "Message reported to moderators" });
    } catch {
      toast({ title: "Failed to report message", variant: "destructive" });
    }
  };

  const handleEditStart = () => {
    setEditValue(actionMessage?.content || "");
    setEditingId(actionMessage?.id);
  };

  const handleEditSubmit = () => {
    if (editingId) {
      editMessage(editingId, editValue);
    }
  };

  const renderMessages = () => {
    const elements = [];
    let prevMsg = null;

    messages.forEach((msg, i) => {
      if (searchQuery && !msg.content?.toLowerCase().includes(searchQuery.toLowerCase())) {
        prevMsg = msg;
        return;
      }

      const msgDate = msg.created_date;
      if (!prevMsg || !isSameDay(msgDate, prevMsg.created_date)) {
        elements.push(
          <div key={"date_" + i} className="flex justify-center py-2">
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
              {formatDateDivider(msgDate)}
            </span>
          </div>
        );
      }

      const showAvatar = !prevMsg ||
        prevMsg.author_id !== msg.author_id ||
        new Date(msg.created_date) - new Date(prevMsg.created_date) > 5 * 60 * 1000;

      elements.push(
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.author_id === user?.id}
          showAvatar={showAvatar}
          showName={showAvatar && msg.author_id !== user?.id}
          user={user}
          onLongPress={() => setActionMessage(msg)}
          isEditing={editingId === msg.id}
          editValue={editValue}
          onEditChange={setEditValue}
          onEditSubmit={handleEditSubmit}
          onEditCancel={() => { setEditingId(null); setEditValue(""); }}
        />
      );

      prevMsg = msg;
    });

    return elements;
  };

  if (loadingConv) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        conversation={conversation}
        user={user}
        typingUser={typingUser}
        onBack={onBack}
        onCall={() => toast({ title: "Voice calls", description: "Ask Bud to schedule a call instead." })}
        onVideoCall={() => toast({ title: "Video calls", description: "Ask Bud to start a live session." })}
        onSearch={() => setSearchOpen(!searchOpen)}
        onInfo={() => setInfoOpen(true)}
      />

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden glass border-b border-border/20"
          >
            <div className="px-4 py-2.5 flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in conversation..."
                className="flex-1 bg-transparent text-[13px] outline-none"
                autoFocus
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-3"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <p className="text-[13px] text-muted-foreground mb-1">No messages yet</p>
            <p className="text-[11px] text-muted-foreground/70">Send the first message to start the conversation.</p>
          </div>
        ) : (
          <>
            {loadingMore && (
              <div className="flex justify-center py-3">
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              </div>
            )}
            {renderMessages()}
            {typingUser && <TypingIndicator name={typingUser.name} />}
          </>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-4 w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center soft-shadow spring-tap z-10"
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Composer */}
      <MessageComposer
        onSend={sendMessage}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editingMessage={editingId ? messages.find((m) => m.id === editingId) : null}
        editValue={editValue}
        onEditChange={setEditValue}
        onEditSubmit={handleEditSubmit}
        onEditCancel={() => { setEditingId(null); setEditValue(""); }}
        onOracleOpen={() => setOracleOpen(true)}
        onTyping={setTyping}
      />

      {/* Message Actions */}
      <MessageActions
        open={!!actionMessage}
        message={actionMessage}
        isOwn={actionMessage?.author_id === user?.id}
        onClose={() => setActionMessage(null)}
        onReact={(emoji) => reactToMessage(actionMessage.id, emoji)}
        onReply={() => setReplyTo(actionMessage)}
        onEdit={handleEditStart}
        onDelete={() => deleteMessage(actionMessage.id)}
        onPin={() => pinMessage(actionMessage.id)}
        onCopy={handleCopy}
        onForward={handleForward}
        onReport={handleReport}
        onTranslate={handleTranslate}
      />

      {/* Oracle Panel */}
      <OraclePanel
        open={oracleOpen}
        onClose={() => setOracleOpen(false)}
        messages={messages}
        conversationTitle={conversation ? getConversationDisplayTitle(conversation, user?.id) : ""}
      />

      {/* Conversation Info Sheet */}
      <AnimatePresence>
        {infoOpen && conversation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setInfoOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-[18px] text-foreground">Conversation Info</h2>
                <button onClick={() => setInfoOpen(false)} className="text-[13px] font-semibold text-muted-foreground">Close</button>
              </div>
              <div className="space-y-3">
                <div className="glass rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">Type</span>
                    <span className="text-[13px] font-semibold capitalize">{conversation.type || "Direct"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">Members</span>
                    <span className="text-[13px] font-semibold">{conversation.participants?.length || 2}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">Messages</span>
                    <span className="text-[13px] font-semibold">{messages?.length || 0}</span>
                  </div>
                  {conversation.created_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-muted-foreground">Created</span>
                      <span className="text-[13px] font-semibold">{new Date(conversation.created_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {conversation.participants && conversation.participants.length > 0 && (
                  <div className="glass rounded-2xl p-4">
                    <p className="text-[12px] text-muted-foreground mb-2">Participants</p>
                    <div className="space-y-2">
                      {conversation.participants.slice(0, 10).map((p) => (
                        <div key={p.id || p.user_id} className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 grid place-items-center text-[11px] font-bold text-primary">
                            {(p.name || p.full_name || "U").charAt(0)}
                          </div>
                          <span className="text-[13px] font-medium truncate">{p.name || p.full_name || "Unknown"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}