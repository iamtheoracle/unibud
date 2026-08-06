import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function NotesCard() {
  const { data: notes, isLoading } = useQuery({
    queryKey: ["card-notes"],
    queryFn: () => base44.entities.Note.list("-updated_date", 6),
    staleTime: 60000,
  });

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!notes || notes.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">No notes yet — start capturing ideas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.slice(0, 4).map((n) => (
        <Link key={n.id} to="/notes" className="flex items-start gap-2.5 spring-tap">
          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{n.title || "Untitled note"}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{n.content || "No content"}</p>
          </div>
        </Link>
      ))}
      <Link to="/notes" className="block text-[12px] font-medium text-primary pt-1">
        All notes →
      </Link>
    </div>
  );
}