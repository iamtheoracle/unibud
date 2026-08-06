import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Share2, Star, ExternalLink } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import { matchSubcategory, timeAgo, estimateReadingTime } from "./newsConstants";

const EASE = [0.16, 1, 0.3, 1];

export default function NewsCard({ article, onSave, onShare, onFollowTopic, index = 0 }) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const sub = matchSubcategory(article);

  const handleSave = () => {
    setSaved(true);
    onSave(article);
  };

  const handleShare = () => onShare(article);

  const handleFollow = () => {
    if (sub) {
      onFollowTopic(article);
      toast({ title: `Following ${sub.label}` });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: EASE }}
      className="rounded-[16px] overflow-hidden glass-card spring-tap"
    >
      {article.image && (
        <div className="aspect-[16/9] overflow-hidden relative">
          <Image src={article.image} fittingType="fill" className="w-full h-full" />
          {sub && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full glass-strong text-[9px] font-bold text-white">
              {sub.label}
            </span>
          )}
        </div>
      )}
      <div className="p-3">
        <p className="text-[13px] font-semibold text-foreground line-clamp-2 leading-snug">{article.title}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">{article.source}</span>
          <span className="text-[9px] text-muted-foreground/50">·</span>
          <span className="text-[10px] text-muted-foreground/70">{timeAgo(article.created_date)}</span>
          <span className="text-[9px] text-muted-foreground/50">·</span>
          <span className="text-[10px] text-muted-foreground/70">{estimateReadingTime(article.content)} min</span>
        </div>
        <div className="flex items-center gap-1 mt-2.5">
          <button onClick={handleSave} className={"flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold spring-tap " + (saved ? "bg-primary/15 text-primary" : "glass text-muted-foreground")}>
            <Bookmark className="w-3 h-3" /> {saved ? "Saved" : "Save"}
          </button>
          <button onClick={handleShare} className="flex items-center gap-1 px-2 py-1 rounded-full glass text-[10px] font-semibold text-muted-foreground spring-tap">
            <Share2 className="w-3 h-3" /> Share
          </button>
          {sub && (
            <button onClick={handleFollow} className="flex items-center gap-1 px-2 py-1 rounded-full glass text-[10px] font-semibold text-muted-foreground spring-tap">
              <Star className="w-3 h-3" /> Follow
            </button>
          )}
          {article.url && (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full glass text-[10px] font-semibold text-muted-foreground spring-tap">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}