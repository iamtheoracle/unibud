import React from "react";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function OpportunitiesCard() {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["card-opportunities"],
    queryFn: async () => {
      const data = await base44.entities.Opportunity.list("-created_date", 5);
      return data || [];
    },
    staleTime: 120000,
  });

  if (isLoading) return <ListSkeleton rows={2} />;

  const list = (opportunities || []).slice(0, 4);

  if (list.length === 0) {
    return (
      <div className="py-2">
        <p className="text-[12px] text-muted-foreground mb-2">Internships, jobs, and networking await.</p>
        <Link to="/opportunities" className="text-[12px] font-medium text-primary">Explore opportunities →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {list.map((o) => (
        <Link key={o.id} to="/opportunities" className="flex items-center gap-3 spring-tap">
          <div className="w-8 h-8 rounded-lg bg-foreground/[0.08] grid place-items-center shrink-0">
            <Briefcase className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{o.title}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {o.company || o.organization || ""} {o.type ? `· ${o.type}` : ""}
            </p>
          </div>
        </Link>
      ))}
      <Link to="/opportunities" className="block text-[12px] font-medium text-primary pt-1">
        All opportunities →
      </Link>
    </div>
  );
}