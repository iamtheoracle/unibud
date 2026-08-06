import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Share2, Bookmark, BadgeCheck, MapPin, Pin, Loader2, Repeat2, X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import ReactionBar from "./ReactionBar";
import PostMediaGallery from "./PostMediaGallery";
import PostMenu from "./PostMenu";
import ShareSheet from "./ShareSheet";
import CommentSection from "./CommentSection";
import LaunchBadge from "@/components/authentic/LaunchBadge";
import {
  timeAgo, formatCount, getPostType,
  getUserReaction, setUserReaction,
  isBookmarked, toggleBookmarkLocal,
  renderRichContent,
} from "./quadConstants";

export default function PostCard({ post, user, index = 0 }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { openWithPrompt } = useBudLauncher();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [editSaving, setEditSaving] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(post.id));
  const [isPinned, setIsPinned] = useState(post.is_pinned || false);
  const [localLikes, setLocalLikes] = useState(post.likes_count || 0);
  const [localReactions, setLocalReactions] = useState(post.reactions || {});
  const [localShares, setLocalShares] = useState(post.shares_count || 0);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating, setTranslating] = useState(false);

  // Sync local interaction counts from the live post prop so other users'
  // likes/reactions/shares/pins appear instantly (routed via the feed subscription).
  useEffect(() => {
    setLocalLikes(post.likes_count || 0);
    setLocalReactions(post.reactions || {});
    setLocalShares(post.shares_count || 0);
    setIsPinned(post.is_pinned || false);
  }, [post.likes_count, post.reactions, post.shares_count, post.is_pinned]);

  const authorName = post.author_name || "Anonymous";
  const authorHandle = post.author_handle || post.university || "";
  const postType = getPostType(post.type);
  const isOwner = post.author_name === (user?.full_name || user?.email?.split("@")[0]);

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
      // Notify the post author on new reaction (skip self-reactions and removals)
      if (reaction && reaction !== currentReaction && post.created_by_id && post.created_by_id !== user?.id) {
        const reactorName = user?.full_name || user?.email?.split("@")[0] || "Someone";
        base44.entities.Notification.create({
          title: `${reactorName} reacted to your post`,
          message: `Reacted with ${reaction}`,
          type: "social",
          category: "social",
          priority: "low",
          user_id: post.created_by_id,
          link: "/quad",
          icon: "Heart",
        }).catch(() => {});
      }
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
      case "edit":
        setEditContent(post.content || "");
        setEditOpen(true);
        break;
      case "repost":
        if (reposted) { toast({ title: "Already reposted" }); return; }
        base44.entities.QuadPost.create({
          type: "repost",
          content: "",
          original_post_id: post.id,
          author_name: user?.full_name || user?.email?.split("@")[0] || "Anonymous",
          author_handle: user?.email?.split("@")[0] || "",
          author_image: user?.profile_picture || null,
        }).then(() => {
          setReposted(true);
          setLocalShares((s) => s + 1);
          base44.entities.QuadPost.update(post.id, { shares_count: (post.shares_count || 0) + 1 }).catch(() => {});
          toast({ title: "Reposted" });
          qc.invalidateQueries({ queryKey: ["quadFeed"] });
        }).catch(() => {
          toast({ title: "Failed to repost", variant: "destructive" });
        });
        break;
      case "quote_repost":
        // Opens share sheet pre-seeded with quote mode — use composer via URL
        window.location.href = `/quad/compose?quote=${post.id}`;
        break;
      case "bookmark":
        handleBookmark();
        break;
      case "copy_link": {
        const postUrl = `${window.location.origin}/quad/post/${post.id}`;
        navigator.clipboard?.writeText(postUrl).then(() => {
          toast({ title: "Link copied to clipboard" });
        }).catch(() => {
          toast({ title: "Could not copy link", variant: "destructive" });
        });
        break;
      }
      case "copy":
        navigator.clipboard?.writeText(post.content);
        toast({ title: "Copied to clipboard" });
        break;
      case "explain_bud":
        openWithPrompt(`Explain this post for me:\n\n"${post.content}"\n\nPosted by ${post.author_name || "someone"} on UNIBUD.`);
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

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editSaving) return;
    setEditSaving(true);
    try {
      await base44.entities.QuadPost.update(post.id, {
        content: editContent.trim(),
        is_edited: true,
        edited_at: new Date().toISOString(),
      });
      qc.invalidateQueries({ queryKey: ["quadFeed"] });
      toast({ title: "Post updated" });
      setEditOpen(false);
    } catch {
      toast({ title: "Failed to update post", variant: "destructive" });
    } finally {
      setEditSaving(false);
    }
  };

  const avatar = post.author_image;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.15), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-border/15"
    >
      {/* Pinned indicator */}
      {isPinned && (
        <div className="flex items-center gap-1.5 px-5 pt-3 text-[11px] font-medium text-foreground/60">
          <Pin className="w-3 h-3" strokeWidth={1.8} /> Pinned
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          {avatar ? (
            <img src={avatar} alt={authorName} className="w-9 h-9 rounded-full object-cover" loading="lazy" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-[14px]">
              {authorName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[14px] text-foreground truncate">{authorName}</span>
              {post.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-foreground/50 flex-shrink-0" strokeWidth={2} />}
              {post.is_seed_content && <LaunchBadge />}
              {postType && (
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide">
                  {postType.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-muted-foreground/60 mt-0.5">
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
          <PostMenu isOwner={isOwner} onAction={handleMenuAction} />
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-5 pb-3">
          <p className="text-[14px] leading-relaxed text-foreground whitespace-pre-wrap break-words">
            {renderRichContent(translatedContent || post.content)}
          </p>
          {translating && (
            <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Translating...
            </p>
          )}
          {translatedContent && (
            <button
              onClick={() => setTranslatedContent(null)}
              className="text-[11px] text-foreground/60 font-medium mt-1.5 spring-tap"
            >
              Show original
            </button>
          )}
        </div>
      )}

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMediaGallery mediaUrls={post.media_urls} mediaTypes={post.media_types} post={post} user={user} />
      )}

      {/* Poll (if applicable) */}
      {post.poll_data && (
        <div className="px-5 pb-3 space-y-2">
          <p className="font-semibold text-[14px] text-foreground">{post.poll_data.question}</p>
          {(post.poll_data.options || []).map((opt) => {
            const totalVotes = (post.poll_data.options || []).reduce((sum, o) => sum + (o.votes || 0), 0);
            const pct = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
            return (
              <div key={opt.id} className="relative rounded-xl border border-border/20 overflow-hidden">
                <div className="absolute inset-0 bg-muted/50" style={{ width: pct + "%" }} />
                <div className="relative flex items-center justify-between px-3 py-2.5">
                  <span className="text-[13px] font-medium text-foreground">{opt.text}</span>
                  <span className="text-[12px] font-medium text-muted-foreground tabular-nums">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 px-5 py-2.5">
        <ReactionBar
          postId={post.id}
          reactions={localReactions}
          likesCount={localLikes}
          onReact={handleReact}
        />

        <button
          onClick={() => setCommentsOpen(!commentsOpen)}
          className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg spring-tap"
        >
          <MessageCircle className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.7} />
          <span className="text-[12px] font-medium text-muted-foreground tabular-nums">{formatCount(post.comments_count || 0)}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg spring-tap"
        >
          <Share2 className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.7} />
          <span className="text-[12px] font-medium text-muted-foreground tabular-nums">{formatCount(localShares)}</span>
        </button>

        <div className="flex-1" />

        <button
          onClick={handleBookmark}
          className="py-1.5 px-2 rounded-lg spring-tap"
        >
          <Bookmark
            className={`w-[18px] h-[18px] ${bookmarked ? "fill-foreground text-foreground" : "text-muted-foreground"}`}
            strokeWidth={1.7}
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
        postUrl={`${window.location.origin}/quad/post/${post.id}`}
        onShare={handleShareComplete}
      />

      {/* Edit post modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} aria-hidden />
            <motion.div
              className="relative w-full max-w-lg glass-strong rounded-[20px] p-5 shadow-xl"
              initial={{ y: 32, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 32, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-label="Edit post"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-foreground">Edit Post</h2>
                <button
                  onClick={() => setEditOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <textarea
                className="w-full min-h-[120px] resize-none bg-muted/40 rounded-[12px] p-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={2000}
                aria-label="Edit post content"
                autoFocus
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-muted-foreground">{editContent.length}/2000</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditOpen(false)}
                    className="px-4 py-2 rounded-[10px] text-[12px] font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || editSaving}
                    className="px-4 py-2 rounded-[10px] text-[12px] font-semibold bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-1.5 transition-opacity"
                  >
                    {editSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}