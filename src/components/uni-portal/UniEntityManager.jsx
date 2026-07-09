import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  UniPageHeader, UniFilterBar, UniTable, UniModal, UniField,
  UniInput, UniTextarea, UniSelect, UniButton, UniEmptyState, UniBadge,
} from "@/components/uni-portal/UniPortalUI";

/**
 * Generic CRUD manager driven by a field configuration.
 * fields: [{ key, label, type: "text"|"textarea"|"number"|"select"|"date"|"datetime", options?, required?, placeholder?, col? }]
 */
export default function UniEntityManager({
  entityName,
  title,
  subtitle,
  searchKeys = [],
  filterConfig = [],
  fields = [],
  columns = [],
  emptyTitle = "Nothing here yet",
  emptyDescription = "Create your first record to get started.",
  createLabel = "Create",
  defaultValues = {},
  rowActions,
  renderFormExtras,
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const { data: records, isLoading } = useQuery({
    queryKey: [entityName, "uni-list"],
    queryFn: () => base44.entities[entityName].list("-created_date", 200),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (editing?.id) {
        return base44.entities[entityName].update(editing.id, payload);
      }
      return base44.entities[entityName].create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [entityName] });
      setModalOpen(false);
      setEditing(null);
      setForm({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities[entityName].delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [entityName] }),
  });

  const filtered = useMemo(() => {
    let list = records || [];
    if (search && searchKeys.length) {
      const q = search.toLowerCase();
      list = list.filter((r) => searchKeys.some((k) => String(r[k] || "").toLowerCase().includes(q)));
    }
    Object.entries(filters).forEach(([key, val]) => {
      if (val) list = list.filter((r) => String(r[key]) === val);
    });
    return list;
  }, [records, search, filters, searchKeys]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultValues });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = () => {
    const payload = {};
    fields.forEach((f) => {
      if (form[f.key] !== undefined && form[f.key] !== "") payload[f.key] = form[f.key];
    });
    saveMutation.mutate(payload);
  };

  const tableColumns = columns.length
    ? columns
    : fields.slice(0, 4).map((f) => ({
        key: f.key,
        header: f.label,
        render: (row) => (f.type === "select" ? (f.options?.find((o) => o.value === row[f.key])?.label || row[f.key]) : String(row[f.key] ?? "—")),
      }));

  const allColumns = [
    ...tableColumns,
    {
      key: "_actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="w-8 h-8 rounded-[10px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground spring-tap">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this record?")) deleteMutation.mutate(row.id); }} className="w-8 h-8 rounded-[10px] flex items-center justify-center text-muted-foreground hover:bg-error/10 hover:text-error spring-tap">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <UniPageHeader
        title={title}
        subtitle={subtitle}
        action={<UniButton icon={Plus} onClick={openCreate}>{createLabel}</UniButton>}
      />

      <UniFilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
        filters={filterConfig.map((f) => ({
          value: filters[f.key] || "",
          onChange: (v) => setFilters((p) => ({ ...p, [f.key]: v })),
          options: f.options,
          placeholder: f.placeholder,
        }))}
      />

      {filtered.length === 0 && !isLoading ? (
        <div className="rounded-[24px] bg-card border border-border/40 soft-shadow">
          <UniEmptyState
            icon={Plus}
            title={emptyTitle}
            description={emptyDescription}
            action={<UniButton icon={Plus} onClick={openCreate}>{createLabel}</UniButton>}
          />
        </div>
      ) : (
        <div className="rounded-[24px] bg-card border border-border/40 soft-shadow overflow-hidden">
          <UniTable columns={allColumns} data={filtered} loading={isLoading} onRowClick={rowActions?.onRowClick} />
        </div>
      )}

      <UniModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); setForm({}); }}
        title={editing ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}
        size="lg"
        footer={
          <>
            <UniButton variant="ghost" onClick={() => setModalOpen(false)}>Cancel</UniButton>
            <UniButton onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save"}
            </UniButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.col === 2 ? "sm:col-span-2" : ""}>
              <UniField label={f.label} required={f.required} hint={f.hint}>
                {f.type === "textarea" ? (
                  <UniTextarea value={form[f.key]} onChange={(v) => setField(f.key, v)} placeholder={f.placeholder} rows={f.rows || 3} />
                ) : f.type === "select" ? (
                  <UniSelect value={form[f.key]} onChange={(v) => setField(f.key, v)} options={f.options} placeholder={f.placeholder || "Select..."} />
                ) : (
                  <UniInput type={f.type === "number" ? "number" : f.type} value={form[f.key]} onChange={(v) => setField(f.key, f.type === "number" ? Number(v) : v)} placeholder={f.placeholder} />
                )}
              </UniField>
            </div>
          ))}
          {renderFormExtras?.(form, setField)}
        </div>
      </UniModal>
    </div>
  );
}