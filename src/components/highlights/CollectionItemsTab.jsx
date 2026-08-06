import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bookmark, MessageSquare } from "lucide-react";
import { Image } from "@/components/ui/image";

/**
 * CollectionItemsTab — the Items tab for shared collections.
 * Lists all saved items with their discussion comment counts.
 * Tapping an item opens its per-item discussion.
 */
export default function CollectionItemsTab({ items = [], collectionId, onOpenItem }) {
  const { data: allComments = [] } = useQuery({
    queryKey: ["collection-item-counts", collectionId],
    queryFn: () => base44.entities.QuadComment.filter({ collection_id: collectionId }, "created_date", 500),
    enabled: !!collectionId,
    staleTime: 15000,
  });

  const commentCounts = {};
  allComments.forEach((c) => {
    if (c.item_id) commentCounts[c.item_id] = (commentCounts[c.item_id] || 0) + 1;
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Bookmark className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-[12px] text-muted-foreground">No items in this collection yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[320px] overflow-y-auto no-scrollbar">
      {items.map((item, i) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onOpenItem?.(item)}
          className="w-full flex items-center gap-3 p-2.5 rounded-2xl glass-card spring-tap text-left"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-card grid place-items-center">
            {item.image_url ? (
              <Image src={item.image_url} fittingType="fill" className="w-full h-full" />
            ) : (
              <Bookmark className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate">{item.title}</p>
            {item.subtitle && <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>}
            {item.source_name && (
              <p className="text-[9px] text-muted-foreground/60 truncate">{item.source_name}</p>
            )}
          </div>
          {commentCounts[item.id] > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary shrink-0">
              <MessageSquare className="w-3 h-3" />
              <span className="text-[10px] font-bold">{commentCounts[item.id]}</span>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}