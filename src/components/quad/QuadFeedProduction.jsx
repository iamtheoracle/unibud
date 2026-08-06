import React, { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal,
  Users,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { Image } from "@/components/ui/image";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const PAGE_SIZE = 10;

/**
 * QuadFeedProduction — production-ready social feed for the Quad.
 * Connects to QuadPost entity with infinite scroll, pull-to-refresh,
 * and proper loading/empty/error/offline states.
 *
 * Props:
 *  - onPostPress: (post) => void
 *  - onProfilePress: (userId) => void
 *  - onCompose: () => void
 */
export default function QuadFeedProduction({ onPostPress, onProfilePress, onCompose }) {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [page, setPage] = useState(0);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const {
    data: posts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["quad", "posts", "feed"],
    queryFn: () => base44.entities.QuadPost.list("-created_date", PAGE_SIZE),
    enabled: isOnline,
  });

  // Sync initial data
  React.useEffect(() => {
    if (posts) {
      setAllPosts(posts);
      setHasMore(posts.length === PAGE_SIZE);
      setPage(0);
    }
  }, [posts]);

  // Infinite scroll observer
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    try {
      const more = await base44.entities.QuadPost.list("-created_date", PAGE_SIZE, nextPage * PAGE_SIZE);
      if (more.length === 0) {
        setHasMore(false);
      } else {
        setAllPosts((prev) => [...prev, ...more]);
        setPage(nextPage);
        setHasMore(more.length === PAGE_SIZE);
      }
    } catch (e) {
      setHasMore(false);
    }
  }, [hasMore, isLoading, page]);

  // Intersection observer for infinite scroll
  React.useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.5 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["quad", "posts"] });
  }, [queryClient]);

  const state = !isOnline ? "offline" : isLoading && allPosts.length === 0 ? "loading" : isError && allPosts.length === 0 ? "error" : allPosts.length === 0 ? "empty" : "ready";

  return (
    <ProductionState
      state={state}
      onRetry={refetch}
      onRefresh={handleRefresh}
      skeleton={<FeedSkeleton />}
      error="Couldn't load your feed. Please try again."
      emptyState={{
        icon: Users,
        title: "Your Quad is quiet",
        description: "Be the first to share something with your campus. Posts, photos, polls — it's all yours.",
        action: onCompose && (
          <button
            onClick={onCompose}
            className="px-5 h-10 rounded-full bg-primary text-[13px] font-bold text-primary-foreground active:scale-95 transition-transform"
          >
            Create Post
          </button>
        ),
      }}
    >
      <div className="space-y-3 pb-24">
        {allPosts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            onPress={() => onPostPress?.(post)}
            onProfilePress={() => onProfilePress?.(post.created_by_id)}
          />
        ))}

        {/* Infinite scroll loader */}
        {hasMore && (
          <div ref={loaderRef} className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && allPosts.length > 0 && (
          <div className="flex items-center justify-center py-6">
            <p className="text-[11px] text-muted-foreground">You're all caught up</p>
          </div>
        )}
      </div>
    </ProductionState>
  );
}

function PostCard({ post, onPress, onProfilePress }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setSaved(!saved);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[20px] bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3">
        <button onClick={onProfilePress} className="active:scale-95 transition-transform">
          <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex items-center justify-center">
            {post.author_image ? (
              <Image src={post.author_image} alt={post.author_name} fittingType="fill" className="w-full h-full" />
            ) : (
              <span className="text-[14px] font-bold text-muted-foreground">
                {(post.author_name || "?").charAt(0)}
              </span>
            )}
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-[12px] font-bold text-foreground truncate">{post.author_name}</p>
            {post.is_verified && (
              <svg className="w-3 h-3 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {formatRelativeTime(post.created_date)}
            {post.visibility && ` · ${post.visibility}`}
          </p>
        </div>
        <button className="w-7 h-7 flex items-center justify-center active:scale-90 transition-transform">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <button onClick={onPress} className="w-full text-left px-3 pb-3">
          <p className="text-[13px] text-foreground leading-relaxed line-clamp-4">{post.content}</p>
        </button>
      )}

      {/* Media */}
      {post.media_urls?.length > 0 && (
        <button onClick={onPress} className="w-full active:opacity-95 transition-opacity">
          <div className="relative w-full aspect-square bg-muted">
            <Image src={post.media_urls[0]} alt="Post media" fittingType="fill" className="w-full h-full" />
            {post.media_urls.length > 1 && (
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-black/60">
                <span className="text-[9px] font-bold text-white">+{post.media_urls.length - 1}</span>
              </div>
            )}
          </div>
        </button>
      )}

      {/* Poll */}
      {post.poll_data?.options?.length > 0 && (
        <div className="px-3 pb-3 space-y-1.5">
          {post.poll_data.question && (
            <p className="text-[13px] font-bold text-foreground mb-1">{post.poll_data.question}</p>
          )}
          {post.poll_data.options.map((option, i) => (
            <button
              key={option.id || i}
              onClick={onPress}
              className="w-full flex items-center justify-between p-2.5 rounded-[12px] bg-muted active:scale-[0.98] transition-transform"
            >
              <span className="text-[12px] font-medium text-foreground">{option.text}</span>
              <span className="text-[11px] font-bold text-muted-foreground">{option.votes || 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 py-2.5 border-t border-border/30">
        <ActionButton icon={Heart} label={likeCount} active={liked} activeColor="text-destructive" onClick={handleLike} />
        <ActionButton icon={MessageCircle} label={post.comments_count || 0} onClick={onPress} />
        <ActionButton icon={Share2} label="" onClick={(e) => e.stopPropagation()} />
        <div className="flex-1" />
        <ActionButton icon={Bookmark} label="" active={saved} activeColor="text-primary" onClick={handleSave} />
      </div>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, label, active, activeColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-full active:scale-90 transition-transform"
    >
      <Icon
        className={`w-4 h-4 ${active ? activeColor : "text-muted-foreground"} ${active && Icon === Heart ? "fill-current" : ""}`}
        strokeWidth={2.2}
      />
      {label !== "" && label > 0 && (
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      )}
    </button>
  );
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-[20px] bg-card shadow-sm overflow-hidden animate-pulse">
          <div className="flex items-center gap-2.5 p-3">
            <div className="w-9 h-9 rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 rounded-full bg-muted" />
              <div className="h-2 w-14 rounded-full bg-muted" />
            </div>
          </div>
          <div className="px-3 pb-3 space-y-1.5">
            <div className="h-2.5 w-full rounded-full bg-muted" />
            <div className="h-2.5 w-3/4 rounded-full bg-muted" />
          </div>
          <div className="w-full aspect-square bg-muted" />
          <div className="flex gap-3 p-3">
            <div className="w-4 h-4 rounded-full bg-muted" />
            <div className="w-4 h-4 rounded-full bg-muted" />
            <div className="w-4 h-4 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}