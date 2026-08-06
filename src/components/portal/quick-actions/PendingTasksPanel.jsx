import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ClipboardList, Megaphone, CalendarX, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function PendingTasksPanel({ user, onClose }) {
  const { data: assignments, isLoading: loadingA } = useQuery({
    queryKey: ["portalAssignments"],
    queryFn: () => base44.entities.Assignment.list(),
    retry: false,
  });
  const { data: announcements, isLoading: loadingAn } = useQuery({
    queryKey: ["portalAnnouncements"],
    queryFn: () => base44.entities.StaffAnnouncement.list(),
    retry: false,
  });
  const { data: events, isLoading: loadingE } = useQuery({
    queryKey: ["portalCalendarEvents"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      return base44.entities.CalendarEvent.filter({ date: { $gte: today } }, "date", 50);
    },
    retry: false,
  });

  const pendingAssignments = (assignments || []).filter((a) => a.status === "pending");
  const draftAnnouncements = (announcements || []).filter((a) => a.status === "draft" || a.status === "scheduled");
  const unsyncedEvents = (events || []).filter((e) => !e.google_event_id);

  const sections = [
    { label: "Assignments Awaiting Submission", icon: ClipboardList, color: "text-warning", bg: "bg-warning/10", items: pendingAssignments, renderItem: (a) => ({ title: a.title, sub: `${a.course_code || "—"} · Due ${a.due_date ? new Date(a.due_date).toLocaleDateString() : "—"}` }) },
    { label: "Unpublished Announcements", icon: Megaphone, color: "text-info", bg: "bg-info/10", items: draftAnnouncements, renderItem: (a) => ({ title: a.title, sub: `${a.audience.replace("_", " ")} · ${a.status}` }) },
    { label: "Events Awaiting Google Sync", icon: CalendarX, color: "text-error", bg: "bg-error/10", items: unsyncedEvents, renderItem: (e) => ({ title: e.title, sub: `${e.type.replace("_", " ")} · ${e.date}` }) },
  ];

  const loading = loadingA || loadingAn || loadingE;
  const totalPending = pendingAssignments.length + draftAnnouncements.length + unsyncedEvents.length;

  return (
    <div className="p-5">
      {/* Summary */}
      <div className="flex items-center gap-3 mb-5 p-4 rounded-[18px] bg-muted/30 border border-border/20">
        <div className="w-12 h-12 rounded-[16px] bg-warning/10 flex items-center justify-center">
          <span className="text-[20px] font-heading font-extrabold text-warning">{totalPending}</span>
        </div>
        <div>
          <p className="font-heading font-bold text-[14px] text-foreground">Total Pending Items</p>
          <p className="text-[12px] text-muted-foreground">Across assignments, announcements, and calendar</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : totalPending === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-[18px] bg-success/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <h3 className="font-heading font-bold text-[15px] text-foreground">All caught up!</h3>
          <p className="text-[13px] text-muted-foreground mt-1">No pending tasks right now.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {sections.map((section, si) => {
            const items = section.items || [];
            if (items.length === 0) return null;
            const Icon = section.icon;
            return (
              <motion.div key={si} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className={`w-7 h-7 rounded-[10px] ${section.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${section.color}`} />
                  </div>
                  <h4 className="text-[13px] font-bold text-foreground">{section.label}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.slice(0, 8).map((item, ii) => {
                    const rendered = section.renderItem(item);
                    return (
                      <div key={item.id || ii} className="flex items-center gap-3 p-3 rounded-[14px] bg-muted/30 border border-border/20">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground truncate">{rendered.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{rendered.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}