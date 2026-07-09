import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  CalendarDays, Video, ClipboardList, CheckSquare, MessageSquare,
  Clock, FileText, BarChart3, Sparkles, Users, PlayCircle, TrendingUp,
} from "lucide-react";
import { UniStatCard, UniCard, UniPageHeader, UniButton } from "@/components/uni-portal/UniPortalUI";

const EASE = [0.16, 1, 0.3, 1];

export default function LecturerDashboard({ user }) {
  const navigate = useNavigate();
  const [budOpen, setBudOpen] = useState(false);
  const [budInput, setBudInput] = useState("");
  const [budMessages, setBudMessages] = useState([]);
  const [budLoading, setBudLoading] = useState(false);

  const { data: courses } = useQuery({
    queryKey: ["Course", "lecturer"],
    queryFn: () => base44.entities.Course.list("-created_date", 50),
  });
  const { data: assignments } = useQuery({
    queryKey: ["Assignment", "lecturer"],
    queryFn: () => base44.entities.Assignment.list("-created_date", 50),
  });
  const { data: liveClasses } = useQuery({
    queryKey: ["LiveClass", "lecturer"],
    queryFn: () => base44.entities.LiveClass.list("-created_date", 20),
  });
  const { data: exams } = useQuery({
    queryKey: ["Exam", "lecturer"],
    queryFn: () => base44.entities.Exam.list("-created_date", 20),
  });
  const { data: timetable } = useQuery({
    queryKey: ["TimetableEntry", "lecturer"],
    queryFn: () => base44.entities.TimetableEntry.list("-created_date", 50),
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = (timetable || []).filter((t) => t.day === today);
  const pendingGrading = (assignments || []).filter((a) => a.status === "submitted" || a.status === "pending");
  const upcomingLive = (liveClasses || []).filter((l) => l.status === "scheduled");
  const upcomingExams = (exams || []).filter((e) => e.status === "upcoming");

  const quickActions = [
    { label: "Take Attendance", icon: CheckSquare, path: "/uni-portal/attendance", accent: "success" },
    { label: "Create Assignment", icon: ClipboardList, path: "/uni-portal/assignments", accent: "primary" },
    { label: "Start Live Class", icon: Video, path: "/uni-portal/live", accent: "info" },
    { label: "Upload Resource", icon: FileText, path: "/uni-portal/resources", accent: "warning" },
    { label: "Send Announcement", icon: MessageSquare, path: "/uni-portal/announcements", accent: "purple" },
    { label: "Message Students", icon: Users, path: "/uni-portal/messaging", accent: "info" },
    { label: "View Timetable", icon: CalendarDays, path: "/uni-portal/academic", accent: "primary" },
    { label: "Gradebook", icon: BarChart3, path: "/uni-portal/gradebook", accent: "success" },
  ];

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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UniStatCard icon={CalendarDays} label="Today's Classes" value={todayClasses.length} sublabel={today} accent="primary" delay={0} onClick={() => navigate("/uni-portal/academic")} />
        <UniStatCard icon={ClipboardList} label="Pending Grading" value={pendingGrading.length} sublabel="assignments" accent="warning" delay={0.05} onClick={() => navigate("/uni-portal/assignments")} />
        <UniStatCard icon={Video} label="Upcoming Live" value={upcomingLive.length} sublabel="sessions" accent="info" delay={0.1} onClick={() => navigate("/uni-portal/live")} />
        <UniStatCard icon={FileText} label="Upcoming Exams" value={upcomingExams.length} sublabel="scheduled" accent="error" delay={0.15} onClick={() => navigate("/uni-portal/examinations")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's classes */}
        <UniCard title="Today's Classes" description={today} delay={0.1} className="lg:col-span-2" padding={false}>
          {todayClasses.length === 0 ? (
            <p className="p-6 text-[13px] text-muted-foreground text-center">No classes scheduled today. Enjoy the break!</p>
          ) : (
            <div className="divide-y divide-border/20">
              {todayClasses.slice(0, 6).map((c, i) => (
                <motion.div key={c.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 cursor-pointer" onClick={() => navigate("/uni-portal/academic")}>
                  <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{c.course_title || c.course_code}</p>
                    <p className="text-[11px] text-muted-foreground">{c.start_time} – {c.end_time} · {c.location || "TBD"}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">{c.type}</span>
                </motion.div>
              ))}
            </div>
          )}
        </UniCard>

        {/* Office hours */}
        <UniCard title="Office Hours" description="Available for students" delay={0.15}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-[14px] bg-success/8">
              <Clock className="w-5 h-5 text-success" />
              <div>
                <p className="text-[12px] font-semibold text-foreground">Today · 2:00 PM – 4:00 PM</p>
                <p className="text-[11px] text-muted-foreground">Room 204, Faculty Block</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-[14px] bg-muted/40">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-[12px] font-semibold text-foreground">Friday · 10:00 AM – 12:00 PM</p>
                <p className="text-[11px] text-muted-foreground">Online via UNIBUD Live</p>
              </div>
            </div>
          </div>
        </UniCard>

        {/* Recent student questions */}
        <UniCard title="Recent Student Questions" description="From your courses" delay={0.2} className="lg:col-span-2" padding={false}>
          <div className="divide-y divide-border/20">
            {[
              { name: "Adaora N.", course: "CSC 301", q: "Could you clarify the Big-O analysis from Tuesday's lecture?", time: "2h ago" },
              { name: "Michael T.", course: "CSC 401", q: "Is the project submission deadline extended?", time: "5h ago" },
              { name: "Fatima B.", course: "CSC 301", q: "Where can I find the past questions for revision?", time: "1d ago" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/30 cursor-pointer" onClick={() => navigate("/uni-portal/messaging")}>
                <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center text-[11px] font-bold text-info flex-shrink-0">{item.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground"><span className="font-semibold">{item.name}</span> <span className="text-muted-foreground">· {item.course}</span></p>
                  <p className="text-[12px] text-muted-foreground truncate">{item.q}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </UniCard>

        {/* Course performance */}
        <UniCard title="Course Performance" description="Average across your courses" delay={0.25}>
          <div className="space-y-3">
            {(courses || []).slice(0, 4).map((c, i) => {
              const avg = 60 + ((i * 7) % 30);
              return (
                <div key={c.id || i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-medium text-foreground truncate">{c.code} — {c.title}</p>
                    <span className={`text-[11px] font-bold ${avg >= 70 ? "text-success" : avg >= 50 ? "text-warning" : "text-error"}`}>{avg}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${avg}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: EASE }} className={`h-full rounded-full ${avg >= 70 ? "bg-success" : avg >= 50 ? "bg-warning" : "bg-error"}`} />
                  </div>
                </div>
              );
            })}
            {(!courses || courses.length === 0) && <p className="text-[12px] text-muted-foreground text-center py-4">No courses yet.</p>}
          </div>
        </UniCard>

        {/* Student engagement */}
        <UniCard title="Student Engagement" description="Active students this week" delay={0.3}>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <motion.circle initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 25 }} transition={{ duration: 1, delay: 0.4, ease: EASE }} cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[16px] font-heading font-extrabold text-foreground">75%</span>
              </div>
            </div>
            <div>
              <p className="text-[20px] font-heading font-extrabold text-foreground">142</p>
              <p className="text-[11px] text-muted-foreground">of 189 enrolled</p>
              <p className="text-[11px] text-success font-semibold flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> +8% vs last week</p>
            </div>
          </div>
        </UniCard>

        {/* Bud insights */}
        <UniCard title="Bud Insights" description="Academic assistant" delay={0.35} className="lg:col-span-3" padding={false}>
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