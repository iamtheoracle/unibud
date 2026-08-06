import React from "react";
import { MessageSquare } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PostCard from "@/components/quad/PostCard";

/**
 * CommunityFeed — discussion feed within a community app.
 */
export default function CommunityFeed({ posts, user, onCompose }) {
  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No discussions yet"
        description="Be the first to start a conversation."
        action={onCompose ? { label: "New Post", onClick: onCompose } : undefined}
      />
    );
  }
  return (
    <div className="space-y-3">
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} user={user} index={i} />
      ))}
    </div>
  );
}