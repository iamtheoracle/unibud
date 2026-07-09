import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { GraduationCap } from "lucide-react";

export default function Lecturers() {
  return (
    <PortalPlaceholder
      title="Lecturers"
      description="Manage lecturer profiles and course assignments."
      icon={GraduationCap}
    />
  );
}