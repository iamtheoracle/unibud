import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, SearchInput, Drawer, Btn, StatusPill, EmptyState, LoadingState, DataTable } from "@/components/management/management-ui";
import { CheckSquare, Plus, Paperclip, Upload, RotateCcw, ArrowRight, MessageSquarePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const todayStr = () => new Date().toISOString().slice(0, 10);
const prioCls = (p) => p === "urgent" || p === "high" ? "text-destructive" : p === "medium" ? "text-warning" : "text-muted-foreground";

export default function TaskCenter({ institutionId, user }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("mine");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => { setLoading(true); try { setTasks(await base44.entities.ManagementTask.filter({ institution_id: institutionId }, "-created_date", 300)); } catch {} setLoading(false); };
  useEffect(() => { load(); }, [institutionId]);

  const me = user?.full_name;
  const tabs = {
    all: tasks,
    mine: tasks.filter((t) => t.assignee === me || t.created_by_id === user.id),
    dueToday: tasks.filter((t) => t.due_date === todayStr() && t.status !== "completed" && t.status !== "archived"),
    overdue: tasks.filter((t) => t.due_date && t.due_date < todayStr() && t.status !== "completed" && t.status !== "archived"),
    completed: tasks.filter((t) => t.status === "completed"),
    archived: tasks.filter((t) => t.status === "archived"),
  };
  const TABS = [["mine", "My Tasks"], ["all", "Assigned Tasks"], ["dueToday", "Due Today"], ["overdue", "Overdue"], ["completed", "Completed"], ["archived", "Archived"]];
  const list = (tabs[tab] || []).filter((t) => !query || JSON.stringify(t).toLowerCase().includes(query.toLowerCase()));

  const log = (action, target, desc) => { try { base44.entities.AuditLog.create({ action, target_name: target, target_type: "operator", severity: "info", description: desc }); } catch {} };

  const transition = async (t, status, label) => {
    const activity = [...(t.activity || []), { at: new Date().toISOString(), by: me, text: `Status → ${status.replace("_", " ")}` }];
    try { await base44.entities.ManagementTask.update(t.id, { status, activity }); log(`Task ${label}`, t.title, `${me} marked '${t.title}' as ${status}`); toast({ title: label }); load(); setOpen({ ...t, status, activity }); }
    catch { toast({ title: "Update failed", variant: "destructive" }); }
  };
  const addNote = async () => {
    if (!note.trim()) return;
    const activity = [...(open.activity || []), { at: new Date().toISOString(), by: me, text: note.trim() }];
    try { await base44.entities.ManagementTask.update(open.id, { activity }); setNote(""); toast({ title: "Note added" }); load(); setOpen({ ...open, activity }); }
    catch { toast({ title: "Failed", variant: "destructive" }); }
  };
  const onUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); const attachments = [...(open.attachments || []), file_url]; await base44.entities.ManagementTask.update(open.id, { attachments }); toast({ title: "Attachment added" }); load(); setOpen({ ...open, attachments }); }
    catch { toast({ title: "Upload failed", variant: "destructive" }); }
    setUploading(false);
  };
  const removeAtt = async (i) => { const attachments = (open.attachments || []).filter((_, idx) => idx !== i); await base44.entities.ManagementTask.update(open.id, { attachments }); load(); setOpen({ ...open, attachments }); };

  const columns = [
    { key: "title", label: "Task", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "type", label: "Type", render: (r) => <span className="capitalize text-muted-foreground text-[12px]">{r.type?.replace("_", " ")}</span> },
    { key: "priority", label: "Priority", render: (r) => <span className={cn("text-[11px] font-semibold capitalize", prioCls(r.priority))}>{r.priority}</span> },
    { key: "assignee", label: "Assignee", render: (r) => <span className="text-muted-foreground">{r.assignee || "—"}</span> },
    { key: "due_date", label: "Due", render: (r) => <span className="text-muted-foreground">{r.due_date || "—"}</span> },
    { key: "status", label: "Status", render: (r) => <StatusPill status={r.status} /> },
    { key: "__a", label: "", render: (r) => <Btn variant="soft" size="sm" onClick={() => setOpen(r)}>Open</Btn> },
  ];

  const createTask = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const title = f.get("title"); if (!title) return;
    try { await base44.entities.ManagementTask.create({ title, type: f.get("type") || "assignment", assignee: f.get("assignee") || me, priority: f.get("priority") || "medium", due_date: f.get("due_date") || "", notes: f.get("notes") || "", status: "pending", institution_id: institutionId }); setCreating(false); toast({ title: "Task created" }); load(); }
    catch { toast({ title: "Create failed", variant: "destructive" }); }
  };

  return (
    <div>
      <SectionHeader title="Task Center" desc="Execute your assigned work — track status, priority, due dates, attachments and activity."
        actions={<><SearchInput value={query} onChange={setQuery} /><Btn variant="primary" onClick={() => setCreating(true)}><Plus className="w-3.5 h-3.5" />New Task</Btn></>} />

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 pb-1">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-colors", tab === id ? "bg-primary text-primary-foreground" : "glass text-foreground/70")}>
            {label} <span className="opacity-60">{tabs[id]?.length || 0}</span>
          </button>
        ))}
      </div>

      <div className="glass-card radius-lg p-3">
        {loading ? <LoadingState /> : list.length === 0 ? <EmptyState icon={CheckSquare} message="No tasks in this view." /> : <DataTable columns={columns} rows={list} />}
      </div>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.title || "Task"}
        footer={<>
          {open && open.status !== "completed" && open.status !== "archived" && <Btn variant="primary" onClick={() => transition(open, "completed", "Completed")}><CheckSquare className="w-3.5 h-3.5" />Complete</Btn>}
          {open && open.status === "pending" && <Btn variant="soft" onClick={() => transition(open, "in_progress", "Started")}><ArrowRight className="w-3.5 h-3.5" />Start</Btn>}
          {open && <Btn variant="soft" onClick={() => transition(open, "archived", "Archived")}>Archive</Btn>}
          {open && (open.status === "completed" || open.status === "archived") && <Btn variant="ghost" onClick={() => transition(open, "pending", "Reopened")}><RotateCcw className="w-3.5 h-3.5" />Reopen</Btn>}
        </>}>
        {open && (
          <>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div><p className="text-muted-foreground">Type</p><p className="font-medium capitalize">{open.type?.replace("_", " ")}</p></div>
              <div><p className="text-muted-foreground">Priority</p><p className={cn("font-semibold capitalize", prioCls(open.priority))}>{open.priority}</p></div>
              <div><p className="text-muted-foreground">Assignee</p><p className="font-medium">{open.assignee || "—"}</p></div>
              <div><p className="text-muted-foreground">Due Date</p><p className="font-medium">{open.due_date || "—"}</p></div>
              <div><p className="text-muted-foreground">Status</p><StatusPill status={open.status} /></div>
            </div>
            {open.notes && <div><p className="text-muted-foreground text-[12px] mt-2">Notes</p><p className="text-[13px]">{open.notes}</p></div>}

            <div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[12px] font-semibold flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" />Attachments</p>
                <label className="cursor-pointer"><span className="inline-flex items-center gap-1 text-[12px] text-primary font-semibold"><Upload className="w-3.5 h-3.5" />{uploading ? "Uploading…" : "Upload"}</span><input type="file" className="hidden" onChange={onUpload} disabled={uploading} /></label>
              </div>
              {(open.attachments || []).length === 0 ? <p className="text-[11px] text-muted-foreground mt-1">No attachments.</p> : (
                <div className="space-y-1 mt-1">{(open.attachments || []).map((u, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]"><a href={u} target="_blank" rel="noreferrer" className="text-primary truncate flex-1">{u.split("/").pop()}</a><button onClick={() => removeAtt(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button></div>
                ))}</div>
              )}
            </div>

            <div>
              <p className="text-[12px] font-semibold mb-1">Activity Timeline</p>
              <div className="space-y-2 border-l border-border pl-3">
                {(open.activity || []).length === 0 ? <p className="text-[11px] text-muted-foreground">No activity yet.</p> : (open.activity || []).map((a, i) => (
                  <div key={i} className="text-[12px]"><span className="text-muted-foreground">{a.at ? new Date(a.at).toLocaleString() : ""} · {a.by}</span><p>{a.text}</p></div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[12px] font-semibold mb-1">Add Note</p>
              <div className="flex gap-2"><input value={note} onChange={(e) => setNote(e.target.value)} className="oracle-input flex-1" placeholder="Note…" /><Btn variant="soft" onClick={addNote}><MessageSquarePlus className="w-3.5 h-3.5" /></Btn></div>
            </div>
          </>
        )}
      </Drawer>

      <Drawer open={creating} onClose={() => setCreating(false)} title="New Task"
        footer={<><Btn variant="ghost" onClick={() => setCreating(false)}>Cancel</Btn><Btn variant="primary" type="submit" form="newtask">Create</Btn></>}>
        <form id="newtask" onSubmit={createTask} className="space-y-3">
          <div><label className="text-[12px] font-semibold">Title *</label><input name="title" required className="oracle-input mt-1" placeholder="Task title" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[12px] font-semibold">Type</label><select name="type" className="oracle-input mt-1"><option value="assignment">Assignment</option><option value="approval">Approval</option><option value="review">Review</option><option value="follow_up">Follow-up</option><option value="deadline">Deadline</option></select></div>
            <div><label className="text-[12px] font-semibold">Priority</label><select name="priority" defaultValue="medium" className="oracle-input mt-1"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div><label className="text-[12px] font-semibold">Assignee</label><input name="assignee" className="oracle-input mt-1" defaultValue={me} /></div>
            <div><label className="text-[12px] font-semibold">Due Date</label><input name="due_date" type="date" className="oracle-input mt-1" /></div>
          </div>
          <div><label className="text-[12px] font-semibold">Notes</label><textarea name="notes" className="oracle-input mt-1 min-h-[60px]" /></div>
        </form>
      </Drawer>
    </div>
  );
}