import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PortalKPI from "../PortalKPI";

export default function PortalAnalytics({ institution }) {
  const [data, setData] = useState({ total: 0, byLevel: {}, byDepartment: {}, byStatus: {} });

  useEffect(() => {
    (async () => {
      try {
        const recs = await base44.entities.StudentRecord.filter({ university: institution.name });
        const byLevel = {}, byDept = {}, byStatus = {};
        recs.forEach((r) => {
          byLevel[r.level || "—"] = (byLevel[r.level || "—"] || 0) + 1;
          byDept[r.department || "—"] = (byDept[r.department || "—"] || 0) + 1;
          byStatus[r.status || "active"] = (byStatus[r.status || "active"] || 0) + 1;
        });
        setData({ total: recs.length, byLevel, byDepartment: byDept, byStatus });
      } catch {}
    })();
  }, [institution]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <PortalKPI label="Enrollment" value={data.total} accent />
        <PortalKPI label="Performance" value="—" />
        <PortalKPI label="Retention" value="—" />
        <PortalKPI label="Graduation Rate" value="—" />
        <PortalKPI label="AI Usage" value="—" />
        <PortalKPI label="System Reports" value="—" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Breakdown title="Enrollment by Level" data={data.byLevel} />
        <Breakdown title="Enrollment by Department" data={data.byDepartment} />
        <Breakdown title="Students by Status" data={data.byStatus} />
        <div className="glass-card radius-lg p-4">
          <p className="text-[13px] font-semibold mb-1">System Reports</p>
          <p className="text-[12px] text-muted-foreground">Performance, retention, graduation, and AI usage reports aggregate across tenant-scoped academic modules.</p>
        </div>
      </div>
    </div>
  );
}

function Breakdown({ title, data }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map((e) => e[1]));
  return (
    <div className="glass-card radius-lg p-4">
      <p className="text-[13px] font-semibold mb-3">{title}</p>
      {entries.length === 0 ? <p className="text-muted-foreground text-[13px]">No data.</p>
        : entries.map(([k, v]) => (
          <div key={k} className="mb-2">
            <div className="flex justify-between text-[12px] mb-1"><span className="truncate">{k}</span><span className="text-muted-foreground">{v}</span></div>
            <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(v / max) * 100}%` }} /></div>
          </div>
        ))}
    </div>
  );
}