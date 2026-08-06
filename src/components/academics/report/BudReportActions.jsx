import { TrendingUp, Timer, Brain, Target } from "lucide-react";
import { useBudPanel } from "@/lib/BudPanelContext";
import { buildBudReportContext } from "@/lib/academics/reportEngine";

const ACTIONS = [
  { key: "gpa", label: "What improved my GPA?", icon: TrendingUp, q: "What improved my GPA this semester?" },
  { key: "streak", label: "Why did my streak reset?", icon: Timer, q: "Why did my study streak reset?" },
  { key: "next", label: "What should I study next?", icon: Brain, q: "What should I study next?" },
  { key: "goal", label: "How can I reach a 4.5 GPA?", icon: Target, q: "How can I reach a 4.5 GPA?" },
];

export default function BudReportActions({ report }) {
  const { openBud } = useBudPanel();
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.key}
            onClick={() => openBud(buildBudReportContext(a.q, report))}
            className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border/40 text-[12px] font-semibold text-foreground spring-tap"
          >
            <Icon className="w-3.5 h-3.5 text-primary" />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}