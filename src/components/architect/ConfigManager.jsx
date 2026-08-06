import React, { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { listConfigs, createConfig, saveConfig, publishConfig, rollbackConfig, duplicateConfig, archiveConfig } from "@/lib/architect/configStore";
import { useEditor } from "@/lib/architect/editorState";
import { Btn, StatusPill, LoadingState, EmptyState, SearchInput, EditorToolbar } from "@/components/architect/architect-ui";
import { Plus, Pencil, Rocket, RotateCcw, Copy, Archive, X } from "lucide-react";

/**
 * ConfigManager — backbone for every Architect builder.
 * Lists ArchitectConfig records of `type`; create/edit/publish/rollback/duplicate/archive.
 * `Editor` receives { record, defaultConfig, schema, onSave, onClose, onPublish, onRollback }.
 */
export default function ConfigManager({ type, label, icon: Icon, singular, Editor, defaultConfig = {}, schema, editorProps }) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await listConfigs(type)); } catch {}
    setLoading(false);
  }, [type]);
  useEffect(() => { load(); }, [load]);

  const filtered = items.filter((i) => (i.name + " " + (i.key || "") + " " + (i.description || "")).toLowerCase().includes(q.toLowerCase()));

  const create = async () => {
    try {
      const rec = await createConfig({ type, name: `Untitled ${singular}`, key: `${type}_${Date.now()}`, config: defaultConfig });
      setActive(rec); load();
    } catch { toast({ title: "Create failed", variant: "destructive" }); }
  };

  const onPublish = async (id) => { try { await publishConfig(id); toast({ title: "Published" }); load(); } catch { toast({ title: "Publish failed", variant: "destructive" }); } };
  const onRollback = async (id) => { try { await rollbackConfig(id); toast({ title: "Rolled back to draft" }); load(); } catch { toast({ title: "Rollback failed", variant: "destructive" }); } };
  const onSave = async (id, config) => { await saveConfig(id, config); };
  const onSaveName = async (id, name) => { await base44.entities.ArchitectConfig.update(id, { name }); };
  const dup = async (c) => { await duplicateConfig(c); toast({ title: "Duplicated" }); load(); };
  const arch = async (c) => { await archiveConfig(c.id); toast({ title: "Archived" }); load(); };

  if (active) {
    return (
      <Editor
        record={active}
        defaultConfig={defaultConfig}
        schema={schema}
        onSave={onSave}
        onSaveName={onSaveName}
        onClose={() => { setActive(null); load(); }}
        onPublish={onPublish}
        onRollback={onRollback}
        {...editorProps}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2"><SearchInput value={q} onChange={setQ} placeholder={`Search ${label.toLowerCase()}…`} /><span className="text-[11px] text-muted-foreground">{filtered.length}</span></div>
        <Btn onClick={create}><Plus className="w-3.5 h-3.5" />New {singular}</Btn>
      </div>

      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState icon={Icon} title={`No ${label.toLowerCase()} yet`} message={`Create your first ${singular} to start configuring the platform.`} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="glass-card radius-lg p-4 card-hover flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0"><p className="font-heading font-semibold text-[14px] truncate">{c.name}</p><p className="text-[10px] text-muted-foreground font-mono truncate">{c.key}</p></div>
                <StatusPill status={c.status} />
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 flex-1">{c.description || "No description"}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                <span>v{c.version || 1}</span><span>{c.updated_date ? new Date(c.updated_date).toLocaleDateString() : ""}</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Btn variant="primary" onClick={() => setActive(c)}><Pencil className="w-3 h-3" />Edit</Btn>
                {c.status === "published"
                  ? <Btn variant="soft" onClick={() => onRollback(c.id)}><RotateCcw className="w-3 h-3" />Rollback</Btn>
                  : <Btn variant="soft" onClick={() => onPublish(c.id)}><Rocket className="w-3 h-3" />Publish</Btn>}
                <Btn variant="ghost" onClick={() => dup(c)} title="Duplicate"><Copy className="w-3 h-3" /></Btn>
                <Btn variant="ghost" onClick={() => arch(c)} title="Archive"><Archive className="w-3 h-3" /></Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** GenericConfigEditor — schema-driven config form for the simpler builders. */
export function GenericConfigEditor({ record, defaultConfig, schema = [], onSave, onSaveName, onClose, onPublish, onRollback }) {
  const { state, set, undo, redo, canUndo, canRedo, saving, lastSaved, saveNow, publishNow } = useEditor(record, { onSave, onPublish, defaultConfig });
  const [name, setName] = useState(record?.name || "");
  const onName = (v) => { setName(v); onSaveName(record.id, v); };

  const up = (k, v) => set((s) => ({ ...s, [k]: v }));
  const arr = (k) => state[k] || [];
  const addArr = (k, val) => set((s) => ({ ...s, [k]: [...(s[k] || []), val] }));
  const updArr = (k, i, val) => set((s) => ({ ...s, [k]: (s[k] || []).map((x, idx) => idx === i ? val : x) }));
  const delArr = (k, i) => set((s) => ({ ...s, [k]: (s[k] || []).filter((_, idx) => idx !== i) }));

  return (
    <div>
      <EditorToolbar name={name} onName={onName} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} onSave={saveNow} saving={saving} onPublish={publishNow} onRollback={() => onRollback(record.id)} status={record?.status} onClose={onClose} lastSaved={lastSaved} />
      <div className="glass-card radius-lg p-4">
        <div className="grid md:grid-cols-2 gap-4">
          {schema.map((f) => (
            <label key={f.key} className={`block ${f.full ? "md:col-span-2" : ""}`}>
              <span className="text-[11px] font-medium text-muted-foreground">{f.label}</span>
              {f.hint && <span className="text-[10px] text-muted-foreground/70 block">{f.hint}</span>}
              <div className="mt-1">
                {f.type === "text" && <input value={state[f.key] || ""} onChange={(e) => up(f.key, e.target.value)} className="oracle-input" placeholder={f.placeholder} />}
                {f.type === "textarea" && <textarea value={state[f.key] || ""} onChange={(e) => up(f.key, e.target.value)} rows={4} className="oracle-input h-auto py-2" placeholder={f.placeholder} />}
                {f.type === "select" && <select value={state[f.key] || ""} onChange={(e) => up(f.key, e.target.value)} className="oracle-input">{(f.options || []).map((o) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}</select>}
                {f.type === "switch" && <button onClick={() => up(f.key, !state[f.key])} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${state[f.key] ? "bg-success/15 text-success" : "bg-muted/50 text-muted-foreground"}`}>{state[f.key] ? "Enabled" : "Disabled"}</button>}
                {f.type === "list" && (
                  <div className="space-y-1.5">
                    {arr(f.key).map((v, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <input value={v} onChange={(e) => updArr(f.key, i, e.target.value)} className="oracle-input flex-1" />
                        <Btn variant="ghost" onClick={() => delArr(f.key, i)}><X className="w-3 h-3" /></Btn>
                      </div>
                    ))}
                    <Btn variant="soft" onClick={() => addArr(f.key, "")}><Plus className="w-3 h-3" />Add</Btn>
                  </div>
                )}
                {f.type === "keyvalue" && (
                  <div className="space-y-1.5">
                    {arr(f.key).map((kv, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <input value={kv.key || ""} onChange={(e) => updArr(f.key, i, { ...kv, key: e.target.value })} className="oracle-input flex-1" placeholder="key" />
                        <input value={kv.value || ""} onChange={(e) => updArr(f.key, i, { ...kv, value: e.target.value })} className="oracle-input flex-1" placeholder="value" />
                        <Btn variant="ghost" onClick={() => delArr(f.key, i)}><X className="w-3 h-3" /></Btn>
                      </div>
                    ))}
                    <Btn variant="soft" onClick={() => addArr(f.key, { key: "", value: "" })}><Plus className="w-3 h-3" />Add</Btn>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}