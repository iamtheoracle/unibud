import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { UsersRound } from "lucide-react";

export default function PortalStudyGroups() {
  return (
    <PortalPlaceholder
      title="Study Groups"
      description="Manage and monitor student study groups."
      icon={UsersRound}
    />
  );
}