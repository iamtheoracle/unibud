import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pin, CheckCircle2, Star, MoreHorizontal, Reply, Edit3, Trash2,
  Link2, Flag, ChevronDown, ChevronUp, BookOpen, Share2,
} from "lucide-react";
import { REACTIONS, timeAgo, renderRichContent } from "@/components/quad/quadConstants";
import { DISCUSSION_TYPES } from "./discussionConstants";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import DiscussionComposer from "./DiscussionComposer";

/**
 * DiscussionCommentItem — a single comment in a collection discussion.
 * Supports threaded replies (recursive), reactions, pinning, answered/
 * helpful marks, edit/delete, copy link, and report. Actions are
 * role-aware (author vs moderator vs viewer).
 */
export default function DiscussionCommentItem({
  comment, replies = [], depth = 0, discussion, canModerate = false, collaborators = [],
}) {
  const [showActions, setShowActions] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReactions, setShowReactions] = useState(false);
  const { toast } = useToast();

  const isAuthor = discussion.isAuthor(comment);
  const userReact = discussion.userReaction(comment.id);
  const hasMedia = (comment.media_urls || []).length > 0;
  const indent = Math.min(depth, 2) * 14;

  const handleEdit = () => {
    discussion.editComment(comment.id, editContent);
    setEditing(false);
    setShowActions(false);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/highlights?comment=${comment.id}`;
    navigator.clipboard?.writeText(url);
    toast({ title: "Link copied!" });
    setShowActions(false);
  };

  const shareComment = async () => {
    const url = `${window.location.origin}/highlights?comment=${comment.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Collection discussion", url }); } catch {}
    } else {
      navigator.clipboard?.writeText(url);
      toast({ title: "Link copied!" });
    }
    setShowActions(false);
  };

  const report = async () => {
    try {
      await base44.entities.ContentReport.create({
        target_type: "discussion_comment",
        target_id: comment.id,
        reason: "Inappropriate content",
        reporter_name: "User",
      });
      toast({ title: "Reported", description: "Thank you for helping keep discussions clean." });
    } catch {
      toast({ title: "Couldn't report", variant: "destructive" });
    }
    setShowActions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
      style={{ marginLeft: indent }}
    >
      <div className={"p-2.5 rounded-2xl " + (comment.is_pinned ? "bg-primary/5 border border-primary/20" : "glass-card")}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-card grid place-items-center shrink-0 overflow-hidden">
            {comment.author_image ? (
              <img src={comment.author_image} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-[9px] font-bold">{comment.author_name?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
          <span className="text-[12px] font-semibold truncate">{comment.author_name}</span>
          <span className="text-[9px] text-muted-foreground/60">{timeAgo(comment.created_date)}</span>
          {comment.is_edited && <span className="text-[8px] text-muted-foreground/40 italic">edited</span>}
          <div className="flex items-center gap-1 ml-auto">
            {comment.discussion_type && comment.discussion_type !== "none" && (
              <span className="flex items-center gap-0.5 text-[8px] font-bold text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted/40">
                {DISCUSSION_TYPES.find((t) => t.id === comment.discussion_type)?.emoji} {DISCUSSION_TYPES.find((t) => t.id === comment.discussion_type)?.label}
              </span>
            )}
            {comment.is_pinned && <span className="flex items-center gap-0.5 text-[8px] font-bold text-primary"><Pin className="w-2.5 h-2.5" />Pinned</span>}
            {comment.is_answered && <span className="flex items-center gap-0.5 text-[8px] font-bold text-success"><CheckCircle2 className="w-2.5 h-2.5" />Answered</span>}
            {comment.is_helpful && <span className="flex items-center gap-0.5 text-[8px] font-bold text-gold"><Star className="w-2.5 h-2.5" />Helpful</span>}
            {comment.is_recommended && <span className="flex items-center gap-0.5 text-[8px] font-bold text-information"><BookOpen className="w-2.5 h-2.5" />Recommended</span>}
          </div>
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              autoFocus
              className="w-full px-2 py-1.5 rounded-xl bg-muted/40 border border-border/30 text-[12px] focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleEdit} className="px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-semibold spring-tap">Save</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1 rounded-full glass text-[10px] font-semibold spring-tap">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-[12px] text-foreground/90 leading-relaxed">{renderRichContent(comment.content)}</div>

            {hasMedia && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {comment.media_urls.map((url) => (
                  <img key={url} src={url} className="w-20 h-20 rounded-xl object-cover" alt="" />
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {REACTIONS.filter((r) => (comment.reactions?.[r.id] || 0) > 0).map((r) => (
                <button
                  key={r.id}
                  onClick={() => discussion.reactToComment(comment.id, r.id)}
                  className={"flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] spring-tap " + (userReact === r.id ? "bg-primary/15 text-primary" : "bg-muted/40 text-muted-foreground")}
                >
                  <span>{r.emoji}</span>
                  <span className="font-semibold">{comment.reactions[r.id]}</span>
                </button>
              ))}

              <div className="relative">
                <button onClick={() => setShowReactions(!showReactions)} className="w-6 h-6 rounded-full glass grid place-items-center spring-tap">
                  <span className="text-[10px] text-muted-foreground">+</span>
                </button>
                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute top-full left-0 mt-1 flex gap-0.5 p-1.5 glass-strong rounded-full z-10"
                    >
                      {REACTIONS.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => { discussion.reactToComment(comment.id, r.id); setShowReactions(false); }}
                          className="w-7 h-7 grid place-items-center rounded-full hover:bg-muted spring-tap"
                        >
                          {r.emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setReplying(!replying)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full glass text-[10px] font-medium text-muted-foreground ml-auto spring-tap"
              >
                <Reply className="w-3 h-3" /> Reply
              </button>

              <button
                onClick={() => setShowActions(!showActions)}
                className="w-6 h-6 rounded-full glass grid place-items-center spring-tap relative"
              >
                <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full mt-1 w-40 glass-strong rounded-2xl overflow-hidden z-20 p-1"
                >
                  {isAuthor && (
                    <button onClick={() => { setEditing(true); setShowActions(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted text-[11px] font-medium text-left">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  )}
                  {canModerate && (
                    <>
                      <button onClick={() => { discussion.togglePin(comment.id); setShowActions(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted text-[11px] font-medium text-left">
                        <Pin className="w-3 h-3" /> {comment.is_pinned ? "Unpin" : "Pin"}
                      </button>
                      <button onClick={() => { discussion.toggleAnswered(comment.id); setShowActions(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted text-[11px] font-medium text-left">
                        <CheckCircle2 className="w-3 h-3" /> {comment.is_answered ? "Unmark answered" : "Mark answered"}
                      </button>
                      <button onClick={() => { discussion.toggleHelpful(comment.id); setShowActions(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted text-[11px] font-medium text-left">
                        <Star className="w-3 h-3" /> {comment.is_helpful ? "Unmark helpful" : "Mark helpful"}
                      </button>
                      <button onClick={() => { discussion.toggleRecommended(comment.id); setShowActions(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted text-[11px] font-medium text-left">
                        <BookOpen className="w-3 h-3" /> {comment.is_recommended ? "Unrecommend" : "Recommend Reading"}
                      </button>
                    </>
                  )}
                  <button onClick={shareComment} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted text-[11px] font-medium text-left">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                  <button onClick={copyLink} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted text-[11px] font-medium text-left">
                    <Link2 className="w-3 h-3" /> Copy Link
                  </button>
                  <button onClick={report} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted text-[11px] font-medium text-left text-muted-foreground">
                    <Flag className="w-3 h-3" /> Report
                  </button>
                  {(isAuthor || canModerate) && (
                    <button onClick={() => { discussion.deleteComment(comment.id); setShowActions(false); }} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-muted text-[11px] font-medium text-left text-destructive">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <AnimatePresence>
        {replying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden ml-4 mt-2"
          >
            <DiscussionComposer
              onSubmit={(content, _parentId, mediaUrls, discussionType) => {
                discussion.createComment(content, comment.id, mediaUrls, discussionType);
                setReplying(false);
              }}
              collaborators={collaborators}
              placeholder={`Reply to ${comment.author_name}...`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {replies.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground spring-tap mb-1"
          >
            {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-2 border-l border-border/15 pl-3"
              >
                {replies.map((reply) => {
                  const replyReplies = discussion.allComments.filter((c) => c.parent_id === reply.id);
                  return (
                    <DiscussionCommentItem
                      key={reply.id}
                      comment={reply}
                      replies={replyReplies}
                      depth={depth + 1}
                      discussion={discussion}
                      canModerate={canModerate}
                      collaborators={collaborators}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}