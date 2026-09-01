import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { Building } from "lucide-react";

export default function Faculties() {
  return (
    <PortalPlaceholder
      title="Faculties"
      description="Manage university faculties and their programs."
      icon={Building}
    />
  );
}