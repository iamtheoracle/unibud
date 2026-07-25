import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ConfigManager from "@/components/architect/ConfigManager";
import { useEditor } from "@/lib/architect/editorState";
import { EditorToolbar, Palette, Btn } from "@/components/architect/architect-ui";
import { Workflow, Trash2, GripVertical, Play, GitBranch, CheckCircle2, XCircle, UserPlus, Bell, Code2, Clock, Filter, Repeat, Flag } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 9);
const STEPS = [
  { key: "start", label: "Start", icon: Play },
  { key: "decision", label: "Decision", icon: GitBranch },
  { key: "approval", label: "Approval", icon: CheckCircle2 },
  { key: "rejection", label: "Rejection", icon: XCircle },
  { key: "assignment", label: "Assignment", icon: UserPlus },
  { key: "notification", label: "Notifications", icon: Bell },
  { key: "api_call", label: "API Call", icon: Code2 },
  { key: "delay", label: "Delay", icon: Clock },
  { key: "condition", label: "Condition", icon: Filter },
  { key: "loop", label: "Loop", icon: Repeat },
  { key: "completion", label: "Completion", icon: Flag },
];
const DEFAULT = { steps: [] };

export default function WorkflowBuilder() {
  return <ConfigManager type="workflow" label="Workflows" singular="workflow" icon={Workflow} Editor={WorkflowEditor} defaultConfig={DEFAULT} />;
}

function WorkflowEditor({ record, defaultConfig, onSave, onSaveName, onClose, onPublish, onRollback }) {
  const { state, set, undo, redo, canUndo, canRedo, saving, lastSaved, saveNow, publishNow } = useEditor(record, { onSave, onPublish, defaultConfig });
  const [name, setName] = useState(record?.name || "");
  const onName = (v) => { setName(v); onSaveName(record.id, v); };

  const steps = state.steps || [];
  const add = (p) => set((s) => ({ ...s, steps: [...(s.steps || []), { id: uid(), type: p.key, name: p.label, config: "" }] }));
  const upd = (i, patch) => set((s) => ({ ...s, steps: s.steps.map((st, idx) => idx === i ? { ...st, ...patch } : st) }));
  const del = (i) => set((s) => ({ ...s, steps: s.steps.filter((_, idx) => idx !== i) }));
  const onDragEnd = (r) => { if (!r.destination || r.destination.index === r.source.index) return; set((s) => { const arr = [...s.steps]; const [m] = arr.splice(r.source.index, 1); arr.splice(r.destination.index, 0, m); return { ...s, steps: arr }; }); };

  const tone = (t) => t === "start" ? "border-l-primary" : t === "rejection" ? "border-l-destructive" : t === "approval" || t === "completion" ? "border-l-success" : t === "decision" || t === "condition" ? "border-l-information" : "border-l-muted-foreground";

  return (
    <div>
      <EditorToolbar name={name} onName={onName} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onSave={saveNow} saving={saving} onPublish={publishNow} onRollback={() => onRollback(record.id)} status={record?.status} onClose={onClose} lastSaved={lastSaved} />
      <div className="flex gap-4 flex-col lg:flex-row">
        <Palette items={STEPS} onAdd={add} title="Workflow Steps" />
        <div className="flex-1 min-w-0">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="wf-canvas">
              {(prov) => (
                <div ref={prov.innerRef} {...prov.droppableProps} className="space-y-2 min-h-[200px]">
                  {steps.length === 0 && <div className="border-2 border-dashed border-border rounded-xl py-16 text-center text-muted-foreground text-[13px]">Add steps to design your workflow</div>}
                  {steps.map((st, i) => (
                    <Draggable key={st.id} draggableId={st.id} index={i}>
                      {(p) => (
                        <div ref={p.innerRef} {...p.draggableProps} className={`glass-card radius-lg p-3 border-l-4 ${tone(st.type)}`}>
                          <div className="flex items-center gap-2" {...p.dragHandleProps}>
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-[100px] shrink-0">{st.type}</span>
                            <input value={st.name} onChange={(e) => upd(i, { name: e.target.value })} className="oracle-input flex-1" placeholder="Step name" />
                            <Btn variant="ghost" onClick={() => del(i)}><Trash2 className="w-3 h-3" /></Btn>
                          </div>
                          <input value={st.config || ""} onChange={(e) => upd(i, { config: e.target.value })} className="oracle-input mt-2 ml-7" placeholder="Configuration / expression (assignee, condition, url, duration)" />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {prov.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {steps.length > 0 && <div className="flex justify-center pt-2"><Flag className="w-4 h-4 text-muted-foreground/40" /></div>}
        </div>
      </div>
    </div>
  );
}