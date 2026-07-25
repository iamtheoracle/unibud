import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
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

const REAL = {
  oracle: OracleOverview,
  users: UserManagement,
  moderation: Moderation,
  audit: AuditLogs,
  featureflags: FeatureFlags,
  notifications: Notifications,
  support: Support,
  health: HealthMonitoring,
  analytics: PlatformAnalytics,
};

export default function Oracle() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const active = params.get("module") || "oracle";
  const onActive = (id) => setParams({ module: id });

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const role = me.role || me.data?.role;
        if (role !== "admin") { navigate("/home"); return; }
        setUser(me);
      } catch { navigate("/login"); return; }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="h-screen grid place-items-center text-muted-foreground">Loading Oracle…</div>;
  if (!user) return null;

  const Section = REAL[active];
  const mod = moduleById(active);

  return (
    <OracleShell user={user} modules={ORACLE_MODULES} active={active} onActive={onActive}>
      {Section ? <Section onActive={onActive} /> : <GenericModule module={mod} />}
    </OracleShell>
  );
}