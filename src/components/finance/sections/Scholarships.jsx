import React from "react";
import { base44 } from "@/api/base44Client";
import EntityModule from "@/components/management/EntityModule";
import { Award, Send, CheckCircle2 } from "lucide-react";

export default function Scholarships({ institutionId }) {
  return (
    <EntityModule
      entityName="ScholarshipAward"
      title="Scholarship Management"
      description="Providers, beneficiaries, awards, disbursement tracking and balance monitoring."
      icon={Award}
      institutionId={institutionId}
      rowActions={[
        { label: "Award", icon: CheckCircle2, patch: (r) => ({ status: "awarded", balance: r.amount }), audit: (r) => ({ action: "Scholarship awarded", target: r.beneficiary_name || r.id, target_type: "finance", description: `Awarded ${r.amount} to ${r.beneficiary_name}` }) },
        { label: "Disburse", icon: Send, run: async (r) => { await base44.entities.ScholarshipAward.update(r.id, { status: "disbursed", disbursed_amount: r.amount, balance: 0 }); try { await base44.entities.AuditLog.create({ action: "Scholarship disbursed", target_name: r.beneficiary_name || r.id, target_type: "finance", severity: "info", description: `Disbursed ${r.amount} to ${r.beneficiary_name}` }); } catch {} }, },
      ]}
    />
  );
}