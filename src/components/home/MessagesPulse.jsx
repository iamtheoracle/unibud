import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

function initials(name) {
  return (name || "U").trim().charAt(0).toUpperCase();
}

/**
 * MessagesPulse — surfaces unread conversations that Bud bumped up the layout.
 */
export default function MessagesPulse({ conversations = [], unreadCount = 0 }) {
  const navigate = useNavigate();
  const unread = (conversations || []).filter((c) => (c.unread_count || 0) > 0).slice(0, 3);

  if (!unread.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/12 flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-[14px] text-foreground">Messages</h2>
        </div>
        <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/12">
          {unreadCount} unread
        </span>
      </div>
      <div className="space-y-2.5">
        {unread.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/messages/${c.id}`)}
            className="w-full flex items-center gap-3 text-left spring-tap"
          >
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-[13px] font-bold text-primary">
                {initials(c.participant_name || c.name || c.title)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground truncate">
                {c.participant_name || c.name || c.title || "Conversation"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {c.last_message || c.preview || "Tap to open"}
              </p>
            </div>
            {(c.unread_count || 0) > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {c.unread_count}
              </span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}