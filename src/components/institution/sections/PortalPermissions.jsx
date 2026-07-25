import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { INSTITUTION_ROLES } from "@/lib/institution/roles";

export default function PortalPermissions({ institution, user }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("lecturer");
  const [inviting, setInviting] = useState(false);

  const invite = async () => {
    if (!email) { toast({ title: "Enter an email" }); return; }
    setInviting(true);
    try { await base44.users.inviteUser(email, role); toast({ title: "Invitation sent" }); setEmail(""); }
    catch { toast({ title: "Invite failed — admin permission required" }); }
    finally { setInviting(false); }
  };

  return (
    <div className="space-y-4 max-w-[760px]">
      <div className="glass-card radius-lg p-4 space-y-3">
        <p className="text-[14px] font-heading font-semibold">Invite a user to this institution</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UDSInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full mt-1 h-12 px-3 rounded-xl bg-muted/40 border border-border text-[14px] focus:outline-none focus:border-primary/60">
              {INSTITUTION_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex items-end"><UDSButton onClick={invite} disabled={inviting} className="w-full">{inviting ? "Inviting…" : "Send invite"}</UDSButton></div>
        </div>
        <p className="text-[12px] text-muted-foreground">Invited users join this tenant. Access is scoped by institution_id automatically.</p>
      </div>

      <div>
        <p className="text-[14px] font-heading font-semibold mb-2">Roles & permissions</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {INSTITUTION_ROLES.map((r) => (
            <div key={r.key} className="glass-card radius-lg p-3">
              <p className="text-[13px] font-semibold">{r.label}</p>
              <p className="text-[12px] text-muted-foreground">{r.manages.length ? r.manages.join(", ") : "Read-only access"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}