import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, ChevronRight, Search, Users, Plus } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import ProgressDashboard from "@/components/academics/ProgressDashboard";
import GradeLogger from "@/components/academics/GradeLogger";
import StudyGoalsTracker from "@/components/academics/StudyGoalsTracker";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";

const tabs = ["Progress", "Goals", "Grades", "Courses", "Timetable", "Tasks", "Analytics", "Groups"];

const DEMO_COURSES = [
  { id: "d1", code: "CSC 301", title: "Data Structures & Algorithms", lecturer: "Dr. Adeyemi", progress: 68, credits: 4, color: "from-info to-info/80" },
  { id: "d2", code: "MTH 201", title: "Linear Algebra", lecturer: "Prof. Okafor", progress: 45, credits: 3, color: "from-purple to-purple/80" },
  { id: "d3", code: "PHY 203", title: "Quantum Mechanics", lecturer: "Dr. Ibrahim", progress: 72, credits: 3, color: "from-success to-success/80" },
];

const DEMO_TIMETABLE = [
  { day: "Monday", classes: [
    { code: "CSC 301", time: "8:00 - 10:00", location: "LT 5", type: "lecture" },
    { code: "MTH 201", time: "11:00 - 1:00", location: "Room 204", type: "lecture" },
  ]},
  { day: "Tuesday", classes: [
    { code: "PHY 203", time: "9:00 - 11:00", location: "Lab 3", type: "lab" },
  ]},
];

