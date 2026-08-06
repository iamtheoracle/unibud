import React, { useState } from "react";
import { Crown, Shield, MessageSquare, Eye, UserPlus, Loader2, X } from "lucide-react";

const ROLE_ICON = { owner: Crown, editor: Shield, commenter: MessageSquare, viewer: Eye };
const ROLE_ORDER = ["owner", "editor", "commenter", "viewer"];

export default function MemberRoster({ workspace, members, user, onAddMember, onUpdateRole }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [role, setRole] = useState("editor");
  const [busy, setBusy] = useState(false);
  const isOwner = workspace?.created_by_id === user?.id;

  const add = async () => {
    if (!name.trim() || !uid.trim()) return;
    setBusy(true);
    try { await onAddMember({ user_id: uid.trim(), name: name.trim(), role }); setName(""); setUid(""); setAdding(false); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-2">
      {isOwner && (
        adding ? (
          <div className="glass-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Add member</p>
              <button onClick={() => setAdding(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Member name" className="w-full oracle-input" />
            <input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="User ID" className="w-full oracle-input" />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full oracle-input">
              {ROLE_ORDER.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={add} disabled={busy} className="w-full bg-accent text-accent-foreground rounded-xl py-2 text-sm font-semibold spring-tap disabled:opacity-40 flex items-center justify-center gap-2">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Add member
            </button>
            <p className="text-[10px] text-muted-foreground">Tip: invite members via People search, then paste their ID here.</p>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full glass-card p-3 flex items-center justify-center gap-2 text-sm font-semibold text-accent spring-tap">
            <UserPlus className="w-4 h-4" /> Add member
          </button>
        )
      )}

      {(members || []).map((m) => {
        const Icon = ROLE_ICON[m.role] || Eye;
        return (
          <div key={m.user_id} className="glass-card p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-bold">
              {(m.name || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{m.name}{m.user_id === user?.id && " (you)"}</p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                <Icon className="w-3 h-3" /> {m.role}
              </div>
            </div>
            {isOwner && m.user_id !== user?.id && (
              <select value={m.role} onChange={(e) => onUpdateRole({ user_id: m.user_id, role: e.target.value })}
                className="oracle-input w-[110px] text-[11px]">
                {ROLE_ORDER.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}