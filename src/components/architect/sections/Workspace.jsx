import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, Panel, StatusPill, Btn, LoadingState, EmptyState, StatCard } from "@/components/architect/architect-ui";
import { listAllConfigs, listProjects, createProject } from "@/lib/architect/configStore";
import { FolderGit2, CheckCircle2, FileEdit, Clock, History, Plus, X } from "lucide-react";

export default function Workspace({ onActive }) {
  const { toast } = useToast();
  const [configs, setConfigs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProject, setShowProject] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, p, a] = await Promise.all([
        listAllConfigs().catch(() => []),
        listProjects().catch(() => []),
        base44.entities.AuditLog.list("-created_date", 60).catch(() => []),
      ]);
      setConfigs(c); setProjects(p); setActivity(a.filter((x) => x.target_type === "architect"));
    } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const published = configs.filter((c) => c.status === "published");
  const drafts = configs.filter((c) => c.status === "draft");
  const recent = [...configs].sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0)).slice(0, 6);

  return (
    <div className="space-y-5">
      <SectionHeader title="Workspace" desc="Projects, recent changes, published & draft configurations, and the platform activity timeline."
        actions={<Btn onClick={() => setShowProject(true)}><Plus className="w-3.5 h-3.5" />New Project</Btn>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={FolderGit2} label="Projects" value={projects.length} tone="primary" />
        <StatCard icon={CheckCircle2} label="Published" value={published.length} tone="success" />
        <StatCard icon={FileEdit} label="Drafts" value={drafts.length} tone="warn" />
        <StatCard icon={History} label="Recent Changes" value={recent.length} tone="info" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Recent Projects" icon={FolderGit2}>
          {loading ? <LoadingState /> : projects.length === 0 ? <EmptyState icon={FolderGit2} message="No projects yet." /> : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div><p className="text-[13px] font-heading font-semibold">{p.name}</p><p className="text-[11px] text-muted-foreground">{p.description || "No description"}</p></div>
                  <StatusPill status={p.status} />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Recent Changes" icon={Clock}>
          {loading ? <LoadingState /> : recent.length === 0 ? <EmptyState icon={Clock} message="No changes yet." /> : (
            <div className="space-y-2">
              {recent.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="min-w-0"><p className="text-[12px] font-medium truncate">{c.name}</p><p className="text-[10px] text-muted-foreground capitalize">{c.type} · v{c.version || 1}</p></div>
                  <StatusPill status={c.status} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Published Configurations" icon={CheckCircle2} className="lg:col-span-1">
          {loading ? <LoadingState /> : published.length === 0 ? <EmptyState icon={CheckCircle2} message="Nothing published yet." /> : (
            <div className="space-y-2">{published.map((c) => <ConfigRow key={c.id} c={c} />)}</div>
          )}
        </Panel>
        <Panel title="Draft Configurations" icon={FileEdit} className="lg:col-span-1">
          {loading ? <LoadingState /> : drafts.length === 0 ? <EmptyState icon={FileEdit} message="No drafts." /> : (
            <div className="space-y-2">{drafts.map((c) => <ConfigRow key={c.id} c={c} />)}</div>
          )}
        </Panel>
        <Panel title="Activity Timeline" icon={History} className="lg:col-span-1">
          {activity.length === 0 ? <EmptyState icon={History} message="No architect activity logged." /> : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto no-scrollbar">
              {activity.map((a) => (
                <div key={a.id} className="flex gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.severity === "warning" ? "bg-warning" : a.severity === "critical" ? "bg-destructive" : "bg-primary"}`} />
                  <div className="min-w-0"><p className="text-[12px] font-medium truncate">{a.action}</p><p className="text-[10px] text-muted-foreground truncate">{a.target_name} · {a.created_date ? new Date(a.created_date).toLocaleString() : ""}</p></div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {showProject && <NewProjectModal onClose={() => setShowProject(false)} onCreated={() => { setShowProject(false); load(); }} />}
    </div>
  );
}

function ConfigRow({ c }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <div className="min-w-0"><p className="text-[12px] font-medium truncate">{c.name}</p><p className="text-[10px] text-muted-foreground capitalize">{c.type}</p></div>
      <StatusPill status={c.status} />
    </div>
  );
}

function NewProjectModal({ onClose, onCreated }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const submit = async () => {
    if (!name) return toast({ title: "Name required", variant: "destructive" });
    await createProject({ name, description: desc });
    toast({ title: "Project created" }); onCreated();
  };
  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-strong rounded-2xl w-full max-w-[420px] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="font-heading font-bold text-[16px]">New Project</h3><button onClick={onClose}><X className="w-4 h-4" /></button></div>
        <div className="space-y-3">
          <label className="block"><span className="text-[11px] font-medium text-muted-foreground">Name</span><input value={name} onChange={(e) => setName(e.target.value)} className="oracle-input mt-1" /></label>
          <label className="block"><span className="text-[11px] font-medium text-muted-foreground">Description</span><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="oracle-input h-auto py-2 mt-1" /></label>
        </div>
        <div className="flex justify-end gap-2 mt-5"><Btn variant="soft" onClick={onClose}>Cancel</Btn><Btn onClick={submit}>Create</Btn></div>
      </div>
    </div>
  );
}