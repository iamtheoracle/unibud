import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Award, ChevronRight, Trophy, BookOpen } from "lucide-react";
import BadgesSection from "@/components/me/BadgesSection";

export default function AchievementsSection({ user, isOwnProfile }) {
  const navigate = useNavigate();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-date_earned", 100),
  });

  return (
    <div className="space-y-4">
      {/* Gallery link */}
      <button
        onClick={() => navigate("/achievements/gallery")}
        className="w-full flex items-center gap-3 p-3.5 rounded-[18px] bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
      >
        <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-5 h-5 text-primary" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-foreground">Achievement Gallery</p>
          <p className="text-[10px] text-muted-foreground">{achievements.length} milestones earned</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
      </button>

      {/* Achievements grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-[16px] bg-card shadow-sm animate-pulse" />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <div className="w-14 h-14 rounded-[18px] bg-muted flex items-center justify-center">
            <Award className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} />
          </div>
          <p className="text-[13px] text-muted-foreground">No achievements yet</p>
          <p className="text-[11px] text-muted-foreground/70">Earn achievements by reaching academic milestones</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {achievements.map((a) => (
            <div key={a.id} className="flex flex-col items-center gap-2 p-3 rounded-[16px] bg-card shadow-sm">
              <div className="w-12 h-12 rounded-[14px] bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" strokeWidth={2} />
              </div>
              <p className="text-[11px] font-bold text-foreground text-center">{a.title}</p>
              {a.description && <p className="text-[9px] text-muted-foreground text-center line-clamp-2">{a.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      <BadgesSection />
    </div>
  );
}