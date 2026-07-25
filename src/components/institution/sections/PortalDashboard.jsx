import React, { useEffect, useState } from "react";
import { Users, BookOpen, Building2, GraduationCap, Activity, Sparkles, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PortalKPI from "../PortalKPI";

export default function PortalDashboard({ institution }) {
  const [stats, setStats] = useState({ students: 0, announcements: 0, courses: 0, departments: 0, programmes: 0, levels: 0 });

  useEffect(() => {
    (async () => {
      try { const recs = await base44.entities.StudentRecord.filter({ university: institution.name }); setStats((s) => ({ ...s, students: recs.length })); } catch {}
      try { const a = await base44.entities.StaffAnnouncement.filter({ institution_id: institution.id }); setStats((s) => ({ ...s, announcements: a.length })); } catch {}
      try { const adm = await base44.entities.Admission.filter({ institution_id: institution.id }); setStats((s) => ({ ...s, admissions: adm.length })); } catch {}
      const as = institution.academic_structure || {};
      setStats((s) => ({ ...s, courses: (as.courses || []).length, departments: (as.departments || []).length, programmes: (as.programmes || []).length, levels: (as.levels || []).length }));
    })();
  }, [institution]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <PortalKPI label="Students" value={stats.students} icon={Users} accent />
        <PortalKPI label="Staff" value="—" icon={Users} />
        <PortalKPI label="Courses" value={stats.courses} icon={BookOpen} />
        <PortalKPI label="Departments" value={stats.departments} icon={Building2} />
        <PortalKPI label="Programmes" value={stats.programmes} icon={GraduationCap} />
        <PortalKPI label="Levels" value={stats.levels} />
        <PortalKPI label="Attendance" value="—" sub="tracking" />
        <PortalKPI label="Active Sessions" value="—" icon={Activity} />
        <PortalKPI label="AI Usage" value="—" icon={Sparkles} />
        <PortalKPI label="Notifications" value={stats.announcements} icon={Bell} />
      </div>
      <div className="glass-card radius-lg p-5">
        <p className="text-[14px] font-heading font-semibold mb-1">Welcome to the {institution.name} portal</p>
        <p className="text-[13px] text-muted-foreground">Manage admissions, academic structure, student records, communications, analytics, branding, and permissions — all scoped to this institution. No data leaves your tenant.</p>
      </div>
    </div>
  );
}