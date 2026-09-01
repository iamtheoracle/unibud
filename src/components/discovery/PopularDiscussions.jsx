import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/quad/PostCard";

// Popular discussions — real posts ranked by engagement (likes + comments).
// Renders only when there is actual engagement.
export default function PopularDiscussions({ user }) {
  const { data: posts } = useQuery({
    queryKey: ["popularPosts"],
    queryFn: () => base44.entities.QuadPost.list("-created_date", 50),
    enabled: !!user,
  });

  const popular = useMemo(() => {
    const list = (posts || []).slice();
    list.sort((a, b) => ((b.likes_count || 0) + (b.comments_count || 0)) - ((a.likes_count || 0) + (a.comments_count || 0)));
    return list.slice(0, 5);
  }, [posts]);

  if (popular.length === 0) return null;
  // Only render if the top post has real engagement
  const top = popular[0];
  if ((top.likes_count || 0) + (top.comments_count || 0) === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-5">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">Popular discussions</h2>
      </div>
      <div className="px-4 space-y-3">
        {popular.map((p, i) => <PostCard key={p.id} post={p} user={user} index={i} />)}
      </div>
    </section>
  );
}