import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Pin, Reply, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * LiveChatBar — floating real-time chat overlay for live streams.
 *
 * Features:
 *  - Floating glass panel at bottom of the screen
 *  - Collapsible (tap to expand/collapse)
 *  - Message input with emoji
 *  - Reactions on messages (heart)
 *  - Reply threading
 *  - Pinned messages bar
 *  - Auto-scroll to latest
 *
 * Props:
 *  - messages: { id, content, author_name, author_image, created_at, is_pinned, reply_to? }[]
 *  - onSend: (content) => void
 *  - onReact: (messageId, reaction) => void
 *  - onPin: (messageId) => void
 *  - pinnedMessage: message object or null
 *  - disabled: boolean
 */
export default function LiveChatBar({ messages = [], onSend, onReact, onPin, pinnedMessage, disabled = false }) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && expanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, expanded]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend?.(input.trim());
    setInput("");
    setReplyTo(null);
  };

  const visibleMessages = messages.slice(-50);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-auto"
          >
            <div className="max-h-[40vh] overflow-y-auto no-scrollbar px-3 pb-2" ref={scrollRef}>
              <AnimatePresence>
                {visibleMessages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onReact={onReact}
                    onPin={onPin}
                    onReply={() => setReplyTo(msg)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned message bar */}
      {pinnedMessage && !expanded && (
        <div className="pointer-events-auto px-3 pb-1">
          <div className="glass-strong rounded-[12px] px-3 py-2 flex items-center gap-2">
            <Pin className="w-3 h-3 text-primary flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[11px] text-foreground/80 truncate flex-1">
              <strong className="text-primary">{pinnedMessage.author_name}:</strong> {pinnedMessage.content}
            </span>
          </div>
        </div>
      )}

      {/* Reply context bar */}
      {replyTo && (
        <div className="pointer-events-auto px-3 pb-1">
          <div className="glass-strong rounded-[12px] px-3 py-2 flex items-center gap-2">
            <Reply className="w-3 h-3 text-muted-foreground flex-shrink-0" strokeWidth={2.5} />
            <span className="text-[11px] text-muted-foreground truncate flex-1">
              Replying to <strong className="text-foreground">{replyTo.author_name}</strong>
            </span>
            <button onClick={() => setReplyTo(null)} className="text-[10px] text-muted-foreground font-semibold">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSend} className="pointer-events-auto p-3 safe-area-pb">
        <div className="flex items-center gap-2 p-1.5 rounded-[22px] crystal-dock">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-9 h-9 rounded-full luxury-capsule flex items-center justify-center spring-tap flex-shrink-0"
          >
            <Smile className="w-4 h-4 text-foreground" strokeWidth={2} style={{ width: 18, height: 18 }} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Chat is disabled" : "Say something…"}
            disabled={disabled}
            className="flex-1 bg-transparent text-[13px] text-foreground outline-none h-9 min-w-0"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.9 }}
            disabled={!input.trim() || disabled}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center spring-tap flex-shrink-0",
              input.trim() ? "bg-primary" : "glass"
            )}
          >
            <Send className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} style={{ width: 16, height: 16, color: input.trim() ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }} />
          </motion.button>
        </div>
      </form>
    </div>
  );
}

function ChatMessage({ message, onReact, onPin, onReply }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="flex items-start gap-2 py-1.5 group"
      onPointerEnter={() => setShowActions(true)}
      onPointerLeave={() => setShowActions(false)}
    >
      {message.author_image ? (
        <img src={message.author_image} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" loading="lazy" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[9px] font-bold text-primary">{message.author_name?.[0]?.toUpperCase()}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-primary truncate">{message.author_name}</span>
          {message.created_at && (
            <span className="text-[8px] text-muted-foreground/60">
              {new Date(message.created_at).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
        </div>
        <p className="text-[12px] text-foreground/90 leading-relaxed break-words">{message.content}</p>
        {message.reactions?.heart > 0 && (
          <div className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-full glass">
            <Heart className="w-2.5 h-2.5 text-destructive fill-destructive" />
            <span className="text-[8px] font-bold text-muted-foreground">{message.reactions.heart}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="flex items-center gap-1 flex-shrink-0"
          >
            <button onClick={() => onReact?.(message.id, "heart")} className="w-6 h-6 rounded-full glass flex items-center justify-center spring-tap">
              <Heart className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
            </button>
            <button onClick={onReply} className="w-6 h-6 rounded-full glass flex items-center justify-center spring-tap">
              <Reply className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
            </button>
            <button onClick={() => onPin?.(message.id)} className="w-6 h-6 rounded-full glass flex items-center justify-center spring-tap">
              <Pin className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}