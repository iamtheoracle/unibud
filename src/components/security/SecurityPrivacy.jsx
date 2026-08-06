import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Lock, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

const DEFAULT = { profile_visibility: "institution", search_visibility: true, messaging: "institution", data_sharing: false, consent_marketing: false };

export default function SecurityPrivacy({ user }) {
  const [p, setP] = useState(DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setP({ ...DEFAULT, ...(user?.data?.privacy || {}) }); }, [user?.id]);

  const save = async (next) => { setSaving(true); try { const merged = { ...next }; await base44.auth.updateMe({ privacy: merged }); setP(merged); toast({ title: "Privacy updated" }); } catch { toast({ title: "Save failed" }); } finally { setSaving(false); } };
  const set = (k, v) => save({ ...p, [k]: v });

  const download = async () => {
    const blob = new Blob([JSON.stringify({ user: { id: user.id, email: user.email, data: user.data || {} }, exported_at: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "unibud-my-data.json"; a.click(); URL.revokeObjectURL(url);
  };
  const erase = async () => {
    if (!window.confirm("Delete my data? This removes your devices, security events, and notifications. Your account remains. This cannot be undone.")) return;
    try { await base44.entities.Device.deleteMany({ user_id: user.id }); } catch {}
    try { await base44.entities.SecurityEvent.deleteMany({ user_id: user.id }); } catch {}
    try { await base44.entities.Notification.deleteMany({ user_id: user.id }); } catch {}
    toast({ title: "Your data has been deleted" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /><h2 className="text-[18px] font-heading font-bold">Privacy</h2></div>

      <div className="glass-card radius-lg p-4 space-y-4">
        <Row label="Profile visibility"><Select value={p.profile_visibility} onValueChange={(v) => set("profile_visibility", v)}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="institution">Institution only</SelectItem><SelectItem value="private">Private</SelectItem></SelectContent></Select></Row>
        <Row label="Search visibility"><Switch checked={p.search_visibility} onCheckedChange={(v) => set("search_visibility", v)} /></Row>
        <Row label="Messaging permissions"><Select value={p.messaging} onValueChange={(v) => set("messaging", v)}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="everyone">Everyone</SelectItem><SelectItem value="institution">Institution only</SelectItem><SelectItem value="none">No one</SelectItem></SelectContent></Select></Row>
        <Row label="Data sharing for analytics"><Switch checked={p.data_sharing} onCheckedChange={(v) => set("data_sharing", v)} /></Row>
        <Row label="Marketing consent"><Switch checked={p.consent_marketing} onCheckedChange={(v) => set("consent_marketing", v)} /></Row>
        {saving && <p className="text-[12px] text-muted-foreground">Saving…</p>}
      </div>

      <div className="glass-card radius-lg p-4 space-y-3">
        <p className="text-[14px] font-heading font-semibold">Your data</p>
        <Button variant="secondary" onClick={download}><Download className="w-4 h-4 mr-1" />Download my data</Button>
        <Button variant="danger" onClick={erase}><Trash2 className="w-4 h-4 mr-1" />Delete my data</Button>
      </div>
    </div>
  );
}

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4"><span className="text-[13px]">{label}</span>{children}</div>
);