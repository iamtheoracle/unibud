import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles, ArrowRight, Wand2 } from "lucide-react";
import { COMM_CATEGORIES, COMM_GROUPS } from "@/lib/communication/registry";

/** Only live surfaces are ever shown — the directive forbids "Coming Soon" placeholders. */
const LIVE_CATEGORIES = COMM_CATEGORIES.filter((c) => c.live);
import { useCommunicationRecommendations } from "@/hooks/useCommunicationRecommendations";
import SmartInboxSummary from "@/components/communication/SmartInboxSummary";
import UnifiedMessageSearch from "@/components/communication/UnifiedMessageSearch";
import BudCommAssistant from "@/components/communication/BudCommAssistant";

const EASE = [0.16, 1, 0.3, 1];

/** CommunicationHub — the front door to UNIBUD's communication platform. */
export default function CommunicationHub() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [budOpen, setBudOpen] = useState(false);
  const recs = useCommunicationRecommendations();

  const filtered = useMemo(() => {
    let items = LIVE_CATEGORIES;
    if (group !== "all") items = items.filter((i) => COMM_GROUPS.find((g) => g.key === group)?.items.includes(i.key));
    if (q.trim()) {
      const s = q.toLowerCase();
      items = items.filter((i) => i.title.toLowerCase().includes(s) || i.desc.toLowerCase().includes(s));
    }
    return items;
  }, [q, group]);

  const recommended = recs.slice(0, 3).map((k) => LIVE_CATEGORIES.find((c) => c.key === k)).filter(Boolean);

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="mb-5">
        <h1 className="font-heading font-extrabold text-[28px] text-foreground tracking-tight">Communication</h1>
        <p className="text-[13px] text-muted-foreground mt-1">One platform — from one-to-one to whole universities.</p>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => setSearchOpen(true)}
            className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-card border border-border/40 text-[13px] text-muted-foreground spring-tap">
            <Search className="w-4 h-4" /> Search all conversations
          </button>
          <button onClick={() => setBudOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-accent/15 text-accent text-[12px] font-semibold spring-tap">
            <Wand2 className="w-3.5 h-3.5" /> Bud
          </button>
        </div>
      </header>

      <section className="mb-5">
        <SmartInboxSummary />
      </section>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search conversations & spaces"
          className="w-full pl-10 pr-4 py-3 rounded-[18px] bg-card border border-border/40 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 spring-tap"
        />
      </div>

      {recommended.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-foreground">Spark priority for you</span>
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
        {[{ key: "all", label: "All" }, ...COMM_GROUPS.map((g) => ({ key: g.key, label: g.label }))].map((g) => (
          <button
            key={g.key}
            onClick={() => setGroup(g.key)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${
              group === g.key ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-foreground/70"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {group === "all" && !q.trim() ? (
        COMM_GROUPS.map((g) => (
          <section key={g.key} className="mb-6">
            <h2 className="text-[13px] font-semibold text-foreground mb-3">{g.label}</h2>
            <div className="grid grid-cols-2 gap-3">
              {g.items.map((k) => {
                const c = LIVE_CATEGORIES.find((x) => x.key === k);
                if (!c) return null;
                return <CommCard key={k} c={c} />;
              })}
            </div>
          </section>
        ))
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((c) => (
            <CommCard key={c.key} c={c} />
          ))}
        </div>
      )}

      <UnifiedMessageSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BudCommAssistant open={budOpen} onClose={() => setBudOpen(false)} />
    </div>
  );
}

function CommCard({ c }) {
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