import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, FileText, Calendar, Users, MessageCircle, ShoppingBag,
  GraduationCap, Briefcase, Award, BookOpen, FlaskConical, Loader2,
} from "lucide-react";
import { useUniversalSearch } from "@/hooks/useUniversalSearch";
import { hapticTap } from "@/lib/haptics";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

const RESULT_CONFIG = {
  posts: { label: "Posts", icon: FileText, route: (r) => "/quad", color: "text-blue-400" },
  events: { label: "Events", icon: Calendar, route: (r) => `/events`, color: "text-orange-400" },
  clubs: { label: "Clubs", icon: Users, route: (r) => `/clubs`, color: "text-purple-400" },
  communities: { label: "Communities", icon: MessageCircle, route: (r) => `/communities`, color: "text-green-400" },
  marketplace: { label: "Marketplace", icon: ShoppingBag, route: (r) => `/marketplace`, color: "text-pink-400" },
  studyGroups: { label: "Study Groups", icon: Users, route: (r) => `/study-groups`, color: "text-teal-400" },
  opportunities: { label: "Opportunities", icon: Briefcase, route: (r) => `/opportunities`, color: "text-cyan-400" },
  scholarships: { label: "Scholarships", icon: Award, route: (r) => `/scholarships`, color: "text-yellow-400" },
  courses: { label: "Courses", icon: BookOpen, route: (r) => r.id ? `/course/${r.id}` : `/courses`, color: "text-indigo-400" },
  research: { label: "Research", icon: FlaskConical, route: (r) => `/research`, color: "text-red-400" },
};

const getTitle = (type, r) => {
  switch (type) {
    case "posts": return r.content?.slice(0, 60) || "Post";
    case "events": return r.title;
    case "clubs": return r.name;
    case "communities": return r.name;
    case "marketplace": return r.title;
    case "studyGroups": return r.name;
    case "opportunities": return r.title;
    case "scholarships": return r.name;
    case "courses": return r.course_code ? `${r.course_code} — ${r.title}` : r.title;
    case "research": return r.title;
    default: return "Untitled";
  }
};

const getSubtitle = (type, r) => {
  switch (type) {
    case "posts": return r.author_name;
    case "events": return [r.location, r.date].filter(Boolean).join(" · ");
    case "clubs": return r.category;
    case "communities": return r.member_count ? `${r.member_count} members` : "Community";
    case "marketplace": return r.price ? `₦${r.price.toLocaleString()}` : r.category;
    case "studyGroups": return r.subject;
    case "opportunities": return r.company;
    case "scholarships": return r.provider;
    case "courses": return r.department;
    case "research": return r.author;
    default: return "";
  }
};

/**
 * UniversalSearchOverlay — full-screen search across all UNIBUD entities.
 */
export default function UniversalSearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const { query, setQuery, results, isLoading, clear } = useUniversalSearch();

  const handleClose = () => {
    hapticTap();
    clear();
    onClose();
  };

  const handleResultClick = (type, r) => {
    hapticTap();
    const config = RESULT_CONFIG[type];
    if (config) navigate(config.route(r));
    handleClose();
  };

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

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

            {/* Results */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
              {query.trim().length < 2 ? (
                <EmptyState query="" />
              ) : totalResults === 0 && !isLoading ? (
                <EmptyState query={query} />
              ) : (
                <div className="space-y-5 pt-2">
                  {Object.entries(results).map(([type, items]) => {
                    const config = RESULT_CONFIG[type];
                    if (!config || !items.length) return null;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={type}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                      >
                        <div className="flex items-center gap-2 mb-2.5">
                          <Icon className={`w-[14px] h-[14px] ${config.color}`} strokeWidth={2} />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {config.label} · {items.length}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {items.slice(0, 5).map((r) => (
                            <button
                              key={r.id}
                              onClick={() => handleResultClick(type, r)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl glass spring-tap text-left hover:bg-white/5 transition-colors"
                            >
                              <ResultThumb type={type} record={r} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-medium text-foreground truncate">
                                  {getTitle(type, r)}
                                </p>
                                {getSubtitle(type, r) && (
                                  <p className="text-[12px] text-muted-foreground truncate">
                                    {getSubtitle(type, r)}
                                  </p>
                                )}
                              </div>
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

function ResultThumb({ type, record }) {
  const img = record.image_url || record.author_image || record.avatar_url || record.logo_url;
  if (img) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
        <Image src={img} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  const config = RESULT_CONFIG[type];
  const Icon = config?.icon || Search;
  return (
    <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
      <Icon className={`w-[16px] h-[16px] ${config?.color || "text-muted-foreground"}`} strokeWidth={2} />
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full glass-strong flex items-center justify-center mb-4">
        <Search className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
      </div>
      {query.trim().length < 2 ? (
        <>
          <p className="text-[15px] font-medium text-foreground">Search UNIBUD</p>
          <p className="text-[13px] text-muted-foreground mt-1">Find people, posts, events, courses, clubs & more</p>
        </>
      ) : (
        <>
          <p className="text-[15px] font-medium text-foreground">No results for "{query}"</p>
          <p className="text-[13px] text-muted-foreground mt-1">Try a different search term</p>
        </>
      )}
    </div>
  );
}