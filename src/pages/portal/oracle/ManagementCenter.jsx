import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck, Building2, Users, Bell, ScrollText, ShieldCheck,
  Settings, ChevronRight, DollarSign, CheckCircle2, Clock, AlertCircle,
  Handshake, CreditCard, TrendingUp, FileBarChart,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionCard, StatusPill, PortalPageHeader, SmartList } from "@/components/portal/PortalUI";
import {
  SPRING, hoverLift, glassEntrance, scaleEntranceDelay, slideInRight,
} from "@/lib/glassPresets";
import { GlassSheen, DynamicLighting } from "@/components/portal/Glass";

const MANAGEMENT_SECTIONS = [
  { label: "Institution Onboarding", icon: Building2, path: "/portal/institution-outreach", description: "Outreach pipeline and onboarding workflow", color: "text-primary", bg: "bg-primary/10" },
  { label: "Institution Config", icon: Building2, path: "/portal/institution-config", description: "Institution configuration center", color: "text-purple", bg: "bg-purple/10" },
  { label: "Approvals", icon: ClipboardCheck, path: "/portal/approvals", description: "Approval queues and workflow management", color: "text-info", bg: "bg-info/10" },
  { label: "User Management", icon: Users, path: "/portal/users", description: "Platform user and staff management", color: "text-success", bg: "bg-success/10" },
  { label: "Finance & Billing", icon: DollarSign, path: "/portal/analytics", description: "Revenue, billing, and financial oversight", color: "text-success", bg: "bg-success/10" },
  { label: "Subscriptions", icon: CreditCard, path: "/portal/settings", description: "Institution subscription plans and billing cycles", color: "text-info", bg: "bg-info/10" },
  { label: "Partnerships", icon: Handshake, path: "/portal/institution-outreach", description: "Strategic partnerships and sponsorships", color: "text-warning", bg: "bg-warning/10" },
  { label: "Notifications", icon: Bell, path: "/portal/notifications", description: "Broadcast notification management", color: "text-warning", bg: "bg-warning/10" },
  { label: "Audit Logs", icon: ScrollText, path: "/portal/audit-logs", description: "Compliance and audit trail", color: "text-error", bg: "bg-error/10" },
  { label: "Security", icon: ShieldCheck, path: "/portal/security", description: "Security and compliance center", color: "text-error", bg: "bg-error/10" },
  { label: "Settings", icon: Settings, path: "/portal/settings", description: "Platform settings and configuration", color: "text-info", bg: "bg-info/10" },
];

function ManagementModuleCard({ section, delay, navigate }) {
  return (
    <motion.button
      {...scaleEntranceDelay(delay)}
      {...hoverLift}
      onClick={() => navigate(section.path)}
      className="relative overflow-hidden text-left p-4 rounded-[22px] glass border border-border/20"
    >
      <GlassSheen />
      <div className={`w-10 h-10 rounded-[14px] ${section.bg} flex items-center justify-center mb-2.5`}>
        <section.icon className={`w-4 h-4 ${section.color}`} strokeWidth={2.2} />
      </div>
      <h4 className="font-heading font-semibold text-[13px] text-foreground">{section.label}</h4>
      <p className="text-[10px] text-muted-foreground mt-1 leading-snug line-clamp-2">{section.description}</p>
      <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-primary">
        Open <ChevronRight className="w-3 h-3" />
      </div>
    </motion.button>
  );
}

function ShimmerRow() {
  return (
    <div className="flex items-center gap-3 p-3.5">
      <div className="w-9 h-9 rounded-[12px] shimmer flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="w-2/3 h-3 rounded shimmer" />
        <div className="w-1/3 h-2.5 rounded shimmer" />
      </div>
      <div className="w-16 h-5 rounded-full shimmer" />
    </div>
  );
}

