import React from "react";
import { base44 } from "@/api/base44Client";
import EntityModule from "@/components/management/EntityModule";
import { GraduationCap, CheckCircle2, UserCheck, PauseCircle, FileUp, PencilLine } from "lucide-react";

export default function StudentOperations({ institutionId, user }) {
  const me = user?.full_name;
  const execTask = (label) => async (r) => {
    await base44.entities.ManagementTask.create({ title: `${label}: ${r.full_name || r.matriculation_number || r.id}`, type: "follow_up", assignee: me, status: "pending", institution_id: institutionId, notes: `Student record · ${r.full_name || r.id}` });
    try { await base44.entities.AuditLog.create({ action: label, target_name: r.full_name || r.id, target_type: "operator", severity: "info", description: `${label} for ${r.full_name || r.id}` }); } catch {}
  };
  return (
    <EntityModule
      entityName="StudentRecord"
      title="Student Operations"
      description="Verify applications, approve registrations, update records, upload documents, student notes and status changes. Actions create tracked follow-up tasks and audit entries."
      icon={GraduationCap}
      institutionId={institutionId}
      rowActions={[
        { label: "Verify", icon: CheckCircle2, run: execTask("Verify Application") },
        { label: "Approve Registration", icon: UserCheck, run: execTask("Approve Registration") },
        { label: "Update Record", icon: PencilLine, run: execTask("Update Record") },
        { label: "Upload Document", icon: FileUp, run: execTask("Upload Document") },
        { label: "Status Change", icon: PauseCircle, run: execTask("Status Change") },
      ]}
    />
  );
}