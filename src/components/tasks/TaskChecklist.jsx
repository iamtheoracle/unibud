import React, { useState } from "react";
import { Check, Loader2, Plus, Sparkles } from "lucide-react";
import { useToggleChecklist, useUpdateTask } from "@/lib/tasks/useTasks";
import { sparkTaskAssist } from "@/lib/tasks/budTaskIntent";
import { useToast } from "@/components/ui/use-toast";

export default function TaskChecklist({ task, actor }) {
  const { toast } = useToast();
  const toggle = useToggleChecklist();
  const update = useUpdateTask();
  const [adding, setAdding] = useState("");
  const [busy, setBusy] = useState(false);
  const list = task.checklist || [];
  const done = list.filter((c) => c.done).length;

  const add = async () => {
    if (!adding.trim()) return;
    await update.mutateAsync({
      task,
      patch: { checklist: [...list, { text: adding.trim(), done: false }] },
      actor,
      activity: { action: "checklist_added", detail: `Added checklist item “${adding.trim()}”` },
    });
    setAdding("");
  };

  const generate = async () => {
    setBusy(true);
    try {
      const res = await sparkTaskAssist(task, "subtasks");
      const items = res.checklist || [];
      if (!items.length) { toast({ title: "No suggestions", variant: "destructive" }); return; }
      await update.mutateAsync({
        task,
        patch: { checklist: [...list, ...items.map((t) => ({ text: t, done: false }))] },
        actor,
        activity: { action: "checklist_added", detail: `Bud generated ${items.length} subtasks` },
      });
      toast({ title: "Bud added subtasks", description: `${items.length} items added.` });
    } catch (e) {
      toast({ title: "Bud could not generate", description: e?.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="crystal-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-heading font-semibold">Checklist</h3>
        <button onClick={generate} disabled={busy} className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold spring-tap disabled:opacity-50">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {busy ? "Generating…" : "Bud subtasks"}
        </button>
      </div>

      <div className="text-[11px] text-muted-foreground mb-3">{done}/{list.length} complete</div>

      <div className="space-y-1.5">
        {list.map((c, i) => (
          <button key={i} onClick={() => toggle.mutateAsync({ task, index: i, actor })}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/40 spring-tap text-left">
            <span className={`w-5 h-5 rounded-md border-2 grid place-items-center shrink-0 ${c.done ? "bg-primary border-primary" : "border-border"}`}>
              {c.done && <Check className="w-3 h-3 text-primary-foreground" />}
            </span>
            <span className={`text-[13px] flex-1 ${c.done ? "line-through text-muted-foreground" : ""}`}>{c.text}</span>
            {c.done_by_name && <span className="text-[10px] text-muted-foreground">by {c.done_by_name.split(" ")[0]}</span>}
          </button>
        ))}
        {list.length === 0 && <p className="text-[12px] text-muted-foreground py-2">No checklist items yet.</p>}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <input
          value={adding} onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a checklist item"
          className="flex-1 h-9 px-3 rounded-xl bg-muted/40 border border-border text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button onClick={add} className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center spring-tap"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
}