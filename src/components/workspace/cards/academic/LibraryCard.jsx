import React from "react";
import { Link } from "react-router-dom";
import { BookMarked } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

const TYPE_LABEL = {
  book: "Book",
  journal: "Journal",
  paper: "Paper",
  past_question: "Past Q",
  lecture_note: "Note",
  thesis: "Thesis",
};

export default function LibraryCard() {
  const { data: resources, isLoading } = useQuery({
    queryKey: ["card-library"],
    queryFn: () => base44.entities.LibraryResource.list("-updated_date", 6),
    staleTime: 120000,
  });

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!resources || resources.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <BookMarked className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">No resources available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resources.slice(0, 4).map((r) => (
        <Link key={r.id} to="/library" className="flex items-center gap-2.5 spring-tap">
          <BookMarked className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{r.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {TYPE_LABEL[r.type] || "Resource"}{r.author ? ` · ${r.author}` : ""}
            </p>
          </div>
          {r.is_bookmarked && <span className="text-[10px] text-primary">★</span>}
        </Link>
      ))}
      <Link to="/library" className="block text-[12px] font-medium text-primary pt-1">
        Browse library →
      </Link>
    </div>
  );
}