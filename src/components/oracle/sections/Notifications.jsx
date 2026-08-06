import React, { useEffect, useState } from "react";
import { Bell, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const TYPES = ["system", "academic", "campus", "emergency", "reminder", "bud", "marketplace"];

export default function Notifications() {
  const [form, setForm] = useState({ title: "", message: "", type: "system" });
  const [sending, setSending] = useState(false);
  const [list, setList] = useState([]);

  const load = async () => { try { setList(await base44.entities.Notification.list("-created_date", 20)); } catch {} };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!form.title || !form.message) { toast({ title: "Title and message required" }); return; }
    setSending(true);
    try {
      await base44.entities.Notification.create({ title: form.title, message: form.message, type: form.type, priority: "normal", category: "system" });
      setForm({ title: "", message: "", type: "system" });
      toast({ title: "Broadcast sent" });
      load();
    } catch { toast({ title: "Send failed" }); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-[20px] font-heading font-bold">Notifications</h1><p className="text-[13px] text-muted-foreground">Broadcast platform-wide notifications to all users.</p></div>

      <div className="glass-card radius-lg p-4 space-y-3 max-w-[560px]">
        <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} /></div>
        <div><Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button onClick={send} disabled={sending}>{sending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Sending…</> : <><Send className="w-4 h-4 mr-1" />Broadcast</>}</Button>
      </div>

      <div>
        <h3 className="font-heading font-semibold text-[15px] mb-2">Recent broadcasts</h3>
        {list.length === 0 ? <p className="text-muted-foreground text-[13px]">None yet.</p> :
          <div className="space-y-2">{list.map((n) => (
            <div key={n.id} className="glass-card radius-lg p-3 flex items-start gap-3"><Bell className="w-4 h-4 text-primary mt-0.5" /><div className="flex-1"><p className="font-semibold text-[14px]">{n.title}</p><p className="text-[12px] text-muted-foreground">{n.message}</p><p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{n.type} · {n.created_date ? new Date(n.created_date).toLocaleString() : ""}</p></div></div>
          ))}</div>}
      </div>
    </div>
  );
}