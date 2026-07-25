import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, BadgeCheck, Flag, Check, X, Loader2, ArrowLeft } from "lucide-react";

export default function ModerationQueue() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setReports(await base44.entities.ContentReport.filter({ status: "pending" }));
      setVerifications(await base44.entities.VerificationRequest.filter({ status: "pending" }));
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => {
    (async () => { const me = await base44.auth.me(); setUser(me); if (me?.role !== "admin") { return; } load(); })();
  }, []);

  if (!user) return <div className="min-h-screen grid place-items-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (user.role !== "admin") {
    return <div className="min-h-screen grid place-items-center px-6"><div className="glass-card radius-lg p-6 text-center max-w-sm"><ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="font-heading font-semibold">Admins only</p><p className="text-[12px] text-muted-foreground mt-1">The moderation queue is for platform administrators.</p><button onClick={() => navigate("/ecosystem")} className="mt-3 text-primary text-[13px] font-semibold">Back to Ecosystem</button></div></div>;
  }

  const actionReport = async (id, status, action_taken) => { try { await base44.entities.ContentReport.update(id, { status, action_taken, moderator_notes: "reviewed" }); toast({ title: status === "actioned" ? "Content actioned" : "Report dismissed" }); load(); } catch {} };

  const approve = async (v) => {
    try {
      await base44.entities.VerificationRequest.update(v.id, { status: "approved", reviewed_at: new Date().toISOString(), reviewed_by_id: user.id });
      if (v.target_type === "listing") await base44.entities.MarketplaceListing.update(v.target_id, { is_verified: true }).catch(() => {});
      else if (v.target_type === "community") await base44.entities.Community.update(v.target_id, { is_verified: true }).catch(() => {});
      else if (v.target_type === "club") await base44.entities.Club.update(v.target_id, { is_verified: true }).catch(() => {});
      toast({ title: "Verified" }); load();
    } catch {}
  };
  const reject = async (id) => { try { await base44.entities.VerificationRequest.update(id, { status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by_id: user.id }); toast({ title: "Rejected" }); load(); } catch {} };

  return (
    <div className="min-h-screen pb-12">
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30"><ArrowLeft className="w-[18px] h-[18px]" /></button>
        <div className="flex-1"><h1 className="font-heading font-extrabold text-[22px] tracking-tight">Moderation</h1><p className="text-[12px] text-muted-foreground">Reports & verification requests</p></div>
        <ShieldCheck className="w-5 h-5 text-primary" />
      </div>

      <div className="px-4 flex gap-2 mb-3">
        {["reports", "verifications"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-[14px] text-[12px] font-semibold capitalize spring-tap ${tab === t ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="px-4 space-y-2.5">
        {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> :
          tab === "reports" ? (
            reports.length === 0 ? <p className="text-muted-foreground text-[13px]">No pending reports. 🎉</p> :
            reports.map((r) => (
              <div key={r.id} className="glass-card radius-lg p-3">
                <div className="flex items-start gap-2"><Flag className="w-4 h-4 text-destructive mt-0.5" /><div className="flex-1"><p className="font-semibold text-[13px] capitalize">{r.reason?.replace(/_/g, " ")} · <span className="text-muted-foreground capitalize">{r.content_type?.replace(/_/g, " ")}</span></p>{r.description && <p className="text-[12px] text-muted-foreground">{r.description}</p>}<p className="text-[11px] text-muted-foreground mt-0.5">By {r.reporter_name}{r.reported_user_name ? ` · about ${r.reported_user_name}` : ""}</p></div></div>
                <div className="flex gap-2 mt-2"><button onClick={() => actionReport(r.id, "actioned", "content_removed")} className="flex-1 py-2 rounded-[12px] bg-destructive text-destructive-foreground text-[11px] font-semibold flex items-center justify-center gap-1"><X className="w-3.5 h-3.5" />Remove content</button><button onClick={() => actionReport(r.id, "dismissed", "none")} className="flex-1 py-2 rounded-[12px] glass text-[11px] font-semibold">Dismiss</button></div>
              </div>
            ))
          ) : (
            verifications.length === 0 ? <p className="text-muted-foreground text-[13px]">No pending verification requests.</p> :
            verifications.map((v) => (
              <div key={v.id} className="glass-card radius-lg p-3">
                <div className="flex items-start gap-2"><BadgeCheck className="w-4 h-4 text-primary mt-0.5" /><div className="flex-1"><p className="font-semibold text-[13px]">{v.target_name || v.target_id}</p><p className="text-[11px] text-muted-foreground capitalize">{v.target_type} · requested by {v.requester_name}</p>{v.notes && <p className="text-[12px] text-muted-foreground mt-0.5">{v.notes}</p>}{v.evidence_url && <a href={v.evidence_url} target="_blank" rel="noreferrer" className="text-[11px] text-primary underline">View evidence</a>}</div></div>
                <div className="flex gap-2 mt-2"><button onClick={() => approve(v)} className="flex-1 py-2 rounded-[12px] bg-success text-success-foreground text-[11px] font-semibold flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" />Approve</button><button onClick={() => reject(v.id)} className="flex-1 py-2 rounded-[12px] glass text-[11px] font-semibold">Reject</button></div>
              </div>
            ))
          )}
      </div>
    </div>
  );
}