import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { FileEdit } from "lucide-react";

export default function Content() {
  return (
    <PortalPlaceholder
      title="Content Management"
      description="Manage announcements, articles, and platform resources."
      icon={FileEdit}
    />
  );
}