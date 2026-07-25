import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import * as Providers from "@/lib/providers";
import { SectionHeader, Panel, StatusPill, Btn, LoadingState, EmptyState, StatCard } from "@/components/oracle/oracle-ui";
import { Plug, Activity, RefreshCw, FlaskConical, ServerCog, CheckCircle2 } from "lucide-react";
import { GROUP_LABELS, GROUP_ORDER, secretFor, nowIso, ago } from "./shared";

const conn = (a) => ({ key: a.id, name: a.name, group: a.group, capabilities: a.capabilities || [], environment: "sandbox", version: a.version || "1.0.0", status: a.id.startsWith("mock") ? "connected" : "needs_config", auth_status: a.id.startsWith("mock") ? "authenticated" : "pending", is_active: false, api_usage: 0, error_rate: 0 });

export default function ProvidersTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    let existing = []; try { existing = await base44.entities.ProviderConnection.list("-created_date", 200); } catch {}
    const byKey = Object.fromEntries(existing.map((r) => [r.key, r]));
    // seed missing adapters
    const adapters = Providers.all();
    for (const a of adapters) if (!byKey[a.key ?? a.id]) { try { const r = await base44.entities.ProviderConnection.create(conn(a)); byKey[r.key] = r; } catch {} }
    let all = Object.values(byKey);
    // sync registry active selection
    GROUP_ORDER.forEach((g) => { const act = all.find((r) => r.group === g && r.is_active) || all.find((r) => r.group === g && r.key === Providers.activeId(g)); if (act) Providers.setActive(g, act.key); });
    setRows(all);
  };
  useEffect(() => { load(); }, []);

  const update = async (id, patch) => { await base44.entities.ProviderConnection.update(id, patch); };
  const reload = async () => { setRows(null); await load(); };

  const test = async (r) => {
    setBusy(r.key);
    try {
      const res = await Providers.check(r.key);
      await update(r.id, { last_health_check: nowIso(), status: res.ok ? "connected" : "error", auth_status: res.ok ? "authenticated" : "failed", error_rate: res.ok ? 0 : 100 });
      try { await base44.entities.ProviderLog.create({ provider: r.key, endpoint: "/health", method: "GET", latency_ms: res.latency || 0, status_code: res.ok ? 200 : 500, ok: !!res.ok, error: res.ok ? "" : res.message, cost: 0 }); } catch {}
      toast({ title: res.ok ? `${r.name} healthy · ${res.latency}ms` : "Health check failed", variant: res.ok ? "default" : "destructive" });
    } catch (e) { toast({ title: e.message, variant: "destructive" }); }
    setBusy(null); reload();
  };
  const toggleActive = async (r) => {
    try {
      if (r.is_active) { await update(r.id, { is_active: false, status: "disabled" }); toast({ title: `${r.name} disabled` }); }
      else {
        const siblings = rows.filter((x) => x.group === r.group);
        for (const s of siblings) if (s.id !== r.id && s.is_active) await update(s.id, { is_active: false });
        await update(r.id, { is_active: true, status: "connected", last_sync: nowIso() });
        Providers.setActive(r.group, r.key);
        toast({ title: `${r.name} is now the active ${GROUP_LABELS[r.group]} provider` });
      }
      reload();
    } catch (e) { toast({ title: e.message, variant: "destructive" }); }
  };
  const toggleEnv = async (r) => { await update(r.id, { environment: r.environment === "sandbox" ? "production" : "sandbox" }); toast({ title: `${r.name} → ${r.environment === "sandbox" ? "production" : "sandbox"}` }); reload(); };
  const rotate = async (r) => {
    setBusy("rot_" + r.key);
    try { const res = await base44.functions.invoke("providerSecrets", { action: "rotate", secret: secretFor(r.key) }); toast({ title: `Key rotation logged for ${r.name}` }); reload(); }
    catch (e) { toast({ title: e.message, variant: "destructive" }); }
    setBusy(null);
  };

  if (!rows) return <LoadingState />;

  const connected = rows.filter((r) => r.status === "connected").length;
  const errors = rows.filter((r) => r.status === "error").length;
  const activeCount = rows.filter((r) => r.is_active).length;

  return (
    <div>
      <SectionHeader title="Provider Registry" desc="Connected providers, status, environment, version, health, sync, authentication, usage and error rate."
        actions={<Btn variant="soft" onClick={reload}><RefreshCw className="w-3.5 h-3.5" />Refresh</Btn>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Plug} label="Providers" value={rows.length} tone="muted" />
        <StatCard icon={CheckCircle2} label="Connected" value={connected} tone="success" />
        <StatCard icon={ServerCog} label="Active (per group)" value={activeCount} tone="primary" />
        <StatCard icon={Activity} label="Errors" value={errors} tone="danger" />
      </div>

      {GROUP_ORDER.map((g) => {
        const items = rows.filter((r) => r.group === g);
        if (!items.length) return null;
        return (
          <Panel key={g} title={GROUP_LABELS[g]} className="mb-4">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((r) => (
                <div key={r.id} className={`rounded-xl border p-3 ${r.is_active ? "border-primary/40 bg-primary/5" : "border-border bg-muted/15"}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0"><p className="font-heading font-semibold text-[13px] truncate">{r.name}</p><p className="text-[10px] text-muted-foreground font-mono">{r.key} · v{r.version}</p></div>
                    {r.is_active && <span className="text-[9px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">ACTIVE</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-2"><StatusPill status={r.status} /><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${r.environment === "production" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>{r.environment === "production" ? "PROD" : "SANDBOX"}</span><span className={`text-[10px] px-1.5 py-0.5 rounded-full ${r.auth_status === "authenticated" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{r.auth_status}</span></div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground mb-2"><span>Health: {ago(r.last_health_check)}</span><span>Sync: {ago(r.last_sync)}</span><span>Usage: {r.api_usage || 0} calls</span><span>Error rate: {r.error_rate || 0}%</span></div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Btn variant={r.is_active ? "soft" : "primary"} size="sm" onClick={() => toggleActive(r)}>{r.is_active ? "Disable" : "Enable"}</Btn>
                    <Btn variant="ghost" size="sm" disabled={busy === r.key} onClick={() => test(r)}><Activity className="w-3 h-3" />Test</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => toggleEnv(r)} title="Toggle sandbox/production"><FlaskConical className="w-3 h-3" /></Btn>
                    <Btn variant="ghost" size="sm" disabled={busy === "rot_" + r.key} onClick={() => rotate(r)} title="Rotate keys"><RefreshCw className="w-3 h-3" /></Btn>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}