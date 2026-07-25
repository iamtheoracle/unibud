import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Zap, Plus, Play, Pause, Trash2, History, AlertTriangle, CheckCircle2, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { triggerLabel, actionLabel } from "@/lib/automation/manifest";

export default function AutomationCenter() {
  const [autos, setAutos] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null);
  const [expandRun, setExpandRun] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, r] = await Promise.all([
        base44.entities.Automation.list("-updated_date", 50),
        base44.entities.AutomationRun.list("-created_date", 20),
      ]);
      setAutos(a); setRuns(r);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (a) => { try { await base44.entities.Automation.update(a.id, { status: a.status === "active" ? "paused" : "active" }); load(); } catch {} };
  const remove = async (a) => { if (!confirm("Delete this automation?")) return; try { await base44.entities.Automation.delete(a.id); load(); } catch {} };
  const run = async (a) => { setRunning(a.id); try { const res = await base44.functions.invoke("runAutomation", { automation_id: a.id, source: "manual" }); toast({ title: res.data?.status === "success" ? "Automation ran" : "Run had errors" }); load(); } catch { toast({ title: "Run failed" }); } finally { setRunning(null); } };

  const active = autos.filter((a) => a.status === "active");
  const paused = autos.filter((a) => a.status === "paused");
  const drafts = autos.filter((a) => a.status === "draft");
  const errors = runs.filter((r) => r.status === "failed");

  return (
    <div className="w-full max-w-[760px] mx-auto px-5 pt-6 pb-28 safe-area-pt space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-[22px] font-heading font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-primary" />Automation Engine</h1><p className="text-[13px] text-muted-foreground">Automations are explainable, reversible, and never act destructively.</p></div>
        <Button asChild><Link to="/automation/builder"><Plus className="w-4 h-4 mr-1" />New</Link></Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={CheckCircle2} label="Active" value={active.length} color="text-success" />
        <Stat icon={Pause} label="Paused" value={paused.length + drafts.length} color="text-muted-foreground" />
        <Stat icon={AlertTriangle} label="Errors" value={errors.length} color="text-destructive" />
      </div>

      <section>
        <h2 className="font-heading font-semibold text-[15px] mb-2">Your automations</h2>
        {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : autos.length === 0 ? (
          <div className="glass-card radius-lg p-6 text-center"><p className="text-muted-foreground text-[13px]">No automations yet. Create your first workflow.</p><Button asChild className="mt-3"><Link to="/automation/builder"><Plus className="w-4 h-4 mr-1" />Build automation</Link></Button></div>
        ) : (
          <div className="space-y-2">
            {autos.map((a) => (
              <div key={a.id} className="glass-card radius-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="font-semibold text-[14px] truncate">{a.name}</p><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.status === "active" ? "bg-success/20 text-success" : a.status === "paused" ? "bg-muted text-muted-foreground" : "bg-warning/20 text-warning"}`}>{a.status}</span></div>
                    <p className="text-[12px] text-muted-foreground truncate">When {triggerLabel(a.trigger)} → {((a.actions || []).map((x) => actionLabel(x.key)).join(", ")) || "no actions"}</p>
                    <p className="text-[11px] text-muted-foreground">{a.run_count || 0} runs{a.last_run_at ? ` · last ${new Date(a.last_run_at).toLocaleDateString()}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => run(a)} disabled={running === a.id} className="p-2 rounded-lg hover:bg-muted/60 text-primary" title="Test run">{running === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}</button>
                    <button onClick={() => toggle(a)} className="p-2 rounded-lg hover:bg-muted/60" title="Pause/Activate">{a.status === "active" ? <Pause className="w-4 h-4" /> : <Zap className="w-4 h-4" />}</button>
                    <Button asChild variant="ghost" size="icon"><Link to={`/automation/builder/${a.id}`}><Settings className="w-4 h-4" /></Link></Button>
                    <button onClick={() => remove(a)} className="p-2 rounded-lg hover:bg-muted/60 text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading font-semibold text-[15px] mb-2 flex items-center gap-2"><History className="w-4 h-4 text-primary" />Execution history</h2>
        {runs.length === 0 ? <p className="text-muted-foreground text-[13px]">No runs yet. Test an automation to see logs.</p> : (
          <div className="space-y-2">
            {runs.map((r) => (
              <div key={r.id} className="glass-card radius-lg p-3">
                <button onClick={() => setExpandRun(expandRun === r.id ? null : r.id)} className="w-full flex items-center gap-3 text-left">
                  <span className={`w-2.5 h-2.5 rounded-full ${r.status === "success" ? "bg-success" : "bg-destructive"}`} />
                  <div className="flex-1 min-w-0"><p className="font-semibold text-[13px] truncate">{r.automation_name || "Automation"}</p><p className="text-[11px] text-muted-foreground">{new Date(r.started_at).toLocaleString()} · {r.trigger_source}</p></div>
                  <span className="text-[11px] text-muted-foreground">{(r.actions_executed || []).length} actions</span>
                </button>
                {expandRun === r.id && (
                  <div className="mt-2 pt-2 border-t border-border space-y-1">
                    {(r.log || []).map((l, i) => <pre key={i} className="whitespace-pre-wrap text-[12px] font-mono text-muted-foreground">{l}</pre>)}
                    {r.error && <p className="text-[12px] text-destructive">Error: {r.error}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card radius-lg p-4"><div className="flex items-center gap-2"><Icon className={`w-4 h-4 ${color}`} /><span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span></div><p className="text-[24px] font-heading font-bold mt-1">{value}</p></div>
);