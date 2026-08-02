import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, BookOpen, Bookmark, FileText, FlaskConical, GraduationCap, Sparkles, X, Clock, MapPin, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";
const EASE = [0.16, 1, 0.3, 1];

const TYPE_FILTERS = [
  { value: "all", label: "All", icon: BookOpen },
  { value: "book", label: "Books", icon: BookOpen },
  { value: "paper", label: "Papers", icon: FileText },
  { value: "journal", label: "Journals", icon: FlaskConical },
  { value: "past_question", label: "Past Qs", icon: GraduationCap },
  { value: "thesis", label: "Theses", icon: FileText },
];

const TYPE_ICONS = { book: BookOpen, paper: FileText, journal: FlaskConical, past_question: GraduationCap, thesis: FileText, lecture_note: FileText };

export default function LibraryHub() {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState(null);

  const { data: resources, isLoading } = useQuery({
    queryKey: ["library-resources", filter, query],
    queryFn: () => {
      const q = {};
      if (filter !== "all") q.type = filter;
      if (query.trim()) q.title = { $regex: query.trim(), $options: "i" };
      return base44.entities.LibraryResource.filter(q, "-rating", 50);
    },
    staleTime: 30000,
  });

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/home" className="w-10 h-10 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: CREAM }}>Library</h1>
          <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Search, borrow & explore resources</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM_MUTED }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search books, papers, past questions…" className="w-full h-12 pl-12 pr-10 rounded-[16px] text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
        {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full grid place-items-center spring-tap"><X className="w-4 h-4" style={{ color: CREAM_MUTED }} /></button>}
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {TYPE_FILTERS.map((f) => {
          const Icon = f.icon;
          const active = filter === f.value;
          return (
            <button key={f.value} onClick={() => setFilter(f.value)} className="flex items-center gap-1.5 px-3 h-9 rounded-full text-[12px] font-medium whitespace-nowrap spring-tap" style={active ? { background: "rgba(255,138,42,0.15)", color: ORANGE, border: "1px solid rgba(255,138,42,0.3)" } : { background: "rgba(44,33,26,0.4)", color: CREAM_MUTED, border: "1px solid rgba(255,255,255,0.05)" }}>
              <Icon className="w-3.5 h-3.5" /> {f.label}
            </button>
          );
        })}
      </div>

      {/* Resources */}
      {isLoading ? (
        <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-4 h-20 shimmer" />)}</div>
      ) : !resources?.length ? (
        <div className="flex flex-col items-center py-16"><BookOpen className="w-8 h-8 mb-3" style={{ color: CREAM_MUTED }} /><p className="text-[14px]" style={{ color: CREAM_MUTED }}>No resources found</p></div>
      ) : (
        <div className="flex flex-col gap-3">
          {resources.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} onClick={() => setSelected(r)} />
          ))}
        </div>
      )}

      {/* Resource Detail Sheet */}
      <AnimatePresence>
        {selected && <ResourceDetail resource={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function ResourceCard({ resource, index, onClick }) {
  const Icon = TYPE_ICONS[resource.type] || BookOpen;
  return (
    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04, ease: EASE }} onClick={onClick} className="glass-card p-4 flex items-center gap-3 text-left spring-tap">
      <div className="w-12 h-16 rounded-[8px] overflow-hidden shrink-0 grid place-items-center" style={{ background: resource.cover_url ? "transparent" : "rgba(255,138,42,0.10)" }}>
        {resource.cover_url ? <img src={resource.cover_url} className="w-full h-full object-cover" /> : <Icon className="w-6 h-6" style={{ color: ORANGE }} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold truncate" style={{ color: CREAM }}>{resource.title}</p>
        <p className="text-[12px] truncate" style={{ color: CREAM_MUTED }}>{resource.author || "Unknown author"}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] capitalize px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: CREAM_MUTED }}>{resource.type.replace(/_/g, " ")}</span>
          {resource.rating > 0 && <span className="flex items-center gap-1 text-[10px]" style={{ color: CREAM_MUTED }}><Star className="w-3 h-3" fill={ORANGE} style={{ color: ORANGE }} /> {resource.rating}</span>}
        </div>
      </div>
    </motion.button>
  );
}

