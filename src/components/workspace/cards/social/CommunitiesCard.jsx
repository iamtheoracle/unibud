import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function CommunitiesCard() {
  const { data: communities, isLoading } = useQuery({
    queryKey: ["card-communities"],
    queryFn: async () => {
      const data = await base44.entities.Community.list("-updated_date", 5);
      return data || [];
    },
    staleTime: 120000,
  });

  if (isLoading) return <ListSkeleton rows={2} />;

  const list = (communities || []).slice(0, 4);

  if (list.length === 0) {
    return (
      <div className="py-2">
        <p className="text-[12px] text-muted-foreground mb-2">Join communities that match your interests.</p>
        <Link to="/communities" className="text-[12px] font-medium text-primary">Browse communities →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {list.map((c) => (
        <Link key={c.id} to={`/community/${c.id}`} className="flex items-center gap-3 spring-tap">
          <div className="w-8 h-8 rounded-lg bg-foreground/[0.08] grid place-items-center shrink-0">
            <Users className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{c.name}</p>
            <p className="text-[11px] text-muted-foreground">{c.member_count || c.members_count || 0} members</p>
          </div>
        </Link>
      ))}
      <Link to="/communities" className="block text-[12px] font-medium text-primary pt-1">
        All communities →
      </Link>
    </div>
  );
}