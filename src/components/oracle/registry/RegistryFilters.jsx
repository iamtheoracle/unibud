import React, { useMemo } from "react";
import { Building2, Layers, Grid3x3, CalendarRange, CalendarClock, GraduationCap, Filter, RotateCcw } from "lucide-react";
import { useRegistryInstitutions } from "@/lib/oracle/useRegistryMetrics";

function Select({ icon: Icon, placeholder, value, onChange, options }) {
  return (
    <div className="relative">
      <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="oracle-input pl-8 pr-7 h-9 min-w-[140px] cursor-pointer appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
    </div>
  );
}

/**
 * RegistryFilters — mission-control scope controls.
 * Derives dropdown options live from the institution registry.
 */
export default function RegistryFilters({ filters, onChange }) {
  const { data: institutions } = useRegistryInstitutions();

  const instOptions = useMemo(
    () => (institutions || []).map((i) => ({ value: i.id, label: i.name, extra: i })),
    [institutions]
  );

  // Faculty / department / semester / session options derived from the
  // selected institution's academic structure + the live course registry.
  const selectedInst = instOptions.find((o) => o.value === filters.institutionId)?.extra;
  const structure = selectedInst?.academic_structure || {};
  const facultyOptions = useMemo(() => {
    const fromStruct = (structure.organizational_units || []).map((u) => u.name).filter(Boolean);
    return Array.from(new Set(fromStruct)).map((f) => ({ value: f, label: f }));
  }, [structure]);
  const deptOptions = useMemo(() => {
    const fromStruct = (structure.organizational_units || []).flatMap((u) => u.departments || []).filter(Boolean);
    return Array.from(new Set(fromStruct)).map((d) => ({ value: d, label: d }));
  }, [structure]);
  const semesterOptions = useMemo(() => {
    const cal = selectedInst?.academic_calendar || {};
    const arr = (cal.sessions || cal.semesters || []).map((s) => s.name || s.semester || s).filter(Boolean);
    return Array.from(new Set(arr)).map((s) => ({ value: s, label: s }));
  }, [selectedInst]);
  const sessionOptions = useMemo(() => {
    const cal = selectedInst?.academic_calendar || {};
    const arr = (cal.sessions || []).map((s) => s.name).filter(Boolean);
    return Array.from(new Set(arr)).map((s) => ({ value: s, label: s }));
  }, [selectedInst]);

  // Carry both id and name so different entities can be scoped correctly.
  const set = (key, val) => {
    const next = { ...filters, [key]: val };
    if (key === "institutionId") {
      const inst = (institutions || []).find((i) => i.id === val);
      next.institutionName = inst?.name || null;
      next.faculty = null;
      next.department = null;
    }
    onChange(next);
  };

  const activeCount = [filters.institutionId, filters.faculty, filters.department, filters.semester, filters.academicSession, filters.dateFrom, filters.dateTo].filter(Boolean).length;

  const reset = () => onChange({});

  return (
    <div className="crystal-card radius-lg p-3 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 pr-2 text-muted-foreground">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">Scope</span>
      </div>

      <Select icon={Building2} placeholder="All Institutions" value={filters.institutionId} onChange={(v) => set("institutionId", v)} options={instOptions} />

      {facultyOptions.length > 0 && (
        <Select icon={Layers} placeholder="All Faculties" value={filters.faculty} onChange={(v) => set("faculty", v)} options={facultyOptions} />
      )}
      {deptOptions.length > 0 && (
        <Select icon={Grid3x3} placeholder="All Departments" value={filters.department} onChange={(v) => set("department", v)} options={deptOptions} />
      )}
      {semesterOptions.length > 0 && (
        <Select icon={CalendarClock} placeholder="All Semesters" value={filters.semester} onChange={(v) => set("semester", v)} options={semesterOptions} />
      )}
      {sessionOptions.length > 0 && (
        <Select icon={GraduationCap} placeholder="All Sessions" value={filters.academicSession} onChange={(v) => set("academicSession", v)} options={sessionOptions} />
      )}

      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg glass">
        <CalendarRange className="w-3.5 h-3.5 text-muted-foreground" />
        <input type="date" value={filters.dateFrom || ""} onChange={(e) => set("dateFrom", e.target.value || null)} className="bg-transparent text-[12px] text-foreground focus:outline-none" />
        <span className="text-muted-foreground text-[11px]">→</span>
        <input type="date" value={filters.dateTo || ""} onChange={(e) => set("dateTo", e.target.value || null)} className="bg-transparent text-[12px] text-foreground focus:outline-none" />
      </div>

      {activeCount > 0 && (
        <button onClick={reset} className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass text-[11px] font-semibold text-foreground spring-tap">
          <RotateCcw className="w-3 h-3" /> Clear ({activeCount})
        </button>
      )}
    </div>
  );
}