import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LayoutDashboard, TrendingUp, CalendarCheck, ClipboardList, Clock, FileText, Megaphone, Sparkles, Bell, MessageSquare, Wallet } from "lucide-react";
import ParentShell from "@/components/parent/ParentShell";
import LinkStudent from "@/components/parent/LinkStudent";
import ParentOverview from "@/components/parent/sections/ParentOverview";
import ParentAcademicProgress from "@/components/parent/sections/ParentAcademicProgress";
import ParentAttendance from "@/components/parent/sections/ParentAttendance";
import ParentAssignments from "@/components/parent/sections/ParentAssignments";
import ParentStudyHours from "@/components/parent/sections/ParentStudyHours";
import ParentUpcomingExams from "@/components/parent/sections/ParentUpcomingExams";
import ParentNotices from "@/components/parent/sections/ParentNotices";
import ParentBudInsights from "@/components/parent/sections/ParentBudInsights";
import ParentNotifications from "@/components/parent/sections/ParentNotifications";
import ParentMessaging from "@/components/parent/sections/ParentMessaging";
import ParentFees from "@/components/parent/sections/ParentFees";
import UDSEmptyState from "@/components/uds/UDSEmptyState";
import UDSButton from "@/components/uds/UDSButton";
import { base44 } from "@/api/base44Client";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "progress", label: "Academic Progress", icon: TrendingUp },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "study", label: "Study Hours", icon: Clock },
  { id: "exams", label: "Upcoming Exams", icon: FileText },
  { id: "notices", label: "Institution Notices", icon: Megaphone },
  { id: "bud", label: "Bud Insights", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "messaging", label: "Messaging", icon: MessageSquare },
  { id: "fees", label: "Fees", icon: Wallet },
];

const GUARDIAN_ROLES = ["guardian", "admin"];

export default function ParentPortal() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(false);

  const active = params.get("section") || "overview";
  const setActive = (id) => setParams({ section: id });

  const loadLinks = async () => { try { setLinks(await base44.entities.ConsentLink.filter({ guardian_id: user.id })); } catch {} };
  useEffect(() => {
    (async () => { try { const me = await base44.auth.me(); setUser(me); } catch {} finally { setLoading(false); } })();
  }, []);
  useEffect(() => { if (user) loadLinks(); }, [user]);

  const approved = links.filter((l) => l.status === "approved" && l.student_id);

  useEffect(() => {
    if (approved.length && !selected) setSelected(approved[0].student_id);
  }, [approved, selected]);

  useEffect(() => {
    if (!selected) { setData(null); return; }
    (async () => { setFetching(true); try { const res = await base44.functions.invoke("parentPortalData", { student_id: selected }); setData(res.data); } catch { setData(null); } finally { setFetching(false); } })();
  }, [selected]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading portal…</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center"><UDSButton onClick={() => navigate("/login")}>Sign in</UDSButton></div>;

  const role = user.role || user.data?.role || "user";
  if (!GUARDIAN_ROLES.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[420px]"><UDSEmptyState title="Parents only" message="This portal is for parents and guardians linked to a student." action={<UDSButton variant="secondary" onClick={() => navigate("/home")}>Back to Campus</UDSButton>} /></div>
      </div>
    );
  }

  const selectedLink = approved.find((l) => l.student_id === selected);
  const studentName = selectedLink?.student_name || data?.student?.full_name || "";

  if (approved.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <h2 className="text-[15px] font-heading font-semibold">Parent Portal</h2>
          <UDSButton variant="secondary" size="sm" onClick={() => navigate("/home")}>Back</UDSButton>
        </div>
        <LinkStudent user={user} links={links} onReload={loadLinks} />
      </div>
    );
  }

  return (
    <ParentShell user={user} studentName={studentName} active={active} onActive={setActive} sections={SECTIONS} onBack={() => navigate("/home")}>
      {approved.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-1">
          {approved.map((l) => (
            <button key={l.student_id} onClick={() => setSelected(l.student_id)} className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium spring-tap ${selected === l.student_id ? "bg-primary text-primary-foreground" : "glass"}`}>{l.student_name || l.student_email}</button>
          ))}
        </div>
      )}
      {fetching ? <p className="text-muted-foreground">Loading student data…</p> : !data ? <p className="text-muted-foreground text-[14px]">Unable to load student data. Consent may have been revoked.</p> : (
        <>
          {active === "overview" && <ParentOverview data={data} />}
          {active === "progress" && <ParentAcademicProgress data={data} />}
          {active === "attendance" && <ParentAttendance data={data} />}
          {active === "assignments" && <ParentAssignments data={data} />}
          {active === "study" && <ParentStudyHours data={data} />}
          {active === "exams" && <ParentUpcomingExams data={data} />}
          {active === "notices" && <ParentNotices data={data} />}
          {active === "bud" && <ParentBudInsights data={data} />}
          {active === "notifications" && <ParentNotifications user={user} />}
          {active === "messaging" && <ParentMessaging data={data} />}
          {active === "fees" && <ParentFees />}
        </>
      )}
    </ParentShell>
  );
}