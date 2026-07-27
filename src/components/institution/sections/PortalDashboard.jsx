import React from "react";
import { Users, BookOpen, Building2, GraduationCap, Bell, CalendarDays, Radio, ShieldCheck, Layers, Megaphone } from "lucide-react";
import PortalKPI from "../PortalKPI";
import PortalActivityFeed from "../PortalActivityFeed";
import { useInstitutionStats } from "@/lib/institution/useInstitutionStats";

/**
 * PortalDashboard — institutional overview. Live, tenant-scoped KPIs from real
 * entities, a realtime activity stream, the configured academic structure, and
 * a system-health summary. Replaces the previous placeholder ("—") metrics.
 */
export default function PortalDashboard({ institution }) {
  const { stats, activity, health, loading } = useInstitutionStats(institution);
  const as = institution?.academic_structure || {};

  return (
    <div className="space-y-5">
      {/* Live KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <PortalKPI label="Students" value={loading ? "…" : stats?.students ?? 0} icon={Users} accent />
        <PortalKPI label="Staff" value={loading ? "…" : stats?.staff ?? 0} icon={Users} />
        <PortalKPI label="Courses" value={loading ? "…" : stats?.courses ?? 0} icon={BookOpen} />
        <PortalKPI label="Departments" value={loading ? "…" : stats?.departments ?? 0} icon={Building2} />
        <PortalKPI label="Programmes" value={loading ? "…" : stats?.programmes ?? 0} icon={GraduationCap} />
        <PortalKPI label="Levels" value={loading ? "…" : stats?.levels ?? 0} icon={Layers} />
        <PortalKPI label="Admissions" value={loading ? "…" : stats?.admissions ?? 0} icon={Building2} />
        <PortalKPI label="Announcements" value={loading ? "…" : stats?.announcements ?? 0} icon={Bell} />
        <PortalKPI label="Events" value={loading ? "…" : stats?.events ?? 0} icon={CalendarDays} />
        <PortalKPI label="Live Now" value={loading ? "…" : stats?.liveNow ?? 0} icon={Radio} sub="active classes" />
        <PortalKPI label="Communities" value={loading ? "…" : stats?.communities ?? 0} icon={Megaphone} sub="engagement" />
        <PortalKPI label="Clubs" value={loading ? "…" : stats?.clubs ?? 0} icon={Users} sub="engagement" />
      </div>

      {/* Welcome / context */}
      <div className="glass-card radius-lg p-5">
        <p className="text-[14px] font-heading font-semibold mb-1">Welcome to the {institution?.name} portal</p>
        <p className="text-[13px] text-muted-foreground">Live overview of admissions, academic structure, communications, events and engagement — all scoped to this institution. No data leaves your tenant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Realtime activity */}
        <div className="glass-card radius-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-heading font-semibold">Realtime activity</p>
            <span className="flex items-center gap-1 text-[11px] text-success font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-success live-pulse" />Live</span>
          </div>
          <PortalActivityFeed activity={activity} loading={loading} />
        </div>

        {/* Academic structure breakdown */}
        <div className="glass-card radius-lg p-4">
          <p className="text-[14px] font-heading font-semibold mb-3">Academic structure</p>
          <StructureList title="Departments" items={as.departments} />
          <StructureList title="Programmes" items={as.programmes} />
          <StructureList title="Levels" items={as.levels} />
          {(!as.departments?.length && !as.programmes?.length && !as.levels?.length) && (
            <p className="text-[13px] text-muted-foreground">No academic structure configured yet. Add departments, programmes and levels in Academic Management to populate this breakdown.</p>
          )}
        </div>
      </div>

      {/* System health */}
      <div className="glass-card radius-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="text-[14px] font-heading font-semibold">System health</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Health label="Institution status" value={health.status || "—"} good={health.status === "active"} />
          <Health label="Verification" value={health.verification_status.replace(/_/g, " ")} good={health.verified} />
          <Health label="Verified" value={health.verified ? "Yes" : "No"} good={health.verified} />
          <Health label="Data sources" value={health.dataSources} good={health.dataSources > 0} />
        </div>
      </div>
    </div>
  );
}

function StructureList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[12px] font-semibold text-muted-foreground mb-1.5">{title} · {items.length}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 12).map((d, i) => (
          <span key={i} className="text-[11px] px-2 py-1 rounded-full bg-muted/60 text-foreground truncate max-w-[180px]">
            {typeof d === "string" ? d : d?.name || d?.title || JSON.stringify(d)}
          </span>
        ))}
        {items.length > 12 && <span className="text-[11px] px-2 py-1 text-muted-foreground">+{items.length - 12} more</span>}
      </div>
    </div>
  );
}

function Health({ label, value, good }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground capitalize">{label}</p>
      <p className={`text-[14px] font-semibold capitalize flex items-center gap-1.5 ${good ? "text-success" : "text-foreground"}`}>
        {good && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
        {value}
      </p>
    </div>
  );
}