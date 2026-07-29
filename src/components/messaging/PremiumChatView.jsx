import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, User, Send, Check, CheckCheck } from "lucide-react";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

/**
 * PremiumChatView — glassmorphism chat interface.
 * Gradient overlay, left-aligned received bubbles (glass),
 * right-aligned sent bubbles (gradient), pill-shaped composer.
 * Matches the reference chat design.
 */
export default function PremiumChatView({ conversation, messages = [], user, onBack, onSend }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const getAvatar = () => {
    if (conversation?.avatar_url) return conversation.avatar_url;
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Gradient overlay background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(167,139,250,0.06) 0%, transparent 30%, rgba(94,234,212,0.04) 100%)" }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 safe-area-pt border-b border-border/20 chrome-reflect">
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center spring-tap">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="relative flex-shrink-0">
          <div className="w-[38px] h-[38px] rounded-full overflow-hidden">
            {getAvatar() ? (
              <Image src={getAvatar()} alt="" fittingType="fill" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary text-[14px] font-bold text-foreground">
                {(conversation?.title || "?").charAt(0)}
              </div>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-semibold text-[15px] text-foreground truncate">
            {conversation?.title || "Chat"}
          </h2>
          <span className="text-[11px] text-success font-medium">Active now</span>
        </div>
        <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
          <Phone className="w-[17px] h-[17px] text-muted-foreground" />
        </button>
        <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
          <User className="w-[17px] h-[17px] text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        {messages.map((msg, i) => {
          const isOwn = msg.author_id === user?.id;
          const prevMsg = messages[i - 1];
          const showTime = !prevMsg || new Date(msg.created_date) - new Date(prevMsg.created_date) > 3 * 60 * 1000;

          return (
            <React.Fragment key={msg.id}>
              {showTime && (
                <div className="flex justify-center py-2">
                  <span className="text-[10px] font-medium text-muted-foreground/60">
                    {formatTime(msg.created_date)}
                  </span>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: EASE }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 text-[14px] leading-relaxed ${
                    isOwn
                      ? "text-white"
                      : "glass text-foreground"
                  }`}
                  style={
                    isOwn
                      ? {
                          background: "linear-gradient(135deg, rgba(167,139,250,0.25) 0%, rgba(94,234,212,0.15) 100%)",
                          borderRadius: "20px 20px 6px 20px",
                        }
                      : { borderRadius: "20px 20px 20px 6px" }
                  }
                >
                  <p>{msg.content}</p>
                  {isOwn && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <CheckCheck className="w-3 h-3 text-white/50" />
                    </div>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Composer */}
      <div className="relative z-10 px-4 py-3 safe-area-pb border-t border-border/20">
        <div className="frosted-mirror rounded-full h-[46px] flex items-center px-4 gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="Your Message..."
            className="flex-1 bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground/60"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center spring-tap disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
}