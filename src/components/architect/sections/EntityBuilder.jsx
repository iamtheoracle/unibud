import React, { useState } from "react";
import ConfigManager from "@/components/architect/ConfigManager";
import { useEditor } from "@/lib/architect/editorState";
import { EditorToolbar, Panel, Btn } from "@/components/architect/architect-ui";
import { Boxes, Plus, Trash2 } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 9);
const FIELD_TYPES = ["string", "number", "boolean", "date", "select", "attachment", "relationship"];
const REL_TYPES = ["one_to_one", "one_to_many", "many_to_many"];
const DEFAULT = { fields: [], relationships: [] };

export default function EntityBuilder() {
  return <ConfigManager type="entity" label="Entities" singular="entity" icon={Boxes} Editor={EntityEditor} defaultConfig={DEFAULT} />;
}

function EntityEditor({ record, defaultConfig, onSave, onSaveName, onClose, onPublish, onRollback }) {
  const { state, set, undo, redo, canUndo, canRedo, saving, lastSaved, saveNow, publishNow } = useEditor(record, { onSave, onPublish, defaultConfig });
  const [name, setName] = useState(record?.name || "");
  const onName = (v) => { setName(v); onSaveName(record.id, v); };

  const fields = state.fields || [];
  const rels = state.relationships || [];
  const addField = () => set((s) => ({ ...s, fields: [...(s.fields || []), { id: uid(), name: "new_field", type: "string", required: false, enum: [], default: "" }] }));
  const updField = (i, patch) => set((s) => ({ ...s, fields: s.fields.map((f, idx) => idx === i ? { ...f, ...patch } : f) }));
  const delField = (i) => set((s) => ({ ...s, fields: s.fields.filter((_, idx) => idx !== i) }));
  const addRel = () => set((s) => ({ ...s, relationships: [...(s.relationships || []), { id: uid(), name: "new_relation", target: "", type: "one_to_many" }] }));
  const updRel = (i, patch) => set((s) => ({ ...s, relationships: s.relationships.map((r, idx) => idx === i ? { ...r, ...patch } : r) }));
  const delRel = (i) => set((s) => ({ ...s, relationships: s.relationships.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <EditorToolbar name={name} onName={onName} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onSave={saveNow} saving={saving} onPublish={publishNow} onRollback={() => onRollback(record.id)} status={record?.status} onClose={onClose} lastSaved={lastSaved} />
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Fields" icon={Boxes} actions={<Btn onClick={addField}><Plus className="w-3 h-3" />Add</Btn>}>
          {fields.length === 0 ? <p className="text-[12px] text-muted-foreground py-4 text-center">No fields yet. Add one to define this entity.</p> : (
            <div className="space-y-2">
              {fields.map((f, i) => (
                <div key={f.id} className="rounded-xl border border-border bg-muted/20 p-2.5 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input value={f.name} onChange={(e) => updField(i, { name: e.target.value })} className="oracle-input flex-1" placeholder="field name" />
                    <select value={f.type} onChange={(e) => updField(i, { type: e.target.value })} className="oracle-input w-[130px]">{FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
                    <Btn variant="ghost" onClick={() => delField(i)}><Trash2 className="w-3 h-3" /></Btn>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[11px]"><input type="checkbox" checked={!!f.required} onChange={(e) => updField(i, { required: e.target.checked })} />Required</label>
                    <input value={f.default || ""} onChange={(e) => updField(i, { default: e.target.value })} className="oracle-input flex-1" placeholder="default value" />
                  </div>
                  {f.type === "select" && (
                    <input value={(f.enum || []).join(", ")} onChange={(e) => updField(i, { enum: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="oracle-input" placeholder="enum values, comma-separated" />
                  )}
                  {f.type === "relationship" && (
                    <input value={f.target || ""} onChange={(e) => updField(i, { target: e.target.value })} className="oracle-input" placeholder="related entity" />
                  )}
                  <input value={f.validation || ""} onChange={(e) => updField(i, { validation: e.target.value })} className="oracle-input" placeholder="validation rule (e.g. min:1, max:255)" />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Relationships" icon={Boxes} actions={<Btn onClick={addRel}><Plus className="w-3 h-3" />Add</Btn>}>
          {rels.length === 0 ? <p className="text-[12px] text-muted-foreground py-4 text-center">No relationships defined.</p> : (
            <div className="space-y-2">
              {rels.map((r, i) => (
                <div key={r.id} className="flex items-center gap-1.5">
                  <input value={r.name} onChange={(e) => updRel(i, { name: e.target.value })} className="oracle-input flex-1" placeholder="relation name" />
                  <input value={r.target || ""} onChange={(e) => updRel(i, { target: e.target.value })} className="oracle-input flex-1" placeholder="target entity" />
                  <select value={r.type} onChange={(e) => updRel(i, { type: e.target.value })} className="oracle-input w-[130px]">{REL_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select>
                  <Btn variant="ghost" onClick={() => delRel(i)}><Trash2 className="w-3 h-3" /></Btn>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}