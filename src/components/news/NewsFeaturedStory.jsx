import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Share2, ExternalLink } from "lucide-react";
import { Image } from "@/components/ui/image";
import { matchSubcategory, timeAgo, estimateReadingTime } from "./newsConstants";

const EASE = [0.16, 1, 0.3, 1];

export default function NewsFeaturedStory({ article, onSave, onShare, index = 0 }) {
  const [saved, setSaved] = useState(false);
  const sub = matchSubcategory(article);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: EASE }}
      className="relative rounded-[20px] overflow-hidden glass-card"
    >
      {article.image ? (
        <div className="aspect-[16/10] overflow-hidden">
          <Image src={article.image} fittingType="fill" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-muted to-card" />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4">
        {sub && (
          <span className="inline-block px-2 py-0.5 rounded-full glass-strong text-[9px] font-bold text-white mb-2">
            {sub.label}
          </span>
        )}
        <p className="text-[16px] font-bold text-white leading-tight line-clamp-3">{article.title}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] font-semibold text-white/90">{article.source}</span>
          <span className="text-[9px] text-white/50">·</span>
          <span className="text-[10px] text-white/70">{timeAgo(article.created_date)}</span>
          <span className="text-[9px] text-white/50">·</span>
          <span className="text-[10px] text-white/70">{estimateReadingTime(article.content)} min read</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => { setSaved(true); onSave(article); }} className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold spring-tap " + (saved ? "bg-white text-black" : "glass-strong text-white")}>
            <Bookmark className="w-3.5 h-3.5" /> {saved ? "Saved" : "Save"}
          </button>
          <button onClick={() => onShare(article)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong text-white text-[11px] font-semibold spring-tap">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          {article.url && (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong text-white text-[11px] font-semibold spring-tap">
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}