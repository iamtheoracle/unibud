import React from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const recommendations = [
  { icon: "📝", title: "Finish CSC 302 Assignment", desc: "Due tomorrow at 11:59 PM", priority: "high" },
  { icon: "📚", title: "Review Data Structures", desc: "Exam in 12 days — weak topic detected", priority: "medium" },
  { icon: "🎓", title: "MTN Scholarship", desc: "Deadline in 5 days — you're eligible!", priority: "high" },
];

export default function SmartRecommendations() {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Bud's Suggestions</h3>
      </div>
      <div className="space-y-2.5">
        {recommendations.map((rec, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex items-center gap-3.5 text-left card-hover"
          >
            <div className="w-11 h-11 rounded-[14px] bg-muted flex items-center justify-center text-lg flex-shrink-0">{rec.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-[13px] text-foreground">{rec.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{rec.desc}</p>
            </div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${rec.priority === "high" ? "bg-destructive" : "bg-warning"}`} />
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}