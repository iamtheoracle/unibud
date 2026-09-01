import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { Bot } from "lucide-react";

export default function BudConfig() {
  return (
    <PortalPlaceholder
      title="Bud Management"
      description="Configure Bud's knowledge base, behavior, and response tuning."
      icon={Bot}
    />
  );
}