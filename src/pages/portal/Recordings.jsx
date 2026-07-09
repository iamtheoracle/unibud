import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { PlayCircle } from "lucide-react";

export default function Recordings() {
  return (
    <PortalPlaceholder
      title="Recorded Lectures"
      description="Manage and review recorded class sessions."
      icon={PlayCircle}
    />
  );
}