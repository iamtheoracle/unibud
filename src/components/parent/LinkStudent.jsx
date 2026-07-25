import React, { useEffect, useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { Empty, SectionTitle } from "@/components/lecturer/ui";

export default function LinkStudent({ user, links, onReload }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ student_email: "", student_name: "", relationship: "" });

  const create = async () => {
    if (!form.student_email) { toast({ title: "Student email required" }); return; }
    try {
      await base44.entities.ConsentLink.create({
        guardian_id: user.id, guardian_name: user.full_name,
        student_email: form.student_email, student_name: form.student_name, relationship: form.relationship,
        status: "pending", requested_at: new Date().toISOString(),
      });
      setForm({ student_email: "", student_name: "", relationship: "" });
      setAdding(false);
      toast({ title: "Request sent", description: "The student must approve access." });
      onReload();
    } catch { toast({ title: "Failed to send request" }); }
  };

  const revoke = async (id) => { try { await base44.entities.ConsentLink.update(id, { status: "revoked", revoked_at: new Date().toISOString() }); onReload(); } catch {} };

  const pending = links.filter((l) => l.status === "pending");
  const declined = links.filter((l) => l.status === "declined");

  return (
    <div className="max-w-[560px] mx-auto px-4 pt-10 pb-16 space-y-5">
      <div className="glass-card radius-lg p-5">
        <h2 className="text-[17px] font-heading font-semibold">Monitor a student</h2>
        <p className="text-[13px] text-muted-foreground mt-1">Link to a student with their consent. They must approve before you can see any progress. Parents never gain unrestricted access.</p>
      </div>

      <SectionTitle title="Your links" action={<UDSButton size="sm" onClick={() => setAdding((a) => !a)}><Plus className="w-4 h-4 mr-1" />Link student</UDSButton>} />

      {adding && (
        <div className="glass-card radius-lg p-4 space-y-3">
          <UDSInput label="Student Email" value={form.student_email} onChange={(e) => setForm({ ...form, student_email: e.target.value })} placeholder="student@email" />
          <UDSInput label="Student Name" value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} />
          <UDSInput label="Relationship" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="Parent / Guardian" />
          <div className="flex gap-2"><UDSButton onClick={create}>Send request</UDSButton><UDSButton variant="secondary" onClick={() => setAdding(false)}>Cancel</UDSButton></div>
        </div>
      )}

      {links.length === 0 ? <Empty label="No links yet. Send a request to a student." /> : (
        <div className="space-y-2">
          {links.map((l) => (
            <div key={l.id} className="glass-card radius-lg p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px]">{l.student_name || l.student_email}</p>
                <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${l.status === "approved" ? "bg-success/15 text-success" : l.status === "pending" ? "bg-warning/15 text-warning" : l.status === "declined" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>{l.status}</span>
                  {l.relationship ? `· ${l.relationship}` : ""}
                </p>
              </div>
              {l.status !== "revoked" && <button onClick={() => revoke(l.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && <p className="text-[12px] text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pending.length} request(s) awaiting student approval.</p>}
      {declined.length > 0 && <p className="text-[12px] text-muted-foreground">Declined requests can be removed. The student must re-approve if you resend.</p>}
    </div>
  );
}