import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  BookOpen, GraduationCap, Calendar, ClipboardList, Trophy,
  Target, Award, ChevronRight,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const QUICK_LINKS = [
  { label: "Courses", to: "/courses", icon: BookOpen },
  { label: "Results", to: "/academics/results", icon: GraduationCap },
  { label: "Attendance", to: "/attendance", icon: Calendar },
  { label: "Assignments", to: "/assignments", icon: ClipboardList },
  { label: "Timetable", to: "/timetable", icon: Calendar },
  { label: "Exams", to: "/exams", icon: Award },
];

function SectionLabel({ children, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <h2 className="text-[13px] font-bold text-foreground tracking-tight">{children}</h2>
      {action && (
        <button onClick={onAction} className="flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground spring-tap">
          {action} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function EmptyCard({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-6 rounded-[16px] glass-card">
      <div className="w-11 h-11 rounded-full grid place-items-center mb-2 bg-muted/40">
        <Icon className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.5} />
      </div>
      <p className="text-[13px] font-bold text-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">{description}</p>
    </div>
  );
}

/**
 * MeAcademic — academic profile snapshot with real data only.
 * No hardcoded courses, grades, or achievements.
 */
export default function MeAcademic({ user }) {
  const navigate = useNavigate();

  const university = user?.university || "";
  const faculty = user?.faculty || "";
  const department = user?.department || "";
  const level = user?.level || "";
  const uniParts = [university, faculty, department, level].filter(Boolean);

  const { data: achievements = [] } = useQuery({
    queryKey: ["me-academic-achievements", user?.id],
    queryFn: () => base44.entities.StudentAchievement.filter({ created_by_id: user.id }, "-created_date", 10),
    enabled: !!user?.id,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["me-academic-goals", user?.id],
    queryFn: () => base44.entities.StudentGoal.filter({ created_by_id: user.id }, "-created_date", 10),
    enabled: !!user?.id,
  });

  return (
    <div className="flex flex-col gap-5">
      {/* University info */}
      {uniParts.length > 0 && (
        <div>
          <SectionLabel>Academic Identity</SectionLabel>
          <div className="p-3.5 rounded-[16px] glass-card">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span className="text-[14px] font-semibold text-foreground">{university || "University"}</span>
            </div>
            <div className="text-[12px] text-muted-foreground ml-6">{[faculty, department].filter(Boolean).join(" · ")}</div>
            {level && <div className="text-[11px] text-muted-foreground/70 ml-6 mt-0.5">{level}</div>}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <SectionLabel>Academic Tools</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.to)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] glass-card spring-tap"
              >
                <Icon className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                <span className="text-[10px] font-medium text-foreground">{link.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <SectionLabel action="See All" onAction={() => navigate("/achievements")}>Achievements</SectionLabel>
        {achievements.length === 0 ? (
          <EmptyCard icon={Trophy} title="No achievements yet" description="Earn achievements by studying, completing assignments, and participating in campus life." />
        ) : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {achievements.map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] glass-card shrink-0 w-20">
                <div className="w-9 h-9 rounded-full grid place-items-center bg-gold/10">
                  <Trophy className="w-4 h-4 text-gold" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold text-foreground text-center line-clamp-2 leading-tight">{a.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goals */}
      <div>
        <SectionLabel action="See All" onAction={() => navigate("/study")}>Goals</SectionLabel>
        {goals.length === 0 ? (
          <EmptyCard icon={Target} title="No goals yet" description="Set academic and personal goals to track your progress and stay motivated." />
        ) : (
          <div className="space-y-1.5">
            {goals.map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-[14px] glass-card">
                <div className="w-8 h-8 rounded-full grid place-items-center bg-primary/10 shrink-0">
                  <Target className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground line-clamp-1">{g.title || g.goal_text || "Goal"}</p>
                  {g.description && <p className="text-[11px] text-muted-foreground line-clamp-1">{g.description}</p>}
                </div>
                {g.progress != null && (
                  <span className="text-[11px] font-bold text-muted-foreground tabular-nums">{g.progress}%</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}