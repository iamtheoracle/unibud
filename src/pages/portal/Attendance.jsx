import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { CheckSquare } from "lucide-react";

export default function Attendance() {
  return (
    <PortalPlaceholder
      title="Attendance"
      description="Track and manage student attendance for your classes."
      icon={CheckSquare}
    />
  );
}