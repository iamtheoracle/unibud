import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AchievementBadge from "./AchievementBadge";
import { Loader2, Trophy, Lock, Eye, EyeOff } from "lucide-react";

const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private", icon: Lock },
  { value: "friends", label: "Friends", icon: EyeOff },
  { value: "university", label: "University", icon: Eye },
  { value: "public", label: "Public", icon: Eye },
];

export default function AchievementTimeline({ limit }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const res = await base44.functions.invoke("checkAchievements", { action: "list" });
      const data = res?.data || res;
      setAchievements(data.achievements || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateVisibility = async (id, visibility) => {
    try {
      await base44.functions.invoke("checkAchievements", {
        action: "update_visibility",
        achievement_id: id,
        visibility,
      });
      setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, visibility } : a)));
      setEditingId(null);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  const list = limit ? achievements.slice(0, limit) : achievements;

  if (list.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-[13px] text-muted-foreground">
          Your achievements will appear here as you progress.
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Study, complete assignments, and join campus life to earn your first badge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {list.map((ach, idx) => {
        const isLast = idx === list.length - 1;
        const isEditing = editingId === ach.id;
        return (
          <div key={ach.id} className="relative">
            {!isLast && (
              <div className="absolute left-[19px] top-12 bottom-0 w-px bg-border/40" />
            )}
            <div className="relative flex gap-3 p-2.5 rounded-xl hover:bg-muted/20 spring-tap">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-xl grid place-items-center"
                  style={{
                    background: `hsl(${ach.accent_color || "142 71% 45%"} / 0.14)`,
                    color: `hsl(${ach.accent_color || "142 71% 45%"})`,
                  }}
                >
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground">{ach.title}</p>
                <p className="text-[12px] text-muted-foreground">{ach.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {ach.date_earned ? new Date(ach.date_earned).toLocaleDateString("en", {
                      month: "short", day: "numeric", year: "numeric",
                    }) : "—"}
                  </span>
                  {ach.related_course && (
                    <span className="text-[11px] text-muted-foreground">· {ach.related_course}</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingId(isEditing ? null : ach.id); }}
                    className="text-[11px] text-primary font-medium ml-auto spring-tap"
                  >
                    {ach.visibility || "private"}
                  </button>
                </div>

                {isEditing && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2 rounded-lg bg-muted/30">
                    {VISIBILITY_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const active = (ach.visibility || "private") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={(e) => { e.stopPropagation(); updateVisibility(ach.id, opt.value); }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium spring-tap ${
                            active ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}