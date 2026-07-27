import React, { useEffect, useState } from "react";
import { Plus, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import AnnouncementComposer from "../AnnouncementComposer";
import AnnouncementListItem from "../AnnouncementListItem";

export default function PortalCommunications({ institution }) {
  const [list, setList] = useState([]);
  const [reads, setReads] = useState({});
  const [composing, setComposing] = useState(false);
  const [email, setEmail] = useState({ to: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      const rows = await base44.entities.StaffAnnouncement.filter({ institution_id: institution.id }, "-created_date", 100);
      // pin first, then newest
      rows.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setList(rows);
      const readEntries = await Promise.all(
        rows.map((r) => base44.entities.AnnouncementRead.filter({ announcement_id: r.id }).catch(() => []))
      );
      const map = {};
      rows.forEach((r, i) => { map[r.id] = (readEntries[i] || []).length; });
      setReads(map);
    } catch {}
  };

  useEffect(() => { load(); }, [institution]);

  const togglePin = async (a) => { try { await base44.entities.StaffAnnouncement.update(a.id, { pinned: !a.pinned }); load(); } catch { toast({ title: "Failed to update" }); } };
  const archive = async (a) => { try { await base44.entities.StaffAnnouncement.update(a.id, { status: "archived", pinned: false }); load(); toast({ title: "Announcement archived" }); } catch { toast({ title: "Failed to archive" }); } };
  const remove = async (a) => { try { await base44.entities.StaffAnnouncement.delete(a.id); load(); toast({ title: "Announcement deleted" }); } catch { toast({ title: "Failed to delete" }); } };

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
        <UDSButton size="sm" onClick={() => setComposing((c) => !c)}><Plus className="w-4 h-4 mr-1" />New announcement</UDSButton>
        <span className="text-[12px] text-muted-foreground">Schedule · Attach files · Pin · Track reads · Set expiry</span>
      </div>

      {composing && <AnnouncementComposer institution={institution} onPublished={() => { setComposing(false); load(); }} />}

      <div className="space-y-2">
        <p className="text-[13px] font-semibold">All announcements ({list.length})</p>
        {list.length === 0 ? <p className="text-muted-foreground text-[13px]">No announcements yet.</p>
          : list.map((a) => (
            <AnnouncementListItem key={a.id} a={a} readCount={reads[a.id]} onTogglePin={togglePin} onArchive={archive} onDelete={remove} />
          ))}
      </div>

      {/* Direct email — registered users only */}
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
    </div>
  );
}