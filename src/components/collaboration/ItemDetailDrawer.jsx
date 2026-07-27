import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Check, Trash2, History, MessageSquare, Plus, Send, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from "date-fns";
import { parseMentions } from "@/lib/collaboration/collabEngine";

const STATUS_OPTS = ["open", "in_progress", "blocked", "needs_review", "approved", "done"];
const PRIORITY_OPTS = ["low", "medium", "high", "urgent"];

export default function ItemDetailDrawer({ item, workspaceId, memberIds, members, user, onClose, onUpdate, onDelete, onSaveVersion }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState(item);
  const [comment, setComment] = useState("");
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => setDraft(item), [item]);

  const { data: comments = [] } = useQuery({
    queryKey: ["collab", "comments", item.id],
    queryFn: () => base44.entities.CollaborationComment.filter({ item_id: item.id }, "-created_date", 100),
    enabled: !!item.id,
  });
  const { data: versions = [] } = useQuery({
    queryKey: ["collab", "versions", item.id],
    queryFn: () => base44.entities.CollaborationVersion.filter({ item_id: item.id }, "-version", 20),
    enabled: !!item.id && showVersions,
  });

  const save = async () => {
    if (onSaveVersion) await onSaveVersion(draft);
    await onUpdate({ id: draft.id, title: draft.title, content: draft.content, blocks: draft.blocks, status: draft.status, priority: draft.priority, due_date: draft.due_date, assignee_id: draft.assignee_id, assignee_name: draft.assignee_name });
    onClose();
  };

  const approve = async () => {
    await onUpdate({ id: draft.id, status: "approved", approved_by_id: user.id, approved_at: new Date().toISOString() });
    onClose();
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    await base44.entities.CollaborationComment.create({
      workspace_id: workspaceId, item_id: item.id, content: comment.trim(),
      author_id: user.id, author_name: user.full_name || user.email, author_image: user.avatar_url || "",
      mentions: parseMentions(comment, members), member_ids: memberIds,
    });
    setComment("");
    qc.invalidateQueries({ queryKey: ["collab", "comments", item.id] });
  };

  const restore = async (v) => {
    await onUpdate({ id: item.id, ...v.snapshot });
    setShowVersions(false);
  };

  const toggleBlock = (i) => {
    const blocks = [...(draft.blocks || [])];
    blocks[i] = { ...blocks[i], done: !blocks[i].done };
    setDraft({ ...draft, blocks });
  };
  const addChecklistRow = () => setDraft({ ...draft, blocks: [...(draft.blocks || []), { text: "", done: false }] });
  const setBlockText = (i, text) => { const b = [...(draft.blocks || [])]; b[i] = { ...b[i], text }; setDraft({ ...draft, blocks: b }); };

  const structured = ["checklist", "whiteboard", "study_plan"].includes(item.type);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[560px] glass-strong rounded-t-3xl sm:rounded-3xl p-5 max-h-[88vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase text-accent">{item.type}</span>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full text-lg font-bold text-foreground bg-transparent outline-none mb-3" />

        {!structured && (
          <textarea value={draft.content || ""} onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Write here… (markdown supported)"
            className="w-full bg-muted/30 rounded-xl p-3 text-sm text-foreground min-h-[140px] resize-none outline-none mb-3" />
        )}

        {item.type === "checklist" && (
          <div className="space-y-1.5 mb-3">
            {(draft.blocks || []).map((b, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg px-2 py-1.5">
                <button onClick={() => toggleBlock(i)} className={`w-5 h-5 rounded-md border flex items-center justify-center ${b.done ? "bg-success text-white border-success" : "border-border"}`}>
                  {b.done && <Check className="w-3 h-3" />}
                </button>
                <input value={b.text} onChange={(e) => setBlockText(i, e.target.value)} placeholder="Checklist item…"
                  className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            ))}
            <button onClick={addChecklistRow} className="text-xs text-accent flex items-center gap-1 spring-tap"><Plus className="w-3 h-3" /> Add row</button>
          </div>
        )}

        {item.type === "study_plan" && (
          <div className="space-y-2 mb-3">
            {(draft.blocks || []).map((w, i) => (
              <div key={i} className="bg-muted/30 rounded-xl p-2.5">
                <p className="text-xs font-semibold text-foreground">Week {w.week} · {w.focus}</p>
                <ul className="text-xs text-foreground/80 list-disc pl-4 mt-1">{(w.items || []).map((it, j) => <li key={j}>{it}</li>)}</ul>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground">Tip: ask Bud to generate a study plan.</p>
          </div>
        )}

        {item.type === "whiteboard" && (
          <div className="relative bg-muted/20 rounded-xl h-[200px] overflow-hidden mb-3 border border-border/40">
            {(draft.blocks || []).map((b, i) => (
              <div key={i} className="absolute bg-accent/15 text-[11px] px-2 py-1 rounded-md"
                style={{ left: `${(b.x || 0.5) * 100}%`, top: `${(b.y || 0.5) * 100}%` }}>
                {b.text}
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground absolute bottom-1 left-2">Simplified whiteboard preview</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="oracle-input">
            {STATUS_OPTS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className="oracle-input">
            {PRIORITY_OPTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={draft.assignee_id || ""} onChange={(e) => { const m = members.find((x) => x.user_id === e.target.value); setDraft({ ...draft, assignee_id: e.target.value || null, assignee_name: m?.name || null }); }} className="oracle-input">
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
          </select>
          <input type="date" value={draft.due_date || ""} onChange={(e) => setDraft({ ...draft, due_date: e.target.value || null })} className="oracle-input" />
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={save} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2 text-sm font-semibold spring-tap flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Save</button>
          {item.status !== "approved" && <button onClick={approve} className="px-3 bg-success/15 text-success rounded-xl text-sm font-semibold spring-tap flex items-center gap-1"><Crown className="w-4 h-4" /> Approve</button>}
          <button onClick={() => onDelete(item.id)} className="px-3 bg-error/12 text-error rounded-xl spring-tap"><Trash2 className="w-4 h-4" /></button>
        </div>

        <button onClick={() => setShowVersions((s) => !s)} className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-2 spring-tap">
          <History className="w-3.5 h-3.5" /> Version history
        </button>
        {showVersions && (
          <div className="space-y-1 mb-4">
            {versions.length === 0 && <p className="text-[11px] text-muted-foreground">No versions saved yet.</p>}
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-2.5 py-1.5">
                <div>
                  <p className="text-[11px] font-semibold text-foreground">v{v.version} · {v.change_summary}</p>
                  <p className="text-[10px] text-muted-foreground">{v.author_name} · {formatDistanceToNow(new Date(v.created_date), { addSuffix: true })}</p>
                </div>
                <button onClick={() => restore(v)} className="text-[11px] text-accent font-semibold">Restore</button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border/40 pt-3">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2"><MessageSquare className="w-3.5 h-3.5" /> Comments</p>
          <div className="space-y-2 mb-2">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">{(c.author_name || "?").slice(0, 1).toUpperCase()}</div>
                <div className="flex-1 bg-muted/30 rounded-xl px-3 py-1.5">
                  <p className="text-[10px] font-semibold text-foreground">{c.author_name}{c.mentions?.length > 0 && <span className="text-accent"> · mentioned</span>}</p>
                  <p className="text-xs text-foreground/90">{c.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-[11px] text-muted-foreground">No comments yet. Use @ to mention a member.</p>}
          </div>
          <div className="flex gap-2">
            <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} placeholder="Comment…" className="flex-1 oracle-input" />
            <button onClick={addComment} className="px-3 bg-accent text-accent-foreground rounded-xl spring-tap"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}