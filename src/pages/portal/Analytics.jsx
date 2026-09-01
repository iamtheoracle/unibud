import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { LineChart } from "lucide-react";

export default function Analytics() {
  return (
    <PortalPlaceholder
      title="Analytics"
      description="Platform analytics, growth metrics, and business intelligence."
      icon={LineChart}
    />
  );
}