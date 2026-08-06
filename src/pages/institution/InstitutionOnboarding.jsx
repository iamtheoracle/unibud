import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import UDSSuccessState from "@/components/uds/UDSSuccessState";
import { INSTITUTION_TYPES } from "@/lib/institution/roles";
import { toast } from "@/components/ui/use-toast";

export default function InstitutionOnboarding() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", type: "University", country: "", city: "", website: "", admin_contact_email: "", admin_contact_name: "", motto: "", accent_color: "#7FD8FF" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!form.name) { toast({ title: "Institution name required" }); return; }
    setSubmitting(true);
    try {
      const inst = await base44.entities.Institution.create({ ...form, verification_status: "awaiting_verification", is_verified: false, status: "active" });
      await base44.auth.updateMe({ institution_id: inst.id });
      setDone(true);
      toast({ title: "Institution registered — pending approval" });
    } catch { toast({ title: "Registration failed" }); }
    finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <div className="w-full max-w-[520px] mx-auto px-5 pt-10 pb-20 safe-area-pt">
        <PageHeader title="Onboarding" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <UDSSuccessState title="Application submitted" message="Your institution is pending verification. A UNIBUD platform administrator will review and activate it. You'll be notified on approval." action={<UDSButton onClick={() => navigate("/institution/console")}>Go to console</UDSButton>} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Register Institution" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card radius-xl p-5 space-y-3.5">
        <UDSInput label="Institution Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. University of Lagos" />
        <div>
          <span className="text-label font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Institution Type</span>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-12 px-4 bg-muted/50 border border-border radius-lg text-body text-foreground focus:outline-none focus:border-primary/60">
            {INSTITUTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <UDSInput label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <UDSInput label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <UDSInput label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
        <div className="grid grid-cols-2 gap-3">
          <UDSInput label="Admin Name" value={form.admin_contact_name} onChange={(e) => setForm({ ...form, admin_contact_name: e.target.value })} />
          <UDSInput label="Admin Email" type="email" value={form.admin_contact_email} onChange={(e) => setForm({ ...form, admin_contact_email: e.target.value })} />
        </div>
        <UDSInput label="Motto (optional)" value={form.motto} onChange={(e) => setForm({ ...form, motto: e.target.value })} />
        <div>
          <span className="text-label font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Accent Color</span>
          <input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="w-full h-10 rounded-xl bg-muted/50 border border-border" />
        </div>
        <p className="text-caption text-muted-foreground">Institutions remain pending until a platform administrator verifies and activates them. Branding never overrides the core UNIBUD experience.</p>
        <UDSButton onClick={submit} disabled={submitting} className="w-full">{submitting ? "Submitting…" : "Submit for verification"}</UDSButton>
      </motion.div>
    </div>
  );
}