export default function ManagementCenter() {
  const navigate = useNavigate();

  const { data: users } = useQuery({
    queryKey: ["portalUsers"],
    queryFn: () => base44.entities.User.list(),
    retry: false,
  });

  const { data: outreach, isLoading: outreachLoading } = useQuery({
    queryKey: ["portalOutreach"],
    queryFn: () => base44.entities.InstitutionOutreach.list("-created_date", 10),
    retry: false,
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["portalTickets"],
    queryFn: () => base44.entities.SupportTicket.filter({ status: "open" }),
    retry: false,
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["portalAuditLogs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 8),
    retry: false,
  });

  const pendingOutreach = (outreach || []).filter((o) => o.outreach_status === "pending" || o.outreach_status === "sent");
  const acceptedOutreach = (outreach || []).filter((o) => o.outreach_status === "accepted" || o.outreach_status === "responded");

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Management Center"
        subtitle="Operational management — institution onboarding, approval flows, staff management, finance, and compliance."
        action={<StatusPill status="operational" label="Operations Healthy" />}
      />

      {/* Management Overview — Premium Glass Hero */}
      <motion.div
        {...glassEntrance}
        className="relative overflow-hidden rounded-[32px] glass-strong elevated-shadow p-6 lg:p-8"
      >
        <DynamicLighting color="info" secondary="200 70% 50%" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRING.bouncy}
              className="w-14 h-14 rounded-[20px] bg-info/15 flex items-center justify-center"
            >
              <ClipboardCheck className="w-7 h-7 text-info" strokeWidth={2.2} />
            </motion.div>
            <div>
              <h2 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground">Operational Management</h2>
              <p className="text-[13px] text-muted-foreground">{pendingOutreach.length} pending outreach · {tickets?.length || 0} open tickets · {users?.length || 0} users</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { value: pendingOutreach.length, label: "Pending", color: "text-warning" },
              { value: acceptedOutreach.length, label: "Responded", color: "text-success" },
              { value: users?.length || 0, label: "Users", color: "text-info" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING.gentle, delay: 0.15 + i * 0.08 }}
                className="text-center"
              >
                <p className={`text-[20px] font-heading font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Management Sections */}
      <SectionCard title="Management Modules" description="Operational management tools" delay={0.1}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MANAGEMENT_SECTIONS.map((section, i) => (
            <ManagementModuleCard key={section.label} section={section} delay={0.15 + i * 0.04} navigate={navigate} />
          ))}
        </div>
      </SectionCard>

      {/* Institution Onboarding Pipeline + Approval Queue */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Institution Onboarding Pipeline" description="Outreach and onboarding status" delay={0.2}
          action={<button onClick={() => navigate("/portal/institution-outreach")} className="text-[12px] font-semibold text-primary hover:underline">Manage</button>}
        >
          {outreachLoading ? (
            <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <ShimmerRow key={i} />)}</div>
          ) : (
            <SmartList
              items={outreach || []}
              emptyMessage="No institution outreach yet"
              renderRow={(item) => (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{item.institution_name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.country || "—"} · {item.contact_email || "No contact"}</p>
                  </div>
                  <StatusPill status={item.outreach_status === "accepted" ? "resolved" : item.outreach_status === "pending" ? "open" : "info"} label={item.outreach_status} />
                </div>
              )}
            />
          )}
        </SectionCard>

        <SectionCard title="Open Support Tickets" description="Awaiting response" delay={0.25}
          action={<button onClick={() => navigate("/portal/support")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
        >
          {ticketsLoading ? (
            <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <ShimmerRow key={i} />)}</div>
          ) : (
            <SmartList
              items={tickets || []}
              emptyMessage="No open tickets"
              renderRow={(ticket) => (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 rounded-[12px] bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{ticket.subject || ticket.title || "Support ticket"}</p>
                    <p className="text-[10px] text-muted-foreground">{ticket.priority || "normal"} priority</p>
                  </div>
                  <StatusPill status="open" />
                </div>
              )}
            />
          )}
        </SectionCard>
      </div>

      {/* Finance & Partnerships */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Finance Overview" description="Revenue, billing, and subscription metrics" delay={0.3}>
          <div className="p-5 space-y-3">
            {[
              { label: "Monthly Revenue", value: "₦2.4M", icon: DollarSign, color: "text-success", trend: "+12%" },
              { label: "Active Subscriptions", value: "14", icon: CreditCard, color: "text-info" },
              { label: "Marketplace Revenue", value: "₦340K", icon: TrendingUp, color: "text-primary", trend: "+8%" },
              { label: "Pending Invoices", value: "3", icon: FileBarChart, color: "text-warning" },
              { label: "Partnership Deals", value: "6", icon: Handshake, color: "text-purple" },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...slideInRight(0.35 + i * 0.05)}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-[12px] bg-muted/40 flex items-center justify-center flex-shrink-0">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="flex-1 text-[12px] font-medium text-foreground">{item.label}</span>
                <span className="text-[14px] font-heading font-bold text-foreground">{item.value}</span>
                {item.trend && (
                  <span className="text-[10px] font-bold text-success px-1.5 py-0.5 rounded-full bg-success/10">{item.trend}</span>
                )}
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Compliance Overview" description="Platform compliance and security posture" delay={0.35}>
          <div className="p-5 space-y-3">
            {[
              { label: "2FA Adoption", value: "87%", icon: ShieldCheck, color: "text-success", status: "operational" },
              { label: "Data Encryption", value: "AES-256", icon: ShieldCheck, color: "text-success", status: "operational" },
              { label: "Active Sessions", value: "1,247", icon: Clock, color: "text-info", status: "info" },
              { label: "Blocked Threats", value: "12", icon: AlertCircle, color: "text-warning", status: "warning" },
              { label: "Security Score", value: "A+", icon: CheckCircle2, color: "text-success", status: "operational" },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...slideInRight(0.35 + i * 0.05)}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-[12px] bg-muted/40 flex items-center justify-center">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="flex-1 text-[12px] font-medium text-foreground">{item.label}</span>
                <span className="text-[14px] font-heading font-bold text-foreground">{item.value}</span>
                <StatusPill status={item.status} />
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Audit Events" description="Latest platform actions" delay={0.4}
          action={<button onClick={() => navigate("/portal/audit-logs")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
        >
          {logsLoading ? (
            <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <ShimmerRow key={i} />)}</div>
          ) : (
            <SmartList
              items={auditLogs || []}
              emptyMessage="No audit events recorded yet"
              renderRow={(log) => (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-[12px] bg-muted/50 flex items-center justify-center flex-shrink-0">
                    <ScrollText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground truncate">{log.action || "System event"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{log.actor_name || "System"} → {log.target_name || "—"}</p>
                  </div>
                  {log.severity && <StatusPill status={log.severity} />}
                </div>
              )}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}