import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { FolderOpen, Clock, Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * SharedCollectionCard — premium preview card for a shared Highlight
 * collection. Shows cover image, name, creator, item count, and an
 * open button. Used in the share sheet, community collections, and
 * message previews.
 */
export default function SharedCollectionCard({
  folder,
  itemCount = 0,
  coverImage,
  creator,
  description,
  updatedAt,
  onOpen,
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="crystal-card overflow-hidden"
    >
      {/* Cover */}
      {coverImage && !compact && (
        <div className="relative h-28 overflow-hidden">
          <Image src={coverImage} fittingType="fill" className="w-full h-full" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(var(--card)), transparent)" }} />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl glass-card grid place-items-center shrink-0 edge-light">
            <FolderOpen className="w-[18px] h-[18px] text-primary" strokeWidth={1.8} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[15px] text-foreground truncate">{folder || "Collection"}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
              {creator && (
                <>
                  <span className="text-[11px] text-muted-foreground/50">·</span>
                  <span className="text-[11px] text-muted-foreground truncate">by {creator}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {description && (
          <p className="text-[12px] text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">{description}</p>
        )}

        {updatedAt && (
          <div className="flex items-center gap-1 mt-2">
            <Clock className="w-3 h-3 text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground/60">Updated {updatedAt}</span>
          </div>
        )}

        {onOpen && (
          <button
            onClick={onOpen}
            className="w-full mt-3 py-2.5 rounded-xl bg-foreground text-background text-[13px] font-semibold spring-tap flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Open Collection
          </button>
        )}
      </div>
    </motion.div>
  );
}