import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Loader2, ChevronDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import CommentItem from "./CommentItem";
import CommentComposer from "./CommentComposer";
import EmptyState from "@/components/ui/EmptyState";
import { PAGE_SIZE } from "./quadConstants";

/**
 * Comment section for a post — lazy-loaded, with nested replies.
 */
export default function CommentSection({ postId, user, isOpen }) {
  const qc = useQueryClient();
  const [replyTo, setReplyTo] = useState(null);
  const [allComments, setAllComments] = useState([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["quadComments", postId],
    queryFn: async () => {
      const filter = { post_id: postId, parent_id: "" };
      const items = await base44.entities.QuadComment.filter(filter, "-created_date", PAGE_SIZE);
      return items;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (data) {
      setAllComments(data);
    }
  }, [data]);

  // Realtime subscription for new comments
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = base44.entities.QuadComment.subscribe((event) => {
      if (event.data?.post_id === postId) {
        qc.invalidateQueries({ queryKey: ["quadComments", postId] });
      }
    });
    return unsubscribe;
  }, [postId, isOpen, qc]);

  const loadMore = async () => {
    if (!allComments.length) return;
    const lastDate = allComments[allComments.length - 1].created_date;
    try {
      const more = await base44.entities.QuadComment.filter(
        { post_id: postId, parent_id: "", created_date: { $lt: lastDate } },
        "-created_date",
        PAGE_SIZE
      );
      setAllComments((prev) => [...prev, ...more]);
    } catch {}
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-border/30 bg-muted/20"
    >
      <div className="p-3 space-y-3">
        {/* Typing indicator (simulated for now — would connect to realtime presence) */}
        {/* Comment Composer */}
        <CommentComposer
          postId={postId}
          user={user}
          parentComment={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />

        {/* Comments list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          </div>
        ) : allComments.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No comments yet"
            description="Start the conversation"
            className="py-6"
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {allComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isOwner={comment.author_name === (user?.full_name || user?.email?.split("@")[0])}
                  onReply={handleReply}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load more */}
        {allComments.length >= PAGE_SIZE && (
          <button
            onClick={loadMore}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-primary hover:bg-muted/30 rounded-lg spring-tap"
          >
            {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Load more comments
          </button>
        )}
      </div>
    </motion.div>
  );
}