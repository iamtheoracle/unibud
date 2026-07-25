import React, { useState } from "react";
import { Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import { SectionTitle, textareaCls } from "@/components/lecturer/ui";

export default function ParentMessaging({ data }) {
  const [m, setM] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const to = data.student?.email || "";

  const send = async () => {
    if (!to) { toast({ title: "Student email unavailable" }); return; }
    if (!m.subject) { toast({ title: "Subject required" }); return; }
    setSending(true);
    try { await base44.integrations.Core.SendEmail({ to, subject: m.subject, body: m.body }); toast({ title: "Message sent" }); setM({ subject: "", body: "" }); }
    catch { toast({ title: "Send failed — registered users only" }); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-4 max-w-[640px]">
      <p className="text-[13px] text-muted-foreground">Message your student directly. Messages go to {to || "—"}</p>
      <SectionTitle title="New Message" />
      <div className="glass-card radius-lg p-4 space-y-3">
        <UDSInput label="Subject" value={m.subject} onChange={(e) => setM({ ...m, subject: e.target.value })} />
        <div><span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Message</span><textarea value={m.body} onChange={(e) => setM({ ...m, body: e.target.value })} rows={5} className={textareaCls} /></div>
        <UDSButton onClick={send} disabled={sending}><Send className="w-4 h-4 mr-1" />{sending ? "Sending…" : "Send"}</UDSButton>
      </div>
    </div>
  );
}