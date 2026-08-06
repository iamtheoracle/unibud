import React from "react";
import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function ResearchCard() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["card-research"],
    queryFn: () => base44.entities.ResearchProject.list("-updated_date", 5),
    staleTime: 120000,
  });

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <FlaskConical className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">No research projects yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.slice(0, 4).map((p) => (
        <Link key={p.id} to="/research" className="flex items-start gap-2.5 spring-tap">
          <FlaskConical className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{p.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {p.field || p.status || "Research project"}
            </p>
          </div>
        </Link>
      ))}
      <Link to="/research" className="block text-[12px] font-medium text-primary pt-1">
        All research →
      </Link>
    </div>
  );
}