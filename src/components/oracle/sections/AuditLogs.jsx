import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Shield, UserCog, AlertTriangle, ChevronDown, Filter } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All", icon: ScrollText },
  { id: "security", label: "Security", icon: Shield },
  { id: "account", label: "Account", icon: UserCog },
  { id: "academic", label: "Academic", icon: ScrollText },
  { id: "system", label: "System", icon: Filter },
];

const SEVERITY_STYLE = {
  critical: { variant: "destructive", color: "text-destructive" },
  warning: { variant: "secondary", color: "text-warning" },
  info: { variant: "outline", color: "text-muted-foreground" },
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLogs(await base44.entities.AuditLog.list("-created_date", 100));
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return logs;
    return logs.filter((l) => l.category === activeCategory);
  }, [logs, activeCategory]);

  const sev = (s) => (SEVERITY_STYLE[s] || SEVERITY_STYLE.info).variant;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-heading font-bold">Audit Timeline</h1>
        <p className="text-[13px] text-muted-foreground">
          Security-focused record of significant account events — for compliance and support.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium spring-tap transition-colors ${
                active ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <Icon className="w-3 h-3" />
              {c.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-[13px]">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <ScrollText className="w-4 h-4" />
          <span className="text-[13px]">No audit entries in this category.</span>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((log, idx) => {
            const isExpanded = expandedId === log.id;
            const hasChanges = log.previous_value || log.new_value;
            return (
              <div key={log.id} className="relative">
                {/* Timeline connector */}
                {idx < filtered.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border/40" />
                )}

                <div
                  className={`relative flex gap-3 p-3 rounded-xl spring-tap ${isExpanded ? "bg-muted/30" : "hover:bg-muted/20"}`}
                  onClick={() => hasChanges && setExpandedId(isExpanded ? null : log.id)}
                >
                  {/* Timeline dot */}
                  <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 mt-0.5 ${
                    log.severity === "critical" ? "bg-destructive/15" :
                    log.severity === "warning" ? "bg-warning/15" : "bg-primary/10"
                  }`}>
                    {log.severity === "critical" ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> :
                     log.severity === "warning" ? <Shield className="w-3.5 h-3.5 text-warning" /> :
                     <ScrollText className="w-3.5 h-3.5 text-primary" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-foreground">{log.action?.replace(/_/g, " ")}</span>
                      <Badge variant={sev(log.severity)} className="text-[10px] capitalize">{log.severity || "info"}</Badge>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">{log.details}</p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      {log.actor_name && <span>by {log.actor_name}</span>}
                      {log.target_name && <span>· {log.target_name}</span>}
                      <span>· {log.timestamp ? new Date(log.timestamp).toLocaleString() : (log.created_date ? new Date(log.created_date).toLocaleString() : "—")}</span>
                    </div>

                    {/* Before/after values (expandable) */}
                    {hasChanges && (
                      <>
                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 grid grid-cols-2 gap-2">
                            {log.previous_value && (
                              <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Previous</p>
                                <p className="text-[12px] text-foreground break-all">{log.previous_value}</p>
                              </div>
                            )}
                            {log.new_value && (
                              <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                                <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-0.5">New</p>
                                <p className="text-[12px] text-foreground break-all">{log.new_value}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {!isExpanded && (
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-primary">
                            <ChevronDown className="w-3 h-3" /> View change
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}