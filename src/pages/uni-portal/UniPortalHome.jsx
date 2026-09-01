import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import LecturerDashboard from "@/pages/uni-portal/LecturerDashboard";
import UniversityAdminDashboard from "@/pages/uni-portal/UniversityAdminDashboard";
import DepartmentDashboard from "@/pages/uni-portal/DepartmentDashboard";
import FacultyDashboard from "@/pages/uni-portal/FacultyDashboard";

export default function UniPortalHome() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const role = user?.role;

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  switch (role) {
    case "lecturer":
    case "course_coordinator":
      return <LecturerDashboard user={user} />;
    case "department_admin":
      return <DepartmentDashboard user={user} />;
    case "faculty_admin":
      return <FacultyDashboard user={user} />;
    case "university_admin":
      return <UniversityAdminDashboard user={user} />;
    default:
      return <LecturerDashboard user={user} />;
  }
}