import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Building2, Users, Save, Loader2,
  IdCard, CalendarDays, GraduationCap, BookOpen, Phone, MapPin, FileText, Plus, Trash2,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import InstitutionStatusBadge from "@/components/institution/InstitutionStatusBadge";
import {
  INSTITUTION_TYPES, IDENTIFIER_TYPES,
  MATRICULATION_TIMING, CREDIT_SYSTEMS, TERM_TYPES, ORG_UNIT_TYPES,
} from "@/lib/institutionConfig";
import { useToast } from "@/components/ui/use-toast";

const SECTIONS = [
  { key: "profile", label: "Profile", icon: Building2 },
  { key: "identifiers", label: "Student IDs", icon: IdCard },
  { key: "academic", label: "Academic Structure", icon: BookOpen },
  { key: "calendar", label: "Calendar & Processes", icon: CalendarDays },
  { key: "grading", label: "Grading & Credits", icon: GraduationCap },
  { key: "terminology", label: "Terminology", icon: FileText },
  { key: "campus", label: "Campus & Traditions", icon: MapPin },
  { key: "contacts", label: "Contacts & Links", icon: Phone },
];

export default function InstitutionConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: institution, isLoading } = useQuery({
    queryKey: ["institutionConfig", user?.university],
    queryFn: async () => {
      const results = await base44.entities.Institution.filter({ name: user.university });
      return results[0] || null;
    },
    enabled: !!user?.university,
  });

  React.useEffect(() => {
    if (institution && !draft) {
      setDraft({ ...institution });
    }
  }, [institution]);

  const update = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (draft.id) {
        await base44.entities.Institution.update(draft.id, draft);
      } else {
        const created = await base44.entities.Institution.create({
          ...draft,
          name: user.university,
          type: draft.type || "university",
          verification_status: draft.verification_status || "community_supported",
        });
        setDraft(created);
      }
      queryClient.invalidateQueries({ queryKey: ["institutionConfig"] });
      toast({ title: "Saved", description: "Institution configuration updated." });
    } catch (e) {
      toast({ title: "Error", description: "Could not save configuration.", variant: "destructive" });
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.university) {
    return (
      <div className="py-12 px-4 text-center">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="font-heading font-semibold text-foreground">No Institution Assigned</p>
        <p className="text-[13px] text-muted-foreground mt-1">Your account is not linked to an institution yet.</p>
      </div>
    );
  }

  const status = draft?.verification_status || institution?.verification_status || "community_supported";

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading font-bold text-[22px] text-foreground">Institution Configuration Center</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Configure {user.university}'s academic structure, identifiers, and traditions.
            </p>
          </div>
          <InstitutionStatusBadge status={status} size="lg" />
        </div>
      </motion.div>

      {/* Verification Status Banner */}
      {status === "community_supported" && (
        <GlassCard variant="solid" className="p-4 mb-5 border-warning/20">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">Community Supported</p>
              <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                Your students are using UNIBUD. Complete your institution profile to unlock official announcements,
                grade synchronization, attendance, and timetable features. Student data is never affected by verification.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Section Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.key;
          return (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all ${
                isActive ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground border border-border/30"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* Active Section */}
      <GlassCard variant="solid" className="p-5 mb-5">
        {activeSection === "profile" && <ProfileSection draft={draft} update={update} />}
        {activeSection === "identifiers" && <IdentifiersSection draft={draft} update={update} />}
        {activeSection === "academic" && <AcademicSection draft={draft} update={update} />}
        {activeSection === "calendar" && <CalendarSection draft={draft} update={update} />}
        {activeSection === "grading" && <GradingSection draft={draft} update={update} />}
        {activeSection === "terminology" && <TerminologySection draft={draft} update={update} />}
        {activeSection === "campus" && <CampusSection draft={draft} update={update} />}
        {activeSection === "contacts" && <ContactsSection draft={draft} update={update} />}
      </GlassCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[13px] spring-tap disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Configuration
        </button>
      </div>
    </div>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────
function ProfileSection({ draft, update }) {
  const [logoUploading, setLogoUploading] = useState(false);

  const handleLogoUpload = async (file) => {
    setLogoUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update("logo_url", file_url);
    } catch {}
    setLogoUploading(false);
  };

  const handleBannerUpload = async (file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      update("banner_url", file_url);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={Building2} title="Institution Profile" subtitle="Basic information about your institution" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Institution Name">
          <input value={draft?.name || ""} readOnly className="input-base" />
        </Field>
        <Field label="Short Name / Abbreviation">
          <input value={draft?.short_name || ""} onChange={(e) => update("short_name", e.target.value)} placeholder="e.g. UNIBEN, MIT" className="input-base" />
        </Field>
        <Field label="Institution Type">
          <select value={draft?.type || "university"} onChange={(e) => update("type", e.target.value)} className="input-base">
            {INSTITUTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Country">
          <input value={draft?.country || ""} onChange={(e) => update("country", e.target.value)} placeholder="e.g. Nigeria" className="input-base" />
        </Field>
        <Field label="City">
          <input value={draft?.city || ""} onChange={(e) => update("city", e.target.value)} placeholder="e.g. Benin City" className="input-base" />
        </Field>
        <Field label="Website">
          <input value={draft?.website || ""} onChange={(e) => update("website", e.target.value)} placeholder="https://" className="input-base" />
        </Field>
      </div>

      <Field label="Official Description">
        <textarea value={draft?.description || ""} onChange={(e) => update("description", e.target.value)} rows={3} placeholder="A brief official description of your institution" className="input-base resize-none" />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Institution Logo">
          <div className="flex items-center gap-3">
            {draft?.logo_url && <img src={draft.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />}
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-[12px] font-medium hover:bg-muted/70 transition-colors">
                {logoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Upload Logo
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleLogoUpload(e.target.files[0])} />
            </label>
          </div>
        </Field>
        <Field label="Banner Image">
          <div className="flex items-center gap-3">
            {draft?.banner_url && <img src={draft.banner_url} alt="Banner" className="w-20 h-12 rounded-xl object-cover" />}
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-foreground text-[12px] font-medium hover:bg-muted/70 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Upload Banner
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleBannerUpload(e.target.files[0])} />
            </label>
          </div>
        </Field>
      </div>

      <Field label="Accent Color">
        <div className="flex items-center gap-2">
          <input type="color" value={draft?.accent_color || "#7C3AED"} onChange={(e) => update("accent_color", e.target.value)} className="w-10 h-10 rounded-xl border border-border/30 cursor-pointer" />
          <input value={draft?.accent_color || ""} onChange={(e) => update("accent_color", e.target.value)} placeholder="#7C3AED" className="input-base flex-1" />
        </div>
      </Field>
    </div>
  );
}

// ─── Identifiers Section ──────────────────────────────────────────────────────
function IdentifiersSection({ draft, update }) {
  const identifiers = draft?.identifier_types || [];

  const addIdentifier = () => {
    const newId = { type: "student_id", label: "Student ID", format_pattern: "", format_example: "", is_required_at_enrollment: false, is_permanent: true, verification_methods: ["email"], issued_timing: "at_enrollment" };
    update("identifier_types", [...identifiers, newId]);
  };

  const removeIdentifier = (idx) => {
    update("identifier_types", identifiers.filter((_, i) => i !== idx));
  };

  const updateIdentifier = (idx, field, value) => {
    const updated = identifiers.map((id, i) => i === idx ? { ...id, [field]: value } : id);
    update("identifier_types", updated);
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={IdCard} title="Student Identifier Configuration" subtitle="Configure how students verify their identity at your institution. Support multiple identifier types — students get full access before receiving permanent IDs." />

      {identifiers.length === 0 && (
        <div className="text-center py-6 bg-muted/30 rounded-2xl">
          <IdCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-[12px] text-muted-foreground">No identifiers configured. Add the types your institution uses.</p>
        </div>
      )}

      {identifiers.map((id, idx) => (
        <div key={idx} className="p-4 rounded-2xl bg-muted/20 border border-border/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-foreground">Identifier {idx + 1}</span>
            <button onClick={() => removeIdentifier(idx)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Identifier Type">
              <select value={id.type} onChange={(e) => updateIdentifier(idx, "type", e.target.value)} className="input-base">
                {IDENTIFIER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Display Label">
              <input value={id.label || ""} onChange={(e) => updateIdentifier(idx, "label", e.target.value)} className="input-base" />
            </Field>
            <Field label="Format Pattern">
              <input value={id.format_pattern || ""} onChange={(e) => updateIdentifier(idx, "format_pattern", e.target.value)} placeholder="e.g. UNIBEN/{year}/{number}" className="input-base" />
            </Field>
            <Field label="Format Example">
              <input value={id.format_example || ""} onChange={(e) => updateIdentifier(idx, "format_example", e.target.value)} placeholder="e.g. UNIBEN/2026/123456" className="input-base" />
            </Field>
            <Field label="When Issued">
              <select value={id.issued_timing || "at_enrollment"} onChange={(e) => updateIdentifier(idx, "issued_timing", e.target.value)} className="input-base">
                {MATRICULATION_TIMING.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Verification Methods">
              <input value={(id.verification_methods || []).join(", ")} onChange={(e) => updateIdentifier(idx, "verification_methods", e.target.value.split(",").map((s) => s.trim()))} placeholder="email, institution_admin, sync_service" className="input-base" />
            </Field>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={id.is_required_at_enrollment || false} onChange={(e) => updateIdentifier(idx, "is_required_at_enrollment", e.target.checked)} className="rounded" />
              Required at enrollment
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={id.is_permanent || false} onChange={(e) => updateIdentifier(idx, "is_permanent", e.target.checked)} className="rounded" />
              Permanent identifier
            </label>
          </div>
        </div>
      ))}

      <button onClick={addIdentifier} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-border/40 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors w-full justify-center">
        <Plus className="w-4 h-4" /> Add Identifier Type
      </button>
    </div>
  );
}

// ─── Academic Structure Section ──────────────────────────────────────────────
function AcademicSection({ draft, update }) {
  const structure = draft?.academic_structure || {};

  const updateStructure = (field, value) => {
    update("academic_structure", { ...structure, [field]: value });
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={BookOpen} title="Academic Structure" subtitle="Configure your institution's organizational hierarchy, levels, and term system" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Organizational Unit Name (e.g. Faculty, School, College)">
          <select value={structure.org_unit_type || "faculty"} onChange={(e) => updateStructure("org_unit_type", e.target.value)} className="input-base">
            {ORG_UNIT_TYPES.slice(0, 5).map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </Field>
        <Field label="Sub-unit Name (e.g. Department, Programme)">
          <select value={structure.sub_unit_type || "department"} onChange={(e) => updateStructure("sub_unit_type", e.target.value)} className="input-base">
            {ORG_UNIT_TYPES.slice(5, 8).map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </Field>
        <Field label="Term System">
          <select value={structure.term_type || "semester"} onChange={(e) => updateStructure("term_type", e.target.value)} className="input-base">
            {TERM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Levels (comma-separated)">
          <input value={structure.levels || ""} onChange={(e) => updateStructure("levels", e.target.value)} placeholder="100 Level, 200 Level, 300 Level, 400 Level" className="input-base" />
        </Field>
      </div>
      <Field label="Organizational Units (JSON)">
        <textarea value={JSON.stringify(structure.organizational_units || [], null, 2)} onChange={(e) => { try { updateStructure("organizational_units", JSON.parse(e.target.value)); } catch {} }} rows={5} className="input-base resize-none font-mono text-[11px]" placeholder='[{"name": "Faculty of Science", "code": "SCI"}]' />
      </Field>
    </div>
  );
}

// ─── Calendar & Processes Section ──────────────────────────────────────────────
function CalendarSection({ draft, update }) {
  const matric = draft?.matriculation_process || {};

  const updateMatric = (field, value) => {
    update("matriculation_process", { ...matric, [field]: value });
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={CalendarDays} title="Calendar & Academic Processes" subtitle="Configure when matriculation, registration, and other key processes happen" />
      <Field label="Matriculation Timing">
        <select value={matric.timing || "first_semester"} onChange={(e) => updateMatric("timing", e.target.value)} className="input-base">
          {MATRICULATION_TIMING.map((t) => <option key={t.value} value={t.value}>{t.label} — {t.description}</option>)}
        </select>
      </Field>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Some institutions matriculate students before lectures begin. Others celebrate matriculation weeks or months
        after lectures have started. Students always have full platform access before receiving their matriculation number.
      </p>
      <Field label="Matriculation Ceremony Details">
        <textarea value={matric.ceremony_details || ""} onChange={(e) => updateMatric("ceremony_details", e.target.value)} rows={2} placeholder="Describe the matriculation ceremony and process" className="input-base resize-none" />
      </Field>
      <Field label="Academic Calendar (JSON)">
        <textarea value={JSON.stringify(draft?.academic_calendar || {}, null, 2)} onChange={(e) => { try { update("academic_calendar", JSON.parse(e.target.value)); } catch {} }} rows={6} className="input-base resize-none font-mono text-[11px]" placeholder='{"current_session": "2025/2026", "terms": [...]}' />
      </Field>
      <Field label="Admission Process (JSON)">
        <textarea value={JSON.stringify(draft?.admission_process || {}, null, 2)} onChange={(e) => { try { update("admission_process", JSON.parse(e.target.value)); } catch {} }} rows={4} className="input-base resize-none font-mono text-[11px]" placeholder='{"methods": [...], "requirements": [...]}' />
      </Field>
      <Field label="Registration Process (JSON)">
        <textarea value={JSON.stringify(draft?.registration_process || {}, null, 2)} onChange={(e) => { try { update("registration_process", JSON.parse(e.target.value)); } catch {} }} rows={4} className="input-base resize-none font-mono text-[11px]" placeholder='{"periods": [...], "add_drop_deadline": "..."}' />
      </Field>
    </div>
  );
}

// ─── Grading & Credits Section ────────────────────────────────────────────────
function GradingSection({ draft, update }) {
  return (
    <div className="space-y-4">
      <SectionTitle icon={GraduationCap} title="Grading & Credit System" subtitle="Configure how your institution measures academic progress" />
      <Field label="Credit System">
        <select value={draft?.credit_system || "credit_units"} onChange={(e) => update("credit_system", e.target.value)} className="input-base">
          {CREDIT_SYSTEMS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </Field>
      <Field label="Grading System (JSON)">
        <textarea value={JSON.stringify(draft?.grading_system || {}, null, 2)} onChange={(e) => { try { update("grading_system", JSON.parse(e.target.value)); } catch {} }} rows={5} className="input-base resize-none font-mono text-[11px]" placeholder='{"scale": [{"grade": "A", "points": 5.0}], "gpa_max": 5.0, "pass_threshold": 1.0}' />
      </Field>
    </div>
  );
}

// ─── Terminology Section ──────────────────────────────────────────────────────
function TerminologySection({ draft, update }) {
  const terms = draft?.terminology || {};
  const updateTerm = (key, value) => update("terminology", { ...terms, [key]: value });
  const commonTerms = [
    ["faculty", "Faculty"], ["department", "Department"], ["semester", "Semester"],
    ["course", "Course"], ["lecturer", "Lecturer"], ["student", "Student"],
    ["matriculation", "Matriculation"], ["graduation", "Graduation"],
  ];
  return (
    <div className="space-y-4">
      <SectionTitle icon={FileText} title="Institution Terminology" subtitle="Customize terms to match your institution's language and culture" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {commonTerms.map(([key, label]) => (
          <Field key={key} label={label}>
            <input value={terms[key] || ""} onChange={(e) => updateTerm(key, e.target.value)} placeholder={label} className="input-base" />
          </Field>
        ))}
      </div>
    </div>
  );
}

// ─── Campus & Traditions Section ──────────────────────────────────────────────
function CampusSection({ draft, update }) {
  return (
    <div className="space-y-4">
      <SectionTitle icon={MapPin} title="Campus & Traditions" subtitle="Configure campus locations, hostels, traditions, and student organizations" />
      <Field label="Campus Locations (JSON)">
        <textarea value={JSON.stringify(draft?.campus_locations || [], null, 2)} onChange={(e) => { try { update("campus_locations", JSON.parse(e.target.value)); } catch {} }} rows={4} className="input-base resize-none font-mono text-[11px]" placeholder='[{"name": "Main Campus", "city": "..."}]' />
      </Field>
      <Field label="Hostels (JSON)">
        <textarea value={JSON.stringify(draft?.hostels || [], null, 2)} onChange={(e) => { try { update("hostels", JSON.parse(e.target.value)); } catch {} }} rows={3} className="input-base resize-none font-mono text-[11px]" placeholder='[{"name": "Hall 1", "type": "male"}]' />
      </Field>
      <Field label="Traditions (JSON)">
        <textarea value={JSON.stringify(draft?.traditions || [], null, 2)} onChange={(e) => { try { update("traditions", JSON.parse(e.target.value)); } catch {} }} rows={4} className="input-base resize-none font-mono text-[11px]" placeholder='[{"name": "Matriculation Day", "description": "..."}]' />
      </Field>
      <Field label="Student Organizations (JSON)">
        <textarea value={JSON.stringify(draft?.student_organizations || [], null, 2)} onChange={(e) => { try { update("student_organizations", JSON.parse(e.target.value)); } catch {} }} rows={3} className="input-base resize-none font-mono text-[11px]" placeholder='[{"name": "SUG", "type": "student_government"}]' />
      </Field>
    </div>
  );
}

// ─── Contacts & Links Section ─────────────────────────────────────────────────
function ContactsSection({ draft, update }) {
  return (
    <div className="space-y-4">
      <SectionTitle icon={Phone} title="Contacts & Important Links" subtitle="Emergency contacts, important links, and student handbook" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Admin Contact Email">
          <input value={draft?.admin_contact_email || ""} onChange={(e) => update("admin_contact_email", e.target.value)} placeholder="registrar@institution.edu" className="input-base" />
        </Field>
        <Field label="Admin Contact Name">
          <input value={draft?.admin_contact_name || ""} onChange={(e) => update("admin_contact_name", e.target.value)} placeholder="Registrar name" className="input-base" />
        </Field>
      </div>
      <Field label="Emergency Contacts (JSON)">
        <textarea value={JSON.stringify(draft?.emergency_contacts || [], null, 2)} onChange={(e) => { try { update("emergency_contacts", JSON.parse(e.target.value)); } catch {} }} rows={3} className="input-base resize-none font-mono text-[11px]" placeholder='[{"name": "Campus Security", "phone": "..."}]' />
      </Field>
      <Field label="Important Links (JSON)">
        <textarea value={JSON.stringify(draft?.important_links || [], null, 2)} onChange={(e) => { try { update("important_links", JSON.parse(e.target.value)); } catch {} }} rows={3} className="input-base resize-none font-mono text-[11px]" placeholder='[{"label": "Student Portal", "url": "..."}]' />
      </Field>
      <Field label="Student Handbook URL">
        <input value={draft?.student_handbook_url || ""} onChange={(e) => update("student_handbook_url", e.target.value)} placeholder="https://" className="input-base" />
      </Field>
      <Field label="Rules & Regulations">
        <textarea value={draft?.rules_and_regulations || ""} onChange={(e) => update("rules_and_regulations", e.target.value)} rows={3} placeholder="Key institutional rules and regulations" className="input-base resize-none" />
      </Field>
    </div>
  );
}

// ─── Shared UI Components ──────────────────────────────────────────────────────
function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h3 className="font-heading font-semibold text-[15px] text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}