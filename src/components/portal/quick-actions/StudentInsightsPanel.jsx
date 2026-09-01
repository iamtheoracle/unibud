import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, ClipboardList, TrendingUp, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function StudentInsightsPanel({ user, onClose }) {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["portalCourses"],
    queryFn: () => base44.entities.Course.list(),
    retry: false,
  });
  const { data: assignments } = useQuery({
    queryKey: ["portalAssignments"],
    queryFn: () => base44.entities.Assignment.list(),
    retry: false,
  });
  const { data: users } = useQuery({
    queryKey: ["portalUsers"],
    queryFn: () => base44.entities.User.list(),
    retry: false,
  });
  const { data: studyGroups } = useQuery({
    queryKey: ["portalStudyGroups"],
    queryFn: () => base44.entities.StudyGroup.list(),
    retry: false,
  });

  const students = (users || []).filter((u) => u.role === "student" || u.role === "user" || !u.role);
  const activeCourses = (courses || []).filter((c) => c.status === "active");
  const pendingAssignments = (assignments || []).filter((a) => a.status === "pending");
  const submittedAssignments = (assignments || []).filter((a) => a.status === "submitted" || a.status === "graded");
  const completionRate = assignments?.length > 0
    ? Math.round((submittedAssignments.length / assignments.length) * 100)
    : 0;
  const avgGrade = (assignments || []).filter((a) => a.grade).reduce((sum, a, _, arr) => sum + (a.grade / (a.max_grade || 100)) * 100, 0) / Math.max((assignments || []).filter((a) => a.grade).length, 1);

  const stats = [
    { label: "Total Students", value: students.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Courses", value: activeCourses.length, icon: BookOpen, color: "text-success", bg: "bg-success/10" },
    { label: "Assignment Completion", value: `${completionRate}%`, icon: CheckCircle2, color: "text-info", bg: "bg-info/10" },
    { label: "Avg. Performance", value: `${Math.round(avgGrade)}%`, icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
    { label: "Pending Submissions", value: pendingAssignments.length, icon: AlertCircle, color: "text-error", bg: "bg-error/10" },
    { label: "Study Groups", value: studyGroups?.length || 0, icon: ClipboardList, color: "text-purple", bg: "bg-purple/10" },
  ];

  return (
    <div className="p-5">
      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-[18px] bg-muted/30 border border-border/20">
              <div className={`w-9 h-9 rounded-[12px] ${stat.bg} flex items-center justify-center mb-2.5`}>
                <Icon className={`w-4 h-4 ${stat.color}`} strokeWidth={2.2} />
              </div>
              <p className="text-[22px] font-heading font-extrabold text-foreground leading-none">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Course performance breakdown */}
      {activeCourses.length > 0 && (
        <div>
          <h4 className="text-[13px] font-bold text-foreground mb-3">Course Performance Breakdown</h4>
          <div className="space-y-2">
            {activeCourses.slice(0, 8).map((course, i) => {
              const courseAssignments = (assignments || []).filter((a) => a.course_code === course.code);
              const completed = courseAssignments.filter((a) => a.status === "graded" || a.status === "submitted").length;
              const rate = courseAssignments.length > 0 ? Math.round((completed / courseAssignments.length) * 100) : 0;
              return (
                <motion.div key={course.id || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="p-3 rounded-[14px] bg-muted/30 border border-border/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-semibold text-foreground truncate">{course.code} — {course.title}</span>
                    <span className="text-[12px] font-bold text-foreground flex-shrink-0">{rate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${rate}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                      className={`h-full rounded-full ${rate >= 75 ? "bg-success" : rate >= 50 ? "bg-warning" : "bg-error"}`} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{completed}/{courseAssignments.length} assignments completed</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
}