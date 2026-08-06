import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Heart, Eye, FileText } from "lucide-react";
import { PORTFOLIO_TYPES, formatNumber } from "./careerConstants";

export default function PortfolioCard({ item, index = 0 }) {
  const typeMeta = PORTFOLIO_TYPES[item.type] || PORTFOLIO_TYPES.project;
  const Icon = typeMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden card-hover"
    >
      {item.cover_url ? (
        <div className="h-28 overflow-hidden">
          <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className={"h-28 flex items-center justify-center " + typeMeta.bg}>
          <Icon className={"w-10 h-10 " + typeMeta.color} strokeWidth={1.5} />
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={"px-2 py-0.5 rounded-full text-[9px] font-semibold " + typeMeta.bg + " " + typeMeta.color}>{typeMeta.label}</span>
          {item.is_featured && <span className="text-[9px] font-bold text-primary">★ Featured</span>}
        </div>
        <h3 className="font-heading font-semibold text-[13px] text-foreground leading-snug line-clamp-2">{item.title}</h3>
        {item.description && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        )}

        {item.skills && item.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-full bg-muted text-[9px] text-muted-foreground font-medium">{skill}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Heart className="w-3 h-3" /> {formatNumber(item.likes_count || 0)}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Eye className="w-3 h-3" /> {formatNumber(item.views_count || 0)}
            </span>
          </div>
          {item.external_link && (
            <a href={item.external_link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-muted spring-tap">
              <ExternalLink className="w-3.5 h-3.5 text-foreground" />
            </a>
          )}
          {item.file_url && !item.external_link && (
            <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-muted spring-tap">
              <FileText className="w-3.5 h-3.5 text-foreground" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}