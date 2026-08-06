import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { processQueue } from "@/lib/providers";
import { SectionHeader, Panel, StatusPill, Btn, EmptyState, LoadingState, StatCard } from "@/components/oracle/oracle-ui";
import { Webhook, RefreshCw, Send, Inbox, AlertOctagon } from "lucide-react";
import { ago } from "./shared";

export default function WebhooksTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState(null);
  const [processing, setProcessing] = useState(false);

  const load = async () => { setRows(null); try { setRows(await base44.entities.WebhookEvent.list("-created_date", 100)); } catch { setRows([]); } };
  useEffect(() => { load(); }, []);

  const run = async () => { setProcessing(true); try { const r = await processQueue(); toast({ title: `Processed ${r.processed} · ${r.dead} dead-lettered` }); load(); } catch (e) { toast({ title: e.message, variant: "destructive" }); } setProcessing(false); };
  const sendTest = async () => { try { await base44.entities.WebhookEvent.create({ direction: "outgoing", provider: "mock", event_type: "test.event", payload: { hello: "world" }, status: "retry", retry_count: 0, signature: "mock-sig" }); toast({ title: "Test webhook queued" }); load(); } catch (e) { toast({ title: e.message, variant: "destructive" }); } };

  if (!rows) return <LoadingState />;
  const retry = rows.filter((r) => r.status === "retry").length;
  const dead = rows.filter((r) => r.status === "dead_letter").length;
  const ok = rows.filter((r) => r.status === "success").length;

  return (
    <div>
      <SectionHeader title="Webhook Center" desc="Incoming & outgoing webhooks, retry queue with exponential backoff, signature verification, replay protection, event logs and dead letter queue."
        actions={<><Btn variant="soft" onClick={sendTest}><Send className="w-3.5 h-3.5" />Test Outgoing</Btn><Btn variant="primary" onClick={run} disabled={processing}><RefreshCw className="w-3.5 h-3.5" />Process Retries</Btn></>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Webhook} label="Total Events" value={rows.length} tone="muted" />
        <StatCard icon={Inbox} label="Successful" value={ok} tone="success" />
        <StatCard icon={RefreshCw} label="In Retry Queue" value={retry} tone="warn" />
        <StatCard icon={AlertOctagon} label="Dead Letter" value={dead} tone="danger" />
      </div>
      <Panel title="Incoming Webhook Endpoint" className="mb-4">
        <p className="text-[11px] text-muted-foreground mb-1">Point provider webhooks here. Signatures are verified against <code className="font-mono text-primary">WEBHOOK_SIGNING_SECRET</code> (server-side only).</p>
        <code className="text-[12px] font-mono text-primary break-all">POST /api/functions/providerSecrets <span className="text-muted-foreground">(webhook route available once a provider is connected)</span></code>
      </Panel>
      <Panel title="Event Log">
        {rows.length === 0 ? <EmptyState icon={Webhook} message="No webhook events yet. Send a test outgoing webhook to populate the queue." /> : (
          <div className="space-y-2">{rows.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20">
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${e.direction === "incoming" ? "bg-information/15 text-information" : "bg-primary/15 text-primary"}`}>{e.direction}</span>
              <Webhook className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="min-w-0 flex-1"><p className="text-[12px] font-medium truncate">{e.provider} · {e.event_type}</p><p className="text-[10px] text-muted-foreground">{ago(e.created_date)} · {e.retry_count || 0} retries {e.error ? `· ${e.error}` : ""}</p></div>
              <span className="text-[10px] text-muted-foreground">{e.response_code || "—"}</span>
              <StatusPill status={e.status} />
            </div>
          ))}</div>
        )}
      </Panel>
    </div>
  );
}