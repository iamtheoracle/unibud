import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, Flame, GraduationCap, MapPin } from "lucide-react";
import {
  INSTITUTION_TYPES, NIGERIAN_STATES, searchInstitutions,
  getAlphabeticalGroups, POPULAR_INSTITUTIONS,
  getRecentInstitutions, addRecentInstitution,
  INSTITUTION_TYPE_COLORS,
} from "@/data/nigerianInstitutions";
import { hapticTap } from "@/lib/haptics";

export default function UniversitySelector({ open, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const [recent, setRecent] = useState([]);

  useEffect(() => { if (open) setRecent(getRecentInstitutions()); }, [open]);

  const results = useMemo(
    () => searchInstitutions(q, { type: type || undefined, state: state || undefined }),
    [q, type, state]
  );
  const alpha = useMemo(() => getAlphabeticalGroups(results), [results]);
  const filtered = q || type || state;

  const pick = (inst) => {
    hapticTap();
    addRecentInstitution(inst);
    onSelect(inst);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-background"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="sticky top-0 z-10 glass-strong safe-area-pt">
            <div className="px-5 pt-3 pb-3 max-w-[600px] mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-heading font-bold text-[20px] text-foreground">Select your institution</h1>
                <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, code, or state"
                  className="w-full pl-10 pr-10 py-3 rounded-[16px] bg-card border border-border/40 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
                {q && (
                  <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
            <div className="px-5 pb-2 max-w-[600px] mx-auto flex gap-2 overflow-x-auto no-scrollbar">
              <Chip active={!type} onClick={() => setType("")} label="All" />
              {INSTITUTION_TYPES.map((t) => (
                <Chip key={t.key} active={type === t.key} onClick={() => setType(type === t.key ? "" : t.key)} label={t.label} color={t.color} />
              ))}
            </div>
            <div className="px-5 pb-3 max-w-[600px] mx-auto flex gap-2 overflow-x-auto no-scrollbar">
              <Chip active={!state} onClick={() => setState("")} label="All States" small />
              {NIGERIAN_STATES.map((s) => (
                <Chip key={s} active={state === s} onClick={() => setState(state === s ? "" : s)} label={s} small />
              ))}
            </div>
          </div>

          <div className="px-5 pb-32 pt-3 max-w-[600px] mx-auto">
            {!filtered && (
              <>
                {recent.length > 0 && (
                  <Section title="Recently selected" icon={Clock}>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                      {recent.map((r) => (
                        <button key={r.name} onClick={() => pick(r)} className="flex-shrink-0 glass rounded-full pl-2 pr-3 py-1.5 flex items-center gap-1.5 spring-tap">
                          <Dot color={INSTITUTION_TYPE_COLORS[r.type]} />
                          <span className="text-[12px] font-semibold text-foreground">{r.short}</span>
                        </button>
                      ))}
                    </div>
                  </Section>
                )}
                <Section title="Popular institutions" icon={Flame}>
                  <div className="grid grid-cols-2 gap-2.5">
                    {POPULAR_INSTITUTIONS.slice(0, 10).map((i) => (
                      <PopularCard key={i.name} inst={i} onClick={() => pick(i)} />
                    ))}
                  </div>
                </Section>
              </>
            )}

            {alpha.length === 0 ? (
              <EmptyState query={q} />
            ) : filtered ? (
              <div className="space-y-1">
                {alpha.flatMap((g) => g.items).map((i) => (
                  <Row key={i.name} inst={i} onClick={() => pick(i)} />
                ))}
              </div>
            ) : (
              alpha.map((g) => (
                <div key={g.letter} className="mb-4">
                  <div className="text-[13px] font-bold text-muted-foreground/60 px-1 mb-1.5">{g.letter}</div>
                  <div className="space-y-1">
                    {g.items.map((i) => (
                      <Row key={i.name} inst={i} onClick={() => pick(i)} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Chip({ active, onClick, label, color, small }) {
  return (
    <button
      onClick={onClick}
      style={active && color ? { background: color, color: "#fff" } : undefined}
      className={`flex-shrink-0 ${small ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[12px]"} font-semibold rounded-full spring-tap whitespace-nowrap ${
        active && !color ? "bg-primary text-primary-foreground" : active && color ? "" : "bg-card border border-border/40 text-foreground/70"
      }`}
    >
      {label}
    </button>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-[13px] font-bold text-foreground">{title}</span>
      </div>
      {children}
    </section>
  );
}

function Dot({ color }) {
  return <span className="w-2 h-2 rounded-full" style={{ background: color }} />;
}

function PopularCard({ inst, onClick }) {
  return (
    <button onClick={onClick} className="text-left glass-card rounded-[18px] p-3 spring-tap card-hover">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-8 h-8 rounded-[10px] flex items-center justify-center font-heading font-bold text-[11px] text-white" style={{ background: INSTITUTION_TYPE_COLORS[inst.type] }}>
          {inst.short.slice(0, 3)}
        </span>
        <span className="text-[12px] font-bold text-foreground">{inst.short}</span>
      </div>
      <p className="text-[11px] text-muted-foreground line-clamp-1">{inst.name}</p>
      <div className="flex items-center gap-1 mt-1">
        <MapPin className="w-3 h-3 text-muted-foreground/70" />
        <span className="text-[10px] text-muted-foreground/70">{inst.state}</span>
      </div>
    </button>
  );
}

function Row({ inst, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[16px] hover:bg-muted/40 active:bg-muted/60 transition-colors text-left spring-tap">
      <span className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 font-heading font-bold text-[11px] text-white" style={{ background: INSTITUTION_TYPE_COLORS[inst.type] }}>
        {inst.short.slice(0, 3)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-foreground truncate">{inst.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {inst.state} · {INSTITUTION_TYPES.find((t) => t.key === inst.type)?.label}
        </p>
      </div>
    </button>
  );
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <GraduationCap className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-[15px] font-semibold text-foreground">No institution found</p>
      <p className="text-[12px] text-muted-foreground mt-1 max-w-[260px]">
        {query ? `We couldn't find "${query}". Try a different spelling, your institution's short code, or your state.` : "Try adjusting your filters."}
      </p>
    </div>
  );
}