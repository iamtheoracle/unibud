import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { Layers } from "lucide-react";

export default function Departments() {
  return (
    <PortalPlaceholder
      title="Departments"
      description="Manage departments within faculties."
      icon={Layers}
    />
  );
}