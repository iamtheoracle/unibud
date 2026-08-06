import React from "react";
import { motion } from "framer-motion";
import {
  Radio, TrendingUp, Users, CalendarDays, Store, Award, Activity,
  ArrowUpRight, Flame, Eye,
} from "lucide-react";
import { EASE } from "@/lib/motion/motionPresets";

const PULSE_ITEMS = [
  { id: "live", icon: Radio, label: "Live Now", color: "hsl(0 84% 60%)", format: (v) => `${v} streams` },
  { id: "trending", icon: TrendingUp, label: "Trending", color: "hsl(251 90% 67%)", format: (v) => `${v} posts` },
  { id: "active", icon: Users, label: "Active Students", color: "hsl(142 71% 45%)", format: (v) => `${v} online` },
  { id: "events", icon: CalendarDays, label: "Events Today", color: "hsl(24 90% 55%)", format: (v) => `${v} events` },
  { id: "marketplace", icon: Store, label: "New Listings", color: "hsl(46 74% 55%)", format: (v) => `${v} items` },
  { id: "scholarships", icon: Award, label: "Scholarships", color: "hsl(280 65% 60%)", format: (v) => `${v} open` },
];

/**
 * CampusPulseWidget — live campus activity pulse widget.
 * Shows real-time campus activity metrics with animated indicators.
 *
 * Props:
 *  - data: { live, trending, active, events, marketplace, scholarships }
 *  - onItemPress: (item) => void
 *  - variant: "full" | "compact"
 */
export default function CampusPulseWidget({ data = {}, onItemPress, variant = "full" }) {
  const items = PULSE_ITEMS.map((item) => ({
    ...item,
    value: data[item.id] || 0,
  }));

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="crystal-card rounded-[14px] p-2.5"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-destructive"
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Campus Pulse</span>
          <Activity className="w-3 h-3 text-muted-foreground ml-auto" strokeWidth={2.2} />
        </div>
        <div className="flex items-center gap-3">
          {items.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onItemPress?.(item)}
                className="flex items-center gap-1 spring-tap flex-1"
              >
                <Icon className="w-3 h-3 flex-shrink-0" strokeWidth={2.2} style={{ color: item.color }} />
                <span className="text-[10px] font-bold text-foreground tabular-nums">{item.value}</span>
                <span className="text-[9px] text-muted-foreground truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="crystal-card rounded-[18px] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-destructive"
          />
          <h4 className="text-[13px] font-bold text-foreground">Campus Pulse</h4>
        </div>
        <span className="text-[9px] text-muted-foreground">Live</span>
      </div>

      {/* Pulse grid */}
      <div className="grid grid-cols-3 gap-px bg-border/20">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isLive = item.id === "live" && item.value > 0;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.25, ease: EASE }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onItemPress?.(item)}
              className="flex flex-col items-center gap-1 py-3 px-2 bg-card/50 spring-tap relative overflow-hidden"
            >
              {/* Live glow */}
              {isLive && (
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0"
                  style={{ background: `radial-gradient(circle at 50% 30%, ${item.color}15, transparent 70%)` }}
                />
              )}

              <div className="relative z-10">
                <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: item.color }} />
              </div>
              <motion.span
                key={item.value}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[14px] font-bold text-foreground tabular-nums relative z-10"
              >
                {item.value}
              </motion.span>
              <span className="text-[8px] text-muted-foreground text-center leading-tight relative z-10">{item.label}</span>

              {/* Live indicator */}
              {isLive && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 z-10">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-destructive"
                  />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer with trending topic */}
      {data.trending_topic && (
        <div className="flex items-center gap-2 px-3.5 py-2 border-t border-border/30">
          <Flame className="w-3 h-3 text-primary" strokeWidth={2.2} />
          <span className="text-[10px] text-muted-foreground flex-1 truncate">
            <span className="font-bold text-foreground">#{data.trending_topic}</span> is trending
          </span>
          <button className="flex items-center gap-0.5 text-[10px] font-bold text-primary spring-tap">
            <Eye className="w-2.5 h-2.5" strokeWidth={2.2} />
            View
            <ArrowUpRight className="w-2.5 h-2.5" strokeWidth={2.2} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export { PULSE_ITEMS };