import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const CATEGORY_LABEL = {
  transfer: "Transfers",
  match_report: "Match Report",
  preview: "Preview",
  analysis: "Analysis",
  injury: "Injury",
  general: "News",
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * FootballNewsCard — Airbnb-style large image article card.
 */
export default function FootballNewsCard({ article, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.2), duration: 0.4, ease: EASE }}
    >
      <Link to="/football" className="block rounded-2xl bg-card border border-border/30 overflow-hidden card-hover">
        {article.image_url && (
          <div className="aspect-[16/9] bg-muted overflow-hidden">
            <img src={article.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-foreground text-background">
              {CATEGORY_LABEL[article.category] || "News"}
            </span>
            <span className="text-[10px] text-muted-foreground">{article.source}</span>
          </div>
          <h3 className="text-[14px] font-bold text-foreground leading-snug line-clamp-2">{article.title}</h3>
          <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(article.published_at || article.created_date)}</span>
            <span>·</span>
            <span>{article.read_time_minutes || 3} min read</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}