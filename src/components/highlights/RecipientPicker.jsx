import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Search, Send, MessageSquare, Users, BookOpen, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * RecipientPicker — instant search across conversations, communities,
 * study groups, and clubs. Only real data — no fake recipients.
 *
 * When sharing to a conversation, a Message with the collection link is
 * sent, and for direct chats a targeted social notification is created.
 */
export default function RecipientPicker({ onShare, folderName, shareUrl }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sharing, setSharing] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 120000,
  });
  const { data: conversations = [] } = useQuery({
    queryKey: ["share-recipients-conversations"],
    queryFn: () => base44.entities.Conversation.list("-updated_date", 20),
    staleTime: 60000,
  });
  const { data: communities = [] } = useQuery({
    queryKey: ["share-recipients-communities"],
    queryFn: () => base44.entities.Community.list("-members_count", 10),
    staleTime: 60000,
  });
  const { data: studyGroups = [] } = useQuery({
    queryKey: ["share-recipients-study-groups"],
    queryFn: () => base44.entities.StudyGroup.list("-created_date", 10),
    staleTime: 60000,
  });
  const { data: clubs = [] } = useQuery({
    queryKey: ["share-recipients-clubs"],
    queryFn: () => base44.entities.Club.list("-members_count", 10),
    staleTime: 60000,
  });

  const q = search.toLowerCase();

  const sections = [
    {
      label: "Recent Conversations",
      icon: MessageSquare,
      items: conversations
        .filter((c) => !q || (c.title || c.name || "Conversation").toLowerCase().includes(q))
        .map((c) => ({
          id: c.id,
          name: c.title || c.name || "Conversation",
          subtitle: c.type === "group" ? "Group Chat" : "Direct Message",
          icon: MessageSquare,
          to: `/messages/${c.id}`,
          type: "conversation",
          raw: c,
        })),
    },
    {
      label: "Communities",
      icon: Users,
      items: communities
        .filter((c) => !q || c.name?.toLowerCase().includes(q))
        .map((c) => ({
          id: c.id,
          name: c.name,
          subtitle: "Community",
          icon: Users,
          to: `/community/${c.id}`,
          type: "community",
        })),
    },
    {
      label: "Study Groups",
      icon: BookOpen,
      items: studyGroups
        .filter((g) => !q || (g.name || g.subject || "Study Group").toLowerCase().includes(q))
        .map((g) => ({
          id: g.id,
          name: g.name || g.subject || "Study Group",
          subtitle: "Study Group",
          icon: BookOpen,
          to: `/study-groups/${g.id}`,
          type: "studyGroup",
        })),
    },
    {
      label: "Clubs",
      icon: Building2,
      items: clubs
        .filter((cl) => !q || cl.name?.toLowerCase().includes(q))
        .map((cl) => ({
          id: cl.id,
          name: cl.name,
          subtitle: "Club",
          icon: Building2,
          to: `/community/${cl.id}`,
          type: "club",
        })),
    },
  ].filter((s) => s.items.length > 0);

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);

  const handleShareTo = async (recipient) => {
    hapticTap();
    setSharing(true);
    try {
      if (onShare) await onShare();

      // For conversations: send a message with the share link
      if (recipient.type === "conversation" && user) {
        await base44.entities.Message.create({
          conversation_id: recipient.id,
          content: shareUrl,
          type: "link",
          author_name: user.full_name || user.email || "Student",
          author_id: user.id,
          link_preview: { url: shareUrl, title: folderName },
        });

        // For direct conversations: create a targeted notification
        const conv = recipient.raw;
        if (conv?.type === "direct") {
          const other = conv.participants?.find((p) => p.user_id !== user.id);
          if (other?.user_id) {
            await base44.entities.Notification.create({
              title: "Collection shared with you",
              message: `"${folderName}" was shared with you.`,
              type: "social",
              category: "social",
              user_id: other.user_id,
              link: shareUrl,
              icon: "Share2",
              source: "highlights",
              action: "shared_collection",
            });
          }
        }
      }

      if (shareUrl) {
        try { await navigator.clipboard?.writeText(shareUrl); } catch {}
      }

      toast({
        title: "Collection shared!",
        description: `"${folderName}" shared with ${recipient.name}.`,
      });
      navigate(recipient.to);
    } catch {
      toast({ title: "Couldn't share", description: "Please try again.", variant: "destructive" });
    } finally {
      setSharing(false);
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends, communities, groups…"
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Loading state */}
      {sharing && (
        <div className="flex items-center justify-center gap-2 py-6">
          <div className="w-5 h-5 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
          <span className="text-[12px] text-muted-foreground">Sharing collection…</span>
        </div>
      )}

      {/* Recipients by section */}
      {!sharing && (
        <div className="max-h-[280px] overflow-y-auto no-scrollbar">
          {totalItems === 0 ? (
            <div className="text-center py-8">
              <p className="text-[12px] text-muted-foreground">
                {search ? "No recipients match your search." : "No recipients available yet."}
              </p>
            </div>
          ) : (
            sections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.label} className="mb-3">
                  <div className="flex items-center gap-1.5 px-1 mb-1.5">
                    <SectionIcon className="w-3 h-3 text-muted-foreground/60" strokeWidth={2} />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {section.label}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((r, i) => {
                      const Icon = r.icon;
                      return (
                        <motion.button
                          key={`${r.type}-${r.id}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02, duration: 0.25, ease: EASE }}
                          onClick={() => handleShareTo(r)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/30 spring-tap text-left"
                        >
                          <div className="w-9 h-9 rounded-full glass-card grid place-items-center shrink-0">
                            <Icon className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-foreground truncate">{r.name}</p>
                            <p className="text-[11px] text-muted-foreground">{r.subtitle}</p>
                          </div>
                          <Send className="w-4 h-4 text-muted-foreground shrink-0" />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}