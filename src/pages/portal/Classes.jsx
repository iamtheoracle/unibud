import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { CalendarDays } from "lucide-react";

export default function Classes() {
  return (
    <PortalPlaceholder
      title="Today's Classes"
      description="View and manage your scheduled classes for today."
      icon={CalendarDays}
    />
  );
}