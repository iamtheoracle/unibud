import React from "react";
import { motion } from "framer-motion";
import { Book, FileText, FileQuestion, NotebookPen, FlaskConical, Bookmark, Download, Clock } from "lucide-react";

const TYPE_ICONS = {
  book: Book, journal: FileText, paper: FileText,
  past_question: FileQuestion, lecture_note: NotebookPen, thesis: FlaskConical,
};

export default function ResourceCard({ resource, onClick }) {
  const Icon = TYPE_ICONS[resource.type] || Book;
  const accent = resource.accent_color || "#DAAF37";

  return (
    <motion.div whileTap={{ scale: 0.97 }} onClick={onClick} className="flex-shrink-0 w-[150px] bg-card rounded-[18px] overflow-hidden premium-shadow border border-border/30 cursor-pointer">
      <div className="relative h-[170px] flex items-end justify-center p-3" style={{ background: `linear-gradient(135deg, ${accent}22, ${accent}08)` }}>
        {resource.cover_url ? (
          <img src={resource.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}20` }}>
              <Icon className="w-6 h-6" style={{ color: accent }} />
            </div>
            <span className="text-[10px] font-semibold text-foreground/60 capitalize text-center px-2">{resource.type.replace("_", " ")}</span>
          </div>
        )}
        {resource.is_downloaded && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center">
            <Download className="w-3 h-3 text-success-foreground" />
          </div>
        )}
        {resource.reading_progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div className="h-full" style={{ width: `${resource.reading_progress}%`, backgroundColor: accent }} />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-heading font-semibold text-[12px] text-foreground leading-snug line-clamp-2 mb-0.5">{resource.title}</h3>
        <p className="text-[10px] text-muted-foreground truncate">{resource.author || resource.course_code}</p>
        {resource.pages > 0 && <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {resource.pages} pages</p>}
      </div>
    </motion.div>
  );
}