import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { CAMPUS_CATEGORIES, CAMPUS_GROUPS } from "@/lib/campus/registry";
import { useCampusRecommendations } from "@/hooks/useCampusRecommendations";
import { useExperience } from "@/lib/ExperienceContext";

const EASE = [0.16, 1, 0.3, 1];

/**
 * CampusHub — the front door to UNIBUD's complete digital campus.
 * Organizes every campus experience by the student's active context
 * (Academic | Social). One ecosystem — the selector only filters.
 */
export default function CampusHub() {
  const { mode } = useExperience();
  const [q, setQ] = useState("");
  const [sub, setSub] = useState("all");
  const recs = useCampusRecommendations();

  const subGroups = useMemo(() => CAMPUS_GROUPS.filter((g) => g.context === mode), [mode]);

  const items = useMemo(() => {
    let list = CAMPUS_CATEGORIES.filter((i) => i.context === mode);
    if (sub !== "all") list = list.filter((i) => i.group === sub);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(s) || i.desc.toLowerCase().includes(s));
    }
    return list;
  }, [mode, sub, q]);

  const recommended = recs
    .map((k) => CAMPUS_CATEGORIES.find((c) => c.key === k))
    .filter((c) => c && c.context === mode)
    .slice(0, 3);

  // reset sub-filter when context changes
  React.useEffect(() => { setSub("all"); }, [mode]);

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="mb-5">
        <h1 className="font-heading font-extrabold text-[28px] text-foreground tracking-tight">Campus</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          {mode === "academic" ? "Classes, academics & learning tools." : "Campus life, community & activities."}
        </p>
      </header>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${mode} experiences`}
          className="w-full pl-10 pr-4 py-3 rounded-[18px] bg-card border border-border/40 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 spring-tap"
        />
      </div>

      {recommended.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-foreground">Spark picks for you</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {recommended.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.key} to={c.to} className="flex-shrink-0 w-[150px] rounded-[22px] p-4 glass-card spring-tap">
                  <div className="w-9 h-9 rounded-[12px] flex items-center justify-center mb-2" style={{ background: `hsl(${c.color} / 0.14)` }}>
                    <Icon className="w-[18px] h-[18px]" style={{ color: `hsl(${c.color})` }} />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground leading-tight">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{c.desc}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-1 px-1">
        {[{ key: "all", label: "All" }, ...subGroups.map((g) => ({ key: g.key, label: g.label }))].map((g) => (
          <button
            key={g.key}
            onClick={() => setSub(g.key)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${
              sub === g.key ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-foreground/70"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((c) => (
          <CampusCard key={c.key} c={c} />
        ))}
      </div>
    </div>
  );
}

function CampusCard({ c }) {
  const Icon = c.icon;
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`rounded-[22px] p-4 h-full glass-card spring-tap relative ${c.live ? "" : "opacity-70"}`}
    >
      <div className="w-10 h-10 rounded-[14px] flex items-center justify-center mb-3" style={{ background: `hsl(${c.color} / 0.14)` }}>
        <Icon className="w-5 h-5" style={{ color: `hsl(${c.color})` }} />
      </div>
      <p className="text-[14px] font-semibold text-foreground leading-tight">{c.title}</p>
      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{c.desc}</p>
      {c.live ? (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center">
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
        </div>
      ) : (
        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
          Soon
        </span>
      )}
    </motion.div>
  );
  return c.live ? <Link to={c.to}>{inner}</Link> : <div className="cursor-not-allowed">{inner}</div>;
}