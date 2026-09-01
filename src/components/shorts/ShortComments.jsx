import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, Loader2, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatCount, timeAgo } from "@/components/quad/quadConstants";

const COMMENT_LIKES_KEY = "unibud_comment_likes";

function toggleCommentLike(commentId) {
  try {
    const data = JSON.parse(localStorage.getItem(COMMENT_LIKES_KEY) || "[]");
    const idx = data.indexOf(commentId);
    if (idx >= 0) { data.splice(idx, 1); } else { data.push(commentId); }
    localStorage.setItem(COMMENT_LIKES_KEY, JSON.stringify(data));
    return idx < 0;
  } catch { return false; }
}

export default function ShortComments({ open, onClose, video, user, isDemoMode }) {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(COMMENT_LIKES_KEY) || "[]")); } catch { return new Set(); }
  });
  const qc = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["shortComments", video.id],
    queryFn: () => base44.entities.ShortVideoComment.filter(
      { video_id: video.id, parent_id: { $exists: false } },
      "-created_date",
      30
    ),
    enabled: open && !isDemoMode,
  });

  const handleSend = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newComment = {
        video_id: video.id,
        content: commentText.trim(),
        author_name: user?.full_name || "Student",
        author_image: user?.avatar_url || "",
        author_role: "student",
        author_handle: user?.department ? `${user.department} · ${user.level || ""}` : "",
        likes_count: 0,
        replies_count: 0,
        is_edited: false,
      };
      await base44.entities.ShortVideoComment.create(newComment);
      await base44.entities.ShortVideo.update(video.id, {
        comments_count: (video.comments_count || 0) + 1,
      });
      qc.invalidateQueries({ queryKey: ["shortComments", video.id] });
      qc.invalidateQueries({ queryKey: ["shorts"] });
      setCommentText("");
    } catch {}
    setSubmitting(false);
  };

  const handleLikeComment = useCallback((comment) => {
    const isLiked = likedComments.has(comment.id);
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(comment.id);
      else next.add(comment.id);
      return next;
    });
    toggleCommentLike(comment.id);
    if (!isDemoMode) {
      base44.entities.ShortVideoComment.update(comment.id, {
        likes_count: Math.max(0, (comment.likes_count || 0) + (isLiked ? -1 : 1)),
      }).catch(() => {});
    }
  }, [likedComments, isDemoMode]);

  const demoComments = [
    {
      id: "dc1",
      content: "This was incredibly helpful! Thanks for sharing 🙏",
      author_name: "Chidi Okafor",
      author_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      author_handle: "Mechanical Engineering · 200L",
      likes_count: 12,
      replies_count: 1,
      created_date: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "dc2",
      content: "Can you make a follow-up on spaced repetition techniques?",
      author_name: "Fatima Bello",
      author_image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
      author_handle: "Medicine · 400L",
      likes_count: 8,
      replies_count: 0,
      created_date: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const displayComments = isDemoMode ? demoComments : (comments || []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-[65vh] bg-card rounded-t-[28px] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
              <h3 className="font-heading font-bold text-[15px] text-foreground">
                Comments {displayComments.length > 0 && `(${displayComments.length})`}
              </h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center spring-tap" aria-label="Close comments">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isLoading && displayComments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/40 mb-2" />
                  <p className="text-[13px] text-muted-foreground">Be the first to comment</p>
                </div>
              )}
              {displayComments.map((comment) => {
                const isLiked = likedComments.has(comment.id);
                return (
                  <div key={comment.id} className="flex gap-2.5">
                    {comment.author_image ? (
                      <img src={comment.author_image} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-[11px] shrink-0">
                        {comment.author_name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[12px] font-semibold text-foreground">{comment.author_name}</span>
                        {comment.author_handle && (
                          <span className="text-[10px] text-muted-foreground">· {comment.author_handle}</span>
                        )}
                      </div>
                      <p className="text-[13px] text-foreground leading-snug mb-0.5">{comment.content}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground">{timeAgo(comment.created_date)}</span>
                        <button
                          onClick={() => handleLikeComment(comment)}
                          className="flex items-center gap-1 spring-tap"
                        >
                          <Heart
                            className={"w-3 h-3 " + (isLiked ? "text-destructive fill-destructive" : "text-muted-foreground")}
                          />
                          {comment.likes_count > 0 && (
                            <span className="text-[10px] text-muted-foreground">{formatCount(comment.likes_count)}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <div className="p-3 border-t border-border/30">
              <div className="flex items-center gap-2">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-[10px] shrink-0">
                    {(user?.full_name || "U").charAt(0)}
                  </div>
                )}
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Add a comment..."
                  maxLength={500}
                  className="flex-1 bg-muted/50 border border-border/40 rounded-full px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                  aria-label="Write a comment"
                />
                <button
                  onClick={handleSend}
                  disabled={!commentText.trim() || submitting}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center spring-tap disabled:opacity-30"
                  aria-label="Send comment"
                >
                  {submitting ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" /> : <Send className="w-4 h-4 text-primary-foreground" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}