import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, SearchInput, Drawer, Btn, EmptyState, LoadingState, DataTable } from "@/components/management/management-ui";
import { Plus, Pencil, Trash2, Save } from "lucide-react";

const BUILTINS = ["id", "created_date", "updated_date", "created_by_id", "institution_id"];
const humanize = (k) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const isLong = (k) => /description|notes|message|address|bio|instructions/i.test(k);

function FieldInput({ k, prop, value, onChange, required }) {
  const enums = prop.enum;
  if (enums) {
    return (
      <select className="oracle-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="">Select…</option>
        {enums.map((o) => <option key={o} value={o}>{humanize(o)}</option>)}
      </select>
    );
  }
  if (prop.type === "boolean") return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded" />;
  if (prop.type === "number") return <input type="number" step="any" className="oracle-input" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} required={required} />;
  if (prop.format === "date") return <input type="date" className="oracle-input" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value)} required={required} />;
  if (prop.type === "string" && isLong(k)) return <textarea className="oracle-input min-h-[80px] py-2" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={required} />;
  return <input className="oracle-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={required} placeholder={humanize(k)} />;
}

function fmt(v, prop) {
  if (v === undefined || v === null || v === "") return "—";
  if (prop && prop.enum) return humanize(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (prop && prop.format === "date") return String(v).slice(0, 10);
  if (typeof v === "object") return "…";
  return String(v);
}

export default function EntityModule({ entityName, title, description, icon: Icon, institutionId, extraActions, rowActions }) {
  const { toast } = useToast();
  const [schema, setSchema] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      let sch = null;
      try { sch = await base44.entities[entityName].schema(); } catch {}
      setSchema(sch);
      const hasInst = sch?.properties?.institution_id;
      const list = hasInst
        ? await base44.entities[entityName].filter({ institution_id: institutionId }, "-created_date", 200)
        : await base44.entities[entityName].list("-created_date", 200);
      setRows(list || []);
    } catch { toast({ title: "Failed to load records", variant: "destructive" }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [entityName, institutionId]);

  const props = schema?.properties || {};
  const fieldKeys = useMemo(() => Object.keys(props).filter((k) => !BUILTINS.includes(k)), [schema]);

  const columns = useMemo(() => {
    const visible = fieldKeys.slice(0, rowActions ? 4 : 6).map((k) => ({
      key: k,
      label: humanize(k),
      render: (r) => fmt(r[k], props[k]),
    }));
    visible.push({
      key: "__a", label: "", render: (r) => (
        <div className="flex gap-1 justify-end flex-wrap">
          {(rowActions || []).map((a) => { const AIcon = a.icon; return <Btn key={a.label} variant="ghost" size="icon" title={a.label} onClick={(e) => { e.stopPropagation(); runRow(a, r); }}><AIcon className="w-3.5 h-3.5" /></Btn>; })}
          <Btn variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditing(r); }}><Pencil className="w-3.5 h-3.5" /></Btn>
          <Btn variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); del(r); }}><Trash2 className="w-3.5 h-3.5" /></Btn>
        </div>
      ),
    });
    return visible;
  }, [schema, fieldKeys, rowActions]);

  const filtered = rows.filter((r) => !query || JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));

  const save = async () => {
    const id = editing.id;
    const payload = { ...editing };
    BUILTINS.forEach((b) => { if (b !== "institution_id") delete payload[b]; });
    if (props.institution_id && !id) payload.institution_id = institutionId;
    try {
      if (id) await base44.entities[entityName].update(id, payload);
      else await base44.entities[entityName].create(payload);
      setEditing(null);
      toast({ title: id ? "Record updated" : "Record created" });
      load();
    } catch { toast({ title: "Save failed", variant: "destructive" }); }
  };

  const del = async (r) => {
    if (!confirm("Delete this record?")) return;
    try { await base44.entities[entityName].delete(r.id); toast({ title: "Deleted" }); load(); }
    catch { toast({ title: "Delete failed", variant: "destructive" }); }
  };

  const runRow = async (a, r) => {
    try {
      if (a.run) { await a.run(r); }
      else {
        const patch = typeof a.patch === "function" ? a.patch(r) : a.patch;
        await base44.entities[entityName].update(r.id, patch);
        if (a.audit) { const info = typeof a.audit === "function" ? a.audit(r) : a.audit; try { await base44.entities.AuditLog.create({ action: info.action, target_name: info.target, target_type: info.target_type || "operator", severity: "info", description: info.description || info.action }); } catch {} }
      }
      toast({ title: `${a.label} ✓` }); load();
    } catch { toast({ title: `${a.label} failed`, variant: "destructive" }); }
  };

  return (
    <div>
      <SectionHeader title={title} desc={description} icon={Icon}
        actions={<>
          {extraActions}
          <SearchInput value={query} onChange={setQuery} />
          <Btn variant="primary" onClick={() => setEditing({})}><Plus className="w-3.5 h-3.5" />Add</Btn>
        </>} />
      <div className="glass-card radius-lg p-3">
        {loading ? <LoadingState /> : rows.length === 0 ? <EmptyState icon={Icon} message="No records yet. Add your first one." /> : <DataTable columns={columns} rows={filtered} />}
      </div>

      <Drawer open={!!editing} onClose={() => setEditing(null)} title={editing && editing.id ? "Edit record" : "New record"}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn variant="primary" onClick={save}><Save className="w-3.5 h-3.5" />Save</Btn></>}>
        {editing && fieldKeys.map((k) => {
          const prop = props[k];
          const req = (schema?.required || []).includes(k);
          return (
            <div key={k} className={prop?.type === "boolean" ? "flex items-center gap-2" : ""}>
              <label className="text-[12px] font-semibold mb-1 block">{humanize(k)}{req && <span className="text-destructive"> *</span>}</label>
              <FieldInput k={k} prop={prop} value={editing[k]} required={req} onChange={(v) => setEditing({ ...editing, [k]: v })} />
            </div>
          );
        })}
      </Drawer>
    </div>
  );
}