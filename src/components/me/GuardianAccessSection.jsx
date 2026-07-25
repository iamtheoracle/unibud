import React, { useEffect, useState } from "react";
import { ShieldCheck, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import SectionHeader from "@/components/me/SectionHeader";

/**
 * GuardianAccessSection — student-side consent management.
 * Lets a student approve or decline a parent's request to monitor their progress.
 */
export default function GuardianAccessSection() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const res = await base44.functions.invoke("guardianConsent", { action: "list" }); setLinks(res.data?.links || []); }
    catch { setLinks([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const act = async (linkId, action) => {
    try { await base44.functions.invoke("guardianConsent", { action, link_id: linkId }); toast({ title: action === "approve" ? "Access approved" : "Request declined" }); load(); }
    catch { toast({ title: "Action failed" }); }
  };
  const revoke = async (id) => { try { await base44.entities.ConsentLink.update(id, { status: "revoked", revoked_at: new Date().toISOString() }); load(); } catch {} };

  const pending = links.filter((l) => l.status === "pending");
  const approved = links.filter((l) => l.status === "approved");

  return (
    <div className="space-y-3">
      <SectionHeader title="Guardian Access" action={<ShieldCheck className="w-5 h-5 text-primary" />} />
      <p className="text-[12px] text-muted-foreground -mt-1 px-1">Parents can monitor your progress only with your consent.</p>

      {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : (
        <>
          {links.length === 0 && <p className="text-muted-foreground text-[13px]">No guardian requests yet.</p>}

          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="text-[12px] font-semibold text-muted-foreground">Pending requests</p>
              {pending.map((l) => (
                <div key={l.id} className="glass-card radius-lg p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px]">{l.guardian_name || "Guardian"}</p>
                    <p className="text-[12px] text-muted-foreground">{l.relationship ? `${l.relationship} · ` : ""}wants to monitor your progress</p>
                  </div>
                  <div className="flex gap-2">
                    <UDSButton size="sm" onClick={() => act(l.id, "approve")}><Check className="w-4 h-4 mr-1" />Approve</UDSButton>
                    <UDSButton size="sm" variant="secondary" onClick={() => act(l.id, "decline")}><X className="w-4 h-4 mr-1" />Decline</UDSButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          {approved.length > 0 && (
            <div className="space-y-2">
              <p className="text-[12px] font-semibold text-muted-foreground">Approved guardians</p>
              {approved.map((l) => (
                <div key={l.id} className="glass-card radius-lg p-3 flex items-center gap-3">
                  <div className="flex-1"><p className="font-semibold text-[14px]">{l.guardian_name || "Guardian"}</p><p className="text-[12px] text-muted-foreground">{l.relationship || ""}</p></div>
                  <button onClick={() => revoke(l.id)} className="text-[12px] text-destructive font-semibold">Revoke</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}