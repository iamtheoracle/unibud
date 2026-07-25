import React from "react";
import EntityModule from "@/components/management/EntityModule";
import { UserPlus, ClipboardCheck, FileCheck, CheckCircle2, XCircle, UserCheck } from "lucide-react";

const audit = (action) => (r) => ({ action, target: r.applicant_name || r.id, target_type: "operator", description: `${action} · ${r.applicant_name || r.id}` });

export default function AdmissionOperations({ institutionId }) {
  return (
    <EntityModule
      entityName="Admission"
      title="Admission Operations"
      description="Review applications, verify documents, screening results, admission decisions and enrollment processing."
      icon={UserPlus}
      institutionId={institutionId}
      rowActions={[
        { label: "Review", icon: ClipboardCheck, patch: { status: "under_review" }, audit: audit("Reviewed application") },
        { label: "Verify Docs", icon: FileCheck, patch: { documents_verified: true }, audit: audit("Verified documents") },
        { label: "Offer", icon: CheckCircle2, patch: { status: "offered" }, audit: audit("Issued offer") },
        { label: "Accept", icon: UserCheck, patch: (r) => ({ status: "accepted", accepted_at: new Date().toISOString() }), audit: audit("Accepted admission") },
        { label: "Reject", icon: XCircle, patch: { status: "rejected" }, audit: audit("Rejected application") },
      ]}
    />
  );
}