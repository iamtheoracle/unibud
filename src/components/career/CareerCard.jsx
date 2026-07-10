import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Bookmark, ExternalLink, Building2 } from "lucide-react";
import { CAREER_TYPES, formatRelativeTime } from "./careerConstants";

export default function CareerCard({ opportunity, index = 0, onBookmark }) {
  const [bookmarked, setBookmarked] = useState(opportunity.is_saved || false);
  const typeMeta = CAREER_TYPES[opportunity.type] || CAREER_TYPES.internship;
  const Icon = typeMeta.icon;
  const deadline = formatRelativeTime(opportunity.deadline);
  const isClosingSoon = opportunity.deadline && new Date(opportunity.deadline) - new Date() < 7 * 86400000;

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (onBookmark) onBookmark(opportunity);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] soft-shadow border border-border/40 p-4 card-hover"
    >
      <div className="flex items-start gap-3">
        <div className={"w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 " + typeMeta.bg}>
          <Icon className={"w-5 h-5 " + typeMeta.color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-semibold text-[14px] text-foreground leading-snug line-clamp-2">{opportunity.title}</h3>
            <button onClick={handleBookmark} className="flex-shrink-0 p-1 -mt-1 -mr-1 spring-tap">
              <Bookmark className={"w-[18px] h-[18px] transition-colors " + (bookmarked ? "fill-primary text-primary" : "text-muted-foreground")} strokeWidth={2} />
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3" /> {opportunity.organization || "Organization"}
          </p>
        </div>
      </div>

      {opportunity.description && (
        <p className="text-[12px] text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{opportunity.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className={"px-2.5 py-1 rounded-full text-[10px] font-semibold " + typeMeta.bg + " " + typeMeta.color}>{typeMeta.label}</span>
        {opportunity.location && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="w-3 h-3" /> {opportunity.location}
          </span>
        )}
        {opportunity.amount && (
          <span className="text-[10px] font-bold text-primary">{opportunity.amount}</span>
        )}
        {deadline && deadline !== "Closed" && (
          <span className={"flex items-center gap-1 text-[10px] font-medium " + (isClosingSoon ? "text-error" : "text-muted-foreground")}>
            <Clock className="w-3 h-3" /> {deadline}
          </span>
        )}
      </div>

      {opportunity.link && (
        <a
          href={opportunity.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 w-full py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap"
        >
          Apply Now <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </motion.div>
  );
}