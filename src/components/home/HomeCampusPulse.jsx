import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];
const todayStr = new Date().toISOString().split("T")[0];

export default function HomeCampusPulse({ quadPosts }) {
  const navigate = useNavigate();
  const events = useQuery({ queryKey: ["homeCampusEvents"], queryFn: () => base44.entities.CampusEvent.list("date", 8) });

  const ev = (events.data || []).filter((e) => e.date && e.date >= todayStr).slice(0, 2);
  const posts = (quadPosts || []).slice(0, 3);

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">Campus Pulse</h2>
        </div>
        <button onClick={() => navigate("/quad")} className="text-[12px] font-medium text-foreground/60 flex items-center spring-tap hover:text-foreground transition-colors">
          Live feed <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {posts.length === 0 && ev.length === 0 ? (
        <div className="py-4">
          <p className="text-[14px] text-muted-foreground">Campus is quiet right now.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {ev.length > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground/60 mb-2">Happening soon</p>
              <div className="divide-y divide-border/25">
                {ev.map((e) => (
                  <button key={e.id} onClick={() => navigate("/events")} className="w-full flex items-center gap-3 py-3 spring-tap text-left">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-foreground truncate">{e.title}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{e.date}{e.start_time ? ` · ${e.start_time}` : ""}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {posts.length > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground/60 mb-2">Trending</p>
              <div className="divide-y divide-border/25">
                {posts.map((p) => (
                  <button key={p.id} onClick={() => navigate("/quad")} className="w-full flex items-center gap-3 py-3 spring-tap text-left">
                    <p className="text-[14px] text-foreground/80 truncate flex-1 min-w-0">{p.content || p.caption || p.title || "New post"}</p>
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