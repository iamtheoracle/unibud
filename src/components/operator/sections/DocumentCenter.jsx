import React from "react";
import EntityModule from "@/components/management/EntityModule";
import { FolderOpen, Eye, CheckCircle2, Archive } from "lucide-react";

const audit = (action) => (r) => ({ action, target: r.title || r.id, target_type: "operator", description: `${action} · ${r.title || r.id}` });

export default function DocumentCenter({ institutionId }) {
  return (
    <EntityModule
      entityName="InstitutionDocument"
      title="Document Center"
      description="Upload, review, approval, archive and search institution documents."
      icon={FolderOpen}
      institutionId={institutionId}
      rowActions={[
        { label: "Review", icon: Eye, patch: { status: "pending_review" }, audit: audit("Sent for review") },
        { label: "Approve", icon: CheckCircle2, patch: { status: "approved" }, audit: audit("Approved document") },
        { label: "Archive", icon: Archive, patch: { status: "archived" }, audit: audit("Archived document") },
      ]}
    />
  );
}