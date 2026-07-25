import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShieldAlert, Loader2 } from "lucide-react";
import OracleShell from "@/components/oracle/OracleShell";
import { ORACLE_MODULES, moduleById } from "@/lib/oracle/modules";
import OracleOverview from "@/components/oracle/sections/OracleOverview";
import UserManagement from "@/components/oracle/sections/UserManagement";
import Moderation from "@/components/oracle/sections/Moderation";
import AuditLogs from "@/components/oracle/sections/AuditLogs";
import FeatureFlags from "@/components/oracle/sections/FeatureFlags";
import Notifications from "@/components/oracle/sections/Notifications";
import Support from "@/components/oracle/sections/Support";
import HealthMonitoring from "@/components/oracle/sections/HealthMonitoring";
import PlatformAnalytics from "@/components/oracle/sections/PlatformAnalytics";
import GenericModule from "@/components/oracle/sections/GenericModule";

const REAL = { oracle: OracleOverview, users: UserManagement, moderation: Moderation, audit: AuditLogs, featureflags: FeatureFlags, notifications: Notifications, support: Support, health: HealthMonitoring, analytics: PlatformAnalytics };

export default function Oracle() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const active = params.get("m") || "oracle";
  const onActive = (id) => setParams({ m: id });

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} finally { setLoading(false); } })(); }, []);

  if (loading) return <div className="h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="h-screen grid place-items-center px-6">
        <div className="glass-card radius-lg p-6 text-center max-w-[360px]">
          <ShieldAlert className="w-8 h-8 text-destructive mx-auto mb-2" />
          <h2 className="font-heading font-bold text-[18px]">Admin access required</h2>
          <p className="text-[13px] text-muted-foreground mt-1">Oracle is restricted to platform administrators.</p>
        </div>
      </div>
    );
  }

  const mod = moduleById(active) || ORACLE_MODULES[0];
  const Section = REAL[mod.id] || GenericModule;
  return (
    <OracleShell user={user} modules={ORACLE_MODULES} active={active} onActive={onActive}>
      <Section module={mod} onActive={onActive} />
    </OracleShell>
  );
}