import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { rankTools, buildGreeting, setGoals, getGoals, TOOL_DEFINITIONS } from "@/lib/unibud";
import BudOrb from "@/components/brand/BudOrb";
import UnibudMark from "@/components/brand/UnibudMark";

const GOAL_OPTIONS = [
  { key: "grades",    label: "Raise my grades" },
  { key: "review",    label: "Get ready for exams" },
  { key: "deadlines", label: "Stop missing deadlines" },
  { key: "community", label: "Find people to work with" },
];

const EASE = [0.16, 1, 0.3, 1];

export default function UnibudDashboard() {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [goalTags, setGoalTagsState] = useState([]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setGoalTagsState(getGoals(u?.id || "guest"));
    }).catch(() => {});
  }, []);

  const toggleGoal = (key) => {
    const next = goalTags.includes(key)
      ? goalTags.filter((k) => k !== key)
      : [...goalTags, key];
    setGoalTagsState(next);
    setGoals(user?.id || "guest", next);
  };

  const pick     = useMemo(() => rankTools(goalTags), [goalTags]);
  const greeting = useMemo(() => buildGreeting(user?.full_name?.split(" ")[0] || "there", goalTags), [user, goalTags]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/30">
        <div className="max-w-3xl mx-auto px-5 py-6">
          <div className="flex items-center gap-2.5 mb-4">
            <BudOrb className="w-8 h-8 text-primary" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Bud · UNIBUD</span>
          </div>
          <motion.h1
            key={greeting}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="font-heading font-bold text-[22px] lg:text-[28px] text-foreground leading-snug"
          >
            {greeting}
          </motion.h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-8">

        {/* Goal chips */}
        <section>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            What are you working toward?
          </p>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((g) => {
              const active = goalTags.includes(g.key);
              return (
                <motion.button
                  key={g.key}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleGoal(g.key)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {g.label}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Bud's pick */}
        <AnimatePresence mode="wait">
          {pick ? (
            <motion.div
              key={pick.tool.id}
              initial={{ opacity: 0, rotate: -4, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, rotate: -1.5, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.42, ease: [0.2, 0.9, 0.3, 1.3] }}
              className="relative inline-block max-w-sm"
            >
              <div className="relative bg-[hsl(46_65%_95%)] dark:bg-[hsl(46_20%_14%)] border border-border rounded-lg p-5 elevated-shadow">
                <Pin className="absolute -top-2 left-4 w-4 h-4 text-warning rotate-12" fill="currentColor" />
                <p className="text-[10px] font-bold text-warning uppercase tracking-widest mb-1">Bud's pick</p>
                <p className="font-heading font-bold text-[17px] text-foreground mb-1">Start with {pick.tool.name}</p>
                <p className="text-[13px] text-muted-foreground">{pick.tool.stat} — matches what you told me.</p>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[13px] text-muted-foreground italic"
            >
              Pick a goal above and I'll point you at one tool to start with.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Tool grid */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TOOL_DEFINITIONS.map((tool, i) => {
              const Icon  = tool.icon;
              const isPick = pick?.tool.id === tool.id;
              return (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(tool.path)}
                  className={`text-left p-5 rounded-[22px] bg-card border transition-all elevated-shadow ${
                    isPick ? "border-primary/40 ring-1 ring-primary/20" : "border-border/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center mb-3 ${
                    isPick ? "bg-primary/15" : "bg-muted/50"
                  }`}>
                    <Icon className={`w-5 h-5 ${isPick ? "text-primary" : "text-foreground"}`} strokeWidth={2.2} />
                  </div>
                  <p className="font-heading font-bold text-[15px] text-foreground mb-1">{tool.name}</p>
                  <p className="text-[12px] text-muted-foreground leading-snug mb-3">{tool.description}</p>
                  <p className="text-[11px] font-semibold text-primary">{tool.stat}</p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Footer mark */}
        <div className="flex items-center gap-2 pt-2 opacity-40">
          <UnibudMark className="w-5 h-5 text-foreground" />
          <span className="text-[11px] text-muted-foreground">Powered by Bud · Spark Intelligence</span>
        </div>
      </div>
    </div>
  );
}