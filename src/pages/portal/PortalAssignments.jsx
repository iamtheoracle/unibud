import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { ClipboardList } from "lucide-react";

export default function PortalAssignments() {
  return (
    <PortalPlaceholder
      title="Assignments"
      description="Create, track, and grade course assignments."
      icon={ClipboardList}
    />
  );
}