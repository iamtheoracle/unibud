import React from "react";
import { Link } from "react-router-dom";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function FeedCard() {
  const { posts, isLoading } = useInfiniteFeed({
    queryKey: ["card-feed"],
    pageSize: 5,
  });

  if (isLoading && posts.length === 0) return <ListSkeleton rows={3} />;

  const display = posts.slice(0, 3);

  if (display.length === 0) {
    return <p className="text-[12px] text-muted-foreground py-2">No posts yet. Be the first to share.</p>;
  }

  return (
    <div className="space-y-3">
      {display.map((post) => (
        <Link key={post.id} to="/quad" className="block spring-tap">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-foreground/[0.08] grid place-items-center shrink-0 overflow-hidden">
              {post.author_image ? (
                <img src={post.author_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-foreground">{(post.author_name || "?")[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-foreground truncate">{post.author_name}</p>
              <p className="text-[12px] text-muted-foreground line-clamp-2">{post.content}</p>
            </div>
          </div>
        </Link>
      ))}
      <Link to="/quad" className="block text-[12px] font-medium text-primary pt-1">
        Open campus feed →
      </Link>
    </div>
  );
}