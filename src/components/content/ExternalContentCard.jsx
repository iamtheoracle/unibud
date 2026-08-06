import React from "react";
import { motion } from "framer-motion";
import { Bookmark, Heart, ExternalLink, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProvenanceBadge from "./ProvenanceBadge";
import { getContentOrigin } from "@/lib/content/contentProvenance";
import { Image } from "@/components/ui/image";

/**
 * ExternalContentCard — renders verified external content with clear
 * provenance labeling. Visually distinct from student-created posts:
 * no student avatar, prominent source badge, external link.
 *
 * Bookmarks and reactions are preserved during API transitions.
 * Community discussions are separate from external updates.
 */
export default function ExternalContentCard({ content, userId, onBookmark, onReact }) {
  const navigate = useNavigate();
  const isBookmarked = (content.bookmarked_by || []).includes(userId);
  const hasReacted = (content.reacted_by || []).includes(userId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="crystal-card p-4 mb-3"
    >
      {/* Provenance badge — always visible, always first */}
      <div className="flex items-center justify-between mb-2.5">
        <ProvenanceBadge label={content.source_label} sourceName={content.source_name} />
        <span className="text-[9px] text-muted-foreground font-medium tracking-wide">
          {getContentOrigin(content)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-bold text-foreground leading-snug mb-1.5 tracking-tight">
        {content.title}
      </h3>

      {/* Bud summary — never verbatim */}
      {content.summary && (
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 mb-3">
          {content.summary}
        </p>
      )}

      {/* Image */}
      {content.image_url && (
        <div className="rounded-xl overflow-hidden mb-3">
          <Image
            src={content.image_url}
            alt={content.title}
            fittingType="fill"
            className="w-full h-40"
          />
        </div>
      )}

      {/* Source link — always external */}
      {content.source_url && (
        <a
          href={content.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-primary font-bold mb-3 active:scale-95 transition-transform"
        >
          View Original
          <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
        </a>
      )}

      {/* Actions — bookmarks/reactions preserved during transition */}
      <div className="flex items-center gap-4 pt-2 border-t border-border/40">
        <button
          onClick={() => onReact?.(content)}
          className={`flex items-center gap-1.5 active:scale-90 transition-transform ${
            hasReacted ? "text-error" : "text-muted-foreground"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${hasReacted ? "fill-current" : ""}`}
            strokeWidth={2}
          />
          <span className="text-[11px] font-bold">{content.reaction_count || 0}</span>
        </button>
        <button
          onClick={() => onBookmark?.(content)}
          className={`flex items-center gap-1.5 active:scale-90 transition-transform ${
            isBookmarked ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Bookmark
            className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
            strokeWidth={2}
          />
        </button>
        {/* Community discussions are separate from external updates */}
        <button
          onClick={() => navigate("/quad")}
          className="flex items-center gap-1.5 text-muted-foreground active:scale-90 transition-transform ml-auto"
        >
          <MessageCircle className="w-4 h-4" strokeWidth={2} />
          <span className="text-[11px] font-bold">{content.discussion_count || 0}</span>
        </button>
      </div>
    </motion.div>
  );
}