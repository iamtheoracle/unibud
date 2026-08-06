import React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Flame, Target, AlertCircle, WifiOff } from "lucide-react";
import { useStudyProgress } from "@/hooks/useStudyProgress";
import ProgressRing from "@/components/home/study/ProgressRing";
import StudyQuickActions from "@/components/home/study/StudyQuickActions";

const EASE = [0.16, 1, 0.3, 1];

export default function StudyProgressWidget() {
  const { loading, error, isEmpty, metrics, upcomingDeadlines, todaySessions } = useStudyProgress();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (isEmpty) return <EmptyState />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
    >
      <div className="bg-card border border-border rounded-2xl p-4 premium-shadow">
        <div className="flex items-center gap-4">
          <ProgressRing percentage={metrics.goalPct} size={64} stroke={5}>
            <span className="text-[15px] font-bold text-foreground">{metrics.goalPct}%</span>
          </ProgressRing>
          <div className="flex-1 grid grid-cols-3 gap-3">
            <Metric icon={Clock} label="Hours" value={`${metrics.weekHours}`} sub={`/ ${metrics.targetHours}h`} pct={metrics.hoursPct} />
            <Metric icon={CheckCircle} label="Done" value={`${metrics.completedAssignments}`} sub={`/ ${metrics.totalAssignments}`} pct={metrics.assignmentsPct} />
            <Metric icon={Flame} label="Streak" value={`${metrics.streak}`} sub="days" />
          </div>
        </div>
      </div>

      {upcomingDeadlines.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <AlertCircle className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</span>
          </div>
          <div className="space-y-2">
            {upcomingDeadlines.map((d, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-[13px] text-foreground font-medium truncate flex-1">{d.title}</span>
                <span className="text-[11px] text-muted-foreground shrink-0">{d.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {todaySessions.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Target className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Today</span>
          </div>
          <div className="space-y-2">
            {todaySessions.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-[12px] text-muted-foreground tabular-nums w-12 shrink-0">{s.time}</span>
                <span className="text-[13px] text-foreground font-medium truncate flex-1">{s.title}</span>
                {s.location && <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">{s.location}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <StudyQuickActions />
    </motion.div>
  );
}

function Metric({ icon: Icon, label, value, sub, pct }) {
  return (
    <div className="flex flex-col items-center">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mb-1" strokeWidth={2} />
      <div className="flex items-baseline gap-0.5">
        <span className="text-[16px] font-bold text-foreground tabular-nums">{value}</span>
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      </div>
      {pct !== undefined && (
        <div className="w-full h-1 rounded-full bg-muted/40 mt-1.5 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 premium-shadow">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full shimmer" />
        <div className="flex-1 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded shimmer" />
              <div className="w-10 h-4 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="bg-card border border-border rounded-2xl p-6 premium-shadow text-center"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Target className="w-5 h-5 text-primary" strokeWidth={2} />
      </div>
      <p className="text-[15px] font-semibold text-foreground mb-1">Start your study journey</p>
      <p className="text-[13px] text-muted-foreground mb-4">Set a weekly study goal and Orbit will build your personalized plan.</p>
      <StudyQuickActions />
    </motion.div>
  );
}

function ErrorState() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 premium-shadow text-center">
      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
        <WifiOff className="w-4 h-4 text-destructive" strokeWidth={2} />
      </div>
      <p className="text-[14px] font-medium text-foreground">Couldn't load progress</p>
      <p className="text-[12px] text-muted-foreground mt-0.5">Pull to refresh.</p>
    </div>
  );
}