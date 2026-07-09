import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { normalizeRole } from "@/lib/portalConfig";
import OracleDashboard from "@/pages/portal/oracle/OracleDashboard";
import ExecutiveDashboard from "@/pages/portal/ExecutiveDashboard";
import OperationsDashboard from "@/pages/portal/OperationsDashboard";
import UniversityDashboard from "@/pages/portal/UniversityDashboard";
import LecturerDashboard from "@/pages/portal/LecturerDashboard";
import GenericPortalDashboard from "@/pages/portal/GenericPortalDashboard";

export default function PortalDashboard() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const role = normalizeRole(user?.role);

  switch (role) {
    case "oracle":
      return <OracleDashboard user={user} />;
    case "executive":
      return <ExecutiveDashboard user={user} />;
    case "operations_staff":
      return <OperationsDashboard user={user} />;
    case "university_admin":
      return <UniversityDashboard user={user} />;
    case "faculty_admin":
    case "department_admin":
      return <GenericPortalDashboard user={user} role={role} />;
    case "lecturer":
      return <LecturerDashboard user={user} />;
    default:
      return <GenericPortalDashboard user={user} role={role} />;
  }
}