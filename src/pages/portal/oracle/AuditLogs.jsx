import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionCard, DataTable, StatusPill } from "@/components/portal/PortalUI";

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const { data: logs } = useQuery({
    queryKey: ["portalAuditLogs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 100),
    retry: false,
  });

  const filtered = (logs || []).filter((log) => {
    const matchesSearch = !search ||
      (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.actor_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.target_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const columns = [
    {
      key: "severity",
      header: "Severity",
      render: (row) => <StatusPill status={row.severity} />,
    },
    {
      key: "action",
      header: "Action",
      render: (row) => <span className="font-semibold text-[13px]">{row.action.replace(/_/g, " ")}</span>,
    },
    { key: "actor_name", header: "Actor", render: (row) => <span className="text-[12px]">{row.actor_name}</span> },
    { key: "target_name", header: "Target", render: (row) => <span className="text-[12px] text-muted-foreground">{row.target_name || "—"}</span> },
    {
      key: "details",
      header: "Details",
      render: (row) => <span className="text-[12px] text-muted-foreground truncate block max-w-[300px]">{row.details || "—"}</span>,
    },
    {
      key: "created_date",
      header: "Timestamp",
      render: (row) => <span className="text-[11px] text-muted-foreground">{row.created_date ? new Date(row.created_date).toLocaleString() : "—"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">Audit Logs</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Complete record of all platform actions and security events.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border/40 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="h-11 px-4 rounded-xl bg-card border border-border/40 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <SectionCard title="Activity Timeline" description={`${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`}>
        <DataTable columns={columns} data={filtered} emptyMessage="No audit events recorded yet" />
      </SectionCard>
    </div>
  );
}