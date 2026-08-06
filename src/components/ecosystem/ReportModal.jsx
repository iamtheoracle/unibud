import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Flag, X, Loader2 } from "lucide-react";

const REASONS = [
  "scam", "fake_listing", "counterfeit", "spam", "harassment", "inappropriate",
  "misinformation", "illegal", "malicious_link", "duplicate", "offensive", "other",
];

export default function ReportModal({ open, onClose, contentType, contentId, reportedUserId, reportedUserName }) {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [reason, setReason] = useState("scam");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setReason("scam"); setDesc(""); base44.auth.me().then(setUser).catch(() => {}); } }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (!user) { toast({ title: "Sign in to report" }); return; }
    setSaving(true);
    try {
      await base44.entities.ContentReport.create({
        content_type: contentType,
        content_id: contentId,
        reporter_id: user.id,
        reporter_name: user.full_name,
        reason,
        description: desc,
        reported_user_id: reportedUserId,
        reported_user_name: reportedUserName,
        status: "pending",
      });
      toast({ title: "Report submitted", description: "Our moderation team will review it." });
      onClose();
    } catch { toast({ title: "Failed to submit report" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm safe-area-px" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] glass-strong p-5 safe-area-pb" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-[17px] flex items-center gap-2"><Flag className="w-4 h-4 text-destructive" />Report</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-[12px] hover:bg-muted/60 grid place-items-center"><X className="w-[18px] h-[18px]" /></button>
        </div>
        <p className="text-[12px] text-muted-foreground mb-3">Help keep UNIBUD safe. Reports are reviewed by moderators and feed into our Trust System.{reportedUserName ? ` You are reporting "${reportedUserName}".` : ""}</p>
        <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Reason</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-muted/40 border border-border text-[13px] capitalize mb-3">
          {REASONS.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
        </select>
        <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Details (optional)</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="w-full p-3 rounded-xl bg-muted/40 border border-border text-[13px] mb-4" placeholder="Add any context…" />
        <button onClick={submit} disabled={saving} className="w-full py-3 rounded-[16px] bg-destructive text-destructive-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><Flag className="w-4 h-4" />Submit report</>}
        </button>
      </div>
    </div>
  );
}