function ResourceDetail({ resource, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const Icon = TYPE_ICONS[resource.type] || BookOpen;
  const [summary, setSummary] = React.useState(null);
  const [summarizing, setSummarizing] = React.useState(false);

  const bookmarkMut = useMutation({
    mutationFn: () => base44.entities.LibraryResource.update(resource.id, { is_bookmarked: !resource.is_bookmarked }),
    onSuccess: () => { qc.invalidateQueries(["library-resources"]); toast({ title: resource.is_bookmarked ? "Removed from reading list" : "Added to reading list ✓" }); onClose(); },
  });

  const borrowMut = useMutation({
    mutationFn: () => base44.entities.LibraryResource.update(resource.id, { available_copies: Math.max(0, (resource.available_copies || 1) - 1) }),
    onSuccess: () => { qc.invalidateQueries(["library-resources"]); toast({ title: "Borrowed ✓", description: "Check your borrow history" }); onClose(); },
  });

  const summarize = async () => {
    setSummarizing(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a concise summary of "${resource.title}" by ${resource.author || "unknown"}. ${resource.description || ""}. Include key themes and why a student should read it. Keep it under 150 words.`,
        response_json_schema: { type: "object", properties: { summary: { type: "string" }, key_themes: { type: "array", items: { type: "string" } } } },
      });
      setSummary(res);
    } catch (e) {
      toast({ title: "Could not generate summary", variant: "destructive" });
    }
    setSummarizing(false);
  };

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60" style={{ backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 36 }} className="relative w-full max-w-[520px] mx-auto rounded-t-[28px] p-6 pb-10 max-h-[85vh] overflow-y-auto no-scrollbar" style={{ background: "rgba(20,14,10,0.98)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "1px solid rgba(255,138,42,0.2)" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.1)" }} />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(255,255,255,0.05)" }}><X className="w-4 h-4" style={{ color: CREAM_MUTED }} /></button>

        <div className="flex gap-4 mb-5">
          <div className="w-20 h-28 rounded-[10px] overflow-hidden shrink-0 grid place-items-center" style={{ background: resource.cover_url ? "transparent" : "rgba(255,138,42,0.10)" }}>
            {resource.cover_url ? <img src={resource.cover_url} className="w-full h-full object-cover" /> : <Icon className="w-8 h-8" style={{ color: ORANGE }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold mb-1" style={{ color: CREAM }}>{resource.title}</p>
            <p className="text-[13px] mb-2" style={{ color: CREAM_MUTED }}>{resource.author || "Unknown"}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] capitalize px-2 py-1 rounded-full" style={{ background: "rgba(255,138,42,0.12)", color: ORANGE }}>{resource.type.replace(/_/g, " ")}</span>
              {resource.subject && <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: CREAM_MUTED }}>{resource.subject}</span>}
            </div>
          </div>
        </div>

        {resource.description && <p className="text-[13px] leading-relaxed mb-4" style={{ color: CREAM_MUTED }}>{resource.description}</p>}

        {/* AI Summary */}
        {summary ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-4">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4" style={{ color: ORANGE }} /><span className="text-[12px] font-bold" style={{ color: CREAM }}>AI Summary</span></div>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: CREAM_MUTED }}>{summary.summary}</p>
            {summary.key_themes?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">{summary.key_themes.map((t, i) => <span key={i} className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(255,138,42,0.10)", color: ORANGE }}>{t}</span>)}</div>
            )}
          </motion.div>
        ) : (
          <button onClick={summarize} disabled={summarizing} className="w-full h-11 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[13px] mb-4 spring-tap disabled:opacity-50" style={{ background: "rgba(255,138,42,0.12)", color: ORANGE, border: "1px solid rgba(255,138,42,0.2)" }}>
            <Sparkles className="w-4 h-4" /> {summarizing ? "Summarizing…" : "AI Summary"}
          </button>
        )}

        {/* Meta Info */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {resource.shelf_location && <MetaItem icon={MapPin} label="Shelf" value={resource.shelf_location} />}
          {resource.pages > 0 && <MetaItem icon={FileText} label="Pages" value={`${resource.pages}`} />}
          {resource.year > 0 && <MetaItem icon={Clock} label="Year" value={`${resource.year}`} />}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => bookmarkMut.mutate()} disabled={bookmarkMut.isPending} className="flex-1 h-12 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[14px] spring-tap disabled:opacity-50" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: resource.is_bookmarked ? ORANGE : CREAM }}>
            <Bookmark className="w-4 h-4" fill={resource.is_bookmarked ? ORANGE : "none"} /> {resource.is_bookmarked ? "Saved" : "Save"}
          </button>
          <button onClick={() => borrowMut.mutate()} disabled={borrowMut.isPending || (resource.available_copies || 0) <= 0} className="flex-1 h-12 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[14px] spring-tap disabled:opacity-40" style={{ background: ORANGE, color: "#1a1208" }}>
            <BookOpen className="w-4 h-4" /> {(resource.available_copies || 0) > 0 ? "Borrow" : "Unavailable"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="text-center">
      <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: CREAM_MUTED }} />
      <p className="text-[10px] uppercase tracking-wider" style={{ color: CREAM_MUTED }}>{label}</p>
      <p className="text-[12px] font-semibold" style={{ color: CREAM }}>{value}</p>
    </div>
  );
}