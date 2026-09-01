import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/quad/PostCard";

// Campus — recent posts from the viewer's university. Real, university-scoped.
export default function DiscoveryCampus({ user }) {
  const { data: posts } = useQuery({
    queryKey: ["campusPosts", user?.university],
    queryFn: () => base44.entities.QuadPost.filter({ university: user.university }, "-created_date", 6),
    enabled: !!user && !!user.university,
  });

  const campusPosts = posts || [];
  if (campusPosts.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-5">
        <Building2 className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">Campus</h2>
      </div>
      <div className="px-4 space-y-3">
        {campusPosts.map((p, i) => <PostCard key={p.id} post={p} user={user} index={i} />)}
      </div>
    </section>
  );
}