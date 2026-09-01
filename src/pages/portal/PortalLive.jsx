import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { Video } from "lucide-react";

export default function PortalLive() {
  return (
    <PortalPlaceholder
      title="UNIBUD Live"
      description="Start and manage live virtual classes."
      icon={Video}
    />
  );
}