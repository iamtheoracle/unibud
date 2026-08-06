import React from "react";
import EntityModule from "@/components/management/EntityModule";
import { Wallet, CheckCircle2, AlertTriangle, RotateCcw, XCircle } from "lucide-react";

const audit = (action) => (r) => ({ action, target: r.student_name || r.id, target_type: "operator", description: `${action} · ${r.student_name || r.id}` });

export default function FinanceOperations({ institutionId }) {
  return (
    <EntityModule
      entityName="Fee"
      title="Finance Operations"
      description="Verify payments, fee adjustments, scholarship processing and refund requests. Uses existing payment services only — no payment APIs."
      icon={Wallet}
      institutionId={institutionId}
      rowActions={[
        { label: "Verify Payment", icon: CheckCircle2, patch: { status: "paid" }, audit: audit("Verified payment") },
        { label: "Mark Overdue", icon: AlertTriangle, patch: { status: "overdue" }, audit: audit("Marked fee overdue") },
        { label: "Approve Refund", icon: RotateCcw, patch: { status: "refunded" }, audit: audit("Approved refund") },
        { label: "Reject", icon: XCircle, patch: { status: "rejected" }, audit: audit("Rejected fee item") },
      ]}
    />
  );
}