import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, Loader2, Clock, ArrowRight, Sparkles,
} from "lucide-react";
import { useUniversalSearch, getRecentSearches, addRecentSearch } from "@/hooks/useUniversalSearch";
import { CONFIG_MAP } from "@/lib/search/searchConfig";
import { hapticTap } from "@/lib/haptics";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

const TRENDING = [
  "Scholarships",
  "Study groups",
  "Campus events",
  "Past questions",
  "Internships",
  "Clubs",
];

/**
 * UniversalSearchOverlay — full-screen search across every UNIBUD resource.
 * Indexes students, courses, lecturers, study groups, organizations, events,
 * files, podcasts, articles, marketplace listings, scholarships, buildings,
 * and Bud knowledge. Only resources the student has permission to access are
 * returned (enforced by RLS at the database level).
 */
export default function UniversalSearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const { query, setQuery, results, isLoading, clear } = useUniversalSearch();
  const [recent, setRecent] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const FILTER_CHIPS = [
    { id: "all", label: "All" },
    { id: "students", label: "People" },
    { id: "courses", label: "Courses" },
    { id: "events", label: "Events" },
    { id: "scholarships", label: "Scholarships" },
    { id: "marketplace", label: "Marketplace" },
    { id: "files", label: "Files" },
  ];

  useEffect(() => {
    if (open) setRecent(getRecentSearches());
  }, [open]);

  const handleClose = () => {
    hapticTap();
    clear();
    setActiveFilter("all");
    onClose();
  };

  const handleResultClick = (config, record) => {
    hapticTap();
    if (query.trim()) addRecentSearch(query.trim());
    navigate(config.route(record));
    handleClose();
  };

  const handleQuickSearch = (term) => {
    hapticTap();
    setQuery(term);
  };

  const clearRecentSearches = () => {
    try { localStorage.removeItem("unibud_recent_searches"); } catch {}
    setRecent([]);
  };

  const { categories, total } = results;
  const hasQuery = query.trim().length >= 2;

  const filteredCategories = activeFilter === "all"
    ? categories
    : categories.filter(({ key }) => key === activeFilter);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={handleClose} />

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative z-10 flex flex-col h-full max-w-[600px] mx-auto w-full"
          >
            {/* Search header */}
            <div className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
              <div className="flex-1 flex items-center gap-3 h-[52px] px-4 rounded-2xl glass-strong">
                <Search className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={2} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search everything…"
                  className="flex-1 bg-transparent text-[16px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-w-0"
                />
                {isLoading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />}
              </div>
              <button
                onClick={handleClose}
                className="w-11 h-11 rounded-full glass flex items-center justify-center spring-tap shrink-0"
                aria-label="Close search"
              >
                <X className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
              </button>
            </div>

            {/* Filter chips — only when query active */}
            {hasQuery && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2">
                {FILTER_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => { hapticTap(); setActiveFilter(chip.id); }}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold spring-tap transition-colors ${
                      activeFilter === chip.id
                        ? "bg-primary text-primary-foreground"
                        : "glass text-muted-foreground"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
              {!hasQuery ? (
                <LandingState recent={recent} onQuickSearch={handleQuickSearch} onClearRecent={clearRecentSearches} />
              ) : total === 0 && !isLoading ? (
                <NoResults query={query} />
              ) : (
                <div className="space-y-5 pt-2">
                  {filteredCategories.map(({ key, label, results: items }) => {
                    const config = CONFIG_MAP[key];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                      >
                        <div className="flex items-center gap-2 mb-2.5">
                          <Icon className="w-[14px] h-[14px] text-muted-foreground" strokeWidth={2} />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {label} · {items.length}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {items.slice(0, 5).map((r) => (
                            <button
                              key={r.id || key + Math.random()}
                              onClick={() => handleResultClick(config, r)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl glass spring-tap text-left"
                            >
                              <ResultThumb config={config} record={r} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-medium text-foreground truncate">
                                  {config.title(r)}
                                </p>
                                {config.subtitle(r) && (
                                  <p className="text-[12px] text-muted-foreground truncate">
                                    {config.subtitle(r)}
                                  </p>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" strokeWidth={1.8} />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultThumb({ config, record }) {
  const img = config.imageField ? record[config.imageField] : null;
  const fallbackImg = record.image_url || record.logo_url || record.cover_url || record.avatar_url || record.thumbnail_url || (record.images && record.images[0]);
  const src = img || fallbackImg;

  if (src) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
        <Image src={src} alt="" className="w-full h-full" />
      </div>
    );
  }
  const Icon = config.icon;
  return (
    <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
      <Icon className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={2} />
    </div>
  );
}

function LandingState({ recent, onQuickSearch, onClearRecent }) {
  return (
    <div className="pt-6">
      {recent.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recent</p>
            <button onClick={onClearRecent} className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground spring-tap">Clear</button>
          </div>
          <div className="space-y-1">
            {recent.map((term, i) => (
              <button
                key={i}
                onClick={() => onQuickSearch(term)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl glass spring-tap text-left"
              >
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.8} />
                <span className="text-[14px] text-foreground truncate">{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Trending</p>
        <div className="flex flex-wrap gap-2">
          {TRENDING.map((term, i) => (
            <button
              key={i}
              onClick={() => onQuickSearch(term)}
              className="px-4 py-2 rounded-full glass spring-tap text-[13px] font-medium text-foreground"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full glass-strong flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
          Search students, courses, lecturers, events, files, podcasts, scholarships, buildings & more
        </p>
      </div>
    </div>
  );
}

function NoResults({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full glass-strong flex items-center justify-center mb-4">
        <Search className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-medium text-foreground">No results for "{query}"</p>
      <p className="text-[13px] text-muted-foreground mt-1">Try a different search term</p>
    </div>
  );
}