export default function Academics() {
  const { isDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState("Progress");

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["academicsCourses"],
    queryFn: () => base44.entities.Course.list(),
    enabled: !isDemoMode,
  });
  const { data: timetable, isLoading: timetableLoading } = useQuery({
    queryKey: ["academicsTimetable"],
    queryFn: () => base44.entities.TimetableEntry.list(),
    enabled: !isDemoMode,
  });
  const { data: assignments } = useQuery({
    queryKey: ["academicsAssignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 50),
    enabled: !isDemoMode,
  });

  const courseList = isDemoMode ? DEMO_COURSES : (courses || []);
  const timetableByDay = isDemoMode ? DEMO_TIMETABLE : groupTimetableByDay(timetable || []);
  const pendingAssignments = (assignments || []).filter((a) => a.status === "pending");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5"
      >
        <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Academics</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Your academic workspace</p>
      </motion.div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5 p-1 bg-muted/60 rounded-[16px] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={"flex-1 py-2.5 px-2 rounded-[12px] text-[11px] font-semibold transition-all duration-300 whitespace-nowrap " + (activeTab === tab ? "bg-card text-foreground soft-shadow" : "text-muted-foreground hover:text-foreground")}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {activeTab === "Progress" && <ProgressDashboard />}
        {activeTab === "Goals" && <StudyGoalsTracker />}
        {activeTab === "Grades" && <GradeLogger />}
        {activeTab === "Analytics" && (
          <>
            <Link to="/academic-analytics" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[14px] bg-primary/10 text-primary text-[12px] font-semibold mb-3">
              View Full Analytics Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
            <ProgressDashboard />
          </>
        )}

        {activeTab === "Courses" && (
          <>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 soft-shadow" />
            </div>
            {coursesLoading && !isDemoMode ? (
              [1, 2, 3].map((i) => <div key={i} className="h-[90px] rounded-[20px] shimmer" />)
            ) : courseList.length === 0 ? (
              <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
                <EmptyState icon={BookOpen} title="No courses yet" description="Your enrolled courses will appear here" action={<Link to="/academics" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap"><Plus className="w-3.5 h-3.5" /> Add Course</Link>} />
              </div>
            ) : (
              courseList.map((course, i) => (
                <GlassCard key={course.id || i} variant="solid" className="p-4" delay={i * 0.05}>
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-primary/80 to-primary/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <BookOpen className="w-5 h-5 text-primary-foreground" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-heading font-bold text-[13px] text-foreground">{course.code}</span>
                        {course.credits && <span className="text-[10px] text-muted-foreground">{course.credits} Credits</span>}
                      </div>
                      <p className="text-[12px] text-muted-foreground mb-0.5 truncate">{course.title}</p>
                      {course.lecturer && <p className="text-[10px] text-muted-foreground mb-2.5">{course.lecturer}</p>}
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </>
        )}

        {activeTab === "Timetable" && (
          <>
            {timetableLoading && !isDemoMode ? (
              [1, 2].map((i) => <div key={i} className="h-[60px] rounded-[20px] shimmer" />)
            ) : timetableByDay.length === 0 ? (
              <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
                <EmptyState icon={Clock} title="No timetable yet" description="Your class schedule will appear here once you add your courses" />
              </div>
            ) : (
              timetableByDay.map((day, di) => (
                <div key={day.day}>
                  <p className="font-heading font-semibold text-[13px] mb-2.5 text-muted-foreground px-1">{day.day}</p>
                  <div className="space-y-2.5">
                    {day.classes.map((cls, ci) => (
                      <GlassCard key={ci} variant="solid" className="p-3.5" delay={di * 0.05 + ci * 0.03}>
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-[18px] h-[18px] text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-heading font-semibold text-[12px] text-foreground">{cls.code}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{cls.time}</span>
                              {cls.location && <span className="text-[10px] text-muted-foreground">{cls.location}</span>}
                            </div>
                          </div>
                          <StatusBadge status={cls.type === "lab" ? "high" : "active"} />
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "Tasks" && (
          <>
            <SectionHeader title="Pending Tasks" subtitle={pendingAssignments.length + " tasks due"} icon={BookOpen} />
            {pendingAssignments.length > 0 ? (
              pendingAssignments.map((task, i) => (
                <GlassCard key={task.id || i} variant="solid" className="p-3.5" delay={i * 0.05}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-5 h-5 rounded-md border-2 border-border flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-heading font-semibold text-[12px] text-foreground">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground">{task.course_code} {task.due_date ? "· Due " + new Date(task.due_date).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}</p>
                    </div>
                    <StatusBadge status={task.priority} />
                  </div>
                </GlassCard>
              ))
            ) : (
              <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
                <EmptyState icon={BookOpen} title="No pending tasks" description="Your assignments and tasks will appear here" action={<Link to="/assignments" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">View Assignments</Link>} />
              </div>
            )}
          </>
        )}

        {activeTab === "Groups" && (
          <>
            <Link to="/study-groups" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap mb-3">
              <Plus className="w-4 h-4" /> Create Study Group
            </Link>
            <StudyGroupsPreview />
          </>
        )}
      </div>
    </div>
  );
}

function groupTimetableByDay(entries) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const grouped = {};
  entries.forEach((e) => {
    const day = (e.day || "").charAt(0).toUpperCase() + (e.day || "").slice(1).toLowerCase();
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push({
      code: e.course_code || "",
      time: (e.start_time || "") + " - " + (e.end_time || ""),
      location: e.location || "",
      type: e.type || "lecture",
    });
  });
  return days.filter((d) => grouped[d]).map((d) => ({ day: d, classes: grouped[d].sort((a, b) => a.time.localeCompare(b.time)) }));
}

function StudyGroupsPreview() {
  const { data: groups, isLoading } = useQuery({
    queryKey: ["studyGroupsPreview"],
    queryFn: () => base44.entities.StudyGroup.list("-created_date", 5),
  });

  if (isLoading) return <div className="h-20 rounded-[20px] shimmer" />;
  if (!groups || groups.length === 0) {
    return (
      <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
        <EmptyState icon={Users} title="No study groups yet" description="Create or join study groups to collaborate" action={<Link to="/study-groups" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">Browse Groups</Link>} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((group, i) => (
        <Link key={group.id} to={"/study-groups/" + group.id}>
          <GlassCard variant="solid" className="p-3.5" delay={i * 0.04}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: (group.accent_color || "hsl(var(--unibud-gold))").replace("))", ") / 0.12)") }}>
                <Users className="w-4 h-4" style={{ color: group.accent_color || "hsl(var(--unibud-gold))" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-[13px] text-foreground truncate">{group.name}</p>
                <p className="text-[10px] text-muted-foreground">{group.course_code || group.subject} {group.members_count != null ? " · " + group.members_count + " members" : ""}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </GlassCard>
        </Link>
      ))}
      <Link to="/study-groups" className="block text-center text-[12px] text-primary font-semibold py-2">View All Study Groups</Link>
    </div>
  );
}