import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  BookOpen, ClipboardList, Megaphone, Sparkles,
  CheckSquare, Video, FileText, MessageSquare, Users, CalendarDays, BarChart3,
} from "lucide-react";
import { UniStatCard, UniCard, UniPageHeader, UniButton } from "@/components/uni-portal/UniPortalUI";
import TeachingAssignmentsCard from "@/components/uni-portal/TeachingAssignmentsCard";
import PendingAnnouncementsCard from "@/components/uni-portal/PendingAnnouncementsCard";
import DepartmentalTasksCard from "@/components/uni-portal/DepartmentalTasksCard";

const EASE = [0.16, 1, 0.3, 1];

const quickActions = [
  { label: "Take Attendance", icon: CheckSquare, path: "/uni-portal/attendance", accent: "success" },
  { label: "Create Assignment", icon: ClipboardList, path: "/uni-portal/assignments", accent: "warning" },
  { label: "Start Live Class", icon: Video, path: "/uni-portal/live", accent: "info" },
  { label: "Upload Resource", icon: FileText, path: "/uni-portal/resources", accent: "primary" },
  { label: "Send Announcement", icon: MessageSquare, path: "/uni-portal/announcements", accent: "purple" },
  { label: "Message Students", icon: Users, path: "/uni-portal/messaging", accent: "info" },
  { label: "View Timetable", icon: CalendarDays, path: "/uni-portal/academic", accent: "primary" },
  { label: "Gradebook", icon: BarChart3, path: "/uni-portal/gradebook", accent: "success" },
];

export default function LecturerDashboard({ user }) {
  const navigate = useNavigate();
  const [budOpen, setBudOpen] = useState(false);
  const [budInput, setBudInput] = useState("");
  const [budMessages, setBudMessages] = useState([]);
  const [budLoading, setBudLoading] = useState(false);

  const { data: courses } = useQuery({
    queryKey: ["Course", "lecturer", "active"],
    queryFn: () => base44.entities.Course.list("-created_date", 50),
  });
  const { data: announcements } = useQuery({
    queryKey: ["StaffAnnouncement", "pending"],
    queryFn: () => base44.entities.StaffAnnouncement.list("-created_date", 30),
  });
  const { data: assignments } = useQuery({
    queryKey: ["Assignment", "dept-upcoming"],
    queryFn: () => base44.entities.Assignment.list("-created_date", 50),
  });

  const activeCourses = (courses || []).filter((c) => c.status === "active");
  const pendingAnnouncements = (announcements || []).filter(
    (a) => a.status === "draft" || a.status === "scheduled"
  );
  const now = new Date();
  const upcomingTasks = (assignments || []).filter(
    (a) => a.due_date && new Date(a.due_date) >= now
  );

  const sendToBud = async () => {
    if (!budInput.trim()) return;
    const msg = budInput.trim();
    setBudMessages((p) => [...p, { role: "user", text: msg }]);
    setBudInput("");
    setBudLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Bud, an academic assistant for a university lecturer named ${user?.full_name || "the lecturer"}. Help with lesson planning, rubrics, summarizing lectures, analyzing class performance, and identifying struggling students. Be concise and practical. Lecturer asks: ${msg}`,
        response_json_schema: { type: "object", properties: { reply: { type: "string" } } },
      });
      setBudMessages((p) => [...p, { role: "bud", text: res.reply || res }]);
    } catch {
      setBudMessages((p) => [...p, { role: "bud", text: "I had trouble processing that. Please try again." }]);
    } finally {
      setBudLoading(false);
    }
  };

  return (
    <div>
      <UniPageHeader
        title={`Good day, ${user?.full_name?.split(" ")[0] || "Lecturer"}`}
        subtitle="Here's your teaching overview for today."
      />

      {/* Stat cards — real counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UniStatCard icon={BookOpen} label="Active Courses" value={activeCourses.length} sublabel="teaching" accent="primary" delay={0} onClick={() => navigate("/uni-portal/courses")} />
        <UniStatCard icon={Megaphone} label="Pending Posts" value={pendingAnnouncements.length} sublabel="drafts & scheduled" accent="purple" delay={0.05} onClick={() => navigate("/uni-portal/announcements")} />
        <UniStatCard icon={ClipboardList} label="Upcoming Tasks" value={upcomingTasks.length} sublabel="assignments" accent="warning" delay={0.1} onClick={() => navigate("/uni-portal/assignments")} />
        <UniStatCard icon={BarChart3} label="Gradebook" value="—" sublabel="open to review" accent="success" delay={0.15} onClick={() => navigate("/uni-portal/gradebook")} />
      </div>

      {/* Core dashboard cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TeachingAssignmentsCard user={user} delay={0.1} />
        <PendingAnnouncementsCard user={user} delay={0.15} />
        <DepartmentalTasksCard user={user} delay={0.2} />

        {/* Bud insights */}
        <UniCard title="Bud Insights" description="Academic assistant" delay={0.3} className="lg:col-span-3" padding={false}>
          {!budOpen ? (
            <div className="p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-[16px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-foreground mb-1">Bud is ready to help</p>
                <p className="text-[12px] text-muted-foreground">Generate quizzes, summarize lectures, create rubrics, analyze performance, or identify struggling students.</p>
                <UniButton size="sm" className="mt-3" onClick={() => setBudOpen(true)}>Ask Bud</UniButton>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <div className="max-h-[300px] overflow-y-auto space-y-3 mb-3">
                {budMessages.length === 0 && <p className="text-[12px] text-muted-foreground text-center py-6">Ask Bud anything about your courses, students, or teaching.</p>}
                {budMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-[16px] text-[13px] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {budLoading && <div className="flex justify-start"><div className="px-4 py-2.5 rounded-[16px] bg-muted/50 text-[12px] text-muted-foreground">Bud is thinking...</div></div>}
              </div>
              <div className="flex gap-2">
                <input
                  value={budInput}
                  onChange={(e) => setBudInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendToBud()}
                  placeholder="Ask Bud for help..."
                  className="flex-1 h-10 px-4 rounded-[14px] bg-muted/50 border border-border/30 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card"
                />
                <UniButton icon={Sparkles} onClick={sendToBud} disabled={budLoading}>Send</UniButton>
              </div>
            </div>
          )}
        </UniCard>
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <h3 className="font-heading font-bold text-[15px] text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a, i) => {
            const accents = {
              primary: "bg-primary/10 text-primary",
              success: "bg-success/10 text-success",
              info: "bg-info/10 text-info",
              warning: "bg-warning/10 text-warning",
              purple: "bg-purple/10 text-purple",
              error: "bg-error/10 text-error",
            };
            return (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04, ease: EASE }}
                whileHover={{ y: -3 }}
                onClick={() => navigate(a.path)}
                className="rounded-[20px] bg-card border border-border/40 soft-shadow p-4 text-left spring-tap"
              >
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center mb-2 ${accents[a.accent] || accents.primary}`}>
                  <a.icon className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <p className="text-[12px] font-semibold text-foreground leading-tight">{a.label}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}