import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Activity, ChevronRight, CalendarDays, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];
const todayStr = new Date().toISOString().split("T")[0];

export default function HomeCampusPulse({ quadPosts }) {
  const navigate = useNavigate();
  const events = useQuery({ queryKey: ["homeCampusEvents"], queryFn: () => base44.entities.CampusEvent.list("date", 8) });

  const ev = (events.data || []).filter((e) => e.date && e.date >= todayStr).slice(0, 2);
  const posts = (quadPosts || []).slice(0, 3);

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <h2 className="font-heading font-bold text-[15px] text-foreground">Campus Pulse</h2>
        </div>
        <button onClick={() => navigate("/quad")} className="text-[11px] font-semibold text-primary flex items-center spring-tap">
          Live feed <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {posts.length === 0 && ev.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-muted-foreground">Campus is quiet right now.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {ev.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" />Happening soon</p>
              <div className="space-y-1.5">
                {ev.map((e) => (
                  <button key={e.id} onClick={() => navigate("/events")} className="w-full flex items-center gap-3 p-2 rounded-xl bg-muted/30 spring-tap text-left">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-foreground truncate">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground">{e.date}{e.start_time ? ` · ${e.start_time}` : ""}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {posts.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Trending on Quad</p>
              <div className="space-y-1.5">
                {posts.map((p) => (
                  <button key={p.id} onClick={() => navigate("/quad")} className="w-full flex items-center gap-3 p-2 rounded-xl bg-muted/30 spring-tap text-left">
                    <Activity className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="text-[12px] text-foreground truncate flex-1 min-w-0">{p.content || p.caption || p.title || "New post"}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}