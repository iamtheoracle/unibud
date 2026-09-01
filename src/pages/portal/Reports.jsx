import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <PortalPlaceholder
      title="Reports"
      description="Platform-wide reports and data exports."
      icon={BarChart3}
    />
  );
}