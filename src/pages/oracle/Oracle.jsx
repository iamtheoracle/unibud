import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ShieldAlert, Loader2 } from "lucide-react";
import OracleShell from "@/components/oracle/OracleShell";
import { ORACLE_MODULES, moduleById } from "@/lib/oracle/modules";
import OracleDashboard from "@/components/oracle/sections/OracleDashboard";
import RegistryDashboard from "@/components/oracle/sections/RegistryDashboard";
import InstitutionRegistry from "@/components/oracle/sections/InstitutionRegistry";
import ProductRegistry from "@/components/oracle/sections/ProductRegistry";
import UserGovernance from "@/components/oracle/sections/UserGovernance";
import AIGovernance from "@/components/oracle/sections/AIGovernance";
import OracleSecurity from "@/components/oracle/sections/OracleSecurity";
import IntegrationCenter from "@/components/oracle/sections/IntegrationCenter";
import ProviderHub from "@/components/oracle/sections/ProviderHub";
import Monitoring from "@/components/oracle/sections/Monitoring";
import AIMonitoring from "@/components/oracle/sections/AIMonitoring";
import AuditCenter from "@/components/oracle/sections/AuditCenter";
import GlobalSearch from "@/components/oracle/sections/GlobalSearch";
import ContentIntelligence from "@/components/oracle/sections/ContentIntelligence";
import FinancialIntelligence from "@/components/oracle/sections/FinancialIntelligence";
import CollaborationIntelligence from "@/components/oracle/sections/CollaborationIntelligence";
import SparkAgentRegistry from "@/components/oracle/sections/SparkAgentRegistry";
import SparkAgentObservability from "@/components/oracle/sections/SparkAgentObservability";
import TaskIntelligence from "@/components/oracle/sections/TaskIntelligence";

const SECTIONS = {
  dashboard: OracleDashboard,
  registry: RegistryDashboard,
  search: GlobalSearch,
  institutions: InstitutionRegistry,
  products: ProductRegistry,
  users: UserGovernance,
  ai: AIGovernance,
  "ai-monitor": AIMonitoring,
  security: OracleSecurity,
  integrations: IntegrationCenter,
  providers: ProviderHub,
  monitoring: Monitoring,
  audit: AuditCenter,
  content: ContentIntelligence,
  finance: FinancialIntelligence,
  collaboration: CollaborationIntelligence,
  "spark-agents": SparkAgentRegistry,
  "spark-observability": SparkAgentObservability,
  "task-intelligence": TaskIntelligence,
};

export default function Oracle() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const active = params.get("m") || "dashboard";
  const onActive = (id) => setParams({ m: id });

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} finally { setLoading(false); } })(); }, []);

  if (loading) return <div className="h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="h-screen grid place-items-center px-6">
        <div className="glass-card radius-lg p-6 text-center max-w-[360px]">
          <ShieldAlert className="w-8 h-8 text-destructive mx-auto mb-2" />
          <h2 className="font-heading font-bold text-[18px]">Platform access required</h2>
          <p className="text-[13px] text-muted-foreground mt-1">Oracle is restricted to authorized platform administrators. Students, lecturers, parents and institution users cannot access this area.</p>
        </div>
      </div>
    );
  }

  const mod = moduleById(active) || ORACLE_MODULES[0];
  const Section = SECTIONS[mod.id] || OracleDashboard;
  return (
    <OracleShell user={user} modules={ORACLE_MODULES} active={active} onActive={onActive}>
      <Section module={mod} onActive={onActive} />
    </OracleShell>
  );
}