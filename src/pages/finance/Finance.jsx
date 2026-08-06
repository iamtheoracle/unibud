import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ShieldAlert } from "lucide-react";
import FinanceShell from "@/components/finance/FinanceShell";
import { FINANCE_MODULES, moduleById } from "@/lib/finance/modules";
import FinanceDashboard from "@/components/finance/sections/FinanceDashboard";
import Wallets from "@/components/finance/sections/Wallets";
import Transactions from "@/components/finance/sections/Transactions";
import Fees from "@/components/finance/sections/Fees";
import Scholarships from "@/components/finance/sections/Scholarships";
import Refunds from "@/components/finance/sections/Refunds";
import FinanceReports from "@/components/finance/sections/FinanceReports";
import FinanceSettings from "@/components/finance/sections/FinanceSettings";

const SECTIONS = { dashboard: FinanceDashboard, wallets: Wallets, transactions: Transactions, fees: Fees, scholarships: Scholarships, refunds: Refunds, reports: FinanceReports, settings: FinanceSettings };

function Denied({ message }) {
  return (
    <div className="h-screen grid place-items-center px-6">
      <div className="glass-card radius-lg p-6 text-center max-w-[420px]">
        <ShieldAlert className="w-8 h-8 text-destructive mx-auto mb-2" />
        <h2 className="font-heading font-bold text-[18px]">Financial access</h2>
        <p className="text-[13px] text-muted-foreground mt-1">{message}</p>
      </div>
    </div>
  );
}

export default function Finance() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const active = params.get("m") || "dashboard";
  const onActive = (id) => setParams({ m: id });

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} finally { setLoading(false); } })(); }, []);

  if (loading) return <div className="h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const instId = user?.data?.institution_id;
  const allowed = user?.role === "admin" || instId;
  if (!allowed) return <Denied message="The Financial Platform is restricted to institution finance managers and platform administrators." />;

  const mod = moduleById(active) || FINANCE_MODULES[0];
  const Sec = SECTIONS[mod.id] || FinanceDashboard;

  return (
    <FinanceShell user={user} institutionName={user.data?.institution_name} modules={FINANCE_MODULES} active={active} onActive={onActive}>
      <Sec institutionId={instId} user={user} />
    </FinanceShell>
  );
}