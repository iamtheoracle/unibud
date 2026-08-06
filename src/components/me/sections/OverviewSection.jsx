import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import {
  BadgeCheck, Award, Briefcase,
  FileText, Wallet as WalletIcon, Star,
} from "lucide-react";
import StreakShowcase from "@/components/me/StreakShowcase";
import DeadlineAlertsBanner from "@/components/academics/DeadlineAlertsBanner";
import BudAcademicInsights from "@/components/bud/BudAcademicInsights";

export default function OverviewSection({ user, isOwnProfile, onNavigateSection }) {
  const navigate = useNavigate();

  const { data: achievements = [] } = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-created_date", 5),
  });

  const { data: trustScore } = useQuery({
    queryKey: ["me", "trustScore"],
    queryFn: () => base44.entities.TrustScore.list("-created_date", 1),
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["me", "followers"],
    queryFn: () => base44.entities.Follow.filter({ followed_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });

  const { data: following = [] } = useQuery({
    queryKey: ["me", "following"],
    queryFn: () => base44.entities.Follow.filter({ follower_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["me", "studySessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 50),
  });

  const uni = [user?.university, user?.department, user?.level].filter(Boolean).join(" · ");
  const sessionDates = sessions.filter((s) => s.session_date).map((s) => s.session_date);
  const uniqueDates = [...new Set(sessionDates)];
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let checkDate = today;
  for (const d of uniqueDates.sort().reverse()) {
    if (d === checkDate) {
      streak++;
      const dt = new Date(checkDate);
      dt.setDate(dt.getDate() - 1);
      checkDate = dt.toISOString().split("T")[0];
    } else if (d < checkDate) break;
  }

  const reputation = trustScore?.[0]?.score || 0;
  const contribution = trustScore?.[0]?.contribution_score || 0;

  const quickActions = [
    { icon: FileText, label: "Portfolio", onClick: () => onNavigateSection?.("portfolio") },
    { icon: Briefcase, label: "Resume", onClick: () => navigate("/cv-builder") },
    { icon: Award, label: "Awards", onClick: () => onNavigateSection?.("achievements") },
    { icon: WalletIcon, label: "Wallet", onClick: () => navigate("/wallet") },
  ];

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="flex items-center gap-4 py-2">
        <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
          {user?.image || user?.picture ? (
            <Image src={user.image || user.picture} alt={user.full_name} fittingType="fill" className="w-full h-full" />
          ) : (
            <span className="text-[28px] font-bold text-muted-foreground">
              {(user?.full_name || user?.email || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[20px] font-bold text-foreground truncate tracking-tight">{user?.full_name || "Student"}</h2>
          {uni && <p className="text-[12px] text-muted-foreground truncate">{uni}</p>}
          {user?.role && (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10">
              <BadgeCheck className="w-3 h-3 text-primary" strokeWidth={2.5} />
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{user.role}</span>
            </span>
          )}
        </div>
      </div>

      {/* Social metrics */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard value={followers.length || 0} label="Followers" onClick={() => onNavigateSection?.("social")} />
        <MetricCard value={following.length || 0} label="Following" onClick={() => onNavigateSection?.("social")} />
        <MetricCard value={reputation} label="Reputation" onClick={() => onNavigateSection?.("analytics")} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((qa) => (
          <motion.button
            key={qa.label}
            whileTap={{ scale: 0.95 }}
            onClick={qa.onClick}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-[16px] bg-card shadow-sm"
          >
            <div className="w-8 h-8 rounded-[12px] bg-chocolate/10 flex items-center justify-center">
              <qa.icon className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
            </div>
            <span className="text-[9px] font-bold text-foreground">{qa.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Study Streak */}
      <StreakShowcase streak={streak} sessionDates={sessionDates} delay={0.1} />

      {/* Contribution */}
      <div className="flex items-center gap-3 p-3.5 rounded-[18px] bg-card shadow-sm">
        <div className="w-10 h-10 rounded-[14px] bg-warning/10 flex items-center justify-center">
          <Star className="w-5 h-5 text-warning" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-foreground">Contribution Score</p>
          <p className="text-[10px] text-muted-foreground">Your campus impact</p>
        </div>
        <p className="text-[18px] font-bold text-warning">{contribution}</p>
      </div>

      {/* Upcoming tasks */}
      <DeadlineAlertsBanner />

      {/* Bud insights */}
      <BudAcademicInsights />

      {/* Recent achievements */}
      {achievements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[15px] font-bold text-foreground tracking-tight">Recent Achievements</h3>
            <button onClick={() => onNavigateSection?.("achievements")} className="text-[11px] font-bold text-primary active:scale-95 transition-transform">View All</button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {achievements.map((a) => (
              <button key={a.id} onClick={() => navigate("/achievements/gallery")} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-20 p-2.5 rounded-[16px] bg-card shadow-sm active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <p className="text-[10px] font-bold text-foreground text-center line-clamp-2">{a.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ value, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center p-3 rounded-[14px] bg-card shadow-sm active:scale-95 transition-transform">
      <p className="text-[18px] font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </button>
  );
}