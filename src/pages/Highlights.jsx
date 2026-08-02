import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ChevronLeft, Bookmark, ExternalLink, Trash2, Folder } from "lucide-react";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];
const DEFAULT_FOLDERS = [
  "Watch Later", "Study Later", "My Playlist", "Career",
  "Sports", "Favorites", "Reading List", "Travel", "Projects",
];

/**
 * Highlights — personal saved content page.
 * Students view and organize everything they've saved from hubs:
 * movies, music, articles, matches, jobs, events, and more.
 */
export default function Highlights() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFolder, setActiveFolder] = useState("All");

  const { data: highlights = [], isLoading } = useQuery({
    queryKey: ["highlights"],
    queryFn: () => base44.entities.Highlight.list("-created_date", 200),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Highlight.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["highlights"] }),
  });

  const userFolders = [...new Set(highlights.map((h) => h.folder).filter(Boolean))];
  const folders = ["All", ...userFolders];
  const filtered = activeFolder === "All" ? highlights : highlights.filter((h) => h.folder === activeFolder);

  return (
    <div className="min-h-screen pb-32 safe-area-pt">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-[520px] mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap" aria-label="Back">
            <ChevronLeft className="w-[20px] h-[20px] text-foreground" strokeWidth={2} />
          </button>
          <h1 className="text-[18px] font-bold tracking-tight text-foreground">Highlights</h1>
          <span className="text-[12px] text-muted-foreground ml-auto">{highlights.length} saved</span>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4">
        {/* Folder chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap flex items-center gap-1.5 ${
                activeFolder === f ? "bg-foreground text-background" : "bg-card text-muted-foreground border border-border/40"
              }`}
            >
              {f !== "All" && <Folder className="w-3 h-3" />}
              {f}
            </button>
          ))}
        </div>

        {/* Suggested folders when user has none */}
        {userFolders.length === 0 && !isLoading && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Suggested Folders</p>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_FOLDERS.map((f) => (
                <span key={f} className="px-3 py-1.5 rounded-full bg-card text-[11px] font-medium text-muted-foreground border border-border/40 flex items-center gap-1.5">
                  <Folder className="w-3 h-3" /> {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] glass-card">
                <div className="w-12 h-12 rounded-[12px] shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 shimmer rounded-full" />
                  <div className="h-2 w-1/3 shimmer rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 px-6">
            <div className="w-20 h-20 rounded-full grid place-items-center mb-4 bg-primary/10">
              <Bookmark className="w-9 h-9 text-primary/50" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-bold text-foreground">No highlights yet</p>
            <p className="text-[12px] text-muted-foreground mt-1.5 max-w-[260px] leading-relaxed">
              Save movies, music, articles, matches, and more from any hub. Your saved items will appear here, organized into folders.
            </p>
            <button onClick={() => navigate("/communities")} className="mt-4 px-5 py-2.5 rounded-full bg-foreground text-background text-[13px] font-semibold spring-tap">
              Explore Hubs
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
                className="flex items-center gap-3 p-3 rounded-[16px] glass-card"
              >
                <div className="w-12 h-12 rounded-[12px] overflow-hidden shrink-0 bg-card grid place-items-center">
                  {item.image_url ? (
                    <Image src={item.image_url} fittingType="fill" className="w-full h-full" />
                  ) : (
                    <Bookmark className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground line-clamp-1">{item.title}</p>
                  {item.subtitle && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.subtitle}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {item.folder && (
                      <span className="text-[9px] font-medium text-muted-foreground/70 px-1.5 py-0.5 rounded-full bg-secondary/50">{item.folder}</span>
                    )}
                    {item.source_name && item.source_url && (
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-2.5 h-2.5" /> {item.source_name}
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground hover:text-destructive spring-tap shrink-0"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}