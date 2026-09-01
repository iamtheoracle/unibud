import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Share2, Bookmark, BadgeCheck, MapPin, Pin, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap, hapticImpact } from "@/lib/haptics";
import ReactionBar from "./ReactionBar";
import PostMediaGallery from "./PostMediaGallery";
import PostMenu from "./PostMenu";
import ShareSheet from "./ShareSheet";
import CommentSection from "./CommentSection";
import {
  timeAgo, formatCount, getPostType,
  getUserReaction, setUserReaction,
  isBookmarked, toggleBookmarkLocal,
  renderRichContent,
} from "./quadConstants";
import { useFollowing } from "@/hooks/useFollowing";

export default function PostCard({ post, user, index = 0 }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(post.id));
  const [isPinned, setIsPinned] = useState(post.is_pinned || false);
  const [localLikes, setLocalLikes] = useState(post.likes_count || 0);
  const [localReactions, setLocalReactions] = useState(post.reactions || {});
  const [localShares, setLocalShares] = useState(post.shares_count || 0);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating, setTranslating] = useState(false);

  const authorName = post.author_name || "Anonymous";
  const authorHandle = post.author_handle || post.university || "";
  const postType = getPostType(post.type);
  const isOwner = post.author_name === (user?.full_name || user?.email?.split("@")[0]);
  const { isFollowing, toggleFollow } = useFollowing();
  const authorId = post.created_by_id;
  const canFollow = !isOwner && !!authorId && !!user && authorId !== user.id;
  const following = canFollow && isFollowing(authorId);

  const handleReact = useCallback(async (reaction) => {
    hapticTap();
    const currentReaction = getUserReaction(post.id);
    const newReactions = { ...localReactions };

    // Remove old reaction
    if (currentReaction) {
      newReactions[currentReaction] = Math.max(0, (newReactions[currentReaction] || 0) - 1);
    }
    // Add new reaction
    if (reaction && reaction !== currentReaction) {
      newReactions[reaction] = (newReactions[reaction] || 0) + 1;
    }

    const newCount = Object.values(newReactions).reduce((a, b) => a + b, 0);
    setLocalReactions(newReactions);
    setLocalLikes(newCount);
    setUserReaction(post.id, reaction || null);

    try {
      await base44.entities.QuadPost.update(post.id, {
        reactions: newReactions,
        likes_count: newCount,
      });
      qc.invalidateQueries({ queryKey: ["quadFeed"] });
    } catch {}
  }, [post.id, localReactions, qc]);

  const handleBookmark = () => {
    hapticTap();
    const nowBookmarked = toggleBookmarkLocal(post.id);
    setBookmarked(nowBookmarked);
    toast({ title: nowBookmarked ? "Saved to bookmarks" : "Removed from bookmarks" });
  };

  const handleShare = () => {
    hapticTap();
    setShareOpen(true);
  };

  const handleShareComplete = () => {
    setLocalShares((s) => {
      const newCount = s + 1;
      try {
        base44.entities.QuadPost.update(post.id, { shares_count: newCount });
      } catch {}
      return newCount;
    });
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case "pin":
        setIsPinned(!isPinned);
        try { base44.entities.QuadPost.update(post.id, { is_pinned: !isPinned }); } catch {}
        break;
      case "bookmark":
        handleBookmark();
        break;
      case "copy":
        navigator.clipboard?.writeText(post.content);
        toast({ title: "Copied to clipboard" });
        break;
      case "delete":
        base44.entities.QuadPost.delete(post.id).then(() => {
          qc.invalidateQueries({ queryKey: ["quadFeed"] });
          toast({ title: "Post deleted" });
        }).catch(() => {
          toast({ title: "Failed to delete post", variant: "destructive" });
        });
        break;
      case "translate":
        if (translatedContent) {
          setTranslatedContent(null);
          return;
        }
        setTranslating(true);
        base44.integrations.Core.InvokeLLM({
          prompt: `Translate to English. If already English, translate to French. Return only the translation:\n\n${post.content}`,
        }).then((result) => {
          setTranslatedContent(typeof result === "string" ? result : String(result || ""));
        }).catch(() => {
          toast({ title: "Translation failed", variant: "destructive" });
        }).finally(() => setTranslating(false));
        break;
      case "report":
        if (!user) return;
        base44.entities.ContentReport.create({
          content_type: "quad_post",
          content_id: post.id,
          reporter_name: user?.full_name || user?.email || "Anonymous",
          reporter_id: user?.id || "",
          reason: "other",
          description: "Reported from post menu",
        }).then(() => {
          toast({ title: "Post reported to moderators" });
        }).catch(() => {
          toast({ title: "Failed to report post", variant: "destructive" });
        });
        break;
      default:
        break;
    }
  };

  const avatar = post.author_image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] soft-shadow border border-border/20 overflow-hidden card-hover"
    >
      {/* Pinned indicator */}
      {isPinned && (
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 text-[10px] font-semibold text-primary">
          <Pin className="w-3 h-3" /> Pinned
        </div>
      )}

      {/* Header */}
      <div className="p-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={authorName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm">
              {authorName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-heading font-semibold text-[13px] text-foreground truncate">{authorName}</span>
              {post.is_verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 flex-shrink-0" />}
              {postType && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wide bg-primary/10 text-primary"
                >
                  {postType.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="truncate">{authorHandle}</span>
              <span>·</span>
              <span>{timeAgo(post.created_date)}</span>
              {post.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 truncate">
                    <MapPin className="w-2.5 h-2.5" /> {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
          {canFollow && (
            <button
              onClick={() => toggleFollow(authorId, post.author_name)}
              className={"px-3 h-7 rounded-full text-[11px] font-semibold spring-tap shrink-0 " + (following ? "bg-muted text-muted-foreground" : "bg-foreground text-background")}
            >
              {following ? "Following" : "Follow"}
            </button>
          )}
          <PostMenu isOwner={isOwner} onAction={handleMenuAction} />
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap break-words">
            {renderRichContent(translatedContent || post.content)}
          </p>
          {translating && (
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Translating...
            </p>
          )}
          {translatedContent && (
            <button
              onClick={() => setTranslatedContent(null)}
              className="text-[10px] text-primary font-semibold mt-1.5 spring-tap"
            >
              Show original
            </button>
          )}
        </div>
      )}

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMediaGallery mediaUrls={post.media_urls} mediaTypes={post.media_types} />
      )}

      {/* Poll (if applicable) */}
      {post.poll_data && (
        <div className="px-4 pb-3 space-y-2">
          <p className="font-heading font-semibold text-[13px] text-foreground">{post.poll_data.question}</p>
          {(post.poll_data.options || []).map((opt) => {
            const totalVotes = (post.poll_data.options || []).reduce((sum, o) => sum + (o.votes || 0), 0);
            const pct = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
            return (
              <div key={opt.id} className="relative rounded-[12px] border border-border/30 overflow-hidden">
                <div className="absolute inset-0 bg-primary/8" style={{ width: pct + "%" }} />
                <div className="relative flex items-center justify-between px-3 py-2">
                  <span className="text-[12px] font-medium text-foreground">{opt.text}</span>
                  <span className="text-[11px] font-semibold text-muted-foreground">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-t border-border/20">
        <ReactionBar
          postId={post.id}
          reactions={localReactions}
          likesCount={localLikes}
          onReact={handleReact}
        />

        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors spring-tap"
        >
          <MessageCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          <span className="text-[11px] font-semibold text-muted-foreground">{formatCount(post.comments_count || 0)}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors spring-tap"
        >
          <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          <span className="text-[11px] font-semibold text-muted-foreground">{formatCount(localShares)}</span>
        </button>

        <div className="flex-1" />

        <button
          onClick={handleBookmark}
          className="py-1.5 px-2 rounded-lg hover:bg-muted transition-colors spring-tap"
        >
          <Bookmark
            className={`w-4 h-4 ${bookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {commentsOpen && (
          <CommentSection
            postId={post.id}
            user={user}
            commentsCount={post.comments_count}
            isOpen={commentsOpen}
          />
        )}
      </AnimatePresence>

      {/* Share sheet */}
      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        postUrl={`${window.location.origin}/quad`}
        onShare={handleShareComplete}
      />
    </motion.div>
  );
}