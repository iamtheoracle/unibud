import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FileText, Sparkles, ChevronRight } from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";

const EASE = [0.16, 1, 0.3, 1];
const todayStr = new Date().toISOString().split("T")[0];

export default function HomeAssignmentsDue({ assignments }) {
  const navigate = useNavigate();
  const { openWithPrompt } = useBudLauncher();

  const items = (assignments || [])
    .filter((a) => a.status === "pending" && a.due_date && a.due_date.split("T")[0] >= todayStr)
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
    .slice(0, 4);

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Assignments Due</h2>
        </div>
        <button onClick={() => navigate("/assignments")} className="text-[11px] font-semibold text-primary flex items-center spring-tap">
          All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-muted-foreground">Nothing due right now. Enjoy the breather.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((a) => {
            const days = Math.ceil((new Date(a.due_date) - new Date(todayStr)) / 86400000);
            const soon = days <= 2;
            return (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground truncate">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{a.course_code || "—"}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${soon ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}>
                  {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                </span>
                <button
                  onClick={() => openWithPrompt(`Explain the assignment "${a.title}"${a.course_code ? ` for ${a.course_code}` : ""} step by step so I know exactly what to do.`)}
                  className="w-8 h-8 rounded-full glass text-primary flex items-center justify-center spring-tap shrink-0"
                  aria-label="Ask Bud to explain"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}