import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, FileText, Award, Clock, ChevronRight, GraduationCap, BarChart3, Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import { Link } from "react-router-dom";

const tabs = ["Courses", "Timetable", "Tasks", "Grades"];

const mockCourses = [
  { code: "CSC 301", title: "Data Structures & Algorithms", lecturer: "Dr. Adeyemi", progress: 68, credits: 4, color: "from-blue-500 to-blue-600" },
  { code: "MTH 201", title: "Linear Algebra", lecturer: "Prof. Okafor", progress: 45, credits: 3, color: "from-purple-500 to-purple-600" },
  { code: "PHY 203", title: "Quantum Mechanics", lecturer: "Dr. Ibrahim", progress: 72, credits: 3, color: "from-emerald-500 to-emerald-600" },
  { code: "ENG 201", title: "Technical Writing", lecturer: "Mrs. Johnson", progress: 90, credits: 2, color: "from-amber-500 to-amber-600" },
  { code: "CSC 305", title: "Operating Systems", lecturer: "Dr. Nnamdi", progress: 30, credits: 4, color: "from-rose-500 to-rose-600" },
];

const timetable = [
  { day: "Monday", classes: [
    { code: "CSC 301", time: "8:00 - 10:00", location: "LT 5", type: "lecture" },
    { code: "MTH 201", time: "11:00 - 1:00", location: "Room 204", type: "lecture" },
  ]},
  { day: "Tuesday", classes: [
    { code: "PHY 203", time: "9:00 - 11:00", location: "Lab 3", type: "lab" },
    { code: "ENG 201", time: "2:00 - 3:00", location: "Room 101", type: "lecture" },
  ]},
  { day: "Wednesday", classes: [
    { code: "CSC 305", time: "10:00 - 12:00", location: "LT 2", type: "lecture" },
    { code: "CSC 301", time: "2:00 - 4:00", location: "Lab 1", type: "tutorial" },
  ]},
];

const grades = [
  { code: "CSC 201", title: "Intro to Programming", grade: "A", points: 5.0, credits: 4 },
  { code: "MTH 101", title: "Calculus I", grade: "B+", points: 4.5, credits: 3 },
  { code: "PHY 101", title: "General Physics", grade: "A-", points: 4.5, credits: 3 },
  { code: "ENG 101", title: "Use of English", grade: "B", points: 4.0, credits: 2 },
];

export default function Academics() {
  const [activeTab, setActiveTab] = useState("Courses");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="pt-12 pb-3 px-5">
        <h1 className="font-heading font-bold text-[22px] tracking-tight">Academics</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Your academic workspace</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5 p-1 bg-muted/60 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {activeTab === "Courses" && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-border/50 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {mockCourses.map((course, i) => (
              <GlassCard key={course.code} variant="solid" className="p-4" delay={i * 0.05}>
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <BookOpen className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-heading font-bold text-[13px]">{course.code}</span>
                      <span className="text-[10px] text-muted-foreground">{course.credits} Credits</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mb-0.5 truncate">{course.title}</p>
                    <p className="text-[10px] text-muted-foreground mb-2">{course.lecturer}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">{course.progress}%</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </>
        )}

        {activeTab === "Timetable" && (
          <>
            {timetable.map((day, di) => (
              <div key={day.day}>
                <p className="font-heading font-semibold text-[13px] mb-2 text-muted-foreground">{day.day}</p>
                <div className="space-y-2">
                  {day.classes.map((cls, ci) => (
                    <GlassCard key={ci} variant="solid" className="p-3" delay={di * 0.05 + ci * 0.03}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          {cls.type === "lab" ? <BarChart3 className="w-4 h-4 text-primary" /> : <BookOpen className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-heading font-semibold text-[12px]">{cls.code}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />{cls.time}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{cls.location}</span>
                          </div>
                        </div>
                        <StatusBadge status={cls.type === "lab" ? "high" : "active"} />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "Tasks" && (
          <>
            <SectionHeader title="Pending Tasks" subtitle="3 tasks due" icon={FileText} />
            {[
              { title: "Data Structures Assignment 3", course: "CSC 301", due: "Tomorrow", priority: "high" },
              { title: "Linear Algebra Problem Set", course: "MTH 201", due: "In 3 days", priority: "medium" },
              { title: "Physics Lab Report", course: "PHY 203", due: "In 5 days", priority: "low" },
            ].map((task, i) => (
              <GlassCard key={i} variant="solid" className="p-3" delay={i * 0.05}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md border-2 border-border flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-[12px]">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground">{task.course} · Due {task.due}</p>
                  </div>
                  <StatusBadge status={task.priority} />
                </div>
              </GlassCard>
            ))}
          </>
        )}

        {activeTab === "Grades" && (
          <>
            <GlassCard variant="solid" className="p-4" delay={0.05}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-heading font-bold text-2xl text-gradient">4.20</p>
                  <p className="text-[11px] text-muted-foreground">Cumulative GPA</p>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-lg">4.35</p>
                  <p className="text-[11px] text-muted-foreground">Semester GPA</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-achievement" />
                <span className="text-[11px] font-medium text-achievement">2nd Class Upper Division</span>
              </div>
            </GlassCard>

            {grades.map((g, i) => (
              <GlassCard key={i} variant="solid" className="p-3" delay={0.1 + i * 0.04}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading font-semibold text-[12px]">{g.code} — {g.title}</p>
                    <p className="text-[10px] text-muted-foreground">{g.credits} Credits · {g.points} Points</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <span className="font-heading font-bold text-[14px] text-emerald-600">{g.grade}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </>
        )}
      </div>
    </div>
  );
}