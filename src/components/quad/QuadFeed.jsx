import React, { useState, useEffect, useRef, useCallback } from "react";
import { Inbox, ChevronUp, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useInfiniteFeed, getCachedFeed } from "@/hooks/useInfiniteFeed";
import { base44 } from "@/api/base44Client";
import PostCard from "./PostCard";
import PostSkeleton from "./PostSkeleton";
import NewPostsBanner from "./NewPostsBanner";
import EmptyState from "@/components/ui/EmptyState";

const SCROLL_KEY = "quad_scroll_position";
const SCROLL_TIMEOUT = 30000; // 30s threshold for "new posts" banner

export default function QuadFeed({ user, university }) {
  const qc = useQueryClient();
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef(null);
  const sentinelRef = useRef(null);
  const lastFetchTime = useRef(Date.now());

  // Build query — filter by university if available
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
    enabled: !!user || !!university,
  });

  // Restore scroll position
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) {
      const { y, ts } = JSON.parse(saved);
      if (Date.now() - ts < SCROLL_TIMEOUT && scrollContainerRef.current) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: "instant" });
        });
      }
      sessionStorage.removeItem(SCROLL_KEY);
    }
  }, [posts]);

  // Save scroll position on unmount
  useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ y: window.scrollY, ts: Date.now() }));
      } catch {}
    };
  }, []);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Realtime subscription — new posts (banner) + live updates to visible posts
  // (likes/reactions/shares/pin) + removals, routed through one feed-level
  // subscription so cards re-render with fresh counts without a full refetch.
  useEffect(() => {
    const unsubscribe = base44.entities.QuadPost.subscribe((event) => {
      if (event.type === "create") {
        const now = Date.now();
        if (now - lastFetchTime.current > 5000) {
          setNewPostsCount((prev) => prev + 1);
          setBannerVisible(true);
        }
        return;
      }
      if (event.type === "update") {
        qc.setQueryData(["quadFeed"], (oldData) => {
          if (!oldData?.pages) return oldData;
          let changed = false;
          const pages = oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((p) => {
              if (p.id === event.data.id) { changed = true; return { ...p, ...event.data }; }
              return p;
            }),
          }));
          return changed ? { ...oldData, pages } : oldData;
        });
        return;
      }
      if (event.type === "delete") {
        qc.setQueryData(["quadFeed"], (oldData) => {
          if (!oldData?.pages) return oldData;
          const pages = oldData.pages.map((page) => ({
            ...page,
            items: page.items.filter((p) => p.id !== event.data.id),
          }));
          return { ...oldData, pages };
        });
      }
    });
    return unsubscribe;
  }, [qc]);

  const handleRefresh = useCallback(async () => {
    setBannerVisible(false);
    setNewPostsCount(0);
    lastFetchTime.current = Date.now();
    await invalidateFeed();
  }, [invalidateFeed]);

  // Pull-to-refresh (mobile touch)
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      handleRefresh();
    }
    setPullDistance(0);
    setIsPulling(false);
  };

  // Show cached posts while loading
  const displayPosts = isLoading ? getCachedFeed() : posts;

  return (
    <div
      ref={scrollContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: pullDistance }}
        >
          <RefreshCw
            className={`w-5 h-5 text-primary ${pullDistance > 60 ? "animate-spin" : ""}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}

      {/* New Posts Banner */}
      <NewPostsBanner
        count={newPostsCount}
        visible={bannerVisible}
        onClick={handleRefresh}
      />

      {/* Feed */}
      <div className="px-4 space-y-3 pb-8 max-w-2xl mx-auto">
        {isLoading && displayPosts.length === 0 ? (
          [0, 1, 2].map((i) => <PostSkeleton key={i} />)
        ) : displayPosts.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
            <EmptyState
              icon={Inbox}
              title="No posts yet"
              description="Be the first to share something with your campus community"
            />
          </div>
        ) : (
          <>
            {displayPosts.map((post, i) => (
              <PostCard key={post.id} post={post} user={user} index={i} />
            ))}

            {/* Infinite scroll sentinel */}
            {hasNextPage && (
              <div ref={sentinelRef} className="py-4">
                <PostSkeleton />
              </div>
            )}

            {/* End of feed */}
            {!hasNextPage && displayPosts.length > 0 && !isLoading && (
              <div className="flex flex-col items-center gap-1 py-6 text-center">
                <ChevronUp className="w-5 h-5 text-muted-foreground/40" />
                <p className="text-[11px] text-muted-foreground/60 font-medium">You're all caught up</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}