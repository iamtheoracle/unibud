import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Trophy, FileText, CheckCircle2, Award, Crown } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const RANK_COLORS = [
  "from-primary to-chocolate",
  "from-chocolate to-chocolate-dark",
  "from-orange-glow to-primary",
];

export default function StudyGroupLeaderboard({ groupId, group }) {
  const { data: resources } = useQuery({
    queryKey: ["leaderboardResources", groupId],
    queryFn: () => base44.entities.StudyGroupResource.filter({ study_group_id: groupId }, "-created_date", 200),
  });

  const { data: tasks } = useQuery({
    queryKey: ["leaderboardTasks", groupId],
    queryFn: () => base44.entities.StudyGroupTask.filter({ group_id: groupId }, "due_date", 100),
  });

  const { data: achievements } = useQuery({
    queryKey: ["leaderboardAchievements", groupId],
    queryFn: () => base44.entities.StudentAchievement.filter({ related_course: group?.course_code }, "-date_earned", 100),
  });

  const leaderboard = useMemo(() => {
    const r = resources || [];
    const t = tasks || [];
    const a = achievements || [];

    // Aggregate by uploader
    const contributors = {};
    const ensure = (id, name) => {
      if (!contributors[id]) {
        contributors[id] = { id, name: name || "Member", resources: 0, notes: 0, tasksDone: 0, achievements: 0, score: 0 };
      }
    };

    r.forEach((res) => {
      const id = res.uploaded_by_id || res.uploaded_by_name || "unknown";
      ensure(id, res.uploaded_by_name);
      contributors[id].resources++;
      if (res.file_type === "notes" || res.file_type === "study_guide") contributors[id].notes++;
      contributors[id].score += 3;
    });

    t.forEach((task) => {
      if (task.status === "done" && task.assigned_to) {
        ensure(task.assigned_to, task.assigned_to);
        contributors[task.assigned_to].tasksDone++;
        contributors[task.assigned_to].score += 5;
      }
    });

    a.forEach((ach) => {
      const id = ach.created_by_id || "unknown";
      ensure(id, ach.student_name);
      contributors[id].achievements++;
      contributors[id].score += 10;
    });

    return Object.values(contributors).sort((a, b) => b.score - a.score);
  }, [resources, tasks, achievements]);

  if (leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-[18px] glass-card flex items-center justify-center mb-3">
          <Trophy className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] font-semibold text-foreground mb-1">No contributors yet</p>
        <p className="text-[11px] text-muted-foreground max-w-[240px]">Share resources, complete tasks, and earn achievements to appear on the leaderboard.</p>
      </div>
    );
  }

  const totalScore = leaderboard.reduce((sum, c) => sum + c.score, 0);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="glass-card p-3 flex items-center gap-2.5">
        <Trophy className="w-4 h-4 text-primary" strokeWidth={2} />
        <div className="flex-1">
          <p className="text-[12px] font-bold text-foreground">Leaderboard</p>
          <p className="text-[10px] text-muted-foreground">{leaderboard.length} contributors · {totalScore} total points</p>
        </div>
      </div>

      {/* Top 3 podium */}
      {leaderboard.length >= 1 && (
        <div className="grid grid-cols-3 gap-2">
          {leaderboard.slice(0, 3).map((contributor, index) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3, ease: EASE }}
              className={`glass-card p-2.5 flex flex-col items-center text-center ${index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3"}`}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${RANK_COLORS[index] || "from-muted to-muted"} flex items-center justify-center mb-1.5`}>
                {index === 0 ? <Crown className="w-5 h-5 text-white" /> : <span className="text-[14px] font-bold text-white">{index + 1}</span>}
              </div>
              <p className="text-[10px] font-bold text-foreground truncate w-full">{contributor.name}</p>
              <p className="text-[14px] font-extrabold text-primary tabular-nums">{contributor.score}</p>
              <p className="text-[8px] text-muted-foreground uppercase">pts</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-1.5">
        {leaderboard.map((contributor, index) => (
          <motion.div
            key={contributor.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25, ease: EASE }}
            className="glass-card p-2.5 flex items-center gap-2.5"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${index < 3 ? `bg-gradient-to-br ${RANK_COLORS[index]}` : "bg-muted/50 text-muted-foreground"}`}>
              {index < 3 ? "" : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{contributor.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground"><FileText className="w-2.5 h-2.5" /> {contributor.resources}</span>
                <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground"><CheckCircle2 className="w-2.5 h-2.5" /> {contributor.tasksDone}</span>
                {contributor.achievements > 0 && <span className="flex items-center gap-0.5 text-[8px] text-primary"><Award className="w-2.5 h-2.5" /> {contributor.achievements}</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-primary tabular-nums">{contributor.score}</p>
              <p className="text-[7px] text-muted-foreground uppercase">pts</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}