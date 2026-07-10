import React, { useState, useEffect } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_RECS = [
  { icon: "📝", title: "Finish CSC 302 Assignment", desc: "Due tomorrow at 11:59 PM", priority: "high", path: "/assignments" },
  { icon: "📚", title: "Review Data Structures", desc: "Exam in 12 days — weak topic detected", priority: "medium", path: "/academics" },
  { icon: "🎓", title: "MTN Scholarship", desc: "Deadline in 5 days — you're eligible!", priority: "high", path: "/opportunities" },
];

export default function SmartRecommendations() {
  const { isDemoMode } = useDemoMode();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: assignments } = useQuery({
    queryKey: ["recAssignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 10),
    enabled: !isDemoMode,
  });
  const { data: exams } = useQuery({
    queryKey: ["recExams"],
    queryFn: () => base44.entities.Exam.filter({ status: "upcoming" }, "date", 5),
    enabled: !isDemoMode,
  });
  const { data: opportunities } = useQuery({
    queryKey: ["recOpportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 5),
    enabled: !isDemoMode,
  });

  useEffect(() => {
    if (isDemoMode) {
      setRecs(DEMO_RECS);
      setLoading(false);
      return;
    }

    const pending = (assignments || []).filter((a) => a.status === "pending");
    const upcoming = (exams || []).filter((e) => new Date(e.date) > new Date());
    const opps = (opportunities || []).filter((o) => !o.is_saved);

    const items = [];
    if (pending.length > 0) {
      const next = pending[0];
      items.push({
        icon: "📝",
        title: next.title,
        desc: "Due " + new Date(next.due_date).toLocaleDateString("en", { month: "short", day: "numeric" }),
        priority: "high",
        path: "/assignments",
      });
    }
    if (upcoming.length > 0) {
      const nextExam = upcoming[0];
      const days = Math.ceil((new Date(nextExam.date) - new Date()) / 86400000);
      items.push({
        icon: "📚",
        title: "Prepare for " + nextExam.course_code,
        desc: "Exam in " + days + " days",
        priority: days <= 7 ? "high" : "medium",
        path: "/academics",
      });
    }
    if (opps.length > 0) {
      const nextOpp = opps[0];
      items.push({
        icon: "🎓",
        title: nextOpp.title,
        desc: nextOpp.organization || "New opportunity",
        priority: "high",
        path: "/opportunities",
      });
    }

    setRecs(items.slice(0, 4));
    setLoading(false);
  }, [isDemoMode, assignments, exams, opportunities]);

  if (loading && !isDemoMode) {
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-[16px] text-foreground">Bud's Suggestions</h3>
        </div>
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-[60px] rounded-[20px] shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (recs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Bud's Suggestions</h3>
      </div>
      <div className="space-y-2.5">
        <AnimatePresence>
          {recs.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={rec.path} className="block">
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-card rounded-[20px] soft-shadow border border-border/20 p-4 flex items-center gap-3.5 text-left card-hover"
                >
                  <div className="w-11 h-11 rounded-[14px] bg-muted flex items-center justify-center text-lg flex-shrink-0">{rec.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-foreground truncate">{rec.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{rec.desc}</p>
                  </div>
                  <div className={"w-2 h-2 rounded-full flex-shrink-0 " + (rec.priority === "high" ? "bg-destructive" : "bg-warning")} />
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}