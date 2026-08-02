import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ChevronLeft, Trophy, Loader2, RefreshCw } from "lucide-react";
import AchievementTimeline from "@/components/academic/AchievementTimeline";
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENTS } from "@/lib/academic/achievementCatalog";
import { ICON_MAP } from "@/components/academic/AchievementBadge";

const EASE = [0.16, 1, 0.3, 1];

export default function Achievements() {
  const [earned, setEarned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);

  const load = async () => {
    try {
      const res = await base44.functions.invoke("checkAchievements", { action: "list" });
      const data = res?.data || res;
      setEarned(data.achievements || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const checkNow = async () => {
    setChecking(true);
    try {
      const res = await base44.functions.invoke("checkAchievements", { action: "check" });
      const data = res?.data || res;
      if (data.newly_earned && data.newly_earned.length > 0) {
        setNewAchievements(data.newly_earned);
      }
      await load();
    } catch {}
    finally { setChecking(false); }
  };

  const earnedKeys = new Set(earned.map((a) => a.achievement_key));

  return (
    <div className="min-h-screen pb-32 safe-area-pt">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-[520px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/academics" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap">
            <ChevronLeft className="w-[20px] h-[20px] text-foreground" strokeWidth={2} />
          </Link>
          <h1 className="text-[18px] font-bold tracking-tight text-foreground">Achievements</h1>
          <button
            onClick={checkNow}
            disabled={checking}
            className="ml-auto w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
          >
            <RefreshCw className={"w-[18px] h-[18px] text-foreground " + (checking ? "animate-spin" : "")} />
          </button>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4">
        {/* New achievements celebration */}
        {newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-2xl crystal-card border-primary/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-[14px] font-bold text-foreground">
                {newAchievements.length === 1 ? "New Achievement!" : newAchievements.length + " New Achievements!"}
              </span>
            </div>
            {newAchievements.map((ach) => {
              const Icon = ICON_MAP[ach.icon] || Trophy;
              return (
                <div key={ach.id} className="flex items-center gap-2.5 py-2">
                  <div
                    className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
                    style={{ background: "hsl(" + ach.accent_color + " / 0.14)", color: "hsl(" + ach.accent_color + ")" }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{ach.title}</p>
                    <p className="text-[11px] text-muted-foreground">{ach.bud_message}</p>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => setNewAchievements([])}
              className="text-[12px] text-primary font-medium mt-2 spring-tap"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Summary */}
        <div className="flex items-center gap-3 mb-4 p-4 rounded-2xl glass-card">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 grid place-items-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[22px] font-bold text-foreground tabular-nums">{earned.length}</p>
            <p className="text-[12px] text-muted-foreground">of {ACHIEVEMENTS.length} achievements earned</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Category sections with progress */}
            {ACHIEVEMENT_CATEGORIES.map((cat) => {
              const catAch = ACHIEVEMENTS.filter((a) => a.category === cat.id);
              const earnedInCat = catAch.filter((a) => earnedKeys.has(a.key));
              const CatIcon = ICON_MAP[cat.icon] || Trophy;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="mb-4"
                >
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div
                      className="w-7 h-7 rounded-lg grid place-items-center"
                      style={{ background: "hsl(" + cat.color + " / 0.14)", color: "hsl(" + cat.color + ")" }}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-[14px] font-bold text-foreground">{cat.label}</h2>
                    <span className="text-[12px] text-muted-foreground ml-auto">
                      {earnedInCat.length}/{catAch.length}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 rounded-full bg-muted mb-2 mx-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: catAch.length > 0 ? ((earnedInCat.length / catAch.length) * 100) + "%" : "0%",
                        background: "hsl(" + cat.color + ")",
                      }}
                    />
                  </div>

                  {/* Achievement badges */}
                  <div className="grid grid-cols-1 gap-1.5">
                    {catAch.map((ach) => {
                      const isEarned = earnedKeys.has(ach.key);
                      const earnedRecord = earned.find((e) => e.achievement_key === ach.key);
                      const Icon = ICON_MAP[ach.icon] || Trophy;
                      return (
                        <div
                          key={ach.key}
                          className={"flex items-center gap-2.5 p-2.5 rounded-xl " + (isEarned ? "glass-card" : "opacity-40")}
                        >
                          <div
                            className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
                            style={{
                              background: isEarned ? "hsl(" + ach.color + " / 0.14)" : "hsl(var(--muted))",
                              color: isEarned ? "hsl(" + ach.color + ")" : "hsl(var(--muted-foreground))",
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-foreground">{ach.title}</p>
                            <p className="text-[11px] text-muted-foreground">{ach.description}</p>
                          </div>
                          {isEarned && earnedRecord && earnedRecord.date_earned && (
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(earnedRecord.date_earned).toLocaleDateString("en", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Achievement timeline */}
            {earned.length > 0 && (
              <div className="mt-6">
                <h2 className="text-[14px] font-bold text-foreground mb-3 px-1">Achievement Timeline</h2>
                <div className="glass-card rounded-2xl p-2">
                  <AchievementTimeline />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}