import React, { useState } from "react";
import ConfigManager from "@/components/architect/ConfigManager";
import { useEditor } from "@/lib/architect/editorState";
import { EditorToolbar, Panel, Btn } from "@/components/architect/architect-ui";
import { Menu, Plus, Trash2 } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 9);
const DEFAULT = { sidebar: [], top: [], mobile: [], quickActions: [] };
const GROUPS = [
  { key: "sidebar", label: "Sidebar Navigation" },
  { key: "top", label: "Top Navigation" },
  { key: "mobile", label: "Mobile Navigation" },
  { key: "quickActions", label: "Quick Actions" },
];

export default function MenuBuilder() {
  return <ConfigManager type="menu" label="Menus" singular="menu" icon={Menu} Editor={MenuEditor} defaultConfig={DEFAULT} />;
}

function MenuEditor({ record, defaultConfig, onSave, onSaveName, onClose, onPublish, onRollback }) {
  const { state, set, undo, redo, canUndo, canRedo, saving, lastSaved, saveNow, publishNow } = useEditor(record, { onSave, onPublish, defaultConfig });
  const [name, setName] = useState(record?.name || "");
  const onName = (v) => { setName(v); onSaveName(record.id, v); };

  const add = (g) => set((s) => ({ ...s, [g]: [...(s[g] || []), { id: uid(), label: "New Item", path: "/", icon: "", roles: "" }] }));
  const upd = (g, i, patch) => set((s) => ({ ...s, [g]: s[g].map((x, idx) => idx === i ? { ...x, ...patch } : x) }));
  const del = (g, i) => set((s) => ({ ...s, [g]: s[g].filter((_, idx) => idx !== i) }));

  return (
    <div>
      <EditorToolbar name={name} onName={onName} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onSave={saveNow} saving={saving} onPublish={publishNow} onRollback={() => onRollback(record.id)} status={record?.status} onClose={onClose} lastSaved={lastSaved} />
      <div className="grid lg:grid-cols-2 gap-4">
        {GROUPS.map((g) => (
          <Panel key={g.key} title={g.label} icon={Menu} actions={<Btn onClick={() => add(g.key)}><Plus className="w-3 h-3" />Add</Btn>}>
            {(state[g.key] || []).length === 0 ? <p className="text-[12px] text-muted-foreground py-4 text-center">No items yet.</p> : (
              <div className="space-y-2">
                {(state[g.key] || []).map((it, i) => (
                  <div key={it.id} className="flex items-center gap-1.5">
                    <input value={it.label} onChange={(e) => upd(g.key, i, { label: e.target.value })} className="oracle-input flex-1" placeholder="label" />
                    <input value={it.path} onChange={(e) => upd(g.key, i, { path: e.target.value })} className="oracle-input w-[120px]" placeholder="/path" />
                    <input value={it.icon} onChange={(e) => upd(g.key, i, { icon: e.target.value })} className="oracle-input w-[90px]" placeholder="icon" />
                    <input value={it.roles} onChange={(e) => upd(g.key, i, { roles: e.target.value })} className="oracle-input w-[120px]" placeholder="roles (comma)" />
                    <Btn variant="ghost" onClick={() => del(g.key, i)}><Trash2 className="w-3 h-3" /></Btn>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}