import React from "react";
import EntityModule from "@/components/management/EntityModule";
import { FileCheck, Upload, CheckSquare, GraduationCap } from "lucide-react";

const audit = (action) => (r) => ({ action, target: r.title || r.subject || r.id, target_type: "operator", description: `${action} · ${r.title || r.id}` });

export default function ExaminationOperations({ institutionId }) {
  return (
    <EntityModule
      entityName="ExamPaper"
      title="Examination Operations"
      description="Examination papers — candidate verification, attendance capture, result upload, script tracking and grade processing."
      icon={FileCheck}
      institutionId={institutionId}
      rowActions={[
        { label: "Publish", icon: Upload, patch: { status: "published" }, audit: audit("Published exam paper") },
        { label: "Revert Draft", icon: FileCheck, patch: { status: "draft" }, audit: audit("Reverted exam to draft") },
      ]}
    />
  );
}