import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Bookmark, ExternalLink, Globe } from "lucide-react";
import { Image } from "@/components/ui/image";
import SharedCollectionCard from "@/components/highlights/SharedCollectionCard";

function formatRelative(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

const EASE = [0.16, 1, 0.3, 1];

export default function CommunityCollections() {
  const [expandedFolder, setExpandedFolder] = useState(null);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: publicHighlights = [], isLoading } = useQuery({
    queryKey: ["community-highlights"],
    queryFn: () => base44.entities.Highlight.filter({ visibility: "public" }, "-created_date", 200),
    staleTime: 30000,
  });

  const collections = useMemo(() => {
    const groups = {};
    publicHighlights.forEach((h) => {
      if (user && h.created_by_id === user.id) return;
      const key = h.folder || "Uncategorized";
      if (!groups[key]) groups[key] = { folder: key, items: [], creatorId: h.created_by_id };
      groups[key].items.push(h);
    });
    return Object.values(groups);
  }, [publicHighlights, user]);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card rounded-[16px] p-4">
            <div className="h-4 w-1/2 shimmer rounded-full mb-2" />
            <div className="h-3 w-1/3 shimmer rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-6">
        <div className="w-20 h-20 rounded-full grid place-items-center mb-4 bg-primary/10">
          <Globe className="w-9 h-9 text-primary/50" strokeWidth={1.5} />
        </div>
        <p className="text-[15px] font-bold text-foreground">No shared collections yet</p>
        <p className="text-[12px] text-muted-foreground mt-1.5 max-w-[260px] leading-relaxed">
          When students share their collections with the community, they'll appear here for you to explore and save from.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {collections.map((col, i) => (
        <motion.div
          key={col.folder}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
        >
          <SharedCollectionCard
            folder={col.folder}
            itemCount={col.items.length}
            coverImage={col.items.find((h) => h.image_url)?.image_url}
            updatedAt={formatRelative(col.items[0]?.updated_date)}
            onOpen={() => setExpandedFolder(expandedFolder === col.folder ? null : col.folder)}
          />

          {expandedFolder === col.folder && (
            <div className="mt-2 ml-4 space-y-2 border-l border-border/30 pl-4">
              {col.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-[12px] glass-card">
                  <div className="w-10 h-10 rounded-[10px] overflow-hidden shrink-0 bg-card grid place-items-center">
                    {item.image_url ? (
                      <Image src={item.image_url} fittingType="fill" className="w-full h-full" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground line-clamp-1">{item.title}</p>
                    {item.subtitle && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{item.subtitle}</p>}
                  </div>
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-medium text-primary shrink-0"
                    >
                      <ExternalLink className="w-2.5 h-2.5" /> Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}