import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ConfigManager from "@/components/architect/ConfigManager";
import { useEditor } from "@/lib/architect/editorState";
import { EditorToolbar, Palette, Btn } from "@/components/architect/architect-ui";
import { FilePlus2, Trash2, GripVertical, Monitor, Tablet, Smartphone } from "lucide-react";
import { LayoutPanelTop, Square, CreditCard, Columns, ChevronDown, PanelRightOpen, MessageSquare, Table, BarChart, List } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 9);
const BLOCKS = [
  { key: "section", label: "Section", icon: LayoutPanelTop },
  { key: "container", label: "Container", icon: Square },
  { key: "card", label: "Card", icon: CreditCard },
  { key: "tabs", label: "Tabs", icon: Columns },
  { key: "accordion", label: "Accordion", icon: ChevronDown },
  { key: "drawer", label: "Drawer", icon: PanelRightOpen },
  { key: "dialog", label: "Dialog", icon: MessageSquare },
  { key: "table", label: "Table", icon: Table },
  { key: "chart", label: "Chart", icon: BarChart },
  { key: "list", label: "List", icon: List },
];
const DEFAULT = { blocks: [] };
const WIDTH = { desktop: "max-w-full", tablet: "max-w-[768px]", mobile: "max-w-[380px]" };

export default function PageBuilder() {
  return <ConfigManager type="page" label="Pages" singular="page" icon={FilePlus2} Editor={PageEditor} defaultConfig={DEFAULT} />;
}

function PageEditor({ record, defaultConfig, onSave, onSaveName, onClose, onPublish, onRollback }) {
  const { state, set, undo, redo, canUndo, canRedo, saving, lastSaved, saveNow, publishNow } = useEditor(record, { onSave, onPublish, defaultConfig });
  const [name, setName] = useState(record?.name || "");
  const [vp, setVp] = useState("desktop");
  const onName = (v) => { setName(v); onSaveName(record.id, v); };

  const blocks = state.blocks || [];
  const add = (p) => set((s) => ({ ...s, blocks: [...(s.blocks || []), { id: uid(), type: p.key, title: p.label, content: "" }] }));
  const upd = (i, patch) => set((s) => ({ ...s, blocks: s.blocks.map((b, idx) => idx === i ? { ...b, ...patch } : b) }));
  const del = (i) => set((s) => ({ ...s, blocks: s.blocks.filter((_, idx) => idx !== i) }));
  const onDragEnd = (r) => { if (!r.destination || r.destination.index === r.source.index) return; set((s) => { const arr = [...s.blocks]; const [m] = arr.splice(r.source.index, 1); arr.splice(r.destination.index, 0, m); return { ...s, blocks: arr }; }); };

  return (
    <div>
      <EditorToolbar name={name} onName={onName} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onSave={saveNow} saving={saving} onPublish={publishNow} onRollback={() => onRollback(record.id)} status={record?.status} onClose={onClose} lastSaved={lastSaved} />
      <div className="flex gap-4 flex-col lg:flex-row">
        <Palette items={BLOCKS} onAdd={add} title="Layout Blocks" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-end gap-1 mb-2">
            <button onClick={() => setVp("desktop")} className={`p-1.5 rounded-lg ${vp === "desktop" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}><Monitor className="w-4 h-4" /></button>
            <button onClick={() => setVp("tablet")} className={`p-1.5 rounded-lg ${vp === "tablet" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}><Tablet className="w-4 h-4" /></button>
            <button onClick={() => setVp("mobile")} className={`p-1.5 rounded-lg ${vp === "mobile" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}><Smartphone className="w-4 h-4" /></button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="page-canvas">
              {(prov) => (
                <div ref={prov.innerRef} {...prov.droppableProps} className={`mx-auto ${WIDTH[vp]} space-y-2 min-h-[200px] transition-all`}>
                  {blocks.length === 0 && <div className="border-2 border-dashed border-border rounded-xl py-16 text-center text-muted-foreground text-[13px]">Add layout blocks to compose your page</div>}
                  {blocks.map((b, i) => (
                    <Draggable key={b.id} draggableId={b.id} index={i}>
                      {(p) => (
                        <div ref={p.innerRef} {...p.draggableProps} className="glass-card radius-lg p-3 border-l-4 border-l-primary/40">
                          <div className="flex items-center gap-2" {...p.dragHandleProps}>
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-[80px] shrink-0">{b.type}</span>
                            <input value={b.title} onChange={(e) => upd(i, { title: e.target.value })} className="oracle-input flex-1" placeholder="Block title" />
                            <Btn variant="ghost" onClick={() => del(i)}><Trash2 className="w-3 h-3" /></Btn>
                          </div>
                          <input value={b.content || ""} onChange={(e) => upd(i, { content: e.target.value })} className="oracle-input mt-2 ml-7" placeholder="content / config / data source" />
                        </div>
                      )}
                    </Draggable>
                  ))}
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