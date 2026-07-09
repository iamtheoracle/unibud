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
        <Sparkles className="w-4 h-4 text-success" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Bud's Suggestions</h3>
      </div>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full bg-card rounded-2xl shadow-sm border border-border/30 p-3.5 flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg flex-shrink-0">{rec.icon}</div>
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