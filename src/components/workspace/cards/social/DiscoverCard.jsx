import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function DiscoverCard() {
  const { data: communities, isLoading } = useQuery({
    queryKey: ["card-discover"],
    queryFn: () => base44.entities.Community.list("-created_date", 6),
    staleTime: 120000,
  });

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!communities || communities.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Compass className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">Nothing to discover yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {communities.slice(0, 3).map((c) => (
        <Link key={c.id} to="/discover" className="flex items-center gap-2.5 spring-tap">
          <Compass className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{c.name}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{c.description || "Community"}</p>
          </div>
        </Link>
      ))}
      <Link to="/discover" className="block text-[12px] font-medium text-primary pt-1">
        Discover more →
      </Link>
    </div>
  );
}