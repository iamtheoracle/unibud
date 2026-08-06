import React, { useState, useMemo, useRef } from "react";
import { Search, MessageSquare, Filter, CheckCircle2, BookOpen } from "lucide-react";
import { useCollectionDiscussion } from "@/hooks/useCollectionDiscussion";
import DiscussionComposer from "./DiscussionComposer";
import DiscussionCommentItem from "./DiscussionCommentItem";
import EmptyState from "@/components/ui/EmptyState";
import TypingIndicator from "./TypingIndicator";
import { DISCUSSION_TYPES } from "./discussionConstants";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "helpful", label: "Helpful" },
];

/**
 * CollectionDiscussion — the Discussion tab for shared collections.
 * Shows search, sort (newest/oldest/helpful), unanswered filter,
 * pinned comments, threaded comment list, and a rich composer.
 * Adapts to per-item discussions when itemId is passed.
 */
export default function CollectionDiscussion({
  collectionId, itemId, collaborators = [], user, canModerate = false, canComment = true,
}) {
  const discussion = useCollectionDiscussion(collectionId, itemId, collaborators, user);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showUnanswered, setShowUnanswered] = useState(false);
  const [showAccepted, setShowAccepted] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef(null);

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setIsTyping(false), 3000);
  };

  const sorted = useMemo(() => {
    let list = [...discussion.unpinned];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.content?.toLowerCase().includes(q) ||
          c.author_name?.toLowerCase().includes(q)
      );
    }
    if (showUnanswered) {
      list = list.filter((c) => (c.replies_count || 0) === 0);
    }
    if (showAccepted) {
      list = list.filter((c) => c.is_answered);
    }
    if (showRecommended) {
      list = list.filter((c) => c.is_recommended);
    }
    if (typeFilter !== "all") {
      list = list.filter((c) => c.discussion_type === typeFilter);
    }
    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
      if (sortBy === "helpful") return (b.likes_count || 0) - (a.likes_count || 0);
      return 0;
    });
    return list;
  }, [discussion.unpinned, search, sortBy, showUnanswered, showAccepted, showRecommended, typeFilter]);

  if (discussion.isLoading) {
    return (
      <div className="py-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-2xl glass-card">
            <div className="h-3 w-1/3 shimmer rounded-full mb-2" />
            <div className="h-2 w-2/3 shimmer rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const isEmpty = discussion.threads.length === 0 && !search && !showUnanswered;

  return (
    <div className="flex flex-col h-[340px]">
      {!isEmpty && (
        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground z-10" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-[12px] focus:outline-none focus:border-primary/30"
            />
          </div>
          <div className="flex gap-1.5 items-center">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={"px-2.5 py-1 rounded-full text-[10px] font-semibold spring-tap " + (sortBy === s.id ? "bg-foreground text-background" : "glass text-muted-foreground")}
              >
                {s.label}
              </button>
            ))}
            <button
              onClick={() => setShowAccepted(!showAccepted)}
              className={"flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold spring-tap " + (showAccepted ? "bg-foreground text-background" : "glass text-muted-foreground")}
            >
              <CheckCircle2 className="w-3 h-3" /> Accepted
            </button>
            <button
              onClick={() => setShowRecommended(!showRecommended)}
              className={"flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold spring-tap " + (showRecommended ? "bg-foreground text-background" : "glass text-muted-foreground")}
            >
              <BookOpen className="w-3 h-3" /> Recommended
            </button>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-muted/40 border border-border/30 focus:outline-none"
            >
              <option value="all">All Types</option>
              {DISCUSSION_TYPES.filter((t) => t.id !== "none").map((t) => (
                <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowUnanswered(!showUnanswered)}
              className={"ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold spring-tap " + (showUnanswered ? "bg-foreground text-background" : "glass text-muted-foreground")}
            >
              <Filter className="w-3 h-3" /> Unanswered
            </button>
          </div>
        </div>
      )}

      {isTyping && <TypingIndicator />}

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-3">
        {isEmpty ? (
          <EmptyState
            icon={MessageSquare}
            title="No discussion yet"
            description="Be the first to ask a question or share a resource."
            budGuidance="Start the conversation — ask a question or share something useful for your collaborators."
          />
        ) : (
          <>
            {discussion.pinned.map((c) => (
              <DiscussionCommentItem
                key={c.id}
                comment={c}
                replies={c._replies}
                discussion={discussion}
                canModerate={canModerate}
                collaborators={collaborators}
              />
            ))}
            {sorted.map((c) => (
              <DiscussionCommentItem
                key={c.id}
                comment={c}
                replies={c._replies}
                discussion={discussion}
                canModerate={canModerate}
                collaborators={collaborators}
              />
            ))}
            {sorted.length === 0 && discussion.pinned.length === 0 && (
              <p className="text-center py-6 text-[12px] text-muted-foreground">
                No comments match your search.
              </p>
            )}
          </>
        )}
      </div>

      {canComment && (
        <DiscussionComposer
          onSubmit={(content, parentId, mediaUrls, discussionType) => discussion.createComment(content, parentId, mediaUrls, discussionType)}
          collaborators={collaborators}
          placeholder="Ask a question about this collection..."
          onTyping={handleTyping}
        />
      )}
    </div>
  );
}