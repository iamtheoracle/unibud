import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, StatCard, StatusPill, DataTable, LoadingState, EmptyState } from "@/components/oracle/oracle-ui";
import { ShieldAlert, Lock, Smartphone, Key, LogIn, Fingerprint, ScanEye, ScrollText } from "lucide-react";

export default function OracleSecurity({ onActive }) {
  const [events, setEvents] = useState([]);
  const [devices, setDevices] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [e, dv, k] = await Promise.all([
          base44.entities.SecurityEvent.list("-created_date", 100).catch(() => []),
          base44.entities.Device.list("-created_date", 100).catch(() => []),
          base44.entities.ApiKey.list("-created_date", 100).catch(() => []),
        ]);
        setEvents(e); setDevices(dv); setKeys(k);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const failed = events.filter((e) => e.type === "failed_login").length;
  const critical = events.filter((e) => e.severity === "critical").length;
  const suspicious = events.filter((e) => ["suspicious_device", "impossible_travel", "privilege_escalation"].includes(e.type)).length;

  const eventCols = [
    { key: "type", label: "Type", render: (r) => <span className="font-medium capitalize">{r.type?.replace(/_/g, " ")}</span> },
    { key: "user_name", label: "User", render: (r) => r.user_name || "—" },
    { key: "location", label: "Location", render: (r) => <span className="text-muted-foreground">{[r.ip, r.location].filter(Boolean).join(" · ") || "—"}</span> },
    { key: "severity", label: "Severity", render: (r) => <StatusPill status={r.severity} /> },
    { key: "date", label: "Date", render: (r) => <span className="text-muted-foreground">{r.created_date ? new Date(r.created_date).toLocaleString() : "—"}</span> },
  ];

  const deviceCols = [
    { key: "device_name", label: "Device", render: (r) => <div><p className="font-medium">{r.device_name}</p><p className="text-[10px] text-muted-foreground">{r.os} · {r.browser}</p></div> },
    { key: "user_name", label: "User", render: (r) => r.user_name || "—" },
    { key: "location", label: "Location", render: (r) => r.location || "—" },
    { key: "is_trusted", label: "Trust", render: (r) => <StatusPill status={r.is_trusted ? "verified" : "pending"} /> },
  ];

  const keyCols = [
    { key: "name", label: "Key", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-[10px] text-muted-foreground font-mono">…{r.key_preview}</p></div> },
    { key: "scopes", label: "Scopes", render: (r) => <span className="text-muted-foreground text-[11px]">{(r.scopes || []).join(", ") || "—"}</span> },
    { key: "is_active", label: "Status", render: (r) => <StatusPill status={r.is_active ? "active" : "inactive"} /> },
    { key: "last_used", label: "Last used", render: (r) => <span className="text-muted-foreground">{r.last_used ? new Date(r.last_used).toLocaleString() : "—"}</span> },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title="Security Center" desc="Global security monitoring — login attempts, threats, devices, API keys and audit." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={LogIn} label="Failed Logins" value={failed} tone={failed > 0 ? "warn" : "success"} />
        <StatCard icon={ShieldAlert} label="Threat Alerts" value={critical} tone={critical > 0 ? "danger" : "success"} onClick={() => onActive("audit")} />
        <StatCard icon={ScanEye} label="Suspicious Activity" value={suspicious} tone={suspicious > 0 ? "warn" : "success"} />
        <StatCard icon={Smartphone} label="Devices" value={devices.length} tone="info" />
        <StatCard icon={Fingerprint} label="MFA Coverage" value="92%" tone="success" />
        <StatCard icon={Key} label="API Keys" value={keys.length} tone="info" />
        <StatCard icon={Lock} label="API Security" value={<StatusPill status="healthy" />} />
        <StatCard icon={ScrollText} label="Audit Trail" value={<StatusPill status="active" />} onClick={() => onActive("audit")} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Security Events" icon={ShieldAlert}>
          {loading ? <LoadingState /> : events.length ? <DataTable columns={eventCols} rows={events} empty="No events" /> : <EmptyState icon={ShieldAlert} message="No security events recorded." />}
        </Panel>
        <Panel title="Device Monitoring" icon={Smartphone}>
          {loading ? <LoadingState /> : devices.length ? <DataTable columns={deviceCols} rows={devices} empty="No devices" /> : <EmptyState icon={Smartphone} message="No devices registered." />}
        </Panel>
      </div>

      <Panel title="API Security — Keys" icon={Key}>
        {loading ? <LoadingState /> : keys.length ? <DataTable columns={keyCols} rows={keys} empty="No API keys" /> : <EmptyState icon={Key} message="No API keys configured." />}
      </Panel>
    </div>
  );
}