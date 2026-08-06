import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Loader2, FileText, Bookmark, Image as ImageIcon, MessageCircle, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];

const SEARCH_ENTITIES = [
  { name: "Note", icon: FileText, titleField: "title", previewField: "content" },
  { name: "Collection", icon: Bookmark, titleField: "name", previewField: "description" },
  { name: "QuadPost", icon: MessageCircle, titleField: "content", previewField: "content" },
  { name: "LibraryResource", icon: ImageIcon, titleField: "title", previewField: "description" },
];

/**
 * NaturalLanguageSearch — intelligent knowledge search.
 *
 * Searches across the entire knowledge store using natural language.
 * Uses InvokeLLM to interpret the query and match it against
 * stored content (notes, files, bookmarks, posts, resources).
 *
 * Results are ranked by relevance and presented with context.
 */
export default function NaturalLanguageSearch({ onResultClick, compact = false }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    // Fetch from multiple knowledge entities in parallel
    const fetches = SEARCH_ENTITIES.map(async ({ name, titleField, previewField }) => {
      try {
        const items = await base44.entities[name].list("-updated_date", 20);
        return { entity: name, titleField, previewField, items: items || [] };
      } catch {
        return { entity: name, titleField, previewField, items: [] };
      }
    });

    const entityResults = await Promise.all(fetches);

    // Build searchable text from all entities
    const allItems = entityResults.flatMap((er) =>
      er.items.map((item) => ({
        entity: er.entity,
        titleField: er.titleField,
        previewField: er.previewField,
        item,
        text: `${item[er.titleField] || ""} ${item[er.previewField] || ""}`,
      }))
    );

    if (allItems.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `A user searched for: "${query}". Here are ${allItems.length} items from their knowledge store. Rank the top 5 most relevant items by returning their indices (0-based) in order of relevance. Return a JSON array of indices.

Items:
${allItems.map((it, i) => `[${i}] (${it.entity}) ${it.text.substring(0, 200)}`).join("\n")}`,
        response_json_schema: {
          type: "object",
          properties: {
            indices: {
              type: "array",
              items: { type: "number" },
              description: "Top 5 most relevant item indices, most relevant first",
            },
          },
        },
      });

      const rankedIndices = llmResponse?.indices || [];
      const ranked = rankedIndices
        .map((i) => allItems[i])
        .filter(Boolean)
        .slice(0, 5);

      setResults(ranked.length > 0 ? ranked : allItems.filter((it) => it.text.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
    } catch {
      // Fallback: simple text match
      const q = query.toLowerCase();
      const matched = allItems
        .filter((it) => it.text.toLowerCase().includes(q))
        .slice(0, 5);
      setResults(matched);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className={compact ? "" : "w-full max-w-[520px] mx-auto px-4 pt-3 pb-28 safe-area-pt"}>
      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search your knowledge naturally…"
          className="w-full pl-10 pr-20 py-3 rounded-[18px] glass text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 spring-tap"
        />
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold flex items-center gap-1.5 spring-tap disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Search
        </button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-12"
          >
            <div className="w-10 h-10 rounded-full crystal-card flex items-center justify-center bud-breathe">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[12px] text-muted-foreground mt-3">Searching your knowledge…</p>
          </motion.div>
        )}

        {!loading && searched && results.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="crystal-card p-8 text-center"
          >
            <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">No results found.</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Try rephrasing your search.</p>
          </motion.div>
        )}

        {!loading && results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2.5"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-muted-foreground">Top results</span>
            </div>
            {results.map((r, i) => {
              const title = r.item[r.titleField] || "Untitled";
              const preview = r.item[r.previewField]?.substring(0, 120) || "";
              return (
                <motion.div
                  key={`${r.entity}-${r.item.id}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: EASE }}
                  onClick={() => onResultClick?.(r)}
                  className="crystal-card p-3.5 hover-lift spring-tap cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-foreground/[0.08] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{title}</p>
                      {preview && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{preview}</p>}
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/60 mt-1 inline-block">
                        {r.entity}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}