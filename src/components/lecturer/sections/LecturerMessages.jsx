import React, { useState } from "react";
import { Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { SectionTitle, textareaCls } from "../ui";

export default function LecturerMessages() {
  const [m, setM] = useState({ to: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!m.to || !m.subject) { toast({ title: "Recipient and subject required" }); return; }
    setSending(true);
    try { await base44.integrations.Core.SendEmail({ to: m.to, subject: m.subject, body: m.body }); toast({ title: "Message sent" }); setM({ to: "", subject: "", body: "" }); }
    catch { toast({ title: "Send failed — registered users only" }); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-4 max-w-[640px]">
      <p className="text-[13px] text-muted-foreground">Communicate with your classes. Email reaches registered UNIBUD users.</p>
      <SectionTitle title="New Message" />
      <div className="glass-card radius-lg p-4 space-y-3">
        <UDSInput label="To" value={m.to} onChange={(e) => setM({ ...m, to: e.target.value })} placeholder="student@email" />
        <UDSInput label="Subject" value={m.subject} onChange={(e) => setM({ ...m, subject: e.target.value })} />
        <div><span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Message</span><textarea value={m.body} onChange={(e) => setM({ ...m, body: e.target.value })} rows={5} className={textareaCls} /></div>
        <UDSButton onClick={send} disabled={sending}><Send className="w-4 h-4 mr-1" />{sending ? "Sending…" : "Send"}</UDSButton>
      </div>
    </div>
  );
}