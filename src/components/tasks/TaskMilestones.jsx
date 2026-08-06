import React, { useState } from "react";
import { Check, Plus, Flag } from "lucide-react";
import { useToggleMilestone, useUpdateTask } from "@/lib/tasks/useTasks";

export default function TaskMilestones({ task, actor }) {
  const toggle = useToggleMilestone();
  const update = useUpdateTask();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const list = task.milestones || [];

  const add = async () => {
    if (!title.trim()) return;
    await update.mutateAsync({
      task,
      patch: { milestones: [...list, { title: title.trim(), due_date: due || undefined, done: false }] },
      actor,
      activity: { action: "milestone_reached", detail: `Added milestone “${title.trim()}”` },
    });
    setTitle(""); setDue("");
  };

  return (
    <div className="crystal-card p-4">
      <h3 className="text-[13px] font-heading font-semibold mb-3 flex items-center gap-2"><Flag className="w-4 h-4 text-primary" />Milestones</h3>
      <div className="space-y-2">
        {list.map((m, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <button onClick={() => toggle.mutateAsync({ task, index: i, actor })}
              className={`w-6 h-6 rounded-full border-2 grid place-items-center shrink-0 spring-tap ${m.done ? "bg-success border-success" : "border-border"}`}>
              {m.done && <Check className="w-3.5 h-3.5 text-success-foreground" />}
            </button>
            <div className="flex-1 min-w-0">
              <span className={`text-[13px] ${m.done ? "line-through text-muted-foreground" : ""}`}>{m.title}</span>
              {m.due_date && <span className="text-[10px] text-muted-foreground ml-2">{m.due_date}</span>}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-[12px] text-muted-foreground py-1">No milestones yet.</p>}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone" className="flex-1 h-9 px-3 rounded-xl bg-muted/40 border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-9 px-2 rounded-xl bg-muted/40 border border-border text-[12px]" />
        <button onClick={add} className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center spring-tap"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
}