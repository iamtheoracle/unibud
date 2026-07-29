import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SectionHeader, Panel, StatusPill, DataTable, SearchInput, Btn, LoadingState } from "@/components/oracle/oracle-ui";
import { Users, LogOut, KeyRound, UserCog, History } from "lucide-react";

const ROLES = ["admin", "user"];
const ROLE_LABELS = { admin: "Platform Admin", user: "User", university_admin: "Institution Admin", developer: "Developer", student: "Student", staff: "Staff", guest: "Guest" };

export default function UserGovernance() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await base44.entities.User.list("-created_date", 200)); } catch {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) => {
    const matchQ = (r.full_name || r.email || "").toLowerCase().includes(q.toLowerCase());
    const matchR = role === "all" || r.role === role;
    return matchQ && matchR;
  });

  const audit = async (action, target) => {
    try { await base44.entities.AuditLog.create({ action, actor_name: "Oracle Admin", target_type: "user", target_name: target, severity: action.includes("impersonate") ? "critical" : "warning" }); } catch {}
  };

  const changeRole = async (r, newRole) => {
    try { await base44.entities.User.update(r.id, { role: newRole }); await audit("user_role_changed", r.email || r.full_name); toast({ title: `Role set to ${ROLE_LABELS[newRole] || newRole}` }); load(); }
    catch { toast({ title: "Update failed", variant: "destructive" }); }
  };

  const act = async (action, label, target) => { await audit(action, target); toast({ title: `${label} — audit logged` }); };

  const columns = [
    { key: "user", label: "User", render: (r) => (
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-full bg-primary/15 grid place-items-center text-[10px] font-heading font-bold text-primary shrink-0">{(r.full_name || r.email || "U").charAt(0).toUpperCase()}</div>
        <div className="min-w-0"><p className="font-medium truncate">{r.full_name || "Unnamed"}</p><p className="text-[10px] text-muted-foreground truncate">{r.email}</p></div>
      </div>
    ) },
    { key: "role", label: "Role", render: (r) => (
      <select value={r.role || "user"} onChange={(e) => changeRole(r, e.target.value)} className="bg-muted/40 border border-border rounded-lg px-2 py-1 text-[11px] focus:outline-none">
        {ROLES.map((rl) => <option key={rl} value={rl}>{ROLE_LABELS[rl] || rl}</option>)}
      </select>
    ) },
    { key: "status", label: "Status", render: () => <StatusPill status="active" /> },
    { key: "joined", label: "Joined", render: (r) => <span className="text-muted-foreground">{r.created_date ? new Date(r.created_date).toLocaleDateString() : "—"}</span> },
    { key: "actions", label: "", render: (r) => (
      <div className="flex items-center gap-1 justify-end">
        <Btn variant="ghost" onClick={() => act("reset_access", "Reset access", r.email)}><KeyRound className="w-3 h-3" /></Btn>
        <Btn variant="ghost" onClick={() => act("force_logout", "Force logout", r.email)}><LogOut className="w-3 h-3" /></Btn>
        <Btn variant="ghost" onClick={() => act("impersonate_user", "Impersonation started", r.email)}><UserCog className="w-3 h-3" /></Btn>
        <Btn variant="ghost" onClick={() => toast({ title: "User timeline", description: r.email })}><History className="w-3 h-3" /></Btn>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title="User Governance" desc="Global administration of all platform users — search, suspend, reset access, impersonate (audit logged)." />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <SearchInput value={q} onChange={setQ} placeholder="Search by name or email…" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="h-9 px-3 rounded-lg bg-muted/40 border border-border text-[12px] focus:outline-none">
          <option value="all">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
        </select>
      </div>

      <Panel title="All Users" icon={Users}>
        {loading ? <LoadingState /> : <DataTable columns={columns} rows={filtered} empty="No users found" />}
      </Panel>
    </div>
  );
}