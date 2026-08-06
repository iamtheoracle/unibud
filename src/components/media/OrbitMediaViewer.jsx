import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  X, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ChevronLeft, ChevronRight, BadgeCheck, MapPin, Flag,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import { hapticTap } from "@/lib/haptics";
import { formatCount, getPostType,
  getUserReaction, setUserReaction,
  isBookmarked, toggleBookmarkLocal,
  extractHashtags,
} from "@/components/quad/quadConstants";
import OrbitMediaComments from "./OrbitMediaComments";
import OrbitMediaProfileSheet from "./OrbitMediaProfileSheet";
import OrbitMediaSaveSheet from "./OrbitMediaSaveSheet";
import OrbitMediaShareSheet from "./OrbitMediaShareSheet";

const EASE = [0.16, 1, 0.3, 1];

/**
 * OrbitMediaViewer — full-screen immersive media experience.
 * Edge-to-edge media, floating glass controls, creator info overlay,
 * double-tap like, swipe between media, pull-to-dismiss.
 * All real data, no demo content.
 */
export default function OrbitMediaViewer({ post, user, initialIndex = 0, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [likeBurst, setLikeBurst] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const mediaUrls = post.media_urls || [];
  const mediaTypes = post.media_types || [];
  const total = mediaUrls.length;
  const currentType = mediaTypes[currentIndex] || "image";

  const [bookmarked, setBookmarked] = useState(() => isBookmarked(post.id));
  const [localLikes, setLocalLikes] = useState(post.likes_count || 0);
  const [localReactions, setLocalReactions] = useState(post.reactions || {});
  const [userReaction, setUserReactionState] = useState(() => getUserReaction(post.id));

  const postType = getPostType(post.type);
  const authorName = post.author_name || "Anonymous";
  const authorHandle = post.author_handle || post.university || "";
  const hashtags = extractHashtags(post.content);

  const goToMedia = useCallback((dir) => {
    setCurrentIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return total - 1;
      if (next >= total) return 0;
      return next;
    });
  }, [total]);

  const handleDoubleTap = useCallback(() => {
    hapticTap();
    if (!userReaction) {
      setLikeBurst(true);
      setTimeout(() => setLikeBurst(false), 600);
      const newReactions = { ...localReactions, like: (localReactions.like || 0) + 1 };
      setLocalReactions(newReactions);
      setLocalLikes((c) => c + 1);
      setUserReactionState("like");
      setUserReaction(post.id, "like");
      try {
        base44.entities.QuadPost.update(post.id, {
          reactions: newReactions,
          likes_count: (localLikes || 0) + 1,
        });
      } catch {}
    }
  }, [userReaction, localReactions, localLikes, post.id]);

  const lastTap = useRef(0);
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleDoubleTap();
    }
    lastTap.current = now;
  };

  const handleLike = () => {
    hapticTap();
    const currentReaction = getUserReaction(post.id);
    const newReactions = { ...localReactions };
    if (currentReaction) {
      newReactions[currentReaction] = Math.max(0, (newReactions[currentReaction] || 0) - 1);
    }
    if (!currentReaction) {
      newReactions.like = (newReactions.like || 0) + 1;
      setUserReactionState("like");
      setUserReaction(post.id, "like");
    } else {
      setUserReactionState(null);
      setUserReaction(post.id, null);
    }
    const newCount = Object.values(newReactions).reduce((a, b) => a + b, 0);
    setLocalReactions(newReactions);
    setLocalLikes(newCount);
    try {
      base44.entities.QuadPost.update(post.id, { reactions: newReactions, likes_count: newCount });
    } catch {}
  };

  const handleBookmark = () => {
    hapticTap();
    const nowSaved = toggleBookmarkLocal(post.id);
    setBookmarked(nowSaved);
    if (nowSaved) {
      setSaveOpen(true);
    } else {
      toast({ title: "Removed from bookmarks" });
    }
  };

  const handleReport = () => {
    if (!user) return;
    base44.entities.ContentReport.create({
      content_type: "quad_post",
      content_id: post.id,
      reporter_name: user.full_name || user.email || "Anonymous",
      reporter_id: user.id || "",
      reason: "other",
      description: "Reported from media viewer",
    }).then(() => toast({ title: "Reported to moderators" }))
      .catch(() => toast({ title: "Failed to report", variant: "destructive" }));
    setMoreOpen(false);
  };

  const onDragStart = (e) => {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartY.current = y;
    setIsDragging(true);
  };
  const onDragMove = (e) => {
    if (!isDragging) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = y - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };
  const onDragEnd = () => {
    setIsDragging(false);
    if (dragY > 150) {
      onClose();
    }
    setDragY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden"
      style={{ transform: `translateY(${dragY}px)`, transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.16,1,0.3,1)" }}
    >
      {/* Drag handle */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20 z-30" />

      {/* Top bar — close + creator info */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-[3.5vh] pb-3 safe-area-pt bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass-strong flex items-center justify-center spring-tap"
          >
            <X className="w-5 h-5 text-white" strokeWidth={2.2} />
          </button>

          {/* Creator info */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-strong spring-tap"
          >
            <div className="relative">
              {post.author_image ? (
                <img src={post.author_image} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white text-[12px] font-bold">
                  {authorName.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-[12px] font-semibold text-white truncate max-w-[100px]">{authorName}</span>
                {post.is_verified && <BadgeCheck className="w-3 h-3 text-primary fill-primary/30" strokeWidth={2.5} />}
              </div>
              <span className="text-[10px] text-white/60">{authorHandle}</span>
            </div>
          </button>
        </div>

        {/* Category badge */}
        {postType && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded-full glass-strong text-[10px] font-semibold text-white/80 uppercase tracking-wide">
              {postType.label}
            </span>
            {post.community && (
              <span className="px-2 py-0.5 rounded-full glass-strong text-[10px] font-medium text-white/60">
                {post.community}
              </span>
            )}
            {post.location && (
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full glass-strong text-[10px] font-medium text-white/60">
                <MapPin className="w-2.5 h-2.5" /> {post.location}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Media area */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onClick={handleTap}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="w-full h-full flex items-center justify-center"
          >
            {currentType === "image" && (
              <Image
                src={mediaUrls[currentIndex]}
                alt=""
                fittingType="fit"
                className="w-full h-full"
              />
            )}
            {currentType === "video" && (
              <video
                src={mediaUrls[currentIndex]}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Like burst animation */}
        <AnimatePresence>
          {likeBurst && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-24 h-24 text-white fill-white/80 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation arrows */}
        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goToMedia(-1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-strong flex items-center justify-center spring-tap z-10"
            >
              <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.2} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToMedia(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass-strong flex items-center justify-center spring-tap z-10"
            >
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.2} />
            </button>
            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {mediaUrls.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${i === currentIndex ? "w-5 bg-white" : "w-1 bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom — caption + floating interaction bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pb-[env(safe-area-inset-bottom)]">
        {/* Caption */}
        {post.content && (
          <div className="px-5 pb-3">
            <p className="text-[13px] leading-relaxed text-white/90 line-clamp-3">{post.content}</p>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {hashtags.slice(0, 5).map((tag) => (
                  <span key={tag} className="text-[10px] font-medium text-white/50">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Floating interaction bar */}
        <div className="flex items-center gap-1.5 px-4 pb-4 pt-2">
          <FloatingButton
            icon={Heart}
            count={localLikes}
            active={!!userReaction}
            activeClass="fill-white text-white"
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
          />
          <FloatingButton
            icon={MessageCircle}
            count={post.comments_count}
            onClick={(e) => { e.stopPropagation(); setCommentsOpen(true); }}
          />
          <FloatingButton
            icon={Share2}
            count={post.shares_count}
            onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}
          />
          <FloatingButton
            icon={Bookmark}
            active={bookmarked}
            activeClass="fill-white text-white"
            onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
          />
          <div className="flex-1" />
          <FloatingButton
            icon={MoreHorizontal}
            onClick={(e) => { e.stopPropagation(); setMoreOpen(true); }}
          />
        </div>
      </div>

      {/* More menu */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMoreOpen(false)} />
            <motion.div
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute bottom-0 left-0 right-0 z-50 glass-strong rounded-t-[28px] p-4 pb-8 safe-area-pb"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
              <button onClick={handleReport} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted/40 spring-tap">
                <Flag className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                <span className="text-[13px] font-medium text-foreground">Report</span>
              </button>
              <button onClick={() => { setMoreOpen(false); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-muted/40 spring-tap">
                <X className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                <span className="text-[13px] font-medium text-foreground">Close Viewer</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Comment sheet */}
      <OrbitMediaComments
        post={post}
        user={user}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />

      {/* Profile sheet */}
      <OrbitMediaProfileSheet
        post={post}
        user={user}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      {/* Save to highlights sheet */}
      <OrbitMediaSaveSheet
        post={post}
        user={user}
        mediaUrl={mediaUrls[currentIndex]}
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
      />

      {/* Share sheet */}
      <OrbitMediaShareSheet
        post={post}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />

    </motion.div>
  );
}

function FloatingButton({ icon: Icon, count, active, activeClass = "", onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-strong spring-tap"
    >
      <Icon
        className={`w-[18px] h-[18px] text-white/80 ${active ? activeClass : ""}`}
        strokeWidth={1.8}
      />
      {count !== undefined && count > 0 && (
        <span className="text-[11px] font-semibold text-white/70 tabular-nums">{formatCount(count)}</span>
      )}
    </button>
  );
}