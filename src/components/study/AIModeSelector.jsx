import React from "react";

const MODES = [
  ["simple", "Simple English"],
  ["exam", "Exam Mode"],
  ["research", "Research Mode"],
  ["assignment", "Assignment Mode"],
  ["project", "Project Mode"],
  ["revision", "Revision Mode"],
  ["tutor", "Tutor Mode"],
  ["interview", "Interview Mode"],
];

/** AIModeSelector — switches Bud's approach per task. */
export default function AIModeSelector({ mode, setMode }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {MODES.map(([k, l]) => (
        <button key={k} onClick={() => setMode(k)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${mode === k ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{l}</button>
      ))}
    </div>
  );
}