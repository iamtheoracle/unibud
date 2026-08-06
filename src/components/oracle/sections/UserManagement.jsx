import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setUsers(await base44.entities.User.list("-created_date", 100)); } catch {} finally { setLoading(false); } })(); }, []);

  const filtered = users.filter((u) => !q || (u.full_name || "").toLowerCase().includes(q.toLowerCase()) || (u.email || "").toLowerCase().includes(q.toLowerCase()));

  const invite = async () => {
    const email = prompt("Enter email to invite as a user:");
    if (!email) return;
    try { await base44.users.inviteUser(email, "user"); toast({ title: "Invitation sent" }); } catch { toast({ title: "Invite failed" }); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-[20px] font-heading font-bold">User Management</h1><p className="text-[13px] text-muted-foreground">{users.length} platform users.</p></div>
        <Button onClick={invite}><UserPlus className="w-4 h-4 mr-1" />Invite</Button>
      </div>
      <div className="relative max-w-[320px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" className="pl-9" /></div>

      {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : filtered.length === 0 ? <p className="text-muted-foreground text-[13px]">No users found.</p> :
        <div className="glass-card radius-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-muted/40 text-muted-foreground"><tr><th className="text-left font-semibold px-4 py-2.5">Name</th><th className="text-left font-semibold px-4 py-2.5 hidden sm:table-cell">Email</th><th className="text-left font-semibold px-4 py-2.5">Role</th></tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border"><td className="px-4 py-2.5 font-medium">{u.full_name || "—"}</td><td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{u.email || "—"}</td><td className="px-4 py-2.5"><Badge variant="secondary">{u.role || "user"}</Badge></td></tr>
              ))}
            </tbody>
          </table>
        </div>}
    </div>
  );
}