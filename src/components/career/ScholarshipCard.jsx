import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Bookmark, ExternalLink, Award, Globe } from "lucide-react";
import { SCHOLARSHIP_TYPES, formatRelativeTime } from "./careerConstants";

export default function ScholarshipCard({ scholarship, index = 0, onBookmark }) {
  const [bookmarked, setBookmarked] = useState(scholarship.is_bookmarked || false);
  const typeMeta = SCHOLARSHIP_TYPES[scholarship.type] || SCHOLARSHIP_TYPES.merit;
  const Icon = typeMeta.icon;
  const deadline = formatRelativeTime(scholarship.deadline);
  const isClosingSoon = scholarship.deadline && new Date(scholarship.deadline) - new Date() < 7 * 86400000;

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (onBookmark) onBookmark(scholarship);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden card-hover"
    >
      {scholarship.banner_url && (
        <div className="h-20 overflow-hidden">
          <img src={scholarship.banner_url} alt={scholarship.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {scholarship.logo_url ? (
            <img src={scholarship.logo_url} alt={scholarship.provider} className="w-11 h-11 rounded-[14px] object-cover flex-shrink-0" />
          ) : (
            <div className={"w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 " + typeMeta.bg}>
              <Icon className={"w-5 h-5 " + typeMeta.color} strokeWidth={2} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading font-semibold text-[14px] text-foreground leading-snug line-clamp-2">{scholarship.title}</h3>
              <button onClick={handleBookmark} className="flex-shrink-0 p-1 -mt-1 -mr-1 spring-tap">
                <Bookmark className={"w-[18px] h-[18px] transition-colors " + (bookmarked ? "fill-primary text-primary" : "text-muted-foreground")} strokeWidth={2} />
              </button>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">{scholarship.provider}</p>
          </div>
        </div>

        {scholarship.description && (
          <p className="text-[12px] text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{scholarship.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={"px-2.5 py-1 rounded-full text-[10px] font-semibold " + typeMeta.bg + " " + typeMeta.color}>{typeMeta.label}</span>
          {scholarship.amount && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
              <Award className="w-3 h-3" /> {scholarship.amount}
            </span>
          )}
          {scholarship.is_international && (
            <span className="flex items-center gap-1 text-[10px] text-purple font-medium">
              <Globe className="w-3 h-3" /> International
            </span>
          )}
          {deadline && deadline !== "Closed" && (
            <span className={"flex items-center gap-1 text-[10px] font-medium " + (isClosingSoon ? "text-error" : "text-muted-foreground")}>
              <Clock className="w-3 h-3" /> {deadline}
            </span>
          )}
        </div>

        {scholarship.link && (
          <a
            href={scholarship.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap"
          >
            Apply Now <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}