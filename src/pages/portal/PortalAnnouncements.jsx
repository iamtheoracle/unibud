import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { Megaphone } from "lucide-react";

export default function PortalAnnouncements() {
  return (
    <PortalPlaceholder
      title="Announcements"
      description="Create and manage university or course announcements."
      icon={Megaphone}
    />
  );
}