import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { CalendarDays } from "lucide-react";

export default function AcademicCalendar() {
  return (
    <PortalPlaceholder
      title="Academic Calendar"
      description="Manage semester schedules, holidays, and key academic dates."
      icon={CalendarDays}
    />
  );
}