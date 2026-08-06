import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { extractMentions, getUserReaction, setUserReaction, REACTIONS } from "@/components/quad/quadConstants";

/**
 * useCollectionDiscussion — manages threaded discussions for shared
 * Highlight collections. Reuses the QuadComment entity (extended with
 * collection_id / item_id) so no new database entity is needed.
 *
 * Supports: threaded replies, reactions, pinning, answered/helpful
 * marks, edit/delete, real-time subscription, and collaborator
 * notifications via the existing Notification entity.
 */
export function useCollectionDiscussion(collectionId, itemId, collaborators = [], user) {
  const queryClient = useQueryClient();
  const userId = user?.id;
  const userName = user?.full_name || user?.email || "Student";
  const userImage = user?.avatar_url || user?.image || "";

  const queryKey = itemId
    ? ["collection-discussion", "item", itemId]
    : ["collection-discussion", "collection", collectionId];

  const filter = itemId
    ? { item_id: itemId }
    : { collection_id: collectionId, item_id: "" };

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => base44.entities.QuadComment.filter(filter, "created_date", 200),
    enabled: !!(itemId || collectionId),
    staleTime: 10000,
  });

  useEffect(() => {
    const unsubscribe = base44.entities.QuadComment.subscribe(() => {
      queryClient.invalidateQueries({ queryKey });
    });
    return unsubscribe;
  }, [queryKey, queryClient]);

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesOf = (id) => comments.filter((c) => c.parent_id === id);
  const threads = topLevel.map((c) => ({ ...c, _replies: repliesOf(c.id) }));
  const pinned = threads.filter((c) => c.is_pinned);
  const unpinned = threads.filter((c) => !c.is_pinned);

  const createComment = async (content, parentId = null, mediaUrls = [], discussionType = "none") => {
    const mentions = extractMentions(content);
    await base44.entities.QuadComment.create({
      post_id: collectionId,
      collection_id: collectionId,
      item_id: itemId || "",
      content,
      author_name: userName,
      author_image: userImage,
      author_role: "student",
      parent_id: parentId || "",
      mentions,
      media_urls: mediaUrls,
      discussion_type: discussionType,
      reactions: {},
      likes_count: 0,
      replies_count: 0,
      is_edited: false,
      is_pinned: false,
      is_answered: false,
      is_helpful: false,
      is_recommended: false,
      university: user?.university || "",
    });

    if (parentId) {
      const parent = comments.find((c) => c.id === parentId);
      await base44.entities.QuadComment.update(parentId, {
        replies_count: (parent?.replies_count || 0) + 1,
      });
    }

    const targets = new Set();
    if (parentId) {
      const parent = comments.find((c) => c.id === parentId);
      if (parent?.created_by_id && parent.created_by_id !== userId)
        targets.add(parent.created_by_id);
    } else {
      collaborators.forEach((c) => {
        if (c.user_id !== userId) targets.add(c.user_id);
      });
    }
    collaborators.forEach((c) => {
      const nameKey = (c.name || "").toLowerCase().replace(/\s+/g, "");
      if (mentions.some((m) => nameKey.includes(m.toLowerCase()))) {
        if (c.user_id !== userId) targets.add(c.user_id);
      }
    });

    const link = `${window.location.origin}/highlights?collection=${encodeURIComponent(collectionId)}`;
    for (const tid of targets) {
      try {
        await base44.entities.Notification.create({
          title: parentId ? "Reply in collection" : "New comment in collection",
          message: parentId
            ? `${userName} replied to a comment in "${collectionId}"`
            : `${userName} commented on "${collectionId}"`,
          type: "social",
          category: "social",
          user_id: tid,
          link,
          icon: "MessageSquare",
          source: "highlights",
          action: parentId ? "discussion_reply" : "discussion_comment",
        });
      } catch {}
    }

    queryClient.invalidateQueries({ queryKey });
  };

  const editComment = async (commentId, newContent) => {
    await base44.entities.QuadComment.update(commentId, {
      content: newContent,
      is_edited: true,
      mentions: extractMentions(newContent),
    });
    queryClient.invalidateQueries({ queryKey });
  };

  const deleteComment = async (commentId) => {
    const childReplies = comments.filter((c) => c.parent_id === commentId);
    if (childReplies.length > 0) {
      await base44.entities.QuadComment.deleteMany({ parent_id: commentId });
    }
    await base44.entities.QuadComment.delete(commentId);
    queryClient.invalidateQueries({ queryKey });
  };

  const reactToComment = async (commentId, reactionId) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;
    const reactions = { ...(comment.reactions || {}) };
    const current = getUserReaction(commentId);
    if (current === reactionId) {
      reactions[reactionId] = Math.max(0, (reactions[reactionId] || 0) - 1);
      if (reactions[reactionId] === 0) delete reactions[reactionId];
      setUserReaction(commentId, null);
    } else {
      if (current && reactions[current]) {
        reactions[current] = Math.max(0, reactions[current] - 1);
        if (reactions[current] === 0) delete reactions[current];
      }
      reactions[reactionId] = (reactions[reactionId] || 0) + 1;
      setUserReaction(commentId, reactionId);
    }
    const total = Object.values(reactions).reduce((a, b) => a + b, 0);
    const isAdding = current !== reactionId;
    await base44.entities.QuadComment.update(commentId, {
      reactions,
      likes_count: total,
    });
    if (isAdding && comment?.created_by_id && comment.created_by_id !== userId) {
      const emoji = REACTIONS.find((r) => r.id === reactionId)?.emoji || "";
      try {
        await base44.entities.Notification.create({
          title: "New reaction",
          message: `${userName} reacted ${emoji} to your comment in "${collectionId}"`,
          type: "social",
          category: "social",
          user_id: comment.created_by_id,
          link: `${window.location.origin}/highlights?collection=${encodeURIComponent(collectionId)}`,
          icon: "Heart",
          source: "highlights",
          action: "comment_reaction",
        });
      } catch {}
    }
    queryClient.invalidateQueries({ queryKey });
  };

  const togglePin = async (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    await base44.entities.QuadComment.update(commentId, {
      is_pinned: !comment?.is_pinned,
    });
    queryClient.invalidateQueries({ queryKey });
  };

  const toggleAnswered = async (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    const newAnswered = !comment?.is_answered;
    await base44.entities.QuadComment.update(commentId, {
      is_answered: newAnswered,
    });
    if (newAnswered && comment?.created_by_id && comment.created_by_id !== userId) {
      try {
        await base44.entities.Notification.create({
          title: "Answer accepted",
          message: `${userName} accepted your answer in "${collectionId}"`,
          type: "social",
          category: "social",
          user_id: comment.created_by_id,
          link: `${window.location.origin}/highlights?collection=${encodeURIComponent(collectionId)}`,
          icon: "CheckCircle2",
          source: "highlights",
          action: "answer_accepted",
        });
      } catch {}
    }
    queryClient.invalidateQueries({ queryKey });
  };

  const toggleHelpful = async (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    const newHelpful = !comment?.is_helpful;
    await base44.entities.QuadComment.update(commentId, {
      is_helpful: newHelpful,
    });
    if (newHelpful && comment?.created_by_id && comment.created_by_id !== userId) {
      try {
        await base44.entities.Notification.create({
          title: "Marked as Most Helpful",
          message: `${userName} marked your comment as Most Helpful in "${collectionId}"`,
          type: "social",
          category: "social",
          user_id: comment.created_by_id,
          link: `${window.location.origin}/highlights?collection=${encodeURIComponent(collectionId)}`,
          icon: "Star",
          source: "highlights",
          action: "marked_helpful",
        });
      } catch {}
    }
    queryClient.invalidateQueries({ queryKey });
  };

  const toggleRecommended = async (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    const newRecommended = !comment?.is_recommended;
    await base44.entities.QuadComment.update(commentId, {
      is_recommended: newRecommended,
    });
    if (newRecommended && comment?.created_by_id && comment.created_by_id !== userId) {
      try {
        await base44.entities.Notification.create({
          title: "Recommended Reading",
          message: `${userName} marked your comment as Recommended Reading in "${collectionId}"`,
          type: "social",
          category: "social",
          user_id: comment.created_by_id,
          link: `${window.location.origin}/highlights?collection=${encodeURIComponent(collectionId)}`,
          icon: "BookOpen",
          source: "highlights",
          action: "marked_recommended",
        });
      } catch {}
    }
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    threads,
    pinned,
    unpinned,
    allComments: comments,
    isLoading,
    createComment,
    editComment,
    deleteComment,
    reactToComment,
    togglePin,
    toggleAnswered,
    toggleHelpful,
    toggleRecommended,
    isAuthor: (comment) => comment.created_by_id === userId,
    userReaction: (commentId) => getUserReaction(commentId),
  };
}