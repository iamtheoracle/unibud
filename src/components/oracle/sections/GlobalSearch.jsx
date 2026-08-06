import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, LoadingState, EmptyState } from "@/components/oracle/oracle-ui";
import { Search, Users, Building2, Layers, ScrollText, Settings, Plug, Bot, CreditCard } from "lucide-react";

const SCOPES = [
  { key: "users", label: "Users", icon: Users, entity: "User", fields: ["full_name", "email"], render: (r) => ({ title: r.full_name || "Unnamed", sub: r.email }) },
  { key: "institutions", label: "Institutions", icon: Building2, entity: "Institution", fields: ["name", "short_name"], render: (r) => ({ title: r.name, sub: r.short_name }) },
  { key: "modules", label: "Modules", icon: Layers, entity: "PlatformModule", fields: ["display_name", "key"], render: (r) => ({ title: r.display_name, sub: r.key }) },
  { key: "audit", label: "Logs", icon: ScrollText, entity: "AuditLog", fields: ["action", "actor_name"], render: (r) => ({ title: r.action, sub: r.actor_name }) },
];

export default function GlobalSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const run = useMemo(() => () => {
    const term = q.toLowerCase().trim();
    if (!term) { setResults({}); setSearched(false); return; }
    setLoading(true); setSearched(true);
    (async () => {
      const out = {};
      await Promise.all(SCOPES.map(async (s) => {
        try { const list = await base44.entities[s.entity].list("-created_date", 50); out[s.key] = list.filter((r) => (s.fields.some((f) => (r[f] || "").toLowerCase().includes(term)))).slice(0, 8); }
        catch { out[s.key] = []; }
      }));
      setResults(out); setLoading(false);
    })();
  }, [q]);

  useEffect(() => { const id = setTimeout(run, 350); return () => clearTimeout(id); }, [q, run]);

  const total = Object.values(results).reduce((a, b) => a + b.length, 0);

  return (
    <div className="space-y-4">
      <SectionHeader title="Global Search" desc="Universal command search across users, institutions, courses, payments, reports, logs, settings, AI and integrations." />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search across the entire platform…" className="w-full h-12 pl-12 pr-4 rounded-xl glass border border-border text-[15px] focus:outline-none focus:border-primary/50" />
      </div>

      {loading && <LoadingState label="Searching…" />}

      {!loading && searched && total === 0 && <EmptyState icon={Search} title="No results" message={`Nothing matched "${q}" across the platform.`} />}

      {!loading && Object.entries(results).map(([key, list]) => {
        if (!list || list.length === 0) return null;
        const scope = SCOPES.find((s) => s.key === key);
        const Icon = scope.icon;
        return (
          <Panel key={key} title={scope.label} icon={Icon} actions={<span className="text-[10px] text-muted-foreground">{list.length}</span>}>
            <div className="space-y-1">
              {list.map((r) => {
                const v = scope.render(r);
                return (
                  <div key={r.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                    <div className="w-7 h-7 rounded-lg bg-primary/12 grid place-items-center shrink-0"><Icon className="w-3.5 h-3.5 text-primary" /></div>
                    <div className="min-w-0 flex-1"><p className="text-[12px] font-medium truncate">{v.title}</p><p className="text-[11px] text-muted-foreground truncate">{v.sub}</p></div>
                  </div>
                );
              })}
            </div>
          </Panel>
        );
      })}

      {!searched && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[Users, Building2, Layers, ScrollText, Bot, Plug, CreditCard, Settings].map((Icon, i) => (
            <div key={i} className="glass-card radius-lg p-4 flex items-center gap-2 text-muted-foreground">
              <Icon className="w-4 h-4 text-primary" /><span className="text-[12px]">Search {["Users", "Institutions", "Modules", "Logs", "AI", "Integrations", "Payments", "Settings"][i]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}