import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, Bookmark, Share2, Flag, Plus, Check, Music,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { REACTIONS, formatCount, timeAgo } from "@/components/quad/quadConstants";
import {
  getShortCategory, getShortReaction, setShortReaction,
  isShortBookmarked, toggleShortBookmark,
  isFollowingCreator, toggleFollowCreator,
} from "./shortConstants";
import ShortVideoPlayer from "./ShortVideoPlayer";
import ShortComments from "./ShortComments";
import ContentReportModal from "@/components/shared/ContentReportModal";

const SHORT_REACTIONS = REACTIONS.filter((r) => ["like", "celebrate", "helpful", "insightful"].includes(r.id));

export default function ShortVideoCard({ video, isActive, user, isDemoMode, _onOpenUpload }) {
  const [userReaction, setUserReaction] = useState(() => getShortReaction(video.id));
  const [bookmarked, setBookmarked] = useState(() => isShortBookmarked(video.id));
  const [following, setFollowing] = useState(() => isFollowingCreator(video.author_name));
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const longPressRef = useRef(null);
  const category = getShortCategory(video.category);

  const handleDoubleTap = useCallback(() => {
    if (userReaction) return;
    setUserReaction("like");
    setShortReaction(video.id, "like");
    setLikeAnimation(true);
    setTimeout(() => setLikeAnimation(false), 800);
    if (!isDemoMode) {
      const reactions = { ...video.reactions, like: (video.reactions?.like || 0) + 1 };
      base44.entities.ShortVideo.update(video.id, {
        reactions,
        likes_count: (video.likes_count || 0) + 1,
      }).catch(() => {});
    }
  }, [userReaction, video, isDemoMode]);

  const handleLike = useCallback(() => {
    if (userReaction) {
      // Remove reaction
      const reactions = { ...video.reactions };
      reactions[userReaction] = Math.max(0, (reactions[userReaction] || 0) - 1);
      setShortReaction(video.id, null);
      setUserReaction(null);
      if (!isDemoMode) {
        base44.entities.ShortVideo.update(video.id, {
          reactions,
          likes_count: Math.max(0, (video.likes_count || 0) - 1),
        }).catch(() => {});
      }
    } else {
      setUserReaction("like");
      setShortReaction(video.id, "like");
      setLikeAnimation(true);
      setTimeout(() => setLikeAnimation(false), 800);
      if (!isDemoMode) {
        const reactions = { ...video.reactions, like: (video.reactions?.like || 0) + 1 };
        base44.entities.ShortVideo.update(video.id, {
          reactions,
          likes_count: (video.likes_count || 0) + 1,
        }).catch(() => {});
      }
    }
  }, [userReaction, video, isDemoMode]);

  const handleReact = useCallback((reactionId) => {
    setShowReactionPicker(false);
    if (userReaction === reactionId) return;

    const reactions = { ...video.reactions };
    if (userReaction) {
      reactions[userReaction] = Math.max(0, (reactions[userReaction] || 0) - 1);
    }
    reactions[reactionId] = (reactions[reactionId] || 0) + 1;

    setUserReaction(reactionId);
    setShortReaction(video.id, reactionId);

    if (!isDemoMode) {
      const likesDelta = userReaction ? 0 : 1;
      base44.entities.ShortVideo.update(video.id, {
        reactions,
        likes_count: Math.max(0, (video.likes_count || 0) + likesDelta),
      }).catch(() => {});
    }
  }, [userReaction, video, isDemoMode]);

  const handleBookmark = useCallback(() => {
    const isNow = toggleShortBookmark(video.id);
    setBookmarked(isNow);
    if (!isDemoMode) {
      base44.entities.ShortVideo.update(video.id, {
        is_bookmarked: isNow,
        bookmarks_count: Math.max(0, (video.bookmarks_count || 0) + (isNow ? 1 : -1)),
      }).catch(() => {});
    }
  }, [video, isDemoMode]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/shorts`;
    if (navigator.share) {
      try { await navigator.share({ title: video.title, url }); } catch {}
    } else {
      try { await navigator.clipboard?.writeText(url); } catch {}
    }
    if (!isDemoMode) {
      base44.entities.ShortVideo.update(video.id, {
        shares_count: (video.shares_count || 0) + 1,
      }).catch(() => {});
    }
  }, [video, isDemoMode]);

  const handleFollow = useCallback(() => {
    const isNow = toggleFollowCreator(video.author_name);
    setFollowing(isNow);
    if (!isDemoMode) {
      base44.entities.ShortVideo.update(video.id, {
        is_following_creator: isNow,
      }).catch(() => {});
    }
  }, [video.author_name, video.id, isDemoMode]);

  const handlePressStart = () => {
    longPressRef.current = setTimeout(() => {
      setShowReactionPicker(true);
      longPressRef.current = null;
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const activeReaction = SHORT_REACTIONS.find((r) => r.id === userReaction);

  return (
    <>
      <ShortVideoPlayer video={video} isActive={isActive} onDoubleTap={handleDoubleTap} />

      {/* Double-tap like animation */}
      <AnimatePresence>
        {likeAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
          >
            <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Category badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1">
          {category && React.createElement(category.icon, { className: "w-3 h-3" })}
          {category?.label}
        </span>
      </div>

      {/* Right action bar */}
      <div className="absolute right-2 bottom-28 z-20 flex flex-col items-center gap-3.5">
        {/* Author avatar + follow */}
        <div className="relative mb-1">
          {video.author_image ? (
            <img src={video.author_image} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-white" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 border-2 border-white flex items-center justify-center text-primary-foreground font-bold text-sm">
              {video.author_name?.charAt(0)}
            </div>
          )}
          {!following && (
            <button
              onClick={handleFollow}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-black spring-tap"
              aria-label="Follow creator"
            >
              <Plus className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
            </button>
          )}
          {following && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-success flex items-center justify-center border-2 border-black">
              <Check className="w-3 h-3 text-success-foreground" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Like */}
        <div className="relative">
          <ActionButton
            icon={activeReaction ? Heart : Heart}
            iconProps={activeReaction ? { fill: "currentColor", style: { color: activeReaction.color } } : {}}
            count={formatCount(video.likes_count || 0)}
            active={!!userReaction}
            activeColor={activeReaction?.color}
            onClick={handleLike}
            onPressStart={handlePressStart}
            onPressEnd={handlePressEnd}
            label="Like"
          />
          <AnimatePresence>
            {showReactionPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute -top-12 right-0 flex gap-1 bg-card/95 backdrop-blur-lg rounded-full px-2 py-1.5 border border-border/40 soft-shadow"
              >
                {SHORT_REACTIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleReact(r.id)}
                    className="text-2xl spring-tap p-1"
                    aria-label={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ActionButton
          icon={MessageCircle}
          count={formatCount(video.comments_count || 0)}
          onClick={() => setShowComments(true)}
          label="Comments"
        />
        <ActionButton
          icon={Bookmark}
          count={formatCount(video.bookmarks_count || 0)}
          active={bookmarked}
          activeColor="hsl(var(--unibud-gold))"
          iconProps={bookmarked ? { fill: "currentColor" } : {}}
          onClick={handleBookmark}
          label="Bookmark"
        />
        <ActionButton
          icon={Share2}
          count={formatCount(video.shares_count || 0)}
          onClick={handleShare}
          label="Share"
        />
        <ActionButton
          icon={Flag}
          onClick={() => setShowReport(true)}
          label="Report"
        />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-0 right-16 z-20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-white text-[14px] font-bold">@{video.author_name?.replace(/\s+/g, "") || "creator"}</p>
          {video.is_verified && (
            <span className="w-3.5 h-3.5 rounded-full bg-info flex items-center justify-center">
              <Check className="w-2 h-2 text-info-foreground" strokeWidth={4} />
            </span>
          )}
          {!following && (
            <button
              onClick={handleFollow}
              className="ml-1 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold spring-tap"
            >
              Follow
            </button>
          )}
        </div>
        <p className="text-white text-[13px] font-medium leading-snug mb-1">{video.title}</p>
        {video.description && (
          <p className="text-white/70 text-[12px] leading-snug mb-1.5 line-clamp-2">{video.description}</p>
        )}
        {video.hashtags && video.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {video.hashtags.slice(0, 4).map((tag, i) => (
              <span key={i} className="text-white/80 text-[11px] font-medium">#{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 mt-1.5">
          <Music className="w-3 h-3 text-white/50" />
          <span className="text-white/50 text-[10px]">{formatCount(video.views_count || 0)} views · {timeAgo(video.created_date || video.uploaded_at)}</span>
        </div>
      </div>

      {/* Comments drawer */}
      <ShortComments
        open={showComments}
        onClose={() => setShowComments(false)}
        video={video}
        user={user}
        isDemoMode={isDemoMode}
      />

      {/* Report modal */}
      <ContentReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        contentType="short_video"
        contentId={video.id}
        reporterName={user?.full_name}
        reporterId={user?.id}
      />
    </>
  );
}

function ActionButton({ icon: Icon, count, active, activeColor, iconProps = {}, onClick, onPressStart, onPressEnd, label }) {
  return (
    <button
      onClick={onClick}
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
      onTouchStart={onPressStart}
      onTouchEnd={onPressEnd}
      className="flex flex-col items-center gap-0.5 spring-tap min-w-[44px] min-h-[44px] justify-center"
      aria-label={label}
    >
      <Icon
        className={"w-7 h-7 " + (active ? "" : "text-white")}
        style={active ? { color: activeColor || "hsl(var(--unibud-red))" } : {}}
        strokeWidth={2}
        {...iconProps}
      />
      {count !== undefined && (
        <span className="text-white text-[10px] font-semibold">{count}</span>
      )}
    </button>
  );
}