import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { Settings } from "lucide-react";

export default function PortalSettings() {
  return (
    <PortalPlaceholder
      title="Portal Settings"
      description="Platform configuration and system preferences."
      icon={Settings}
    />
  );
}