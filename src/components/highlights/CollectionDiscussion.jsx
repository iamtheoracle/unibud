import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, Filter } from "lucide-react";
import { useCollectionDiscussion } from "@/hooks/useCollectionDiscussion";
import DiscussionComposer from "./DiscussionComposer";
import DiscussionCommentItem from "./DiscussionCommentItem";
import EmptyState from "@/components/ui/EmptyState";

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
    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
      if (sortBy === "helpful") return (b.likes_count || 0) - (a.likes_count || 0);
      return 0;
    });
    return list;
  }, [discussion.unpinned, search, sortBy, showUnanswered]);

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
              onClick={() => setShowUnanswered(!showUnanswered)}
              className={"ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold spring-tap " + (showUnanswered ? "bg-foreground text-background" : "glass text-muted-foreground")}
            >
              <Filter className="w-3 h-3" /> Unanswered
            </button>
          </div>
        </div>
      )}

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
          onSubmit={(content, parentId, mediaUrls) => discussion.createComment(content, parentId, mediaUrls)}
          collaborators={collaborators}
          placeholder="Ask a question about this collection..."
        />
      )}
    </div>
  );
}