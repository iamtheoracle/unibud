import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PenLine, Search, Heart, Send, ChevronUp, RefreshCw, Inbox } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useInfiniteFeed, getCachedFeed } from "@/hooks/useInfiniteFeed";
import PostCard from "@/components/quad/PostCard";
import PostSkeleton from "@/components/quad/PostSkeleton";
import NewPostsBanner from "@/components/quad/NewPostsBanner";
import EmptyState from "@/components/ui/EmptyState";
import StoryBar from "@/components/stories/StoryBar";
import PostComposer from "@/components/quad/PostComposer";
import {
  PeopleToKnow, CommunitiesForYou, TrendingOnCampus,
  EventsNearby, MarketplaceDeals, PodcastsForYou,
  CreatorsToFollow, ScholarshipsForYou, LiveNow,
} from "@/components/square/DiscoveryModules";

const EASE = [0.16, 1, 0.3, 1];
const SCROLL_KEY = "square_scroll_position";

/* ── Recommendation modules interleaved at intervals ── */
const MODULES = [
  { component: PeopleToKnow, afterPost: 2 },
  { component: TrendingOnCampus, afterPost: 5 },
  { component: CommunitiesForYou, afterPost: 8 },
  { component: EventsNearby, afterPost: 11 },
  { component: MarketplaceDeals, afterPost: 14 },
  { component: PodcastsForYou, afterPost: 17 },
  { component: CreatorsToFollow, afterPost: 20 },
  { component: ScholarshipsForYou, afterPost: 23 },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Square() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [composerOpen, setComposerOpen] = useState(false);
  const qc = useQueryClient();
  const sentinelRef = useRef(null);
  const touchStartY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(false);
  const lastFetchTime = useRef(Date.now());

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const university = user?.university || "";
  const query = university ? { university } : {};

  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    invalidateFeed,
  } = useInfiniteFeed({
    queryKey: ["quadFeed"],
    query,
    enabled: !!user || !!university || isDemoMode,
  });

  // Realtime subscription
  React.useEffect(() => {
    if (!user && !isDemoMode) return;
    const unsubscribe = base44.entities.QuadPost.subscribe((event) => {
      if (event.type === "create") {
        if (Date.now() - lastFetchTime.current > 5000) {
          setNewPostsCount((p) => p + 1);
          setBannerVisible(true);
        }
      }
      if (event.type === "update") {
        qc.setQueryData(["quadFeed"], (old) => {
          if (!old?.pages) return old;
          const pages = old.pages.map((p) => ({
            ...p,
            items: p.items.map((post) => post.id === event.data.id ? { ...post, ...event.data } : post),
          }));
          return { ...old, pages };
        });
      }
      if (event.type === "delete") {
        qc.setQueryData(["quadFeed"], (old) => {
          if (!old?.pages) return old;
          const pages = old.pages.map((p) => ({ ...p, items: p.items.filter((post) => post.id !== event.data.id) }));
          return { ...old, pages };
        });
      }
    });
    return unsubscribe;
  }, [qc, user, isDemoMode]);

  // Infinite scroll
  React.useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: "200px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Restore scroll
  React.useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const { y, ts } = JSON.parse(saved);
      if (Date.now() - ts < 30000) requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" }));
      sessionStorage.removeItem(SCROLL_KEY);
    }
  }, [posts]);

  React.useEffect(() => () => {
    try { sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ y: window.scrollY, ts: Date.now() })); } catch {}
  }, []);

  const handleRefresh = useCallback(async () => {
    setBannerVisible(false);
    setNewPostsCount(0);
    lastFetchTime.current = Date.now();
    await invalidateFeed();
  }, [invalidateFeed]);

  const handleTouchStart = (e) => { if (window.scrollY === 0) { touchStartY.current = e.touches[0].clientY; setIsPulling(true); } };
  const handleTouchMove = (e) => {
    if (!isPulling) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0 && window.scrollY === 0) setPullDistance(Math.min(diff * 0.5, 80));
  };
  const handleTouchEnd = () => { if (pullDistance > 60) handleRefresh(); setPullDistance(0); setIsPulling(false); };

  const displayPosts = isLoading ? getCachedFeed() : posts;
  const firstName = (user?.full_name || "Scholar").split(" ")[0];

  // Build interleaved feed
  const feedItems = [];
  if (displayPosts.length > 0 || !isLoading) {
    displayPosts.forEach((post, i) => {
      feedItems.push({ type: "post", post, index: i });
      const mod = MODULES.find((m) => m.afterPost === i + 1);
      if (mod) feedItems.push({ type: "module", Module: mod.component });
    });
  }

  return (
    <div className="min-h-screen pb-32 safe-area-pt">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground font-medium">{greeting()},</p>
              <h1 className="text-[22px] font-bold tracking-tight text-foreground leading-tight">{firstName}</h1>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => navigate("/discover")} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap" aria-label="Search">
                <Search className="w-[19px] h-[19px] text-foreground" strokeWidth={1.8} />
              </button>
              <button onClick={() => navigate("/notifications")} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap" aria-label="Activity">
                <Heart className="w-[19px] h-[19px] text-foreground" strokeWidth={1.8} />
              </button>
              <button onClick={() => navigate("/messages")} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap" aria-label="Messages">
                <Send className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Stories ── */}
      <StoryBar user={user} isDemoMode={isDemoMode || !user} />

      {/* ── Live Now ── */}
      <LiveNow />

      {/* ── Discovery Feed ── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative"
      >
        {pullDistance > 0 && (
          <div className="flex items-center justify-center overflow-hidden" style={{ height: pullDistance }}>
            <RefreshCw className={`w-5 h-5 text-foreground ${pullDistance > 60 ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
          </div>
        )}

        <NewPostsBanner count={newPostsCount} visible={bannerVisible} onClick={handleRefresh} />

        <div className="max-w-2xl mx-auto space-y-4 pb-8 pt-2">
          {isLoading && displayPosts.length === 0 ? (
            [0, 1, 2].map((i) => <PostSkeleton key={i} />)
          ) : displayPosts.length === 0 && !isDemoMode ? (
            <div className="glass rounded-[20px]">
              <EmptyState icon={Inbox} title="No posts yet" description="Be the first to share something with your campus" />
            </div>
          ) : (
            <>
              {feedItems.map((item, i) => {
                if (item.type === "module") {
                  const { Module } = item;
                  return <Module key={`mod-${i}`} />;
                }
                return <PostCard key={item.post.id} post={item.post} user={user} index={item.index} />;
              })}

              {hasNextPage && (
                <div ref={sentinelRef} className="py-4"><PostSkeleton /></div>
              )}

              {!hasNextPage && displayPosts.length > 0 && (
                <div className="flex flex-col items-center gap-1 py-6 text-center">
                  <ChevronUp className="w-5 h-5 text-muted-foreground/40" />
                  <p className="text-[11px] text-muted-foreground/60 font-medium">You're all caught up</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Compose FAB ── */}
      <button
        onClick={() => setComposerOpen(true)}
        className="fixed right-4 z-40 w-12 h-12 rounded-full glass-strong text-foreground flex items-center justify-center spring-tap premium-shadow"
        style={{ bottom: "calc(120px + env(safe-area-inset-bottom))" }}
        aria-label="Create post"
      >
        <PenLine className="w-5 h-5" strokeWidth={2} />
      </button>

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} user={user} />
    </div>
  );
}