import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, PenLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import StoryBar from "@/components/stories/StoryBar";
import QuadFeed from "@/components/quad/QuadFeed";
import PostComposer from "@/components/quad/PostComposer";
import FollowingFeed from "@/components/quad/FollowingFeed";
import { useFollowing } from "@/hooks/useFollowing";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { useDemoMode } from "@/lib/DemoModeContext";

// Feed — UNIBUD's primary social experience (default landing).
// Social-first: Stories row + post feed. Real data only — no fabricated content.
// Profile is reached by tapping the avatar in the header.
export default function Feed() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [composerOpen, setComposerOpen] = useState(false);
  const [feedTab, setFeedTab] = useState("foryou");
  const { followingIds } = useFollowing();

  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const university = isDemoMode ? "" : user?.university || "";

  const handleRefresh = async () => {
    await refetchUser();
  };

  const avatar = user?.avatar_url || user?.image;
  const initial = (user?.full_name || user?.email || "U").charAt(0);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="pt-12 pb-3 px-5 flex items-center justify-between sticky top-0 z-20 glass border-b border-border/20"
        >
          {/* Avatar → Profile */}
          <button
            onClick={() => !isDemoMode && navigate("/me")}
            className="spring-tap"
            aria-label="Open profile"
          >
            {avatar ? (
              <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-[13px]">
                {initial}
              </div>
            )}
          </button>

          <h1 className="font-heading font-extrabold text-[20px] tracking-tight text-foreground">
            Feed
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/discover")}
              className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30"
              aria-label="Search and discover"
            >
              <Search className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
            </button>
            <button
              onClick={() => setComposerOpen(true)}
              className="w-10 h-10 rounded-full bg-primary soft-shadow flex items-center justify-center spring-tap"
              aria-label="Create post"
            >
              <PenLine className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2} />
            </button>
          </div>
        </motion.div>

        {/* Stories */}
        <StoryBar user={user} isDemoMode={isDemoMode} />

        {/* Composer trigger */}
        {!isDemoMode && (
          <div className="px-4 mb-3">
            <button
              onClick={() => setComposerOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[20px] bg-card soft-shadow border border-border/40 spring-tap text-left card-hover"
            >
              {avatar ? (
                <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-[12px]">
                  {initial}
                </div>
              )}
              <span className="flex-1 text-[13px] text-muted-foreground">Share something with your campus...</span>
              <PenLine className="w-4 h-4 text-primary" strokeWidth={1.8} />
            </button>
          </div>
        )}

        {/* Feed tabs */}
        <div className="px-4 pb-2 flex gap-2">
          {["foryou", "following"].map((t) => (
            <button
              key={t}
              onClick={() => setFeedTab(t)}
              className={"px-3.5 py-1.5 rounded-full text-[12px] font-semibold spring-tap " + (feedTab === t ? "bg-foreground text-background" : "bg-card text-muted-foreground border border-border/40")}
            >
              {t === "foryou" ? "For you" : "Following"}
            </button>
          ))}
        </div>

        {/* Feed — real data, real empty/loading states */}
        {feedTab === "foryou" ? (
          <QuadFeed user={user} university={university} />
        ) : (
          <FollowingFeed user={user} followingIds={followingIds} />
        )}

        {/* Post Composer */}
        <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} user={user} />
      </div>
    </PullToRefresh>
  );
}