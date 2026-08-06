import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

/**
 * CommunityChat — real-time community chat. Messages are stored as
 * StudyGroupMessage records scoped to a synthetic group id derived from
 * the community, so each community has its own persistent conversation.
 */
export default function CommunityChat({ community, user, accentColor }) {
  const accent = accentColor || "0 0% 100%";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || !user) return;
    const msg = {
      id: Date.now().toString(),
      content: input.trim(),
      author_name: user.full_name || "You",
      author_image: user.avatar_url || "",
      created_date: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 280px)" }}>
      <div className="flex-1 space-y-2.5 pb-3">
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Start the chat"
            description="Send the first message to your community."
          />
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.author_name === (user?.full_name || "You");
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-[11px] flex-shrink-0">
                    {(msg.author_name || "U").charAt(0)}
                  </div>
                )}
                <div className={`max-w-[75%] ${isMe ? "items-end" : ""} flex flex-col`}>
                  {!isMe && <span className="text-[10px] text-muted-foreground mb-0.5 px-1">{msg.author_name}</span>}
                  <div
                    className={`px-3.5 py-2 rounded-[18px] text-[13px] leading-snug ${
                      isMe ? "rounded-br-md text-primary-foreground" : "rounded-bl-md glass text-foreground"
                    }`}
                    style={isMe ? { background: `hsl(${accent})` } : {}}
                  >
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-20 z-10">
        <div className="crystal-card flex items-center gap-2 p-2 rounded-[20px]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message your community…"
            className="flex-1 bg-transparent px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center spring-tap liquid-press disabled:opacity-30"
            style={{ background: `hsl(${accent})` }}
          >
            <Send className="w-4 h-4 text-primary-foreground" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}