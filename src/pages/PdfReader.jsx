import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, Bookmark, Download, Highlighter, BookOpen, BookmarkCheck, Sparkles } from "lucide-react";
import BookBudPanel from "@/components/library/BookBudPanel";

export default function PdfReader() {
  const { resourceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const passedResource = location.state?.resource;

  const { data: fetchedResource, isLoading } = useQuery({
    queryKey: ["libraryResource", resourceId],
    queryFn: () => base44.entities.LibraryResource.get(resourceId),
    enabled: !passedResource,
  });

  const resource = passedResource || fetchedResource;
  const [page, setPage] = useState(resource?.current_page || 1);
  const [showBud, setShowBud] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [bookmarked, setBookmarked] = useState(resource?.is_bookmarked || false);

  if (!resource) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const totalPages = resource.pages || 250;

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 pb-2">
        <button onClick={() => navigate("/library")} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-muted/70">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-bold text-[14px] text-foreground truncate">{resource.title}</h1>
          <p className="text-[10px] text-muted-foreground truncate">{resource.author || resource.course_code} · Page {page} of {totalPages}</p>
        </div>
        <button onClick={() => setBookmarked(!bookmarked)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-muted/70">
          {bookmarked ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden px-4 pb-2">
        <div className="h-full bg-card rounded-[20px] premium-shadow border border-border/30 overflow-hidden flex flex-col">
          <div className="flex items-center gap-1 px-3 py-2 border-b border-border/30 bg-muted/30">
            <button onClick={() => setHighlighted(!highlighted)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${highlighted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Highlighter className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><BookOpen className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></button>
            <div className="flex-1" />
            <span className="text-[11px] font-semibold text-muted-foreground">{Math.round((page / totalPages) * 100)}%</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            <div className="max-w-md mx-auto">
              <p className="text-[11px] text-muted-foreground font-medium mb-3">{resource.author || resource.subject || resource.title}</p>
              <h2 className="font-heading font-bold text-[18px] text-foreground mb-4">
                {page <= 20 ? `Introduction to ${resource.subject || resource.title}` : `Section ${Math.ceil(page / 20)}`}
              </h2>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <p key={i} className={`text-[13px] leading-relaxed ${highlighted && i === 2 ? "bg-primary/15 px-1 rounded" : "text-foreground"}`}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/30">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-xl bg-muted text-[12px] font-semibold text-foreground disabled:opacity-30">Previous</button>
            <span className="text-[11px] font-semibold text-muted-foreground">{page} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1.5 rounded-xl bg-muted text-[12px] font-semibold text-foreground disabled:opacity-30">Next</button>
          </div>
        </div>
        {showBud && <BookBudPanel resourceName={resource.title} onClose={() => setShowBud(false)} />}
      </div>

      <div className="px-4 pb-5 pt-2 flex items-center gap-2 bg-gradient-to-t from-background via-background/95 to-transparent">
        <button onClick={() => setShowBud(true)} className="flex-1 h-[48px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(218,175,55,0.3)]">
          <Sparkles className="w-[18px] h-[18px]" /> Ask Bud
        </button>
        <button className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-foreground"><Download className="w-5 h-5" /></button>
      </div>
    </div>
  );
}