import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LifeBuoy, Building, Clock, MessageSquare, CheckCircle2, TicketCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DashboardCard, SectionCard, PortalPageHeader, StatusPill, SmartList } from "@/components/portal/PortalUI";
import { useNavigate } from "react-router-dom";

const TABS = ["All", "Open", "In Progress", "Resolved"];

export default function OperationsDashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");

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

  const filteredTickets = (tickets || []).filter((t) => {
    if (activeTab === "All") return true;
    if (activeTab === "Open") return t.status === "open";
    if (activeTab === "In Progress") return t.status === "in_progress";
    if (activeTab === "Resolved") return t.status === "resolved";
    return true;
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader title="Operations Dashboard" subtitle="Support tickets, university onboarding, and customer success." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={LifeBuoy} value={openTickets.length} title="Open Tickets" subtitle="Awaiting response" accent="warning" delay={0} onClick={() => navigate("/portal/support")} />
        <DashboardCard icon={CheckCircle2} value={resolvedTickets.length} title="Resolved" subtitle="All time" accent="success" delay={0.05} />
        <DashboardCard icon={Building} value={universities.length} title="Universities" subtitle="Onboarded" accent="primary" delay={0.1} onClick={() => navigate("/portal/universities")} />
        <DashboardCard icon={Clock} value="2.4h" title="Avg Response" subtitle="First reply time" accent="info" delay={0.15} />
      </div>

      <SectionCard title="Support Tickets" description="Latest tickets requiring attention" delay={0.2}
        action={<button onClick={() => navigate("/portal/support")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
      >
        <div className="px-5 pt-3 flex gap-2 border-b border-border/20">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12px] font-semibold transition-colors relative ${
                activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="ticketTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
        <SmartList
          items={filteredTickets}
          emptyMessage="No tickets in this category"
          onRowClick={(ticket) => navigate("/portal/support")}
          renderRow={(ticket) => (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-[14px] bg-warning/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{ticket.subject || "Untitled"}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {(ticket.category || "").replace(/_/g, " ")} · {ticket.is_anonymous ? "Anonymous" : ticket.student_name || "—"}
                </p>
              </div>
              {ticket.priority && <StatusPill status={ticket.priority === "urgent" ? "critical" : ticket.priority === "high" ? "warning" : "info"} label={ticket.priority} />}
              <StatusPill status={ticket.status} />
            </div>
          )}
        />
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Quick Actions" description="Common operations tasks" delay={0.3}>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Respond to Tickets", icon: MessageSquare, path: "/portal/support" },
              { label: "Onboard University", icon: Building, path: "/portal/universities" },
              { label: "View Reports", icon: TicketCheck, path: "/portal/reports" },
              { label: "Content Management", icon: CheckCircle2, path: "/portal/content" },
            ].map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 p-4 rounded-[20px] bg-muted/30 border border-border/20 hover:bg-muted/50 spring-tap transition-colors"
              >
                <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center">
                  <action.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[12px] font-semibold text-foreground">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="University Onboarding" description="Recently onboarded institutions" delay={0.35}>
          <div className="p-5 space-y-3">
            {universities.length > 0 ? (
              universities.map((uni, i) => {
                const count = (users || []).filter((u) => u.university === uni).length;
                return (
                  <motion.div
                    key={uni}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-[16px] bg-muted/30 border border-border/20"
                  >
                    <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{uni}</p>
                      <p className="text-[11px] text-muted-foreground">{count} users</p>
                    </div>
                    <StatusPill status="operational" label="Active" />
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Building className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[13px] text-muted-foreground">No universities onboarded yet</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}