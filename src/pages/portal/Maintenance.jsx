import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { Wrench } from "lucide-react";

export default function Maintenance() {
  return (
    <PortalPlaceholder
      title="System Maintenance"
      description="Maintenance mode, deployments, and system operations."
      icon={Wrench}
    />
  );
}