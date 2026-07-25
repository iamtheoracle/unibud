import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, Star, BadgeCheck, Loader2, ArrowLeft, Flag } from "lucide-react";

export default function TrustCenter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [computing, setComputing] = useState(true);
  const [req, setReq] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ evidence_url: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const res = await base44.functions.invoke("trustProfile", { user_id: me.id, user_name: me.full_name });
        setProfile(res.data);
        try { const r = await base44.entities.VerificationRequest.filter({ target_type: "user", target_id: me.id, requester_id: me.id }); setReq(r[0] || null); } catch {}
        try { setReviews(await base44.entities.MarketplaceReview.filter({ seller_id: me.id })); } catch {}
      } catch {}
      finally { setComputing(false); }
    })();
  }, []);

  const submitReq = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const created = await base44.entities.VerificationRequest.create({
        target_type: "user", target_id: user.id, target_name: user.full_name,
        requester_id: user.id, requester_name: user.full_name,
        status: "pending", evidence_url: form.evidence_url, notes: form.notes,
        submitted_at: new Date().toISOString(),
      });
      setReq(created); setForm({ evidence_url: "", notes: "" });
      toast({ title: "Verification requested" });
    } catch { toast({ title: "Failed to submit" }); }
    finally { setSubmitting(false); }
  };

  if (computing) return <div className="min-h-screen grid place-items-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!user) return <div className="min-h-screen grid place-items-center"><button onClick={() => navigate("/login")} className="text-primary font-semibold">Sign in</button></div>;

  const levelColor = { star: "text-warning", trusted: "text-success", verified: "text-primary", unverified: "text-muted-foreground", new: "text-muted-foreground" }[profile?.level || "new"];

  return (
    <div className="min-h-screen pb-12">
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30"><ArrowLeft className="w-[18px] h-[18px]" /></button>
        <div className="flex-1"><h1 className="font-heading font-extrabold text-[22px] tracking-tight">Trust Profile</h1><p className="text-[12px] text-muted-foreground">{user.full_name}</p></div>
        <ShieldCheck className="w-5 h-5 text-primary" />
      </div>

      <div className="px-4 space-y-4">
        <div className="glass-card radius-lg p-5 text-center">
          <div className="relative w-28 h-28 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(profile?.score || 0) * 2.76} 276`} />
            </svg>
            <div className="absolute inset-0 grid place-items-center"><div><p className="text-[28px] font-heading font-bold">{profile?.score ?? 0}</p><p className="text-[10px] text-muted-foreground">/ 100</p></div></div>
          </div>
          <p className={`font-heading font-semibold text-[15px] mt-2 capitalize ${levelColor}`}>{profile?.level || "new"}{profile?.verified ? " · Verified" : ""}</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Stat label="Reviews" value={profile?.reviews_count || 0} />
          <Stat label="Avg" value={profile?.reviews_avg ? `${profile.reviews_avg}★` : "—"} />
          <Stat label="Reports" value={profile?.reports_count || 0} />
          <Stat label="Listings" value={profile?.listings_count || 0} />
        </div>

        <div className="glass-card radius-lg p-4">
          <div className="flex items-center gap-2 mb-2"><BadgeCheck className="w-4 h-4 text-primary" /><h3 className="font-heading font-semibold text-[14px]">Verification</h3></div>
          {req ? (
            <p className="text-[12px] text-muted-foreground">Your verification request is <span className="font-semibold capitalize">{req.status}</span>.{req.status === "approved" ? " You're verified ✓" : req.status === "rejected" ? " You can resubmit with more evidence." : " Awaiting moderator review."}</p>
          ) : (
            <>
              <p className="text-[12px] text-muted-foreground mb-3">Get a verified badge by submitting evidence of your identity/student status.</p>
              <input value={form.evidence_url} onChange={(e) => setForm({ ...form, evidence_url: e.target.value })} placeholder="Evidence URL (ID/student card link)" className="w-full h-10 px-3 rounded-xl bg-muted/40 border border-border text-[13px] mb-2" />
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Notes for the reviewer" className="w-full p-3 rounded-xl bg-muted/40 border border-border text-[13px] mb-3" />
              <button onClick={submitReq} disabled={submitting} className="w-full py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap disabled:opacity-50">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}Request verification</button>
            </>
          )}
        </div>

        <div className="glass-card radius-lg p-4">
          <div className="flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-warning" /><h3 className="font-heading font-semibold text-[14px]">Reviews received</h3></div>
          {reviews.length === 0 ? <p className="text-[12px] text-muted-foreground">No reviews yet. Complete a marketplace exchange to earn reviews.</p> :
            <div className="space-y-2">{reviews.map((r) => (
              <div key={r.id} className="rounded-[14px] bg-muted/30 p-3"><div className="flex items-center gap-1 mb-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-warning fill-warning" : "text-muted-foreground/40"}`} />)}</div>{r.comment && <p className="text-[12px] text-muted-foreground">{r.comment}</p>}</div>
            ))}</div>}
        </div>

        {profile?.reports_count > 0 && (
          <div className="glass-card radius-lg p-4 flex items-start gap-2 border border-destructive/30"><Flag className="w-4 h-4 text-destructive mt-0.5" /><p className="text-[12px] text-muted-foreground">{profile.reports_count} report(s) filed against your account. Repeated violations can lower your trust score and lead to suspension.</p></div>
        )}
      </div>
    </div>
  );
}

const Stat = ({ label, value }) => <div className="glass-card radius-md p-3 text-center"><p className="text-[18px] font-heading font-bold">{value}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p></div>;