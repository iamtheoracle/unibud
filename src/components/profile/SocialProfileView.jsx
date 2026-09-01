import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, MessageCircle, Repeat2, FileText, Inbox } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HighlightShelf from "@/components/stories/HighlightShelf";
import PostCard from "@/components/quad/PostCard";
import EmptyState from "@/components/ui/EmptyState";
import { timeAgo } from "@/components/quad/quadConstants";

const TABS = [
  { key: "posts", label: "Posts", icon: FileText },
  { key: "replies", label: "Replies", icon: MessageCircle },
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "reposts", label: "Reposts", icon: Repeat2 },
];

export default function SocialProfileView({ user }) {
  const [tab, setTab] = useState("posts");

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["profilePosts", user?.id],
    queryFn: () => base44.entities.QuadPost.filter({ created_by_id: user.id }, "-created_date", 50),
    enabled: !!user,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["profileReplies", user?.id],
    queryFn: () => base44.entities.QuadComment.filter({ created_by_id: user.id }, "-created_date", 50),
    enabled: !!user,
  });

  const mediaPosts = useMemo(
    () => (posts || []).filter((p) => p.media_urls && p.media_urls.length > 0),
    [posts]
  );

  return (
    <div>
      {/* Highlights */}
      <HighlightShelf />

      {/* Tabs */}
      <div className="sticky top-0 z-10 glass border-y border-border/20">
        <div className="flex">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[12px] font-semibold transition-colors"
              >
                <t.icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground/60"}`} strokeWidth={active ? 2.2 : 1.8} />
                <span className={active ? "text-primary" : "text-muted-foreground/60"}>{t.label}</span>
                {active && (
                  <motion.div
                    layoutId="profileTabIndicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-8">
        <AnimatePresence mode="wait">
          {tab === "posts" && (
            <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {postsLoading ? (
                <p className="text-center text-[12px] text-muted-foreground py-8">Loading posts…</p>
              ) : (posts || []).length === 0 ? (
                <EmptyState icon={Inbox} title="No posts yet" description="Share your first update with your campus." />
              ) : (
                posts.map((p, i) => <PostCard key={p.id} post={p} user={user} index={i} />)
              )}
            </motion.div>
          )}

          {tab === "replies" && (
            <motion.div key="replies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {commentsLoading ? (
                <p className="text-center text-[12px] text-muted-foreground py-8">Loading replies…</p>
              ) : (comments || []).length === 0 ? (
                <EmptyState icon={MessageCircle} title="No replies yet" description="Your replies to posts will show up here." />
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-card border border-border/30 p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[12px] font-semibold text-foreground">{c.author_name}</span>
                      <span className="text-[10px] text-muted-foreground">· {timeAgo(c.created_date)}</span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {tab === "media" && (
            <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {mediaPosts.length === 0 ? (
                <EmptyState icon={ImageIcon} title="No media yet" description="Photos and videos you post will appear here." />
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {mediaPosts.flatMap((p) =>
                    (p.media_urls || []).map((url, i) => (
                      <div key={p.id + "-" + i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        {(p.media_types?.[i] === "video") ? (
                          <video src={url} className="w-full h-full object-cover" preload="metadata" />
                        ) : (
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}

          {tab === "reposts" && (
            <motion.div key="reposts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState icon={Repeat2} title="No reposts yet" description="Posts you repost will show up here." />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}