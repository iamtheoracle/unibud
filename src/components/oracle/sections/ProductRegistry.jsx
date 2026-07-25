import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, Panel, StatusPill, DataTable, SearchInput, Btn, LoadingState } from "@/components/oracle/oracle-ui";
import { Boxes, Plus, Layers, Tag } from "lucide-react";

const PRODUCTS = [
  { key: "unibud", name: "UNIBUD", version: "1.0.0", env: "Production", status: "operational", channel: "stable", modules: 0 },
  { key: "future", name: "More My Realm products", version: "—", env: "Planned", status: "draft", channel: "—", modules: 0, placeholder: true },
];

export default function ProductRegistry() {
  const { toast } = useToast();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setModules(await base44.entities.PlatformModule.list("sort_order", 200)); } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  PRODUCTS[0].modules = modules.length;

  const toggle = async (m) => {
    try { await base44.entities.PlatformModule.update(m.id, { enabled: !m.enabled }); toast({ title: `${m.display_name} ${m.enabled ? "disabled" : "enabled"}` }); load(); }
    catch { toast({ title: "Toggle failed", variant: "destructive" }); }
  };

  const filtered = modules.filter((m) => (m.display_name || "").toLowerCase().includes(q.toLowerCase()) || (m.key || "").toLowerCase().includes(q.toLowerCase()));

  const columns = [
    { key: "display_name", label: "Module", render: (m) => <div><p className="font-medium">{m.display_name}</p><p className="text-[10px] text-muted-foreground">{m.key}</p></div> },
    { key: "category", label: "Category", render: (m) => <span className="text-muted-foreground capitalize">{m.category?.replace(/_/g, " ")}</span> },
    { key: "university_scope", label: "Scope", render: (m) => m.university_scope || "Global" },
    { key: "enabled", label: "Status", render: (m) => <StatusPill status={m.enabled ? "active" : "inactive"} /> },
    { key: "actions", label: "", render: (m) => (
      <div className="flex justify-end"><Btn variant={m.enabled ? "soft" : "primary"} onClick={() => toggle(m)}>{m.enabled ? "Disable" : "Enable"}</Btn></div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title="Product Registry" desc="My Realm product registry — versions, environments, modules and release channels." />

      <div className="grid md:grid-cols-2 gap-4">
        {PRODUCTS.map((p) => (
          <Panel key={p.key} title={p.name} icon={p.placeholder ? Tag : Boxes}>
            {p.placeholder ? (
              <div className="py-6 text-center">
                <p className="text-[12px] text-muted-foreground">Future My Realm applications will appear here.</p>
                <Btn variant="soft" className="mt-3" onClick={() => toast({ title: "Product onboarding coming soon" })}><Plus className="w-3.5 h-3.5" />Register Product</Btn>
              </div>
            ) : (
              <div className="space-y-2.5">
                <Row k="Version" v={p.version} />
                <Row k="Environment" v={p.env} />
                <Row k="Status" v={<StatusPill status={p.status} />} />
                <Row k="Release Channel" v={p.channel} />
                <Row k="Modules" v={p.modules} />
              </div>
            )}
          </Panel>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SearchInput value={q} onChange={setQ} placeholder="Search modules…" />
        <p className="text-[11px] text-muted-foreground">{filtered.length} modules</p>
      </div>

      <Panel title="UNIBUD Modules" icon={Layers}>
        {loading ? <LoadingState /> : <DataTable columns={columns} rows={filtered} empty="No modules registered" />}
      </Panel>
    </div>
  );
}

function Row({ k, v }) {
  return <div className="flex items-center justify-between"><span className="text-[12px] text-muted-foreground">{k}</span><span className="text-[12px] font-medium">{v}</span></div>;
}