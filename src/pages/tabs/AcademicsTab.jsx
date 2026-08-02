import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, ClipboardList, GraduationCap, CalendarClock,
  TrendingUp, Library, Wallet, Award, ChevronRight, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const CATEGORIES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "courses", label: "Courses" },
  { id: "assignments", label: "Assignments" },
  { id: "exams", label: "Exams" },
  { id: "timetable", label: "Timetable" },
  { id: "library", label: "Library" },
  { id: "wallet", label: "Wallet" },
  { id: "career", label: "Career" },
];

const QUICK_LINKS = [
  { id: "timetable", label: "Timetable", icon: CalendarClock, path: "/timetable" },
  { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
  { id: "grades", label: "Grades", icon: TrendingUp, path: "/academics/results" },
  { id: "library", label: "Library", icon: Library, path: "/library" },
  { id: "wallet", label: "Wallet", icon: Wallet, path: "/wallet" },
  { id: "career", label: "Career", icon: GraduationCap, path: "/career" },
];

export default function AcademicsTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [activeCategory, setActiveCategory] = useState("dashboard");

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["academics", "courses"],
    queryFn: () => base44.entities.Course.list("-created_date", 5),
    enabled: isOnline,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["academics", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 5),
    enabled: isOnline,
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["academics", "exams"],
    queryFn: () => base44.entities.Exam.list("-date", 5),
    enabled: isOnline,
  });

  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ["academics", "grades"],
    queryFn: () => base44.entities.Grade.list("-created_date", 5),
    enabled: isOnline && activeCategory === "dashboard",
  });

  const { data: resources, isLoading: resLoading } = useQuery({
    queryKey: ["academics", "library"],
    queryFn: () => base44.entities.LibraryResource.list("-created_date", 5),
    enabled: isOnline && activeCategory === "library",
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["academics", "wallet"],
    queryFn: () => base44.entities.Wallet.list("-created_date", 1),
    enabled: isOnline && activeCategory === "wallet",
  });

  const { data: opportunities, isLoading: oppLoading } = useQuery({
    queryKey: ["academics", "opportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 5),
    enabled: isOnline && activeCategory === "career",
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["academics"] });
  }, [queryClient]);

  const allLoading = coursesLoading && assignmentsLoading;
  const state = !isOnline ? "offline" : allLoading ? "loading" : "ready";

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 pt-5 pb-2">
        <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-3">Academics</h1>

        {/* Quick links */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-center gap-1 flex-shrink-0 w-14 active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-[14px] bg-card shadow-sm flex items-center justify-center">
                  <Icon className="w-5 h-5 text-chocolate" strokeWidth={2} />
                </div>
                <span className="text-[9px] font-semibold text-muted-foreground">{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 h-8 rounded-full text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground shadow-sm"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 pb-24">
        {activeCategory === "dashboard" && (
          <ProductionState state={state} onRefresh={handleRefresh} skeleton={<DashboardSkeleton />}>
            <div className="space-y-4">
              {/* Bud suggestion */}
              <button
                onClick={() => navigate("/bud")}
                className="w-full flex items-center gap-3 p-3.5 rounded-[18px] bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                >
                  <Sparkles className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
                </motion.div>
                <p className="text-[12px] text-foreground flex-1">
                  {assignments?.length > 0
                    ? `${assignments.length} assignments due. Want help planning?`
                    : "Your academic day looks clear. Ready to study?"}
                </p>
                <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
              </button>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                <StatCard icon={BookOpen} label="Courses" value={courses?.length || 0} onClick={() => navigate("/courses")} />
                <StatCard icon={ClipboardList} label="Due" value={assignments?.length || 0} onClick={() => navigate("/assignments")} />
                <StatCard icon={Award} label="Exams" value={exams?.length || 0} onClick={() => navigate("/exams")} />
              </div>

              {/* Courses */}
              {(courses?.length ?? 0) > 0 && (
                <Section title="My Courses" onSeeAll={() => navigate("/courses")}>
                  <div className="grid grid-cols-2 gap-2">
                    {courses.slice(0, 4).map((c) => (
                      <CourseCard key={c.id} course={c} onClick={() => navigate(`/course/${c.id}`)} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Assignments */}
              {(assignments?.length ?? 0) > 0 && (
                <Section title="Assignments" onSeeAll={() => navigate("/assignments")}>
                  <div className="space-y-2">
                    {assignments.slice(0, 3).map((a) => (
                      <AssignmentRow key={a.id} assignment={a} onClick={() => navigate("/assignments")} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Exams */}
              {(exams?.length ?? 0) > 0 && (
                <Section title="Upcoming Exams" onSeeAll={() => navigate("/exams")}>
                  <div className="space-y-2">
                    {exams.slice(0, 3).map((e) => (
                      <ExamRow key={e.id} exam={e} onClick={() => navigate("/exams")} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Grades */}
              {(grades?.length ?? 0) > 0 && (
                <Section title="Recent Grades" onSeeAll={() => navigate("/academics/results")}>
                  <div className="space-y-2">
                    {grades.slice(0, 3).map((g) => (
                      <GradeRow key={g.id} grade={g} />
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </ProductionState>
        )}

        {activeCategory === "courses" && (
          <ProductionState state={coursesLoading ? "loading" : "ready"} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(courses?.length ?? 0) === 0 ? (
              <EmptyContent icon={BookOpen} text="No courses enrolled yet" />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {courses.map((c) => (
                  <CourseCard key={c.id} course={c} onClick={() => navigate(`/course/${c.id}`)} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "assignments" && (
          <ProductionState state={assignmentsLoading ? "loading" : "ready"} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(assignments?.length ?? 0) === 0 ? (
              <EmptyContent icon={ClipboardList} text="No assignments due" />
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => (
                  <AssignmentRow key={a.id} assignment={a} onClick={() => navigate("/assignments")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "exams" && (
          <ProductionState state={examsLoading ? "loading" : "ready"} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(exams?.length ?? 0) === 0 ? (
              <EmptyContent icon={Award} text="No upcoming exams" />
            ) : (
              <div className="space-y-2">
                {exams.map((e) => (
                  <ExamRow key={e.id} exam={e} onClick={() => navigate("/exams")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "timetable" && (
          <button
            onClick={() => navigate("/timetable")}
            className="w-full p-4 rounded-[18px] bg-card shadow-sm flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          >
            <CalendarClock className="w-5 h-5 text-primary" strokeWidth={2} />
            <span className="text-[13px] font-bold text-foreground flex-1">View Full Timetable</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
          </button>
        )}

        {activeCategory === "library" && (
          <ProductionState state={resLoading ? "loading" : "ready"} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(resources?.length ?? 0) === 0 ? (
              <EmptyContent icon={Library} text="No resources available" />
            ) : (
              <div className="space-y-2">
                {resources.map((r) => (
                  <ListRow key={r.id} icon={Library} title={r.title} subtitle={r.author || r.subject || "Library"} onClick={() => navigate("/library")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "wallet" && (
          <ProductionState state={walletLoading ? "loading" : "ready"} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            <button
              onClick={() => navigate("/wallet")}
              className="w-full p-4 rounded-[20px] bg-chocolate text-white shadow-sm flex items-center justify-between text-left active:scale-[0.98] transition-transform"
            >
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">Campus Wallet</p>
                <p className="text-[22px] font-bold mt-0.5">
                  ₦{Number(wallet?.[0]?.balance || 0).toLocaleString()}
                </p>
              </div>
              <Wallet className="w-6 h-6 text-white/40" strokeWidth={2} />
            </button>
          </ProductionState>
        )}

        {activeCategory === "career" && (
          <ProductionState state={oppLoading ? "loading" : "ready"} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(opportunities?.length ?? 0) === 0 ? (
              <EmptyContent icon={GraduationCap} text="No opportunities available" />
            ) : (
              <div className="space-y-2">
                {opportunities.map((o) => (
                  <ListRow key={o.id} icon={GraduationCap} title={o.title} subtitle={o.company || o.organization || "Opportunity"} onClick={() => navigate("/opportunities")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center p-2.5 rounded-[16px] bg-card shadow-sm"
    >
      <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center mb-1.5">
        <Icon className="w-4 h-4 text-primary" strokeWidth={2.2} />
      </div>
      <span className="text-[16px] font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </motion.button>
  );
}

function Section({ title, onSeeAll, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-[15px] font-bold text-foreground tracking-tight">{title}</h3>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-[11px] font-bold text-primary active:scale-95 transition-transform">
            See all
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function CourseCard({ course, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-8 h-8 rounded-[10px] bg-chocolate/10 flex items-center justify-center mb-2">
        <BookOpen className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
      </div>
      <p className="text-[12px] font-bold text-foreground truncate">{course.code || course.name}</p>
      <p className="text-[9px] text-muted-foreground truncate mt-0.5">{course.name || course.title}</p>
    </motion.button>
  );
}

function AssignmentRow({ assignment, onClick }) {
  const d = assignment.due_date ? new Date(assignment.due_date) : null;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
        <ClipboardList className="w-4 h-4 text-primary" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground truncate">{assignment.title}</p>
        <p className="text-[10px] text-muted-foreground">{assignment.course_code || assignment.subject || "General"}</p>
      </div>
      {d && (
        <span className="text-[10px] font-bold text-primary px-2 py-1 rounded-full bg-primary/10">
          {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function ExamRow({ exam, onClick }) {
  const d = exam.date ? new Date(exam.date) : null;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-10 h-10 rounded-[12px] bg-chocolate flex flex-col items-center justify-center flex-shrink-0">
        {d && <span className="text-[8px] font-bold text-white/70 uppercase">{d.toLocaleDateString("en-US", { month: "short" })}</span>}
        {d && <span className="text-[14px] font-bold text-white">{d.getDate()}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground truncate">{exam.title}</p>
        <p className="text-[10px] text-muted-foreground">{exam.course_code || exam.subject || "Exam"}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function GradeRow({ grade }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm">
      <div className="w-9 h-9 rounded-[12px] bg-success/10 flex items-center justify-center flex-shrink-0">
        <TrendingUp className="w-4 h-4 text-success" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground truncate">{grade.course_code || grade.title}</p>
        <p className="text-[10px] text-muted-foreground">{grade.semester || grade.term || ""}</p>
      </div>
      <span className="text-[16px] font-bold text-foreground tabular-nums">{grade.grade || grade.score || "-"}</span>
    </div>
  );
}

function ListRow({ icon: Icon, title, subtitle, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-10 h-10 rounded-[12px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-chocolate" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground truncate">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function EmptyContent({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16">
      <div className="w-14 h-14 rounded-[18px] bg-muted flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <p className="text-[13px] text-muted-foreground">{text}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 rounded-[16px] bg-card shadow-sm animate-pulse" />
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-16 rounded-[18px] bg-card shadow-sm animate-pulse" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-[16px] bg-card shadow-sm animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-[16px] bg-card shadow-sm animate-pulse" />
        ))}
      </div>
    </div>
  );
}