import React from "react";
import { MessageCircle, Inbox } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";
import { Link } from "react-router-dom";

const DEMO_CONVERSATIONS = [
  { id: "d1", name: "Chioma Eze", last_message: "Are you joining the study group tomorrow?", unread_count: 2, avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", created_date: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "d2", name: "CSC 302 Study Group", last_message: "David: I've uploaded the past questions PDF", unread_count: 5, avatar_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&q=80", created_date: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "d3", name: "Dr. Adeyemi", last_message: "Sure, I'll review your assignment this evening.", unread_count: 0, avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80", created_date: new Date(Date.now() - 60 * 60000).toISOString() },
];

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return "now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h";
  return Math.floor(diff / 86400000) + "d";
}

export default function MessagesPreview({ title = "Messages" }) {
  const { isDemoMode } = useDemoMode();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { data: realConversations, isLoading } = useQuery({
    queryKey: ["connectMessages", user?.id],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list("-last_message_at", 30);
      return all.filter(
        (c) => !c.is_archived && c.participants?.some((p) => p.user_id === user?.id)
      );
    },
    enabled: !isDemoMode && !!user,
  });

  const conversations = isDemoMode
    ? DEMO_CONVERSATIONS
    : (realConversations || []).slice(0, 5).map((c) => {
        const otherParticipant = (c.participants || []).find((p) => p.user_id !== user?.id) || (c.participants || [])[0];
        const lastMsg = c.last_message || {};
        const myParticipant = (c.participants || []).find((p) => p.user_id === user?.id);
        const isUnread = c.last_message_at && (!myParticipant?.last_read_at || new Date(c.last_message_at) > new Date(myParticipant.last_read_at));
        return {
          id: c.id,
          name: c.type === "direct" ? (otherParticipant?.name || c.title || "Conversation") : (c.title || "Group"),
          last_message: lastMsg.content || "",
          unread_count: isUnread ? 1 : 0,
          avatar_url: otherParticipant?.image || c.avatar_url || "",
          created_date: c.last_message_at || c.created_date,
        };
      });

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-[16px] text-foreground">{title}</h3>
        </div>
      </div>
      {isLoading && !isDemoMode ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-[68px] rounded-[20px] shimmer" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
          <EmptyState icon={Inbox} title="No messages yet" description="Your conversations will appear here" action={<Link to="/messages" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">Open Messages</Link>} />
        </div>
      ) : (
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden">
          {conversations.map((c, i) => (
            <motion.button
              key={c.id || i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className={"w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors text-left " + (i < conversations.length - 1 ? "border-b border-border/30" : "")}
            >
              <div className="relative flex-shrink-0">
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt={c.name} className="w-11 h-11 rounded-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm">{(c.name || "U").charAt(0)}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-heading font-semibold text-[13px] text-foreground truncate block">{c.name}</span>
                <p className={"text-[11px] truncate " + (c.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>{c.last_message || ""}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_date)}</span>
                {c.unread_count > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-primary rounded-full text-primary-foreground text-[10px] font-bold flex items-center justify-center">{c.unread_count}</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}