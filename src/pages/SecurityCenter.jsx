import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Shield, MonitorSmartphone, Lock, History, LogOut, Loader2 } from "lucide-react";
import ScreenShell from "@/components/layout/ScreenShell";
import SecurityOverview from "@/components/security/SecurityOverview";
import SecurityDevices from "@/components/security/SecurityDevices";
import SecurityPrivacy from "@/components/security/SecurityPrivacy";
import SecurityActivity from "@/components/security/SecurityActivity";
import SecuritySessions from "@/components/security/SecuritySessions";

const TABS = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "devices", label: "Devices", icon: MonitorSmartphone },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "activity", label: "Activity", icon: History },
  { id: "sessions", label: "Sessions", icon: LogOut },
];

export default function SecurityCenter() {
  const [params, setParams] = useSearchParams();
  const active = params.get("tab") || "overview";
  const setTab = (id) => setParams({ tab: id });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} finally { setLoading(false); } })(); }, []);

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!user) return <div className="min-h-screen grid place-items-center px-6 text-center text-muted-foreground">Sign in to manage your security.</div>;

  return (
    <ScreenShell title="Identity & Security" subtitle={user.email} back>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mt-3 mb-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          return <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap spring-tap ${active === t.id ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-foreground/80"}`}><Icon className="w-4 h-4" />{t.label}</button>;
        })}
      </div>

      <div>
        {active === "overview" && <SecurityOverview user={user} onTab={setTab} />}
        {active === "devices" && <SecurityDevices user={user} />}
        {active === "privacy" && <SecurityPrivacy user={user} />}
        {active === "activity" && <SecurityActivity user={user} />}
        {active === "sessions" && <SecuritySessions user={user} />}
      </div>
    </ScreenShell>
  );
}