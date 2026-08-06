import { motion } from "framer-motion";

const TYPE_COLOR = {
  admission: "217 91% 60%",
  orientation: "142 71% 45%",
  semester_started: "262 83% 58%",
  course_completed: "38 92% 50%",
  research_published: "38 92% 50%",
  competition_won: "46 70% 50%",
  project_completed: "142 71% 45%",
  leadership_role: "262 83% 58%",
  internship: "142 71% 45%",
  award: "46 70% 50%",
  scholarship: "46 70% 50%",
  graduation: "217 91% 60%",
  alumni: "215 16% 45%",
  custom: "215 16% 45%",
};

export default function MilestoneTimeline({ milestones = [], reduced }) {
  if (!milestones.length) {
    return <div className="py-8 text-center text-[12px] text-muted-foreground">No academic milestones recorded yet.</div>;
  }
  return (
    <div className="relative pl-5">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border/60" />
      {milestones.map((m, i) => {
        const accent = TYPE_COLOR[m.entry_type] || "215 16% 45%";
        return (
          <motion.div
            key={m.id || i}
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : i * 0.04 }}
            className="relative mb-3.5 last:mb-0"
          >
            <span className="absolute -left-[15px] top-1 w-3 h-3 rounded-full border-2 border-background" style={{ background: `hsl(${accent})` }} />
            <p className="text-[13px] font-semibold text-foreground leading-tight">{m.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {m.subtitle ? `${m.subtitle} · ` : ""}
              {m.date ? new Date(m.date).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : ""}
              {m.is_verified ? " · ✓ verified" : ""}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}