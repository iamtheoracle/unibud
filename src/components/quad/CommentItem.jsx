import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal, Heart, Reply, Trash2, Flag, Copy, Pin, Pencil, BadgeCheck, Play,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { REACTIONS, getUserReaction, setUserReaction, timeAgo, formatCount } from "./quadConstants";

const COMMENT_MENU = [
  { id: "pin", label: "Pin", icon: Pin },
  { id: "copy", label: "Copy", icon: Copy },
  { id: "translate", label: "Translate", icon: Pencil },
  { id: "edit", label: "Edit", icon: Pencil, ownerOnly: true },
  { id: "report", label: "Report", icon: Flag },
  { id: "delete", label: "Delete", icon: Trash2, ownerOnly: true, danger: true },
];

export default function CommentItem({ comment, isOwner, onReply, depth = 0 }) {
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [userReaction, setUserReactionState] = useState(() => getUserReaction(comment.id));
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [translated, setTranslated] = useState(null);
  const [_translating, setTranslating] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const reactionObj = REACTIONS.find((r) => r.id === userReaction);

  const handleReact = async () => {
    const newReaction = userReaction ? null : "like";
    setUserReactionState(newReaction || null);
    setUserReaction(comment.id, newReaction);

    const currentReactions = { ...(comment.reactions || {}) };
    if (newReaction) {
      currentReactions[newReaction] = (currentReactions[newReaction] || 0) + 1;
    } else if (userReaction) {
      currentReactions[userReaction] = Math.max(0, (currentReactions[userReaction] || 0) - 1);
    }
    const newCount = Object.values(currentReactions).reduce((a, b) => a + b, 0);

    try {
      await base44.entities.QuadComment.update(comment.id, {
        reactions: currentReactions,
        likes_count: newCount,
      });
      qc.invalidateQueries({ queryKey: ["quadComments", comment.post_id] });
    } catch {}
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      await base44.entities.QuadComment.update(comment.id, {
        content: editText,
        is_edited: true,
      });
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["quadComments", comment.post_id] });
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await base44.entities.QuadComment.delete(comment.id);
      qc.invalidateQueries({ queryKey: ["quadComments", comment.post_id] });
    } catch {}
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following text to English. If it's already in English, translate it to French. Return only the translation, nothing else:\n\n${comment.content}`,
      });
      setTranslated(typeof res === "string" ? res : res?.response || "");
    } catch {
      setTranslated("Translation unavailable");
    }
    setTranslating(false);
    setMenuOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(comment.content);
    setMenuOpen(false);
  };

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
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

  const handleMenuAction = (action) => {
    setMenuOpen(false);
    switch (action) {
      case "edit": setEditing(true); break;
      case "delete": handleDelete(); break;
      case "copy": handleCopy(); break;
      case "translate": handleTranslate(); break;
      case "pin": qc.invalidateQueries({ queryKey: ["quadComments", comment.post_id] }); break;
      default: break;
    }
  };

  const avatar = comment.author_image;
  const displayName = comment.author_name || "Anonymous";
  const marginLeft = Math.min(depth, 2) * 32;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginLeft }}
      className="flex gap-2.5"
    >
      {/* Avatar */}
      {avatar ? (
        <img src={avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" loading="lazy" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-[11px] flex-shrink-0">
          {displayName.charAt(0)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="bg-muted/40 rounded-[16px] px-3 py-2 inline-block max-w-full">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-heading font-semibold text-[12px] text-foreground">{displayName}</span>
            {comment.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary fill-primary/20" />}
            <span className="text-[10px] text-muted-foreground ml-1">{timeAgo(comment.created_date)}</span>
            {comment.is_edited && <span className="text-[9px] text-muted-foreground italic">· edited</span>}
          </div>
          {editing ? (
            <div className="mt-1">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full bg-card rounded-[12px] px-2.5 py-1.5 text-[12px] text-foreground border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <div className="flex gap-2 mt-1.5">
                <button onClick={handleEdit} className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold">Save</button>
                <button onClick={() => setEditing(false)} className="px-2.5 py-1 rounded-lg text-muted-foreground text-[10px] font-semibold hover:bg-muted">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[12px] leading-relaxed text-foreground whitespace-pre-wrap break-words">{comment.content}</p>
              {translated && (
                <p className="text-[11px] text-muted-foreground italic mt-1 pt-1 border-t border-border/20">
                  🌐 {translated}
                </p>
              )}
            </>
          )}

          {/* Media */}
          {comment.media_urls && comment.media_urls.length > 0 && (
            <div className="flex gap-1 mt-2">
              {comment.media_urls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover" loading="lazy" />
              ))}
            </div>
          )}

          {/* Voice reply */}
          {comment.voice_url && (
            <div className="flex items-center gap-2 mt-2 bg-card rounded-lg px-2.5 py-1.5">
              <Play className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Voice reply</span>
              <audio src={comment.voice_url} controls className="h-6 flex-1" style={{ height: 24 }} />
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 mt-1 ml-1">
          <button
            onClick={handleReact}
            className="flex items-center gap-1 spring-tap"
          >
            {reactionObj ? (
              <span className="text-[12px]">{reactionObj.emoji}</span>
            ) : (
              <Heart className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
            )}
            {comment.likes_count > 0 && (
              <span className="text-[10px] font-semibold text-muted-foreground">{formatCount(comment.likes_count)}</span>
            )}
          </button>
          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground spring-tap"
          >
            <Reply className="w-3.5 h-3.5" strokeWidth={1.8} /> Reply
          </button>
          {comment.replies_count > 0 && (
            <button
              onClick={loadReplies}
              className="text-[10px] font-semibold text-primary spring-tap"
            >
              {loadingReplies ? "Loading..." : showReplies ? "Hide replies" : `${comment.replies_count} ${comment.replies_count === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>

        {/* Nested replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isOwner={false}
                onReply={onReply}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-6 h-6 rounded-lg hover:bg-muted flex items-center justify-center flex-shrink-0"
        >
          <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-8 w-40 rounded-[14px] glass-strong elevated-shadow p-1 z-50"
            >
              {COMMENT_MENU.filter((item) => !item.ownerOnly || isOwner).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuAction(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-[11px] font-medium transition-colors ${
                    item.danger ? "text-error hover:bg-error/5" : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}