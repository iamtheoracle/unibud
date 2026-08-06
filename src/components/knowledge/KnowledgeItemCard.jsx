import React, { useState } from "react";
import {
  FileText, FileType, Presentation, Sheet, Image, Mic, Video, ScanLine, File,
  Bookmark, Sparkles, Loader2, Folder, NotebookPen, Library,
} from "lucide-react";
import { SOURCE_LABELS } from "@/lib/knowledge/knowledgeEngine";

const CATEGORY_ICON = {
  pdf: FileText, word: FileType, powerpoint: Presentation, excel: Sheet,
  images: Image, voice_notes: Mic, audio: Mic, video: Video,
  text: FileText, scanned_notes: ScanLine, other: File,
  book: Library, journal: Library, paper: Library,
  past_question: FileText, lecture_note: NotebookPen, thesis: Library,
  text_note: NotebookPen,
};

const KIND_ICON = { file: File, note: NotebookPen, library: Library, collection: Folder };

export default function KnowledgeItemCard({ item, onExtract, onBookmark }) {
  const [extracting, setExtracting] = useState(false);
  const KindIcon = KIND_ICON[item.kind] || File;
  const CatIcon = CATEGORY_ICON[item.type] || FileText;

  const handleExtract = async () => {
    setExtracting(true);
    try { await onExtract(item); } finally { setExtracting(false); }
  };

  return (
    <div className="glass-card p-3.5 card-hover flex gap-3">
      <div className="relative shrink-0">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover" loading="lazy" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CatIcon className="w-6 h-6" />
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center border border-border">
          <KindIcon className="w-3 h-3 text-muted-foreground" />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
          <button onClick={() => onBookmark(item)} className="shrink-0 spring-tap">
            <Bookmark className={`w-4 h-4 ${item.bookmarked ? "fill-gold text-gold" : "text-muted-foreground"}`} />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{item.subtitle || SOURCE_LABELS[item.source] || item.kind}</p>

        {item.summary && (
          <p className="text-xs text-foreground/70 mt-1.5 line-clamp-2">{item.summary}</p>
        )}

        {item.concepts?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.concepts.slice(0, 3).map((c) => (
              <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent/10 text-accent font-medium">{c}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-2">
          {item.kind !== "collection" && !item.ai_indexed && (
            <button
              onClick={handleExtract}
              disabled={extracting}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary spring-tap"
            >
              {extracting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Extract
            </button>
          )}
          {item.ai_indexed && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
              <Sparkles className="w-3 h-3" /> Indexed
            </span>
          )}
          {item.file_url && (
            <a href={item.file_url} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-accent ml-auto">
              Open
            </a>
          )}
        </div>
      </div>
    </div>
  );
}