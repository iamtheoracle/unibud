import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, MessageSquare, HeartHandshake } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard, DataTable, StatusPill } from "@/components/portal/PortalUI";

const CATEGORY_LABELS = {
  academic_stress: "Academic Stress",
  homesickness: "Homesickness",
  loneliness: "Loneliness",
  exam_anxiety: "Exam Anxiety",
  burnout: "Burnout",
  motivation: "Motivation",
  time_management: "Time Management",
  financial_concerns: "Financial Concerns",
  relationship_challenges: "Relationships",
  university_life: "University Life",
  technical: "Technical",
  general: "General",
};

export default function SupportCenter() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const { data: tickets } = useQuery({
    queryKey: ["portalTickets"],
    queryFn: () => base44.entities.SupportTicket.list("-created_date", 50),
    retry: false,
  });

  const filtered = (tickets || []).filter((t) => {
    const matchesSearch = !search || (t.subject || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = (tickets || []).filter((t) => t.status === "open").length;
  const inProgressCount = (tickets || []).filter((t) => t.status === "in_progress").length;
  const resolvedCount = (tickets || []).filter((t) => t.status === "resolved").length;

  const updateStatus = async (ticketId, newStatus) => {
    await base44.entities.SupportTicket.update(ticketId, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ["portalTickets"] });
    setSelected(null);
  };

  const columns = [
    { key: "subject", header: "Subject", render: (row) => <span className="font-medium text-[13px]">{row.subject}</span> },
    { key: "category", header: "Category", render: (row) => <span className="text-[12px] text-muted-foreground">{CATEGORY_LABELS[row.category] || row.category}</span> },
    { key: "student_name", header: "Student", render: (row) => <span className="text-[12px] text-muted-foreground">{row.is_anonymous ? "Anonymous" : row.student_name || "—"}</span> },
    { key: "priority", header: "Priority", render: (row) => <StatusPill status={row.priority === "urgent" ? "critical" : row.priority === "high" ? "warning" : "info"} label={row.priority} /> },
    { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">Support Center</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Manage student support tickets and wellbeing inquiries.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={MessageSquare} label="Open Tickets" value={openCount} accent="warning" />
        <KpiCard icon={HeartHandshake} label="In Progress" value={inProgressCount} accent="info" />
        <KpiCard icon={MessageSquare} label="Resolved" value={resolvedCount} accent="success" />
        <KpiCard icon={MessageSquare} label="Total" value={tickets?.length || 0} accent="primary" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border/40 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 px-4 rounded-xl bg-card border border-border/40 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      <SectionCard title="Support Tickets" description={`${filtered.length} ticket${filtered.length !== 1 ? "s" : ""} found`}>
        <DataTable columns={columns} data={filtered} emptyMessage="No support tickets yet" />
      </SectionCard>
    </div>
  );
}