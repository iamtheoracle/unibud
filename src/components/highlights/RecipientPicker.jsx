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
 * When a recipient is selected, the collection is made visible and
 * the user is navigated to the recipient's page with share context.
 */
export default function RecipientPicker({ onShare, folderName, shareUrl }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sharing, setSharing] = useState(false);

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

  const recipients = [
    ...conversations.map((c) => ({
      id: c.id,
      name: c.title || c.name || "Conversation",
      subtitle: "Direct Message",
      icon: MessageSquare,
      to: `/messages/${c.id}`,
    })),
    ...communities.map((c) => ({
      id: c.id,
      name: c.name,
      subtitle: "Community",
      icon: Users,
      to: `/community/${c.id}`,
    })),
    ...studyGroups.map((g) => ({
      id: g.id,
      name: g.name || g.subject || "Study Group",
      subtitle: "Study Group",
      icon: BookOpen,
      to: `/study-groups/${g.id}`,
    })),
    ...clubs.map((cl) => ({
      id: cl.id,
      name: cl.name,
      subtitle: "Club",
      icon: Building2,
      to: `/community/${cl.id}`,
    })),
  ];

  const filtered = recipients.filter((r) =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleShareTo = async (recipient) => {
    hapticTap();
    setSharing(true);
    try {
      if (onShare) await onShare();
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

      {/* Section label */}
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
        Share directly
      </p>

      {/* Recipients */}
      <div className="max-h-[260px] overflow-y-auto no-scrollbar space-y-0.5">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[12px] text-muted-foreground">
              {search ? "No recipients match your search." : "No recipients available yet."}
            </p>
          </div>
        ) : (
          filtered.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.button
                key={`${r.subtitle}-${r.id}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.25, ease: EASE }}
                onClick={() => handleShareTo(r)}
                disabled={sharing}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/30 spring-tap text-left disabled:opacity-50"
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
          })
        )}
      </div>
    </div>
  );
}