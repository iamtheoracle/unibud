import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PostCard from "./PostCard";
import EmptyState from "@/components/ui/EmptyState";

// "Following" feed — posts only from users the current user follows.
// Real data via the Follow graph; honest empty states when empty.
export default function FollowingFeed({ user, followingIds }) {
  const ids = [...followingIds];

  const { data: posts, isLoading } = useQuery({
    queryKey: ["followingFeed", ids.join(",")],
    queryFn: () => base44.entities.QuadPost.filter(
      { created_by_id: { $in: ids } },
      "-created_date",
      50
    ),
    enabled: ids.length > 0,
  });

  if (ids.length === 0) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          icon={Users}
          title="Follow people to see their posts"
          description="Posts from people you follow will show up here."
        />
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-center text-[12px] text-muted-foreground py-10">Loading…</p>;
  }

  if ((posts || []).length === 0) {
    return (
      <div className="px-4 py-10">
        <EmptyState icon={Users} title="No posts yet" description="The people you follow haven't posted yet." />
      </div>
    );
  }

  return (
    <div className="px-4 space-y-3 pb-8 max-w-2xl mx-auto">
      {posts.map((p, i) => (
        <PostCard key={p.id} post={p} user={user} index={i} />
      ))}
    </div>
  );
}