import React from "react";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function CareerCard() {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["card-career"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 6),
    staleTime: 120000,
  });

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Briefcase className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">No opportunities right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {opportunities.slice(0, 4).map((o) => (
        <Link key={o.id} to="/career" className="flex items-start gap-2.5 spring-tap">
          <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{o.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {o.type || o.category || "Opportunity"}{o.company ? ` · ${o.company}` : ""}
            </p>
          </div>
        </Link>
      ))}
      <Link to="/career" className="block text-[12px] font-medium text-primary pt-1">
        Explore careers →
      </Link>
    </div>
  );
}