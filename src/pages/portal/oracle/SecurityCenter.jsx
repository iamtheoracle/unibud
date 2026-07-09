import React from "react";
import { Shield, Lock, KeyRound, Smartphone, Eye, AlertTriangle, CheckCircle2, Fingerprint } from "lucide-react";
import { KpiCard, SectionCard, StatusPill, DataTable } from "@/components/portal/PortalUI";

export default function SecurityCenter() {
  const securityFeatures = [
    { name: "Role-Based Access Control", icon: Shield, status: "operational", detail: "8 role tiers enforced" },
    { name: "Two-Factor Authentication", icon: Lock, status: "operational", detail: "Available for all roles" },
    { name: "Session Management", icon: KeyRound, status: "operational", detail: "JWT with refresh rotation" },
    { name: "Device Management", icon: Smartphone, status: "operational", detail: "Device tracking enabled" },
    { name: "Activity Monitoring", icon: Eye, status: "operational", detail: "Real-time audit logging" },
    { name: "Approval Workflows", icon: CheckCircle2, status: "operational", detail: "Multi-step approvals active" },
  ];

  const loginColumns = [
    { key: "user", header: "User", render: (row) => <span className="font-medium text-[13px]">{row.user}</span> },
    { key: "device", header: "Device", render: (row) => <span className="text-[12px] text-muted-foreground">{row.device}</span> },
    { key: "location", header: "Location", render: (row) => <span className="text-[12px] text-muted-foreground">{row.location}</span> },
    { key: "time", header: "Time", render: (row) => <span className="text-[11px] text-muted-foreground">{row.time}</span> },
  ];

  const recentLogins = [
    { id: 1, user: "Oracle Admin", device: "Chrome · macOS", location: "Lagos, NG", time: "2 min ago" },
    { id: 2, user: "exec@myrealm.io", device: "Safari · iPhone", location: "Abuja, NG", time: "1 hour ago" },
    { id: 3, user: "ops@unibud.io", device: "Firefox · Windows", location: "Benin, NG", time: "3 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">Security Center</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Platform security, access control, and threat monitoring.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Shield} label="Security Score" value="A+" sublabel="Excellent posture" accent="success" />
        <KpiCard icon={Lock} label="2FA Adoption" value="87%" sublabel="Of admin users" accent="primary" />
        <KpiCard icon={AlertTriangle} label="Threats Blocked" value={12} sublabel="Last 7 days" accent="warning" />
        <KpiCard icon={Fingerprint} label="Active Sessions" value={47} sublabel="Across all users" accent="info" />
      </div>

      <SectionCard title="Security Features" description="Platform security capabilities and their status">
        <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityFeatures.map((feat) => (
            <div key={feat.name} className="bg-muted/30 rounded-xl p-4 border border-border/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <feat.icon className="w-5 h-5 text-success" />
                </div>
                <StatusPill status={feat.status} />
              </div>
              <p className="text-[13px] font-semibold text-foreground">{feat.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{feat.detail}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Recent Login History" description="Latest authentication events across the platform">
        <DataTable columns={loginColumns} data={recentLogins} />
      </SectionCard>
    </div>
  );
}