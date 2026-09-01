import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { GraduationCap } from "lucide-react";

export default function Grades() {
  return (
    <PortalPlaceholder
      title="Grades"
      description="Manage and publish student grades and results."
      icon={GraduationCap}
    />
  );
}