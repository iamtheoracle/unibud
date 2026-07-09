import React from "react";
import PortalPlaceholder from "@/components/portal/PortalPlaceholder";
import { BookOpen } from "lucide-react";

export default function PortalCourses() {
  return (
    <PortalPlaceholder
      title="Courses"
      description="Manage courses across faculties and departments."
      icon={BookOpen}
    />
  );
}