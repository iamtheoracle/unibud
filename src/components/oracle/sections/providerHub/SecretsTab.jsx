import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, Panel, Btn, LoadingState, StatusPill, EmptyState } from "@/components/oracle/oracle-ui";
import { KeyRound, ShieldCheck, RefreshCw, FlaskConical, Lock } from "lucide-react";

export default function SecretsTab() {
  const { toast } = useToast();
  const [secrets, setSecrets] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setSecrets(null);
    try { const res = await base44.functions.invoke("providerSecrets", { action: "list" }); setSecrets(res.data?.secrets || []); }
    catch (e) { setSecrets([]); toast({ title: "Could not load secrets", variant: "destructive" }); }
  };
  useEffect(() => { load(); }, []);

  const test = async (key) => {
    setBusy("t_" + key);
    try { const res = await base44.functions.invoke("providerSecrets", { action: "test", secret: key }); toast({ title: res.data?.message, variant: res.data?.ok ? "default" : "destructive" }); }
    catch (e) { toast({ title: e.message, variant: "destructive" }); }
    setBusy(null);
  };
  const rotate = async (key) => {
    setBusy("r_" + key);
    try { const res = await base44.functions.invoke("providerSecrets", { action: "rotate", secret: key }); toast({ title: "Key rotation recorded (audit logged)" }); }
    catch (e) { toast({ title: e.message, variant: "destructive" }); }
    setBusy(null);
  };

  return (
    <div>
      <SectionHeader title="Secret Management" desc="Secure server-side storage for API keys, OAuth tokens, certificates and webhook secrets. Values are never exposed to the frontend — configure them in dashboard → environment variables." />
      <Panel>
        <div className="flex items-center gap-2 mb-3 text-[11px] text-muted-foreground"><Lock className="w-3.5 h-3.5" />All secrets remain server-side. Only configuration status and a masked preview are shown here.</div>
        {!secrets ? <LoadingState /> : secrets.length === 0 ? <EmptyState icon={KeyRound} message="No secrets registered." /> : (
          <div className="space-y-2">{secrets.map((s) => (
            <div key={s.key} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20">
              <KeyRound className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1"><p className="text-[12px] font-mono font-medium truncate">{s.key}</p><p className="text-[10px] text-muted-foreground">{s.configured ? `configured · ${s.masked}` : "not configured"}</p></div>
              <StatusPill status={s.configured ? "authenticated" : "needs_config"} />
              <Btn variant="ghost" size="sm" disabled={busy === "t_" + s.key} onClick={() => test(s.key)}><FlaskConical className="w-3 h-3" />Test</Btn>
              <Btn variant="ghost" size="sm" disabled={busy === "r_" + s.key} onClick={() => rotate(s.key)}><RefreshCw className="w-3 h-3" />Rotate</Btn>
            </div>
          ))}</div>
        )}
      </Panel>
    </div>
  );
}