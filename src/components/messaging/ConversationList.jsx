import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PenSquare, Pin, BellOff, Archive, MoreVertical, MessageCircle } from "lucide-react";
import {
  CONVERSATION_TYPES, getConversationDisplayTitle, getConversationDisplayImage,
  getLastMessagePreview, hasUnreadMessages, formatRelativeTime,
} from "./messagingConstants";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "groups", label: "Groups" },
  { key: "direct", label: "Direct" },
  { key: "archived", label: "Archived" },
];

export default function ConversationList({
  conversations, isLoading, activeId, onSelect, user,
  filter, setFilter, togglePin, toggleMute, toggleArchive, onNewConversation,
}) {
  const [search, setSearch] = useState("");
  const [menuConvId, setMenuConvId] = useState(null);

  const filtered = search
    ? conversations.filter((c) => {
        const q = search.toLowerCase();
        return (
          getConversationDisplayTitle(c, user?.id).toLowerCase().includes(q) ||
          (getLastMessagePreview(c) || "").toLowerCase().includes(q)
        );
      })
    : conversations;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-12 pb-3 glass border-b border-border/20 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Messages</h1>
            <p className="text-[12px] text-muted-foreground font-medium">Campus communication</p>
          </div>
          <button onClick={onNewConversation} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center spring-tap gold-glow">
            <PenSquare className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full bg-card border border-border/40 text-[13px] outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={"px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap " +
                (filter === f.key ? "bg-foreground text-background soft-shadow" : "bg-card text-muted-foreground border border-border/40")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-12 h-12 rounded-full shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 rounded-full shimmer" />
                  <div className="h-2.5 w-3/4 rounded-full shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <ListEmptyState onNewConversation={onNewConversation} />
        ) : (
          <AnimatePresence>
            {filtered.map((conv, i) => {
              const isActive = conv.id === activeId;
              const unread = hasUnreadMessages(conv, user?.id);
              const typeMeta = CONVERSATION_TYPES[conv.type] || CONVERSATION_TYPES.direct;
              const Icon = typeMeta.icon;
              const title = getConversationDisplayTitle(conv, user?.id);
              const image = getConversationDisplayImage(conv, user?.id);

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                  className={"relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors spring-tap " +
                    (isActive ? "bg-primary/8" : "hover:bg-muted/50")}
                  onClick={() => onSelect(conv.id)}
                >
                  <div className="relative shrink-0">
                    {image ? (
                      <img src={image} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
                      </div>
                    )}
                    {unread && (
                      <div className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={"font-semibold text-[14px] truncate " + (unread ? "text-foreground" : "text-foreground/80")}>
                          {title}
                        </span>
                        {conv.is_pinned && <Pin className="w-3 h-3 text-muted-foreground shrink-0" />}
                        {conv.is_muted && <BellOff className="w-3 h-3 text-muted-foreground shrink-0" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatRelativeTime(conv.last_message_at || conv.created_date)}
                      </span>
                    </div>
                    <p className={"text-[12px] truncate mt-0.5 " + (unread ? "text-foreground/70 font-medium" : "text-muted-foreground")}>
                      {getLastMessagePreview(conv)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuConvId(menuConvId === conv.id ? null : conv.id); }}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {menuConvId === conv.id && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setMenuConvId(null); }} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-2 top-14 z-30 w-44 glass-strong rounded-2xl py-2 elevated-shadow"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MenuItem icon={Pin} label={conv.is_pinned ? "Unpin" : "Pin"} onClick={() => { togglePin(conv.id, conv.is_pinned); setMenuConvId(null); }} />
                        <MenuItem icon={BellOff} label={conv.is_muted ? "Unmute" : "Mute"} onClick={() => { toggleMute(conv.id, conv.is_muted); setMenuConvId(null); }} />
                        <MenuItem icon={Archive} label={conv.is_archived ? "Unarchive" : "Archive"} onClick={() => { toggleArchive(conv.id, conv.is_archived); setMenuConvId(null); }} />
                      </motion.div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-2 text-left text-[12px] hover:bg-muted flex items-center gap-2 transition-colors">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      {label}
    </button>
  );
}

function ListEmptyState({ onNewConversation }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-[20px] bg-primary/8 flex items-center justify-center mb-4">
        <MessageCircle className="w-7 h-7 text-primary" strokeWidth={1.8} />
      </div>
      <h3 className="font-heading font-semibold text-[15px] text-foreground mb-1">No conversations yet</h3>
      <p className="text-[12px] text-muted-foreground mb-4 max-w-[220px]">Start a conversation with a classmate, lecturer, or mentor.</p>
      <button onClick={onNewConversation} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap gold-glow">
        New Message
      </button>
    </div>
  );
}