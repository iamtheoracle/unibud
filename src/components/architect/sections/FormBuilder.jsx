import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ConfigManager from "@/components/architect/ConfigManager";
import { useEditor } from "@/lib/architect/editorState";
import { EditorToolbar, Palette, Btn } from "@/components/architect/architect-ui";
import { ClipboardList, Trash2, GripVertical, Monitor, Smartphone } from "lucide-react";
import {
  Type, AtSign, Phone, Hash, Lock, AlignLeft, FileText, Calendar, Clock, ChevronDown,
  ListChecks, Circle, CheckSquare, ToggleRight, Upload, Image, PenTool, Star,
} from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 9);
const PALETTE = [
  { key: "text", label: "Text", icon: Type },
  { key: "email", label: "Email", icon: AtSign },
  { key: "phone", label: "Phone", icon: Phone },
  { key: "number", label: "Number", icon: Hash },
  { key: "password", label: "Password", icon: Lock },
  { key: "textarea", label: "Textarea", icon: AlignLeft },
  { key: "richtext", label: "Rich Text", icon: FileText },
  { key: "date", label: "Date", icon: Calendar },
  { key: "time", label: "Time", icon: Clock },
  { key: "select", label: "Select", icon: ChevronDown },
  { key: "multiselect", label: "Multi Select", icon: ListChecks },
  { key: "radio", label: "Radio", icon: Circle },
  { key: "checkbox", label: "Checkbox", icon: CheckSquare },
  { key: "switch", label: "Switch", icon: ToggleRight },
  { key: "file_upload", label: "File Upload", icon: Upload },
  { key: "image_upload", label: "Image Upload", icon: Image },
  { key: "signature", label: "Signature", icon: PenTool },
  { key: "rating", label: "Rating", icon: Star },
];
const HAS_OPTIONS = ["select", "multiselect", "radio"];
const DEFAULT = { components: [] };

export default function FormBuilder() {
  return <ConfigManager type="form" label="Forms" singular="form" icon={ClipboardList} Editor={FormEditor} defaultConfig={DEFAULT} />;
}

function FormEditor({ record, defaultConfig, onSave, onSaveName, onClose, onPublish, onRollback }) {
  const { state, set, undo, redo, canUndo, canRedo, saving, lastSaved, saveNow, publishNow } = useEditor(record, { onSave, onPublish, defaultConfig });
  const [name, setName] = useState(record?.name || "");
  const [preview, setPreview] = useState("desktop");
  const onName = (v) => { setName(v); onSaveName(record.id, v); };

  const items = state.components || [];
  const add = (p) => set((s) => ({ ...s, components: [...(s.components || []), { id: uid(), type: p.key, label: p.label, key: p.key + "_" + (s.components?.length || 0), required: false, placeholder: "", default: "", showIf: "", options: [], options_source: "" }] }));
  const upd = (i, patch) => set((s) => ({ ...s, components: s.components.map((c, idx) => idx === i ? { ...c, ...patch } : c) }));
  const del = (i) => set((s) => ({ ...s, components: s.components.filter((_, idx) => idx !== i) }));
  const onDragEnd = (r) => { if (!r.destination || r.destination.index === r.source.index) return; set((s) => { const arr = [...s.components]; const [m] = arr.splice(r.source.index, 1); arr.splice(r.destination.index, 0, m); return { ...s, components: arr }; }); };

  return (
    <div>
      <EditorToolbar name={name} onName={onName} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onSave={saveNow} saving={saving} onPublish={publishNow} onRollback={() => onRollback(record.id)} status={record?.status} onClose={onClose} lastSaved={lastSaved} />
      <div className="flex gap-4 flex-col lg:flex-row">
        <Palette items={PALETTE} onAdd={add} title="Form Components" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-end gap-1 mb-2">
            <button onClick={() => setPreview("desktop")} className={`p-1.5 rounded-lg ${preview === "desktop" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}><Monitor className="w-4 h-4" /></button>
            <button onClick={() => setPreview("mobile")} className={`p-1.5 rounded-lg ${preview === "mobile" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}><Smartphone className="w-4 h-4" /></button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="form-canvas">
              {(prov) => (
                <div ref={prov.innerRef} {...prov.droppableProps} className={`mx-auto ${preview === "mobile" ? "max-w-[360px]" : "max-w-full"} space-y-2 min-h-[200px]`}>
                  {items.length === 0 && <div className="border-2 border-dashed border-border rounded-xl py-16 text-center text-muted-foreground text-[13px]">Click palette components to add, then drag to reorder</div>}
                  {items.map((c, i) => (
                    <Draggable key={c.id} draggableId={c.id} index={i}>
                      {(p) => (
                        <div ref={p.innerRef} {...p.draggableProps} className="glass-card radius-lg p-3">
                          <div className="flex items-center gap-2" {...p.dragHandleProps}>
                            <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab" />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-[80px] shrink-0">{c.type}</span>
                            <input value={c.label} onChange={(e) => upd(i, { label: e.target.value })} className="oracle-input flex-1" placeholder="Label" />
                            <label className="flex items-center gap-1 text-[11px] whitespace-nowrap"><input type="checkbox" checked={!!c.required} onChange={(e) => upd(i, { required: e.target.checked })} />Req</label>
                            <Btn variant="ghost" onClick={() => del(i)}><Trash2 className="w-3 h-3" /></Btn>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 pl-6">
                            <input value={c.key} onChange={(e) => upd(i, { key: e.target.value })} className="oracle-input" placeholder="field key" />
                            <input value={c.placeholder || ""} onChange={(e) => upd(i, { placeholder: e.target.value })} className="oracle-input" placeholder="placeholder" />
                            <input value={c.default || ""} onChange={(e) => upd(i, { default: e.target.value })} className="oracle-input" placeholder="default value" />
                            <input value={c.showIf || ""} onChange={(e) => upd(i, { showIf: e.target.value })} className="oracle-input" placeholder="conditional: field=value" />
                          </div>
                          {HAS_OPTIONS.includes(c.type) && (
                            <div className="grid grid-cols-2 gap-2 mt-2 pl-6">
                              <input value={(c.options || []).join(", ")} onChange={(e) => upd(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="oracle-input" placeholder="static options, comma-separated" />
                              <input value={c.options_source || ""} onChange={(e) => upd(i, { options_source: e.target.value })} className="oracle-input" placeholder="dynamic options source (entity/API)" />
                            </div>
                          )}
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