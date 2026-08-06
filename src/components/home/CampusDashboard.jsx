import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sun, Moon, Cloud, CalendarDays, BookOpen, Wallet, Users,
  Store, ArrowRight, Sparkles, ChevronRight,
} from "lucide-react";
import { EASE } from "@/lib/motion/motionPresets";

function getGreeting(hour) {
  if (hour < 12) return { text: "Good morning", icon: Sun, period: "morning" };
  if (hour < 17) return { text: "Good afternoon", icon: Sun, period: "afternoon" };
  if (hour < 21) return { text: "Good evening", icon: Moon, period: "evening" };
  return { text: "Good night", icon: Moon, period: "night" };
}

/**
 * CampusDashboard — the AI-powered home dashboard.
 * Personalized content that changes throughout the day.
 *
 * Props:
 *  - user: { name, image, faculty }
 *  - weather: { temp, condition }
 *  - schedule: [{ time, title, location }]
 *  - assignments: [{ title, due_date, subject }]
 *  - wallet: { balance, currency }
 *  - events: [{ title, date }]
 *  - friendsNearby: number
 *  - onAction: (actionId) => void
 */
export default function CampusDashboard({
  user = { name: "Student" },
  weather = { temp: 28, condition: "sunny" },
  schedule = [],
  assignments = [],
  wallet = { balance: 0, currency: "₦" },
  events = [],
  friendsNearby = 0,
  onAction,
}) {
  const [greeting, setGreeting] = useState(getGreeting(new Date().getHours()));
  const GreetingIcon = greeting.icon;

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting(new Date().getHours()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-6 space-y-4 max-w-[600px] mx-auto">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2">
          <GreetingIcon className="w-5 h-5 text-primary" strokeWidth={2} />
          <p className="text-[13px] text-muted-foreground font-medium">{greeting.text},</p>
        </div>
        <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-tight">
          {user.name}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Cloud className="w-3.5 h-3.5" strokeWidth={2} />
            {weather.temp}° {weather.condition}
          </span>
          {user.faculty && (
            <span className="text-[12px] text-muted-foreground">{user.faculty}</span>
          )}
        </div>
      </motion.div>

      {/* Bud proactive suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
        className="p-3 rounded-[18px] glass flex items-center gap-2.5"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-8 h-8 rounded-full gradient-bud flex items-center justify-center flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2.2} />
        </motion.div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Bud</p>
          <p className="text-[12px] text-foreground mt-0.5">
            {schedule.length > 0
              ? `You have ${schedule.length} classes today. First one at ${schedule[0]?.time}.`
              : "No classes today. Perfect time to catch up on assignments."}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
      </motion.div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={Wallet}
          label="Wallet"
          value={`${wallet.currency}${wallet.balance.toLocaleString()}`}
          color="hsl(var(--chocolate))"
          onClick={() => onAction?.("wallet")}
        />
        <StatCard
          icon={Users}
          label="Nearby"
          value={`${friendsNearby} friends`}
          color="hsl(var(--primary))"
          onClick={() => onAction?.("friends")}
        />
        <StatCard
          icon={BookOpen}
          label="GPA"
          value="3.8"
          color="hsl(var(--chocolate))"
          onClick={() => onAction?.("academics")}
        />
      </div>

      {/* Today's schedule */}
      {schedule.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE }}
        >
          <SectionHeader title="Today's Schedule" action={() => onAction?.("schedule")} />
          <div className="space-y-2 mt-2">
            {schedule.slice(0, 3).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.3, ease: EASE }}
                className="flex items-center gap-3 p-3 rounded-[16px] glass spring-tap"
                onClick={() => onAction?.("class")}
              >
                <div className="w-12 h-12 rounded-[14px] bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-primary uppercase">{item.time?.split(":")[0]}</span>
                  <span className="text-[14px] font-bold text-primary">{item.time?.split(":")[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.location}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Assignments due */}
      {assignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
        >
          <SectionHeader title="Assignments Due" action={() => onAction?.("assignments")} />
          <div className="space-y-2 mt-2">
            {assignments.slice(0, 2).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05, duration: 0.3, ease: EASE }}
                className="flex items-center gap-3 p-3 rounded-[16px] glass spring-tap"
                onClick={() => onAction?.("assignment")}
              >
                <div className="w-9 h-9 rounded-[12px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-foreground truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.subject}</p>
                </div>
                <span className="text-[10px] font-bold text-primary px-2 py-1 rounded-full bg-primary/10">
                  {item.due_date}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Events & Marketplace row */}
      <div className="grid grid-cols-2 gap-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
          className="p-3 rounded-[16px] gradient-chocolate text-white spring-tap"
          onClick={() => onAction?.("events")}
        >
          <CalendarDays className="w-4 h-4 mb-2" strokeWidth={2.2} />
          <p className="text-[14px] font-bold">{events.length} Events</p>
          <p className="text-[10px] text-white/70">Happening this week</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
          className="p-3 rounded-[16px] glass spring-tap"
          onClick={() => onAction?.("marketplace")}
        >
          <Store className="w-4 h-4 mb-2 text-primary" strokeWidth={2.2} />
          <p className="text-[14px] font-bold text-foreground">Marketplace</p>
          <p className="text-[10px] text-muted-foreground">Browse deals</p>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-start p-2.5 rounded-[14px] glass spring-tap"
    >
      <div className="w-7 h-7 rounded-[10px] flex items-center justify-center mb-1.5" style={{ background: `${color}15` }}>
        <Icon className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color }} />
      </div>
      <span className="text-[11px] font-bold text-foreground">{value}</span>
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </motion.button>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
      <button onClick={action} className="text-[11px] font-bold text-primary spring-tap">
        See all
      </button>
    </div>
  );
}