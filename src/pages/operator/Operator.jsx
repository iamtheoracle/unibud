import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldAlert } from "lucide-react";
import OperatorShell from "@/components/operator/OperatorShell";
import { OPERATOR_MODULES, moduleById } from "@/lib/operator/modules";
import OperatorDashboard from "@/components/operator/sections/OperatorDashboard";
import TaskCenter from "@/components/operator/sections/TaskCenter";
import StudentOperations from "@/components/operator/sections/StudentOperations";
import AdmissionOperations from "@/components/operator/sections/AdmissionOperations";
import ExaminationOperations from "@/components/operator/sections/ExaminationOperations";
import FinanceOperations from "@/components/operator/sections/FinanceOperations";
import SupportDesk from "@/components/operator/sections/SupportDesk";
import DocumentCenter from "@/components/operator/sections/DocumentCenter";
import OperatorNotifications from "@/components/operator/sections/OperatorNotifications";
import Performance from "@/components/operator/sections/Performance";
import GlobalSearch from "@/components/operator/sections/GlobalSearch";

const SECTIONS = {
  dashboard: OperatorDashboard, tasks: TaskCenter, students: StudentOperations, admissions: AdmissionOperations,
  examination: ExaminationOperations, finance: FinanceOperations, support: SupportDesk, documents: DocumentCenter,
  notifications: OperatorNotifications, performance: Performance, search: GlobalSearch,
};

function Denied({ message }) {
  return (
    <div className="h-screen grid place-items-center px-6">
      <div className="glass-card radius-lg p-6 text-center max-w-[420px]">
        <ShieldAlert className="w-8 h-8 text-destructive mx-auto mb-2" />
        <h2 className="font-heading font-bold text-[18px]">Operator access</h2>
        <p className="text-[13px] text-muted-foreground mt-1">{message}</p>
      </div>
    </div>
  );
}

export default function Operator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const active = params.get("m") || "dashboard";
  const onActive = (id) => setParams({ m: id });

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} finally { setLoading(false); } })(); }, []);

  if (loading) return <div className="h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const instId = user?.data?.institution_id;
  if (user?.role === "admin" && !instId) return <Denied message="Oracle Administrators manage the platform from Oracle. Operator is the execution workspace for institution operational staff." />;
  if (!instId) return <Denied message="You are not assigned to an institution. Operator is for institution operational staff who execute tasks assigned by Management." />;

  const mod = moduleById(active) || OPERATOR_MODULES[0];
  const Sec = SECTIONS[mod.id] || OperatorDashboard;

  return (
    <OperatorShell user={user} institutionName={user.data.institution_name} modules={OPERATOR_MODULES} active={active} onActive={onActive}>
      <Sec institutionId={instId} user={user} />
    </OperatorShell>
  );
}