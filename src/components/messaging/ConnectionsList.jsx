import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Settings } from "lucide-react";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ConnectionsList — premium glassmorphism messaging home.
 * Purple-to-teal gradient header, avatar story row, conversation list.
 * Matches the "Let's Stay Connected" reference design.
 */
export default function ConnectionsList({
  conversations = [],
  activeId,
  onSelect,
  onNewConversation,
  user,
}) {
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.last_message?.content || "").toLowerCase().includes(q)
    );
  });

  const storyAvatars = conversations.slice(0, 6);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Gradient header */}
      <div
        className="relative px-5 pt-[3.5vh] pb-5 safe-area-pt liquid-mirror"
        style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.18) 0%, rgba(94,234,212,0.10) 100%)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading font-bold text-[26px] text-foreground tracking-tight leading-tight">
            Let's Stay Connected
          </h1>
          <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
            <Settings className="w-[18px] h-[18px] text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="glass rounded-full h-[42px] flex items-center px-4 gap-2.5">
          <Search className="w-[17px] h-[17px] text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Avatar story row */}
        <div className="flex items-center gap-3.5 mt-4 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={onNewConversation}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="w-[56px] h-[56px] rounded-full border-[1.5px] border-dashed border-muted-foreground/30 flex items-center justify-center glass">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Add</span>
          </button>
          {storyAvatars.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="w-[56px] h-[56px] rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                {c.avatar_url ? (
                  <Image src={c.avatar_url} alt="" fittingType="fill" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-[18px] font-bold text-foreground">
                    {(c.title || "?").charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground font-medium max-w-[56px] truncate">
                {c.title?.split(" ")[0] || "User"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3">
        {filtered.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.03 }}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl spring-tap ${activeId === c.id ? "glass" : ""}`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-[52px] h-[52px] rounded-full overflow-hidden">
                {c.avatar_url ? (
                  <Image src={c.avatar_url} alt="" fittingType="fill" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-[18px] font-bold text-foreground">
                    {(c.title || "?").charAt(0)}
                  </div>
                )}
              </div>
              {c._hasUnread && (
                <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading font-semibold text-[15px] text-foreground truncate">
                  {c.title}
                </span>
                <span className="text-[11px] text-muted-foreground flex-shrink-0">
                  {formatTimestamp(c.last_message_at)}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                {c.last_message?.content || "No messages yet"}
              </p>
            </div>
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-[15px] font-heading font-semibold text-foreground mb-1">No conversations found</p>
            <p className="text-[13px] text-muted-foreground">Start a new conversation to connect.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just Now";
  if (diff < 3600000) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
  if (diff < 86400000) return "Yesterday";
  if (diff < 604800000) return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}