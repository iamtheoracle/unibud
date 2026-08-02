import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X, Search, Heart, Reply, BadgeCheck, Pin, Send, Loader2,
  MessageCircle, ArrowUpDown,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import {
  getUserReaction, setUserReaction,
  timeAgo, formatCount,
} from "@/components/quad/quadConstants";
import { hapticTap } from "@/lib/haptics";

const SORT_OPTIONS = [
  { key: "top", label: "Top" },
  { key: "newest", label: "Newest" },
  { key: "helpful", label: "Most Helpful" },
];

const PAGE_SIZE = 20;

/**
 * OrbitMediaComments — floating bottom sheet for threaded comments.
 * Never reloads the media. Supports replies, reactions, pinned comments,
 * search, and sort (Top, Newest, Most Helpful). All real data.
 */
export default function OrbitMediaComments({ post, user, open, onClose }) {
  const qc = useQueryClient();
  const [sort, setSort] = useState("top");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["media-comments", post?.id, sort],
    queryFn: async () => {
      if (!post?.id) return [];
      const items = await base44.entities.QuadComment.filter(
        { post_id: post.id, parent_id: "" },
        sort === "newest" ? "-created_date" : "-likes_count",
        PAGE_SIZE
      );
      if (sort === "top") {
        return [...items].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      }
      if (sort === "helpful") {
        return [...items].sort((a, b) => (b.is_helpful ? 1 : 0) - (a.is_helpful ? 1 : 0) || (b.likes_count || 0) - (a.likes_count || 0));
      }
      return items;
    },
    enabled: !!open && !!post?.id,
  });

  useEffect(() => {
    if (!open || !post?.id) return;
    const unsub = base44.entities.QuadComment.subscribe((event) => {
      if (event.data?.post_id === post.id) {
        qc.invalidateQueries({ queryKey: ["media-comments", post.id] });
      }
    });
    return unsub;
  }, [open, post?.id, qc]);

  const filtered = search
    ? comments.filter((c) => c.content?.toLowerCase().includes(search.toLowerCase()) || c.author_name?.toLowerCase().includes(search.toLowerCase()))
    : comments;

  const pinned = filtered.filter((c) => c.is_pinned);
  const unpinned = filtered.filter((c) => !c.is_pinned);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !user || !post) return;
    setSending(true);
    hapticTap();
    const content = input.trim();
    setInput("");

    try {
      const comment = await base44.entities.QuadComment.create({
        post_id: post.id,
        content,
        author_name: user.full_name || user.email || "Anonymous",
        author_image: user.avatar_url || "",
        author_role: "student",
        parent_id: replyTo?.id || "",
        likes_count: 0,
        replies_count: 0,
        reactions: {},
      });

      if (replyTo) {
        await base44.entities.QuadComment.update(replyTo.id, {
          replies_count: (replyTo.replies_count || 0) + 1,
        });
      }

      await base44.entities.QuadPost.update(post.id, {
        comments_count: (post.comments_count || 0) + 1,
      });

      qc.invalidateQueries({ queryKey: ["media-comments", post.id] });
      qc.invalidateQueries({ queryKey: ["quadFeed"] });
      setReplyTo(null);
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  }, [input, user, post, replyTo, qc]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[60] flex items-end"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="relative w-full max-h-[80%] glass-strong rounded-t-[28px] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-[16px] text-foreground">Comments</h3>
                <span className="text-[12px] text-muted-foreground font-medium">{formatCount(post?.comments_count || 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSearchOpen(!searchOpen)} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                  <Search className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Search bar */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden px-5 pb-2"
                >
                  <div className="glass rounded-full h-9 flex items-center px-3 gap-2">
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search comments…"
                      className="flex-1 bg-transparent outline-none text-[12px] text-foreground"
                      autoFocus
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="w-5 h-5 flex items-center justify-center">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sort tabs */}
            <div className="flex items-center gap-1.5 px-5 py-2">
              <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold spring-tap ${
                    sort === opt.key ? "bg-foreground text-background" : "text-muted-foreground bg-card/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-[18px] glass-card flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.6} />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground mb-1">No comments yet</p>
                  <p className="text-[11px] text-muted-foreground max-w-[200px]">Be the first to share your thoughts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pinned.map((c) => (
                    <MediaCommentItem
                      key={c.id}
                      comment={c}
                      user={user}
                      isPinned
                      onReply={setReplyTo}
                      postAuthor={post?.author_name}
                    />
                  ))}
                  {unpinned.map((c) => (
                    <MediaCommentItem
                      key={c.id}
                      comment={c}
                      user={user}
                      onReply={setReplyTo}
                      postAuthor={post?.author_name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Reply preview */}
            <AnimatePresence>
              {replyTo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden px-5 py-2 border-t border-border/20 bg-muted/20"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground truncate">
                      Replying to <span className="font-semibold text-foreground">{replyTo.author_name}</span>
                    </span>
                    <button onClick={() => setReplyTo(null)} className="text-[11px] font-semibold text-muted-foreground spring-tap">
                      Cancel
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{replyTo.content}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Composer */}
            <div className="px-5 py-3 border-t border-border/20 safe-area-pb">
              <div className="frosted-mirror rounded-full h-[44px] flex items-center px-4 gap-2.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={replyTo ? `Reply to ${replyTo.author_name}…` : "Add a comment…"}
                  className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground/60"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center spring-tap disabled:opacity-40 flex-shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" /> : <Send className="w-4 h-4 text-primary-foreground" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MediaCommentItem({ comment, user, isPinned, onReply, postAuthor }) {
  const qc = useQueryClient();
  const [userReaction, setUserReactionState] = useState(() => getUserReaction(comment.id));
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const handleReact = async () => {
    hapticTap();
    const newReaction = userReaction ? null : "like";
    setUserReactionState(newReaction);
    setUserReaction(comment.id, newReaction);

    const currentReactions = { ...(comment.reactions || {}) };
    if (newReaction) {
      currentReactions[newReaction] = (currentReactions[newReaction] || 0) + 1;
    } else if (userReaction) {
      currentReactions[userReaction] = Math.max(0, (currentReactions[userReaction] || 0) - 1);
    }
    const newCount = Object.values(currentReactions).reduce((a, b) => a + b, 0);

    try {
      await base44.entities.QuadComment.update(comment.id, { reactions: currentReactions, likes_count: newCount });
      qc.invalidateQueries({ queryKey: ["media-comments"] });
    } catch {}
  };

  const loadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    setLoadingReplies(true);
    try {
      const data = await base44.entities.QuadComment.filter(
        { post_id: comment.post_id, parent_id: comment.id },
        "-created_date",
        20
      );
      setReplies(data);
      setShowReplies(true);
    } catch {}
    setLoadingReplies(false);
  };

  const isCreator = comment.author_name === postAuthor;
  const avatar = comment.author_image;
  const displayName = comment.author_name || "Anonymous";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-2.5"
    >
      {avatar ? (
        <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
          {displayName.charAt(0)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="glass rounded-[16px] px-3 py-2 inline-block max-w-full">
          {isPinned && (
            <div className="flex items-center gap-1 mb-1">
              <Pin className="w-2.5 h-2.5 text-primary" strokeWidth={2.5} />
              <span className="text-[9px] font-bold text-primary uppercase tracking-wide">Pinned</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-[12px] text-foreground">{displayName}</span>
            {comment.is_verified && <BadgeCheck className="w-3 h-3 text-primary fill-primary/20" strokeWidth={2.5} />}
            {isCreator && (
              <span className="px-1.5 py-0 rounded-full bg-primary/15 text-[8px] font-bold text-primary uppercase">Creator</span>
            )}
            <span className="text-[10px] text-muted-foreground ml-0.5">{timeAgo(comment.created_date)}</span>
          </div>
          <p className="text-[12px] leading-relaxed text-foreground whitespace-pre-wrap break-words">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1 ml-1">
          <button onClick={handleReact} className="flex items-center gap-1 spring-tap">
            <Heart
              className={`w-3.5 h-3.5 ${userReaction ? "fill-primary text-primary" : "text-muted-foreground"}`}
              strokeWidth={1.8}
            />
            {comment.likes_count > 0 && (
              <span className="text-[10px] font-semibold text-muted-foreground">{formatCount(comment.likes_count)}</span>
            )}
          </button>
          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground spring-tap"
          >
            <Reply className="w-3.5 h-3.5" strokeWidth={1.8} /> Reply
          </button>
          {comment.replies_count > 0 && (
            <button onClick={loadReplies} className="text-[10px] font-semibold text-primary spring-tap">
              {loadingReplies ? "Loading…" : showReplies ? "Hide" : `${comment.replies_count} ${comment.replies_count === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>

        {/* Nested replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2.5 space-y-2.5 pl-2 border-l border-border/20">
            {replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                {reply.author_image ? (
                  <img src={reply.author_image} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {(reply.author_name || "?").charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="glass rounded-[14px] px-2.5 py-1.5 inline-block max-w-full">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-semibold text-[11px] text-foreground">{reply.author_name}</span>
                      {reply.author_name === postAuthor && (
                        <span className="px-1 py-0 rounded-full bg-primary/15 text-[8px] font-bold text-primary uppercase">Creator</span>
                      )}
                      <span className="text-[9px] text-muted-foreground">{timeAgo(reply.created_date)}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}