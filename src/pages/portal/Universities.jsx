import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { Landmark } from "lucide-react";

export default function Universities() {
  return (
    <PortalPlaceholder
      title="University Management"
      description="Onboard and manage universities on the UNIBUD platform."
      icon={Landmark}
    />
  );
}