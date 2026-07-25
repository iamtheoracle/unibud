import React, { useEffect, useState } from "react";
import { Plus, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";

export default function PortalCommunications({ institution }) {
  const [list, setList] = useState([]);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", audience: "entire_university", priority: "normal" });
  const [email, setEmail] = useState({ to: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);

  const load = async () => { try { setList(await base44.entities.StaffAnnouncement.filter({ institution_id: institution.id })); } catch {} };
  useEffect(() => { load(); }, [institution]);

  const publish = async () => {
    if (!form.title || !form.message) { toast({ title: "Title and message required" }); return; }
    try {
      await base44.entities.StaffAnnouncement.create({ ...form, institution_id: institution.id, status: "published", author_name: institution.short_name || institution.name });
      setForm({ title: "", message: "", audience: "entire_university", priority: "normal" });
      setComposing(false);
      toast({ title: "Announcement published" });
      load();
    } catch { toast({ title: "Failed to publish" }); }
  };

  const sendEmail = async () => {
    if (!email.to || !email.subject) { toast({ title: "Recipient and subject required" }); return; }
    setSending(true);
    try { await base44.integrations.Core.SendEmail({ to: email.to, subject: email.subject, body: email.body }); toast({ title: "Email queued" }); setEmail({ to: "", subject: "", body: "" }); }
    catch { toast({ title: "Email failed — registered users only" }); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-4 max-w-[760px]">
      <div className="flex gap-2 flex-wrap items-center">
        <UDSButton size="sm" onClick={() => setComposing((c) => !c)}><Plus className="w-4 h-4 mr-1" />Announcement</UDSButton>
        <span className="text-[12px] text-muted-foreground">Channels: Announcements · Broadcasts · Emergency · Email · Push · SMS</span>
      </div>

      {composing && (
        <div className="glass-card radius-lg p-4 space-y-3">
          <UDSInput label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div>
            <span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Message</span>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="w-full mt-1 p-3 rounded-xl bg-muted/40 border border-border text-[14px] focus:outline-none focus:border-primary/60" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Audience" value={form.audience} onChange={(v) => setForm({ ...form, audience: v })} options={["entire_university", "faculty", "department", "course", "class", "lecturers", "students"]} />
            <Select label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v })} options={["low", "normal", "high", "urgent"]} />
          </div>
          <UDSButton onClick={publish}>Publish announcement</UDSButton>
        </div>
      )}

      <div className="glass-card radius-lg p-4 space-y-3">
        <p className="text-[13px] font-semibold">Direct Email (registered users)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UDSInput label="To" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} placeholder="registered@email" />
          <UDSInput label="Subject" value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} />
        </div>
        <div>
          <span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Body</span>
          <textarea value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })} rows={3} className="w-full mt-1 p-3 rounded-xl bg-muted/40 border border-border text-[14px] focus:outline-none focus:border-primary/60" />
        </div>
        <UDSButton onClick={sendEmail} disabled={sending}><Send className="w-4 h-4 mr-1" />{sending ? "Sending…" : "Send email"}</UDSButton>
      </div>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold">Recent announcements</p>
        {list.length === 0 ? <p className="text-muted-foreground text-[13px]">None.</p>
          : list.map((a) => (
            <div key={a.id} className="glass-card radius-lg p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px]">{a.title}</p>
                <p className="text-[12px] text-muted-foreground truncate">{a.message}</p>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0 capitalize">{a.audience?.replace("_", " ")} · {a.priority}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

const Select = ({ label, value, onChange, options }) => (
  <div>
    <span className="text-[12px] font-semibold text-muted-foreground ml-0.5">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/40 border border-border text-[14px] capitalize focus:outline-none focus:border-primary/60">
      {options.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
    </select>
  </div>
);