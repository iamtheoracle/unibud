import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldAlert } from "lucide-react";
import ManagementShell from "@/components/management/ManagementShell";
import { MANAGEMENT_MODULES, moduleById } from "@/lib/management/modules";
import EntityModule from "@/components/management/EntityModule";
import MgmtDashboard from "@/components/management/sections/MgmtDashboard";
import Communication from "@/components/management/sections/Communication";
import Reporting from "@/components/management/sections/Reporting";
import Analytics from "@/components/management/sections/Analytics";

const SECTIONS = { dashboard: MgmtDashboard, communication: Communication, reporting: Reporting, analytics: Analytics };

function Denied({ message }) {
  return (
    <div className="h-screen grid place-items-center px-6">
      <div className="glass-card radius-lg p-6 text-center max-w-[420px]">
        <ShieldAlert className="w-8 h-8 text-destructive mx-auto mb-2" />
        <h2 className="font-heading font-bold text-[18px]">Management access</h2>
        <p className="text-[13px] text-muted-foreground mt-1">{message}</p>
      </div>
    </div>
  );
}

export default function Management() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const active = params.get("m") || "dashboard";
  const onActive = (id) => setParams({ m: id });

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} finally { setLoading(false); } })(); }, []);

  if (loading) return <div className="h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const instId = user?.data?.institution_id;
  if (user?.role === "admin" && !instId) return <Denied message="Oracle Administrators manage the platform from Oracle. Management is the operational headquarters for institution leaders and managers." />;
  if (!instId) return <Denied message="You are not assigned to an institution. Management is for institution leaders and managers." />;

  const mod = moduleById(active) || MANAGEMENT_MODULES[0];
  let body;
  if (mod.kind === "entity") {
    body = <EntityModule entityName={mod.entity} title={mod.label} description={mod.desc} icon={mod.icon} institutionId={instId} />;
  } else {
    const Sec = SECTIONS[mod.id] || MgmtDashboard;
    body = <Sec institutionId={instId} user={user} />;
  }

  return (
    <ManagementShell user={user} institutionName={user.data.institution_name} modules={MANAGEMENT_MODULES} active={active} onActive={onActive}>
      {body}
    </ManagementShell>
  );
}