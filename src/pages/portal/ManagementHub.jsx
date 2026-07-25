import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  normalizeRole, isPlatformRole, isUniversityRole, canAccessPath, ROLE_HIERARCHY,
} from "@/lib/portalConfig";
import {
  DashboardCard, SectionCard, PortalPageHeader, SmartList, StatusPill,
} from "@/components/portal/PortalUI";
import { COMPANY_IDENTITY, PLATFORM_IDENTITY } from "@/lib/companyIdentity";
import {
  Radar, ShieldCheck, Headset, Boxes, Network, Brain, Users, ScrollText, Activity,
  ShieldAlert, BarChart3, FileBarChart, LifeBuoy, FileEdit, Landmark, Building2,
  Mail, Wrench, Flag, Bell, CheckCircle2, UserPlus, Settings, Bot, CalendarHeart,
  ShoppingBag, Building, Layers, GraduationCap, BookOpen, CalendarDays, Megaphone,
  Video, ClipboardList, UserCheck, FolderOpen, PlayCircle, UsersRound, Cpu,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

// Unified launcher registry — filtered per role by canAccessPath.
const LAUNCHER_GROUPS = [
  {
    label: "System Command",
    items: [
      { label: "Oracle Mission Control", icon: Radar, path: "/portal/oracle" },
      { label: "Management Center", icon: ShieldCheck, path: "/portal/management" },
      { label: "Operator Center", icon: Headset, path: "/portal/operator" },
      { label: "Architect Center", icon: Boxes, path: "/portal/architect" },
      { label: "Agent Network", icon: Network, path: "/portal/agent-network" },
      { label: "Oracle Intelligence", icon: Brain, path: "/portal/oracle-intelligence" },
    ],
  },
  {
    label: "Platform Operations",
    items: [
      { label: "Users", icon: Users, path: "/portal/users" },
      { label: "Audit Logs", icon: ScrollText, path: "/portal/audit-logs" },
      { label: "System Health", icon: Activity, path: "/portal/system-health" },
      { label: "Security", icon: ShieldAlert, path: "/portal/security" },
      { label: "Analytics", icon: BarChart3, path: "/portal/analytics" },
      { label: "Reports", icon: FileBarChart, path: "/portal/reports" },
      { label: "Support", icon: LifeBuoy, path: "/portal/support" },
      { label: "Content", icon: FileEdit, path: "/portal/content" },
      { label: "Notifications", icon: Bell, path: "/portal/notifications" },
      { label: "Approvals", icon: CheckCircle2, path: "/portal/approvals" },
      { label: "Feature Flags", icon: Flag, path: "/portal/feature-flags" },
      { label: "Maintenance", icon: Wrench, path: "/portal/maintenance" },
      { label: "Settings", icon: Settings, path: "/portal/settings" },
      { label: "Bud Config", icon: Bot, path: "/portal/bud-config" },
      { label: "Invitations", icon: UserPlus, path: "/portal/invitations" },
    ],
  },
  {
    label: "Institutions & Outreach",
    items: [
      { label: "Universities", icon: Landmark, path: "/portal/universities" },
      { label: "Institution Config", icon: Building2, path: "/portal/institution-config" },
      { label: "Outreach", icon: Mail, path: "/portal/institution-outreach" },
      { label: "Events", icon: CalendarHeart, path: "/portal/events" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Marketplace", icon: ShoppingBag, path: "/portal/marketplace" },
      { label: "Marketplace Analytics", icon: BarChart3, path: "/portal/marketplace/analytics" },
    ],
  },
  {
    label: "Academic Operations",
    items: [
      { label: "Faculties", icon: Building, path: "/portal/faculties" },
      { label: "Departments", icon: Layers, path: "/portal/departments" },
      { label: "Lecturers", icon: GraduationCap, path: "/portal/lecturers" },
      { label: "Courses", icon: BookOpen, path: "/portal/courses" },
      { label: "Academic Calendar", icon: CalendarDays, path: "/portal/calendar" },
      { label: "Announcements", icon: Megaphone, path: "/portal/announcements" },
      { label: "Live Classes", icon: Video, path: "/portal/live" },
      { label: "Assignments", icon: ClipboardList, path: "/portal/assignments" },
      { label: "Attendance", icon: UserCheck, path: "/portal/attendance" },
      { label: "Grades", icon: GraduationCap, path: "/portal/grades" },
      { label: "Materials", icon: FolderOpen, path: "/portal/materials" },
      { label: "Recordings", icon: PlayCircle, path: "/portal/recordings" },
      { label: "Study Groups", icon: UsersRound, path: "/portal/study-groups" },
    ],
  },
];

export default function ManagementHub({ user }) {
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);
  const roleMeta = ROLE_HIERARCHY.find((r) => r.key === role);
  const roleLabel = roleMeta?.name || role;
  const firstName = user?.full_name?.split(" ")[0] || "there";

  const isPlatform = role === "oracle" || isPlatformRole(role);
  const isUniv = isUniversityRole(role);
  const isLec = role === "lecturer";

  // Platform data
  const { data: users } = useQuery({
    queryKey: ["hubUsers"], queryFn: () => base44.entities.User.list(),
    enabled: isPlatform, retry: false,
  });
  const { data: tickets } = useQuery({
    queryKey: ["hubTickets"], queryFn: () => base44.entities.SupportTicket.filter({ status: "open" }),
    enabled: isPlatform, retry: false,
  });
  const { data: auditLogs } = useQuery({
    queryKey: ["hubAudit"], queryFn: () => base44.entities.AuditLog.list("-created_date", 6),
    enabled: isPlatform, retry: false,
  });
  const { data: listings } = useQuery({
    queryKey: ["hubListings"], queryFn: () => base44.entities.MarketplaceListing.list("-created_date", 500),
    enabled: isPlatform, retry: false,
  });

  // Academic data
  const { data: courses } = useQuery({
    queryKey: ["hubCourses"], queryFn: () => base44.entities.Course.list(),
    enabled: isUniv || isLec, retry: false,
  });
  const { data: assignments } = useQuery({
    queryKey: ["hubAssignments"], queryFn: () => base44.entities.Assignment.list(),
    enabled: isUniv || isLec, retry: false,
  });
  const { data: liveClasses } = useQuery({
    queryKey: ["hubLive"], queryFn: () => base44.entities.LiveClass.list(),
    enabled: isUniv || isLec, retry: false,
  });
  const { data: recordings } = useQuery({
    queryKey: ["hubRecordings"], queryFn: () => base44.entities.LiveRecording.list(),
    enabled: isLec, retry: false,
  });

  const myCourses = isLec
    ? (courses || []).filter((c) => !c.lecturer || c.lecturer === user?.full_name)
    : (courses || []);
  const pendingAssignments = (assignments || []).filter((a) => a.status === "pending");

  const kpis = isPlatform
    ? [
        { icon: Users, value: users?.length || 0, title: "Platform Users", accent: "primary" },
        { icon: LifeBuoy, value: tickets?.length || 0, title: "Open Tickets", accent: "warning" },
        { icon: ScrollText, value: auditLogs?.length || 0, title: "Audit Events", accent: "info" },
        { icon: ShoppingBag, value: listings?.length || 0, title: "Listings", accent: "success" },
      ]
    : isUniv
    ? [
        { icon: BookOpen, value: courses?.length || 0, title: "Courses", accent: "primary" },
        { icon: ClipboardList, value: pendingAssignments.length, title: "Assignments", accent: "warning" },
        { icon: Video, value: liveClasses?.length || 0, title: "Live Classes", accent: "info" },
        { icon: Megaphone, value: courses?.length || 0, title: "Academic Items", accent: "success" },
      ]
    : isLec
    ? [
        { icon: BookOpen, value: myCourses.length, title: "My Courses", accent: "primary" },
        { icon: ClipboardList, value: pendingAssignments.length, title: "Pending Assignments", accent: "warning" },
        { icon: Video, value: liveClasses?.length || 0, title: "Live Classes", accent: "info" },
        { icon: PlayCircle, value: recordings?.length || 0, title: "Recordings", accent: "success" },
      ]
    : [
        { icon: BookOpen, value: courses?.length || 0, title: "Courses", accent: "primary" },
        { icon: ClipboardList, value: assignments?.length || 0, title: "Assignments", accent: "info" },
      ];

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Operations Hub"
        subtitle={`Welcome back, ${firstName} · ${roleLabel}`}
        action={
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
            <Cpu className="w-3.5 h-3.5" /> {PLATFORM_IDENTITY.core}
          </span>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <DashboardCard key={k.title} icon={k.icon} value={k.value} title={k.title} accent={k.accent} delay={i * 0.05} />
        ))}
      </div>

      {/* Unified module launcher */}
      {LAUNCHER_GROUPS.map((group, gi) => {
        const items = group.items.filter((it) => canAccessPath(role, it.path));
        if (items.length === 0) return null;
        return (
          <SectionCard key={group.label} title={group.label} description="Unified access" delay={0.15 + gi * 0.05}>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((it, i) => (
                <motion.button
                  key={it.path}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + gi * 0.05 + i * 0.03, ease: EASE }}
                  onClick={() => navigate(it.path)}
                  className="flex items-center gap-2.5 p-3.5 rounded-[16px] bg-muted/30 border border-border/20 hover:bg-muted/50 portal-card-hover text-left"
                >
                  <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <it.icon className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground leading-tight">{it.label}</span>
                </motion.button>
              ))}
            </div>
          </SectionCard>
        );
      })}

      {/* Recent activity */}
      {isPlatform ? (
        <SectionCard
          title="Recent Activity"
          description="Latest platform audit events"
          delay={0.4}
          action={<button onClick={() => navigate("/portal/audit-logs")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
        >
          <SmartList
            items={auditLogs || []}
            emptyMessage="No audit events yet"
            onRowClick={() => navigate("/portal/audit-logs")}
            renderRow={(log) => (
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-[14px] bg-info/10 flex items-center justify-center flex-shrink-0">
                  <ScrollText className="w-4 h-4 text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{log.action || log.event || "Event"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{log.actor_name || log.user_id || "system"} · {log.created_date ? new Date(log.created_date).toLocaleString() : "—"}</p>
                </div>
                <StatusPill status="info" label={log.category || "audit"} />
              </div>
            )}
          />
        </SectionCard>
      ) : (
        <SectionCard
          title="Pending Assignments"
          description="Awaiting submission"
          delay={0.4}
          action={<button onClick={() => navigate("/portal/assignments")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
        >
          <SmartList
            items={pendingAssignments.slice(0, 8)}
            emptyMessage="No pending assignments"
            onRowClick={() => navigate("/portal/assignments")}
            renderRow={(a) => (
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-[14px] bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{a.title || "Untitled"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{a.course_code || "—"} · Due {a.due_date ? new Date(a.due_date).toLocaleDateString() : "—"}</p>
                </div>
                <StatusPill status="open" label={a.status} />
              </div>
            )}
          />
        </SectionCard>
      )}

      <p className="text-center text-[10px] text-muted-foreground/50 pt-2">
        {PLATFORM_IDENTITY.product} · {COMPANY_IDENTITY.companyName} · {COMPANY_IDENTITY.rcNumber}
      </p>
    </div>
  );
}