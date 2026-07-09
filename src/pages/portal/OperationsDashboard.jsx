import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LifeBuoy, TicketCheck, Building, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard, DataTable, StatusPill } from "@/components/portal/PortalUI";

export default function OperationsDashboard({ user }) {
  const { data: tickets } = useQuery({
    queryKey: ["portalTickets"],
    queryFn: () => base44.entities.SupportTicket.list("-created_date", 20),
    retry: false,
  });

  const { data: users } = useQuery({
    queryKey: ["portalUsers"],
    queryFn: () => base44.entities.User.list(),
    retry: false,
  });

  const openTickets = (tickets || []).filter((t) => t.status === "open" || t.status === "in_progress");
  const resolvedTickets = (tickets || []).filter((t) => t.status === "resolved");
  const universities = [...new Set((users || []).map((u) => u.university).filter(Boolean))];

  const ticketColumns = [
    {
      key: "subject",
      header: "Subject",
      render: (row) => <span className="font-medium text-[13px]">{row.subject}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (row) => <span className="text-[12px] text-muted-foreground">{(row.category || "").replace(/_/g, " ")}</span>,
    },
    { key: "student_name", header: "Student", render: (row) => <span className="text-[12px] text-muted-foreground">{row.is_anonymous ? "Anonymous" : row.student_name || "—"}</span> },
    { key: "priority", header: "Priority", render: (row) => <StatusPill status={row.priority === "urgent" ? "critical" : row.priority === "high" ? "warning" : "info"} label={row.priority} /> },
    { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">Operations Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Support tickets, university onboarding, and customer success.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={LifeBuoy} label="Open Tickets" value={openTickets.length} sublabel="Awaiting response" accent="warning" />
        <KpiCard icon={CheckCircle2} label="Resolved" value={resolvedTickets.length} sublabel="All time" accent="success" />
        <KpiCard icon={Building} label="Universities" value={universities.length} sublabel="Onboarded" accent="primary" />
        <KpiCard icon={Clock} label="Avg Response" value="2.4h" sublabel="First reply time" accent="info" />
      </div>

      <SectionCard title="Support Tickets" description="Latest tickets requiring attention" action={<a href="/portal/support" className="text-[12px] font-semibold text-primary hover:underline">View all</a>}>
        <DataTable columns={ticketColumns} data={tickets || []} emptyMessage="No support tickets yet" />
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Quick Actions" description="Common operations tasks">
          <div className="p-5 space-y-2">
            {[
              { label: "Respond to Support Tickets", icon: MessageSquare, path: "/portal/support" },
              { label: "Onboard New University", icon: Building, path: "/portal/universities" },
              { label: "View Reports", icon: TicketCheck, path: "/portal/reports" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors"
              >
                <action.icon className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-semibold text-foreground">{action.label}</span>
              </a>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="University Onboarding" description="Recently onboarded institutions">
          <div className="p-5 space-y-3">
            {universities.length > 0 ? (
              universities.map((uni) => {
                const count = (users || []).filter((u) => u.university === uni).length;
                return (
                  <div key={uni} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{uni}</p>
                      <p className="text-[11px] text-muted-foreground">{count} users</p>
                    </div>
                    <StatusPill status="operational" label="Active" />
                  </div>
                );
              })
            ) : (
              <p className="text-[13px] text-muted-foreground text-center py-6">No universities onboarded yet</p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}