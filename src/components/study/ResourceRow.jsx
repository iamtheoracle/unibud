import React from "react";
import { motion } from "framer-motion";
import { FileText, BookOpen, Link2, Video, Mic, Code, Archive, ClipboardList, FlaskConical, StickyNote, HelpCircle, Layout, Monitor, Pin, Bookmark, Share2, Download, WifiOff } from "lucide-react";

export const FILE_TYPE_CONFIG = {
  lecture_slides: { label: "Slides", icon: Monitor },
  pdf: { label: "PDF", icon: FileText },
  past_questions: { label: "Past Q", icon: HelpCircle },
  notes: { label: "Notes", icon: StickyNote },
  study_guide: { label: "Guide", icon: BookOpen },
  link: { label: "Link", icon: Link2 },
  document: { label: "Doc", icon: FileText },
  presentation: { label: "Deck", icon: Monitor },
  image: { label: "Image", icon: FileText },
  video: { label: "Video", icon: Video },
  audio_recording: { label: "Audio", icon: Mic },
  spreadsheet: { label: "Sheet", icon: FileText },
  archive: { label: "ZIP", icon: Archive },
  code: { label: "Code", icon: Code },
  assignment: { label: "Assignment", icon: ClipboardList },
  project: { label: "Project", icon: FileText },
  template: { label: "Template", icon: Layout },
  research_paper: { label: "Research", icon: FlaskConical },
  handout: { label: "Handout", icon: FileText },
};

export function formatSize(bytes) {
  if (!bytes || bytes === 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default function ResourceRow({ resource, userId, onOpen, onPin, onBookmark, onShare, onDownload, onToggleOffline }) {
  const config = FILE_TYPE_CONFIG[resource.file_type] || FILE_TYPE_CONFIG.pdf;
  const Icon = config.icon;
  const isBookmarked = resource.bookmarked_by?.includes(userId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen(resource)}
      className="rounded-[16px] glass-card p-3 cursor-pointer card-hover"
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 ${resource.is_pinned ? "bg-primary/8" : "bg-muted/40"}`}>
          <Icon className={`w-[18px] h-[18px] ${resource.is_pinned ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.6} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[12px] font-semibold text-foreground truncate">{resource.title}</p>
            {resource.version > 1 && <span className="text-[8px] font-bold text-muted-foreground bg-muted/40 px-1 py-0.5 rounded">v{resource.version}</span>}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
            <span className="font-medium">{config.label}</span>
            {resource.file_size_bytes > 0 && <span>· {formatSize(resource.file_size_bytes)}</span>}
            <span>· {resource.uploaded_by_name || "Member"}</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {resource.download_count > 0 && (
            <span className="text-[9px] text-muted-foreground mr-1">{resource.download_count}↓</span>
          )}
          {resource.file_url && onDownload && (
            <button onClick={() => onDownload(resource)} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform" aria-label="Download">
              <Download className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />
            </button>
          )}
          {onToggleOffline && (
            <button onClick={() => onToggleOffline(resource)} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform" aria-label="Toggle offline">
              <WifiOff className={`w-3.5 h-3.5 ${resource.is_offline_available ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.6} />
            </button>
          )}
          {onShare && (
            <button onClick={() => onShare(resource)} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform" aria-label="Share">
              <Share2 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />
            </button>
          )}
          <button onClick={() => onBookmark(resource)} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform" aria-label="Bookmark">
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "text-primary fill-primary" : "text-muted-foreground"}`} strokeWidth={1.6} />
          </button>
          <button onClick={() => onPin(resource)} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform" aria-label="Pin">
            <Pin className={`w-3.5 h-3.5 ${resource.is_pinned ? "text-primary fill-primary" : "text-muted-foreground"}`} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {resource.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {resource.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded-full bg-muted/30 text-[9px] font-medium text-muted-foreground">#{tag}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}