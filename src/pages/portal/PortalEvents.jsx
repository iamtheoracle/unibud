import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Users, MapPin, PartyPopper } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DashboardCard, SectionCard, PortalPageHeader, StatusPill, SmartList } from "@/components/portal/PortalUI";

export default function PortalEvents() {
  const { data: traditions } = useQuery({
    queryKey: ["portalEvents"],
    queryFn: () => base44.entities.CampusTradition.list("-created_date", 20),
    retry: false,
  });

  const upcoming = (traditions || []).filter((t) => t.status === "upcoming" || !t.status);
  const ongoing = (traditions || []).filter((t) => t.status === "ongoing");

  return (
    <div className="space-y-6">
      <PortalPageHeader title="Events" subtitle="Campus events, traditions, and activities oversight." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={CalendarDays} value={traditions?.length || 0} title="Total Events" accent="primary" delay={0} />
        <DashboardCard icon={PartyPopper} value={upcoming.length} title="Upcoming" accent="success" delay={0.05} />
        <DashboardCard icon={Users} value={ongoing.length} title="Ongoing Now" accent="warning" delay={0.1} />
        <DashboardCard icon={MapPin} value="12" title="Venues" subtitle="Active locations" accent="info" delay={0.15} />
      </div>

      <SectionCard title="Campus Events" description="Recent and upcoming campus traditions" delay={0.2}>
        <SmartList
          items={traditions || []}
          emptyMessage="No events found"
          renderRow={(event) => (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{event.title || "Untitled Event"}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {(event.type || "event").replace(/_/g, " ")} · {event.start_date || "TBD"}
                  {event.location && ` · ${event.location}`}
                </p>
              </div>
              <StatusPill status={event.status === "ongoing" ? "operational" : event.status === "completed" ? "resolved" : "open"} label={event.status || "upcoming"} />
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}