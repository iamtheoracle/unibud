import React from "react";
import { Search, Sparkles, Bookmark, X } from "lucide-react";
import { SOURCE_LABELS } from "@/lib/knowledge/knowledgeEngine";

/**
 * KnowledgeSearchBar — natural-language + smart (semantic) search with
 * kind, source, tag and bookmark filters.
 */
export default function KnowledgeSearchBar({ kb }) {
  return (
    <div className="glass-card p-3 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-full px-3.5 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={kb.query}
            onChange={(e) => { kb.setQuery(e.target.value); kb.clearSmart(); }}
            onKeyDown={(e) => e.key === "Enter" && kb.runSmartSearch()}
            placeholder="Search your knowledge in natural language…"
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          {kb.query && (
            <button onClick={() => { kb.setQuery(""); kb.clearSmart(); }} className="text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={kb.runSmartSearch}
          disabled={kb.smartLoading || !kb.query.trim()}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold spring-tap transition-colors ${
            kb.isSmart ? "bg-primary text-primary-foreground" : "bg-accent/15 text-accent"
          } disabled:opacity-40`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {kb.smartLoading ? "Thinking…" : "Smart"}
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {["all", "file", "note", "library", "collection"].map((k) => (
          <button
            key={k}
            onClick={() => kb.setKind(k)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap capitalize ${
              kb.kind === k ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground/70"
            }`}
          >
            {k === "all" ? "All" : k}
          </button>
        ))}
        <span className="w-px h-4 bg-border mx-1" />
        {["all", "academics", "connect", "marketplace", "wallet", "news", "knowledge"].map((s) => (
          <button
            key={s}
            onClick={() => kb.setSource(s)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
              kb.source === s ? "bg-accent text-accent-foreground" : "bg-muted/40 text-foreground/60"
            }`}
          >
            {s === "all" ? "Any source" : SOURCE_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => kb.setBookmarksOnly(!kb.bookmarksOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold spring-tap ${
            kb.bookmarksOnly ? "bg-gold/20 text-gold" : "bg-muted/40 text-foreground/60"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Bookmarks
        </button>
        {kb.tags.slice(0, 6).map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => kb.setActiveTag(kb.activeTag === tag ? null : tag)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium spring-tap ${
              kb.activeTag === tag ? "bg-foreground text-background" : "bg-muted/40 text-foreground/60"
            }`}
          >
            #{tag} <span className="opacity-50">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}