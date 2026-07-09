import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { FolderOpen } from "lucide-react";

export default function Materials() {
  return (
    <PortalPlaceholder
      title="Course Materials"
      description="Upload and manage lecture notes, slides, and resources."
      icon={FolderOpen}
    />
  );
}