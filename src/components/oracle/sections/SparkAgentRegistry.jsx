import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Cpu, Loader2, Power } from "lucide-react";
import { loadAgentRegistry, setAgentEnabled, SPARK_DIVISIONS } from "@/lib/spark/agents/registry";

export default function SparkAgentRegistry({ module }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(null);

  const { data: agents, isLoading } = useQuery({
    queryKey: ["sparkAgents"],
    queryFn: () => loadAgentRegistry({ force: true }),
  });

  const list = agents || [];

  const toggle = async (agent) => {
    setBusy(agent.agent_id);
    try {
      await setAgentEnabled(agent.agent_id, !agent.enabled);
      qc.invalidateQueries({ queryKey: ["sparkAgents"] });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-heading font-bold tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" /> Spark Agent Registry
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">Configuration-driven registry of all {list.length || 25} specialist agents. Admins can enable, disable, and reorder agents without code changes.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        SPARK_DIVISIONS.map((div) => {
          const divAgents = list.filter((a) => a.division === div);
          if (divAgents.length === 0) return null;
          return (
            <div key={div} className="crystal-card p-4">
              <h3 className="text-[12px] font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">{div} Division</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {divAgents.map((a) => (
                  <div key={a.agent_id} className="rounded-xl border border-border/60 p-3 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-heading font-semibold text-[14px]">{a.name}</div>
                        <div className="text-[11px] text-muted-foreground">{a.role}</div>
                      </div>
                      <button
                        onClick={() => toggle(a)}
                        disabled={busy === a.agent_id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          a.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        } disabled:opacity-50`}
                        title={a.enabled ? "Disable agent" : "Enable agent"}
                      >
                        <Power className="w-3 h-3" />
                        {a.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{a.focus}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(a.tools || []).slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}