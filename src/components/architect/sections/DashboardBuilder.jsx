import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ConfigManager from "@/components/architect/ConfigManager";
import { useEditor } from "@/lib/architect/editorState";
import { EditorToolbar, Palette, Btn } from "@/components/architect/architect-ui";
import { BarChart3, Trash2, GripVertical, Hash, Table, BarChart, GitCommit, Calendar, Activity, Gauge, Grid3x3, Trophy } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 9);
const WIDGETS = [
  { key: "kpi", label: "KPI Card", icon: Hash },
  { key: "table", label: "Table", icon: Table },
  { key: "chart", label: "Chart", icon: BarChart },
  { key: "timeline", label: "Timeline", icon: GitCommit },
  { key: "calendar", label: "Calendar", icon: Calendar },
  { key: "activity", label: "Activity Feed", icon: Activity },
  { key: "statistics", label: "Statistics", icon: Gauge },
  { key: "heatmap", label: "Heatmap", icon: Grid3x3 },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
];
const DEFAULT = { widgets: [] };

export default function DashboardBuilder() {
  return <ConfigManager type="dashboard" label="Dashboards" singular="dashboard" icon={BarChart3} Editor={DashboardEditor} defaultConfig={DEFAULT} />;
}

function DashboardEditor({ record, defaultConfig, onSave, onSaveName, onClose, onPublish, onRollback }) {
  const { state, set, undo, redo, canUndo, canRedo, saving, lastSaved, saveNow, publishNow } = useEditor(record, { onSave, onPublish, defaultConfig });
  const [name, setName] = useState(record?.name || "");
  const onName = (v) => { setName(v); onSaveName(record.id, v); };

  const widgets = state.widgets || [];
  const add = (p) => set((s) => ({ ...s, widgets: [...(s.widgets || []), { id: uid(), type: p.key, title: p.label, source: "" }] }));
  const upd = (i, patch) => set((s) => ({ ...s, widgets: s.widgets.map((w, idx) => idx === i ? { ...w, ...patch } : w) }));
  const del = (i) => set((s) => ({ ...s, widgets: s.widgets.filter((_, idx) => idx !== i) }));
  const onDragEnd = (r) => { if (!r.destination || r.destination.index === r.source.index) return; set((s) => { const arr = [...s.widgets]; const [m] = arr.splice(r.source.index, 1); arr.splice(r.destination.index, 0, m); return { ...s, widgets: arr }; }); };

  return (
    <div>
      <EditorToolbar name={name} onName={onName} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onSave={saveNow} saving={saving} onPublish={publishNow} onRollback={() => onRollback(record.id)} status={record?.status} onClose={onClose} lastSaved={lastSaved} />
      <div className="flex gap-4 flex-col lg:flex-row">
        <Palette items={WIDGETS} onAdd={add} title="Widgets" />
        <div className="flex-1 min-w-0">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="dash-canvas">
              {(prov) => (
                <div ref={prov.innerRef} {...prov.droppableProps} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 min-h-[200px]">
                  {widgets.length === 0 && <div className="sm:col-span-2 xl:col-span-3 border-2 border-dashed border-border rounded-xl py-16 text-center text-muted-foreground text-[13px]">Add widgets to compose your dashboard</div>}
                  {widgets.map((w, i) => {
                    const Icon = WIDGETS.find((x) => x.key === w.type)?.icon || Hash;
                    return (
                      <Draggable key={w.id} draggableId={w.id} index={i}>
                        {(p) => (
                          <div ref={p.innerRef} {...p.draggableProps} className="glass-card radius-lg p-3">
                            <div className="flex items-center gap-2" {...p.dragHandleProps}>
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                              <Icon className="w-4 h-4 text-primary" />
                              <input value={w.title} onChange={(e) => upd(i, { title: e.target.value })} className="oracle-input flex-1" placeholder="Widget title" />
                              <Btn variant="ghost" onClick={() => del(i)}><Trash2 className="w-3 h-3" /></Btn>
                            </div>
                            <input value={w.source || ""} onChange={(e) => upd(i, { source: e.target.value })} className="oracle-input mt-2" placeholder="data source (entity / query)" />
                            <div className="mt-2 h-16 rounded-lg bg-muted/30 grid place-items-center text-[10px] text-muted-foreground capitalize">{w.type} preview</div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {prov.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}