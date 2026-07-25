import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, Panel, StatusPill, Btn, SearchInput } from "@/components/oracle/oracle-ui";
import { Plug, CreditCard, Landmark, BadgeCheck, Mail, MessageSquare, BellRing, Cloud, BarChart3, Bot } from "lucide-react";

const CATEGORIES = [
  { key: "payments", label: "Payment Providers", icon: CreditCard, items: ["Stripe", "Paystack", "Flutterwave"] },
  { key: "banking", label: "Banking APIs", icon: Landmark, items: ["Mono", "Okra", "Sterling Open Banking"] },
  { key: "cards", label: "Card Providers", icon: CreditCard, items: ["Verve", "Visa Direct", "Mastercard Send"] },
  { key: "kyc", label: "KYC Providers", icon: BadgeCheck, items: ["Smile ID", "VerifyMe", "Youverify"] },
  { key: "email", label: "Email", icon: Mail, items: ["Resend", "SendGrid", "Amazon SES"] },
  { key: "sms", label: "SMS", icon: MessageSquare, items: ["Termii", "Twilio", "Vonage"] },
  { key: "push", label: "Push Notifications", icon: BellRing, items: ["FCM", "APNs", "OneSignal"] },
  { key: "storage", label: "Cloud Storage", icon: Cloud, items: ["Wix Storage", "AWS S3", "Cloudflare R2"] },
  { key: "analytics", label: "Analytics", icon: BarChart3, items: ["Base44 Analytics", "PostHog", "Mixpanel"] },
  { key: "ai", label: "AI Providers", icon: Bot, items: ["Base44 AI", "Google Gemini", "Anthropic Claude", "OpenAI"] },
];

const ENVS = ["Production", "Staging", "Sandbox"];

export default function IntegrationCenter() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [state, setState] = useState({}); // key "cat::name" => { connected, env, lastSync }

  const toggle = (cat, name) => {
    const k = `${cat}::${name}`;
    const cur = state[k] || { connected: false, env: "Production", lastSync: null };
    const next = { ...cur, connected: !cur.connected, lastSync: !cur.connected ? new Date().toISOString() : cur.lastSync };
    setState((s) => ({ ...s, [k]: next }));
    toast({ title: `${name} ${next.connected ? "connected" : "disconnected"}` });
  };

  const setEnv = (cat, name, env) => {
    const k = `${cat}::${name}`;
    setState((s) => ({ ...s, [k]: { ...(s[k] || { connected: false, lastSync: null }), env } }));
  };

  const envOf = (cat, name) => state[`${cat}::${name}`]?.env || "Production";
  const connected = (cat, name) => !!state[`${cat}::${name}`]?.connected;
  const lastSync = (cat, name) => state[`${cat}::${name}`]?.lastSync;

  return (
    <div className="space-y-4">
      <SectionHeader title="Integration Center" desc="Manage external services — payments, banking, KYC, email, SMS, cloud, analytics and AI."
        actions={<SearchInput value={q} onChange={setQ} placeholder="Search integrations…" />} />

      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const items = cat.items.filter((n) => n.toLowerCase().includes(q.toLowerCase()));
          if (q && items.length === 0) return null;
          return (
            <Panel key={cat.key} title={cat.label} icon={Icon}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((name) => {
                  const on = connected(cat.key, name);
                  const ls = lastSync(cat.key, name);
                  return (
                    <div key={name} className="rounded-xl border border-border bg-muted/20 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-heading font-semibold">{name}</p>
                        <StatusPill status={on ? "connected" : "inactive"} />
                      </div>
                      <div className="space-y-1.5 mb-3">
                        <Row k="Environment">
                          <select value={envOf(cat.key, name)} onChange={(e) => setEnv(cat.key, name, e.target.value)} className="bg-muted/40 border border-border rounded px-1.5 py-0.5 text-[11px] focus:outline-none">
                            {ENVS.map((e) => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </Row>
                        <Row k="Last sync"><span className="text-[11px] text-muted-foreground">{ls ? new Date(ls).toLocaleString() : "—"}</span></Row>
                        <Row k="Webhooks"><StatusPill status={on ? "active" : "inactive"} /></Row>
                      </div>
                      <Btn variant={on ? "soft" : "primary"} className="w-full" onClick={() => toggle(cat.key, name)}>
                        <Plug className="w-3 h-3" />{on ? "Disconnect" : "Connect"}
                      </Btn>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">{k}</span>{v}</div>;
}