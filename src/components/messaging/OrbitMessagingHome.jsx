import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Settings, PenSquare, MessageCircle } from "lucide-react";
import { ORBIT_TABS, useConversations } from "@/hooks/useConversations";
import OrbitStoriesBar from "./OrbitStoriesBar";
import OrbitConversationCard from "./OrbitConversationCard";
import OrbitMessageSearch from "./OrbitMessageSearch";
const EASE = [0.16, 1, 0.3, 1];

/**
 * OrbitMessagingHome — premium messaging home with tabs, stories,
 * rich conversation cards, and universal search. No fake data.
 */
export default function OrbitMessagingHome({
  conversations, isLoading, activeId, onSelect, user,
  onTogglePin, onToggleMute, onToggleArchive, onNewConversation,
  filter, setFilter, onAvatarTap,
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Glass header */}
      <div className="px-5 pt-[3.5vh] pb-2 safe-area-pt sticky top-0 z-20 glass border-b border-border/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-heading font-bold text-[24px] text-foreground tracking-tight leading-tight">
              Messages
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">Orbit Communication Hub</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
              <Search className="w-[17px] h-[17px] text-muted-foreground" strokeWidth={2.2} />
            </button>
            <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
              <Settings className="w-[17px] h-[17px] text-muted-foreground" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <TabBar filter={filter} setFilter={setFilter} />
      </div>

      {/* Stories */}
      <OrbitStoriesBar user={user} />

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {isLoading ? (
          <LoadingSkeleton />
        ) : conversations.length === 0 ? (
          <EmptyState filter={filter} onNewConversation={onNewConversation} />
        ) : (
          <AnimatePresence>
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="space-y-0.5"
            >
              {conversations.map((conv, i) => (
                <OrbitConversationCard
                  key={conv.id}
                  conversation={conv}
                  user={user}
                  isActive={conv.id === activeId}
                  onSelect={onSelect}
                  onTogglePin={onTogglePin}
                  onToggleMute={onToggleMute}
                  onToggleArchive={onToggleArchive}
                  onAvatarTap={onAvatarTap}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* New conversation FAB */}
      <button
        onClick={onNewConversation}
        className="absolute bottom-4 right-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center spring-tap shadow-premium z-10"
        style={{ width: 52, height: 52 }}
      >
        <PenSquare className="w-5 h-5" strokeWidth={2.2} />
      </button>

      {/* Universal search overlay */}
      <OrbitMessageSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        conversations={conversations}
        user={user}
        onSelectConversation={onSelect}
      />
    </div>
  );
}

function TabBar({ filter, setFilter }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
      {ORBIT_TABS.map((tab) => {
        const isActive = filter === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`relative px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all spring-tap ${
              isActive
                ? "bg-foreground text-background"
                : "bg-card/60 text-muted-foreground border border-border/30"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="w-[50px] h-[50px] rounded-full shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 rounded-full shimmer" />
            <div className="h-2.5 w-3/4 rounded-full shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filter, onNewConversation }) {
  const messages = {
    all: { title: "No Conversations Yet", desc: "Start a conversation with classmates, lecturers, or study groups.", action: "Start a Conversation" },
    friends: { title: "No Friend Chats", desc: "Connect with classmates to start direct conversations.", action: "Find People" },
    communities: { title: "No Community Chats", desc: "Join a community to start chatting with members.", action: "Browse Communities" },
    academic: { title: "No Academic Chats", desc: "Your course and study group conversations will appear here.", action: "Explore Courses" },
    marketplace: { title: "No Marketplace Chats", desc: "Conversations with buyers and sellers will appear here.", action: "Browse Marketplace" },
    requests: { title: "No Message Requests", desc: "When someone reaches out to you for the first time, it will appear here.", action: null },
    archived: { title: "No Archived Chats", desc: "Conversations you archive will appear here.", action: null },
  };
  const msg = messages[filter] || messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="crystal-bloom mb-5"
      >
        <div className="w-16 h-16 rounded-[20px] glass-card flex items-center justify-center edge-light">
          <MessageCircle className="w-7 h-7 text-muted-foreground/60" strokeWidth={1.6} />
        </div>
      </motion.div>
      <h3 className="font-heading font-semibold text-[15px] text-foreground mb-1.5">{msg.title}</h3>
      <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[240px] mb-5">{msg.desc}</p>
      {msg.action && (
        <button onClick={onNewConversation} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
          {msg.action}
        </button>
      )}
    </div>
  );
}