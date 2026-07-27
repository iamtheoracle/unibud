import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import DashboardShell from "@/components/uds/DashboardShell";
import DashboardWidget from "@/components/uds/DashboardWidget";
import UDSButton from "@/components/uds/UDSButton";
import UDSInput from "@/components/uds/UDSInput";
import UDSEmptyState from "@/components/uds/UDSEmptyState";
import UDSBadge from "@/components/uds/UDSBadge";
import { INSTITUTION_ROLES, isAdminRole } from "@/lib/institution/roles";
import { useInstitution } from "@/lib/institution/useInstitution";
import { toast } from "@/components/ui/use-toast";

const TABS = ["Overview", "Branding", "Academic", "People", "Roles"];

export default function InstitutionConsole() {
  const navigate = useNavigate();
  const { institution, user, loading, reload } = useInstitution();
  const [tab, setTab] = useState("Overview");
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [enrollment, setEnrollment] = useState(0);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("lecturer");

  useEffect(() => {
    if (institution) {
      setBranding({ logo_url: institution.logo_url || "", accent_color: institution.accent_color || "#7FD8FF", banner_url: institution.banner_url || "", description: institution.description || "", website: institution.website || "", admin_contact_email: institution.admin_contact_email || "", country: institution.country || "", city: institution.city || "", motto: "" });
      setAcademic({ credit_system: institution.credit_system || "", terminology: JSON.stringify(institution.terminology || {}, null, 0), grading_system: JSON.stringify(institution.grading_system || {}, null, 0), academic_calendar: JSON.stringify(institution.academic_calendar || {}, null, 0) });
    }
  }, [institution]);

  useEffect(() => {
    if (institution) {
      (async () => { try { const recs = await base44.entities.StudentRecord.filter({ university: institution.name }); setEnrollment(recs.length); } catch {} })();
    }
  }, [institution]);

  if (loading) return <div className="w-full max-w-[520px] mx-auto px-5 pt-10 safe-area-pt"><PageHeader title="Institution" /><p className="text-body text-muted-foreground">Loading…</p></div>;

  if (!user?.institution_id || !institution) {
    return (
      <div className="w-full max-w-[520px] mx-auto px-5 pt-10 pb-20 safe-area-pt">
        <PageHeader title="Institution" />
        <UDSEmptyState title="No institution yet" message="Register your institution to unlock the multi-tenant console, branding, academic configuration, and analytics." action={<UDSButton onClick={() => navigate("/institution/onboard")}>Register institution</UDSButton>} />
      </div>
    );
  }

  if (!isAdminRole(user.role)) {
    return (
      <div className="w-full max-w-[520px] mx-auto px-5 pt-10 pb-20 safe-area-pt">
        <PageHeader title="Institution" />
        <UDSEmptyState title="Administrators only" message="This console is for institution owners and administrators. Ask your institution admin to invite you with an admin role." action={<UDSButton variant="secondary" onClick={() => navigate("/home")}>Back to Campus</UDSButton>} />
      </div>
    );
  }

  const saveBranding = async () => {
    setSaving(true);
    try { await base44.entities.Institution.update(institution.id, { logo_url: branding.logo_url, accent_color: branding.accent_color, banner_url: branding.banner_url, description: branding.description, website: branding.website, admin_contact_email: branding.admin_contact_email, country: branding.country, city: branding.city }); toast({ title: "Branding saved" }); reload(); }
    catch { toast({ title: "Save failed" }); } finally { setSaving(false); }
  };
  const saveAcademic = async () => {
    setSaving(true);
    try { await base44.entities.Institution.update(institution.id, { credit_system: academic.credit_system, terminology: JSON.parse(academic.terminology || "{}"), grading_system: JSON.parse(academic.grading_system || "{}"), academic_calendar: JSON.parse(academic.academic_calendar || "{}") }); toast({ title: "Academic config saved" }); reload(); }
    catch { toast({ title: "Save failed — check JSON" }); } finally { setSaving(false); }
  };
  const invite = async () => {
    if (!inviteEmail) { toast({ title: "Enter an email" }); return; }
    try { await base44.users.inviteUser(inviteEmail, inviteRole); toast({ title: "Invitation sent" }); setInviteEmail(""); }
    catch { toast({ title: "Invite failed" }); }
  };

  return (
    <DashboardShell title={institution.name} subtitle={`${institution.type} · ${institution.verification_status?.replace("_", " ")}`} actions={<UDSButton variant="secondary" size="sm" onClick={() => navigate("/home")}>Back to Campus</UDSButton>}>
      <div className="col-span-full flex gap-2 mb-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 radius-md text-label font-semibold spring-tap whitespace-nowrap ${tab === t ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{t}</button>)}
      </div>

      {tab === "Overview" && (
        <>
          <DashboardWidget title="Verification"><UDSBadge variant={institution.is_verified ? "success" : "warning"}>{institution.verification_status?.replace("_", " ")}</UDSBadge></DashboardWidget>
          <DashboardWidget title="Enrollment" kpi={enrollment} kpiLabel="students" />
          <DashboardWidget title="Type" kpi={institution.type} />
          <DashboardWidget title="Location">{institution.city}{institution.country ? `, ${institution.country}` : ""}</DashboardWidget>
          <DashboardWidget title="Tenant" accent><p className="text-caption text-muted-foreground break-all">Isolated by institution_id. No cross-institution access.</p></DashboardWidget>
        </>
      )}

      {tab === "Branding" && (
        <div className="col-span-full glass-card radius-lg p-5 space-y-3.5">
          <UDSInput label="Logo URL" value={branding?.logo_url || ""} onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })} />
          <UDSInput label="Banner URL" value={branding?.banner_url || ""} onChange={(e) => setBranding({ ...branding, banner_url: e.target.value })} />
          <div>
            <span className="text-label font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Accent Color</span>
            <input type="color" value={branding?.accent_color || "#7FD8FF"} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} className="w-full h-10 rounded-xl bg-muted/50 border border-border" />
          </div>
          <UDSInput label="Website" value={branding?.website || ""} onChange={(e) => setBranding({ ...branding, website: e.target.value })} />
          <UDSInput label="Description" value={branding?.description || ""} onChange={(e) => setBranding({ ...branding, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <UDSInput label="Country" value={branding?.country || ""} onChange={(e) => setBranding({ ...branding, country: e.target.value })} />
            <UDSInput label="City" value={branding?.city || ""} onChange={(e) => setBranding({ ...branding, city: e.target.value })} />
          </div>
          <UDSInput label="Contact Email" value={branding?.admin_contact_email || ""} onChange={(e) => setBranding({ ...branding, admin_contact_email: e.target.value })} />
          <UDSButton onClick={saveBranding} disabled={saving}>{saving ? "Saving…" : "Save branding"}</UDSButton>
        </div>
      )}

      {tab === "Academic" && (
        <div className="col-span-full glass-card radius-lg p-5 space-y-3.5">
          <UDSInput label="Credit System (e.g. credit units, ECTS)" value={academic?.credit_system || ""} onChange={(e) => setAcademic({ ...academic, credit_system: e.target.value })} />
          <div>
            <span className="text-label font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Grading System (JSON)</span>
            <textarea value={academic?.grading_system || ""} onChange={(e) => setAcademic({ ...academic, grading_system: e.target.value })} rows={4} className="w-full p-4 bg-muted/50 border border-border radius-lg text-caption text-foreground font-mono focus:outline-none focus:border-primary/60" placeholder='{"scale":"A-F","pass":40}' />
          </div>
          <div>
            <span className="text-label font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Terminology (JSON)</span>
            <textarea value={academic?.terminology || ""} onChange={(e) => setAcademic({ ...academic, terminology: e.target.value })} rows={4} className="w-full p-4 bg-muted/50 border border-border radius-lg text-caption text-foreground font-mono focus:outline-none focus:border-primary/60" placeholder='{"faculty":"School","semester":"Term"}' />
          </div>
          <div>
            <span className="text-label font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Academic Calendar (JSON)</span>
            <textarea value={academic?.academic_calendar || ""} onChange={(e) => setAcademic({ ...academic, academic_calendar: e.target.value })} rows={4} className="w-full p-4 bg-muted/50 border border-border radius-lg text-caption text-foreground font-mono focus:outline-none focus:border-primary/60" placeholder='{"semester_system":"semester"}' />
          </div>
          <UDSButton onClick={saveAcademic} disabled={saving}>{saving ? "Saving…" : "Save academic config"}</UDSButton>
        </div>
      )}

      {tab === "People" && (
        <div className="col-span-full glass-card radius-lg p-5 space-y-3.5">
          <p className="text-subtitle font-heading font-semibold text-foreground">Invite a user to this institution</p>
          <div className="grid grid-cols-2 gap-3">
            <UDSInput label="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <div>
              <span className="text-label font-semibold text-muted-foreground/90 ml-1 block mb-1.5">Role</span>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full h-12 px-4 bg-muted/50 border border-border radius-lg text-body text-foreground focus:outline-none focus:border-primary/60">
                {INSTITUTION_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <UDSButton onClick={invite}>Send invitation</UDSButton>
          <p className="text-caption text-muted-foreground">Invited users join this tenant. Access is scoped by institution_id automatically.</p>
        </div>
      )}

      {tab === "Roles" && (
        <div className="col-span-full space-y-2">
          {INSTITUTION_ROLES.map((r) => (
            <div key={r.key} className="glass-card radius-lg p-4">
              <p className="text-subtitle font-heading font-semibold text-foreground">{r.label}</p>
              <p className="text-caption text-muted-foreground mt-0.5">{r.manages.length ? r.manages.join(", ") : "Read-only access"}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}