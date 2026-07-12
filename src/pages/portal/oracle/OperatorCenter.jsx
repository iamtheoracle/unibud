import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Settings, LifeBuoy, FileEdit, ShoppingBag, CalendarDays, Landmark,
  UserPlus, ChevronRight, AlertCircle, CheckCircle2, Clock, Eye,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionCard, StatusPill, PortalPageHeader, SmartList } from "@/components/portal/PortalUI";

const EASE = [0.16, 1, 0.3, 1];

const OPERATOR_SECTIONS = [
  { label: "Support Tickets", icon: LifeBuoy, path: "/portal/support", description: "Support ticket management and resolution", color: "text-warning", bg: "bg-warning/10" },
  { label: "Content Management", icon: FileEdit, path: "/portal/content", description: "Content moderation and publishing", color: "text-info", bg: "bg-info/10" },
  { label: "Marketplace", icon: ShoppingBag, path: "/portal/marketplace", description: "Marketplace oversight and listings", color: "text-success", bg: "bg-success/10" },
  { label: "Events", icon: CalendarDays, path: "/portal/events", description: "Event management and oversight", color: "text-primary", bg: "bg-primary/10" },
  { label: "Universities", icon: Landmark, path: "/portal/universities", description: "University management and status", color: "text-purple", bg: "bg-purple/10" },
  { label: "Invitations", icon: UserPlus, path: "/portal/invitations", description: "User invitations and onboarding", color: "text-info", bg: "bg-info/10" },
];

export default function OperatorCenter() {
  const navigate = useNavigate();

  const { data: tickets } = useQuery({
    queryKey: ["portalTickets"],
    queryFn: () => base44.entities.SupportTicket.list("-created_date", 10),
    retry: false,
  });

  const { data: listings } = useQuery({
    queryKey: ["portalListings"],
    queryFn: () => base44.entities.MarketplaceListing.list("-created_date", 5),
    retry: false,
  });

  const { data: events } = useQuery({
    queryKey: ["portalEvents"],
    queryFn: () => base44.entities.CampusEvent.list("-created_date", 5),
    retry: false,
  });

  const openTickets = (tickets || []).filter((t) => t.status === "open");
  const resolvedTickets = (tickets || []).filter((t) => t.status === "resolved" || t.status === "closed");

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Operator Center"
        subtitle="Day-to-day operations — support, moderation, content, user assistance, and system alerts."
        action={<StatusPill status="operational" label="Operations Active" />}
      />

      {/* Operator Overview */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative overflow-hidden rounded-[32px] glass-strong elevated-shadow p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-warning/8 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[20px] bg-warning/15 flex items-center justify-center">
              <Settings className="w-7 h-7 text-warning" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground">Daily Operations</h2>
              <p className="text-[13px] text-muted-foreground">{openTickets.length} open tickets · {listings?.length || 0} marketplace listings · {events?.length || 0} events</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[20px] font-heading font-extrabold text-warning">{openTickets.length}</p>
              <p className="text-[10px] text-muted-foreground">Open</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-heading font-extrabold text-success">{resolvedTickets.length}</p>
              <p className="text-[10px] text-muted-foreground">Resolved</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-heading font-extrabold text-info">{events?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">Events</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Operator Sections */}
      <SectionCard title="Operator Tools" description="Day-to-day operational tools" delay={0.1}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OPERATOR_SECTIONS.map((section, i) => (
            <motion.button
              key={section.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04, ease: EASE }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(section.path)}
              className="text-left p-5 rounded-[24px] border border-border/20 bg-muted/20 hover:bg-muted/40 spring-tap"
            >
              <div className={`w-11 h-11 rounded-[14px] ${section.bg} flex items-center justify-center mb-3`}>
                <section.icon className={`w-5 h-5 ${section.color}`} strokeWidth={2.2} />
              </div>
              <h4 className="font-heading font-bold text-[14px] text-foreground">{section.label}</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{section.description}</p>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-primary">
                Open <ChevronRight className="w-3 h-3" />
              </div>
            </motion.button>
          ))}
        </div>
      </SectionCard>

      {/* Support Queue + Marketplace */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Support Queue" description="Latest support tickets" delay={0.2}
          action={<button onClick={() => navigate("/portal/support")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
        >
          <SmartList
            items={tickets || []}
            emptyMessage="No support tickets"
            renderRow={(ticket) => (
              <div className="flex items-center gap-3 w-full">
                <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 ${ticket.status === "open" ? "bg-warning/10" : "bg-success/10"}`}>
                  {ticket.status === "open" ? <AlertCircle className="w-4 h-4 text-warning" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{ticket.subject || ticket.title || "Support ticket"}</p>
                  <p className="text-[10px] text-muted-foreground">{ticket.priority || "normal"} priority</p>
                </div>
                <StatusPill status={ticket.status === "open" ? "open" : ticket.status === "resolved" ? "resolved" : "info"} label={ticket.status} />
              </div>
            )}
          />
        </SectionCard>

        <SectionCard title="Marketplace Listings" description="Latest marketplace activity" delay={0.25}
          action={<button onClick={() => navigate("/portal/marketplace")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
        >
          <SmartList
            items={listings || []}
            emptyMessage="No marketplace listings"
            renderRow={(listing) => (
              <div className="flex items-center gap-3 w-full">
                <div className="w-9 h-9 rounded-[12px] bg-success/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{listing.title || "Listing"}</p>
                  <p className="text-[10px] text-muted-foreground">{listing.price ? `₦${listing.price}` : "No price"}</p>
                </div>
                <StatusPill status={listing.status || "info"} />
              </div>
            )}
          />
        </SectionCard>
      </div>

      {/* Upcoming Events + Moderation Queue */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Upcoming Events" description="Latest campus events" delay={0.3}
          action={<button onClick={() => navigate("/portal/events")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
        >
          <SmartList
            items={events || []}
            emptyMessage="No events"
            renderRow={(event) => (
              <div className="flex items-center gap-3 w-full">
                <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{event.title || "Event"}</p>
                  <p className="text-[10px] text-muted-foreground">{event.date || "No date"} · {event.location || "No location"}</p>
                </div>
                <StatusPill status={event.status || "info"} />
              </div>
            )}
          />
        </SectionCard>

        <SectionCard title="Moderation Queue" description="Content awaiting review" delay={0.35}
          action={<button onClick={() => navigate("/portal/content")} className="text-[12px] font-semibold text-primary hover:underline">Review</button>}
        >
          <div className="p-5 space-y-3">
            {[
              { label: "Posts pending review", count: 0, icon: FileEdit, color: "text-info" },
              { label: "Reported content", count: 0, icon: AlertCircle, color: "text-warning" },
              { label: "User reports", count: 0, icon: Eye, color: "text-error" },
              { label: "Auto-flagged items", count: 0, icon: Eye, color: "text-purple" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 p-3.5 rounded-[18px] bg-muted/20 border border-border/15"
              >
                <div className={`w-8 h-8 rounded-[12px] bg-muted/40 flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="flex-1 text-[12px] font-medium text-foreground">{item.label}</span>
                <span className="text-[16px] font-heading font-bold text-foreground">{item.count}</span>
              </motion.div>
            ))}
            <div className="p-3 rounded-[16px] bg-success/5 border border-success/15">
              <p className="text-[11px] text-success font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All clear — no items awaiting moderation
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}