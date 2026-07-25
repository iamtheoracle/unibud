import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Shield, MonitorSmartphone, Lock, History, LogOut, Loader2, ChevronLeft } from "lucide-react";
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
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const active = params.get("tab") || "overview";
  const setTab = (id) => setParams({ tab: id });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} finally { setLoading(false); } })(); }, []);

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!user) return <div className="min-h-screen grid place-items-center px-6 text-center text-muted-foreground">Sign in to manage your security.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-xl flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted/60"><ChevronLeft className="w-5 h-5" /></button>
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-[16px] font-heading font-semibold flex-1">Identity & Security</h1>
        <span className="text-[12px] text-muted-foreground truncate max-w-[180px] hidden sm:block">{user.email}</span>
      </header>

      <div className="px-4 pt-4"><div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">{TABS.map((t) => {
        const Icon = t.icon;
        return <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap spring-tap ${active === t.id ? "bg-primary text-primary-foreground" : "glass text-foreground/80"}`}><Icon className="w-4 h-4" />{t.label}</button>;
      })}</div></div>

      <main className="p-4 md:p-6 max-w-3xl mx-auto">
        {active === "overview" && <SecurityOverview user={user} onTab={setTab} />}
        {active === "devices" && <SecurityDevices user={user} />}
        {active === "privacy" && <SecurityPrivacy user={user} />}
        {active === "activity" && <SecurityActivity user={user} />}
        {active === "sessions" && <SecuritySessions user={user} />}
      </main>
    </div>
  );
}