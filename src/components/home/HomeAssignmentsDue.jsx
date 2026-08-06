import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
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
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">Assignments Due</h2>
        <button onClick={() => navigate("/assignments")} className="text-[12px] font-medium text-foreground/60 flex items-center spring-tap hover:text-foreground transition-colors">
          All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-4">
          <p className="text-[14px] text-muted-foreground">Nothing due right now. Enjoy the breather.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/25">
          {items.map((a) => {
            const days = Math.ceil((new Date(a.due_date) - new Date(todayStr)) / 86400000);
            const soon = days <= 2;
            return (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-foreground truncate">{a.title}</p>
                  <p className="text-[12px] text-muted-foreground truncate mt-0.5">{a.course_code || "—"}</p>
                </div>
                <span className={`text-[11px] font-semibold tabular-nums shrink-0 ${soon ? "text-foreground" : "text-muted-foreground/60"}`}>
                  {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                </span>
                <button
                  onClick={() => openWithPrompt(`Explain the assignment "${a.title}"${a.course_code ? ` for ${a.course_code}` : ""} step by step so I know exactly what to do.`)}
                  className="w-8 h-8 rounded-full flex items-center justify-center spring-tap shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Ask Bud to explain"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={1.7} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}