import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";

export default function PortalAcademic({ institution }) {
  const [structure, setStructure] = useState("");
  const [calendar, setCalendar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStructure(JSON.stringify(institution.academic_structure || {}, null, 0));
    setCalendar(JSON.stringify(institution.academic_calendar || {}, null, 0));
  }, [institution]);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Institution.update(institution.id, {
        academic_structure: JSON.parse(structure || "{}"),
        academic_calendar: JSON.parse(calendar || "{}"),
      });
      toast({ title: "Academic structure saved" });
    } catch { toast({ title: "Save failed — check JSON" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 max-w-[820px]">
      <p className="text-[13px] text-muted-foreground">Configure the academic hierarchy: departments, programmes, levels, semesters, sessions, courses, and timetables — stored on the institution and scoped to this tenant.</p>

      <Field label="Academic Structure (JSON) — departments · programmes · levels · semesters · sessions · courses · timetables">
        <textarea value={structure} onChange={(e) => setStructure(e.target.value)} rows={10}
          className="w-full p-4 rounded-xl bg-muted/40 border border-border text-[12px] font-mono text-foreground focus:outline-none focus:border-primary/60"
          placeholder='{"departments":[{"name":"..."}],"levels":["100","200","300"],"courses":[{"code":"CSC101","title":"..."}]}' />
      </Field>

      <Field label="Academic Calendar (JSON) — term dates · registration · exams · holidays · orientation · convocation">
        <textarea value={calendar} onChange={(e) => setCalendar(e.target.value)} rows={7}
          className="w-full p-4 rounded-xl bg-muted/40 border border-border text-[12px] font-mono text-foreground focus:outline-none focus:border-primary/60"
          placeholder='{"semester_system":"semester","sessions":[{"name":"2025/2026"}]}' />
      </Field>

      <UDSButton onClick={save} disabled={saving}>{saving ? "Saving…" : "Save academic configuration"}</UDSButton>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <p className="text-[12px] font-semibold text-muted-foreground mb-1.5 ml-0.5">{label}</p>
    {children}
  </div>
);