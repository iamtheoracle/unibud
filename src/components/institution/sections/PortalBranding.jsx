import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";

export default function PortalBranding({ institution }) {
  const [b, setB] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setB({
      logo_url: institution.logo_url || "", accent_color: institution.accent_color || "#7FD8FF",
      banner_url: institution.banner_url || "", website: institution.website || "",
      motto: institution.motto || "", timezone: institution.timezone || "",
      admin_contact_email: institution.admin_contact_email || "", admin_contact_name: institution.admin_contact_name || "",
      academic_calendar: JSON.stringify(institution.academic_calendar || {}, null, 0),
    });
  }, [institution]);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Institution.update(institution.id, {
        logo_url: b.logo_url, accent_color: b.accent_color, banner_url: b.banner_url, website: b.website,
        motto: b.motto, timezone: b.timezone, admin_contact_email: b.admin_contact_email, admin_contact_name: b.admin_contact_name,
        academic_calendar: JSON.parse(b.academic_calendar || "{}"),
      });
      toast({ title: "Branding saved" });
    } catch { toast({ title: "Save failed — check calendar JSON" }); }
    finally { setSaving(false); }
  };

  if (!b) return null;
  return (
    <div className="space-y-3 max-w-[640px]">
      <p className="text-[13px] text-muted-foreground">Institution branding never overrides the core UNIBUD experience.</p>
      <UDSInput label="Logo URL" value={b.logo_url} onChange={(e) => setB({ ...b, logo_url: e.target.value })} />
      <UDSInput label="Banner URL" value={b.banner_url} onChange={(e) => setB({ ...b, banner_url: e.target.value })} />
      <div>
        <span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Accent Color</span>
        <input type="color" value={b.accent_color} onChange={(e) => setB({ ...b, accent_color: e.target.value })} className="w-full h-10 mt-1 rounded-xl bg-muted/40 border border-border" />
      </div>
      <UDSInput label="Website" value={b.website} onChange={(e) => setB({ ...b, website: e.target.value })} />
      <UDSInput label="Motto" value={b.motto} onChange={(e) => setB({ ...b, motto: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <UDSInput label="Time Zone" value={b.timezone} onChange={(e) => setB({ ...b, timezone: e.target.value })} />
        <UDSInput label="Contact Email" value={b.admin_contact_email} onChange={(e) => setB({ ...b, admin_contact_email: e.target.value })} />
      </div>
      <UDSInput label="Contact Name" value={b.admin_contact_name} onChange={(e) => setB({ ...b, admin_contact_name: e.target.value })} />
      <div>
        <span className="text-[12px] font-semibold text-muted-foreground ml-0.5">Academic Calendar (JSON)</span>
        <textarea value={b.academic_calendar} onChange={(e) => setB({ ...b, academic_calendar: e.target.value })} rows={5} className="w-full mt-1 p-3 rounded-xl bg-muted/40 border border-border text-[12px] font-mono focus:outline-none focus:border-primary/60" />
      </div>
      <UDSButton onClick={save} disabled={saving}>{saving ? "Saving…" : "Save branding"}</UDSButton>
    </div>
  );
}