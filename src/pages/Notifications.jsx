import React from "react";
import { ArrowLeft, Bell, BookOpen, Users, Award, AlertTriangle, Settings, Check, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_NOTIFICATIONS = [
  { id: "d1", title: "Assignment Due Tomorrow", message: "Data Structures Assignment 3 is due in 24 hours", type: "academic", time: "1h ago", is_read: false },
  { id: "d2", title: "New Scholarship Available", message: "Africa Merit Scholarship 2026 — you may be eligible", type: "opportunity", time: "3h ago", is_read: false },
  { id: "d3", title: "Chioma Eze connected with you", message: "You now have a new study connection", type: "social", time: "5h ago", is_read: true },
  { id: "d4", title: "Mid-Semester Exams Schedule", message: "Exams begin July 21st. Check your timetable", type: "academic", time: "8h ago", is_read: true },
  { id: "d5", title: "Campus Wi-Fi Upgrade", message: "Wi-Fi speeds improved across all buildings", type: "system", time: "1d ago", is_read: true },
  { id: "d6", title: "Study Streak Achievement!", message: "You've maintained a 5-day study streak", type: "achievement", time: "1d ago", is_read: true },
];

const typeConfig = {
  academic: { icon: BookOpen, color: "bg-info/10 text-info" },
  opportunity: { icon: Award, color: "bg-success/10 text-success" },
  social: { icon: Users, color: "bg-purple/10 text-purple" },
  system: { icon: Settings, color: "bg-muted text-muted-foreground" },
  achievement: { icon: Award, color: "bg-warning/10 text-warning" },
  emergency: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  reminder: { icon: Bell, color: "bg-primary/10 text-primary" },
};

export default function Notifications() {
  const { isDemoMode } = useDemoMode();
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 50),
    enabled: !isDemoMode,
  });

  const items = isDemoMode ? DEMO_NOTIFICATIONS : (notifications || []);
  const unreadCount = items.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (isDemoMode) return;
    const unread = items.filter((n) => !n.is_read);
    for (const n of unread) {
      await base44.entities.Notification.update(n.id, { is_read: true });
    }
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center gap-3"
      >
        <Link to="/" className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-[18px] text-foreground">Notifications</h1>
          {unreadCount > 0 && <p className="text-[11px] text-muted-foreground">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[12px] font-medium text-primary spring-tap">Mark all read</button>
        )}
      </motion.div>

      <div className="px-4 space-y-2.5 pb-8">
        {isLoading && !isDemoMode ? (
          [1, 2, 3].map((i) => <div key={i} className="h-[80px] rounded-[20px] shimmer" />)
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No notifications yet"
            description="Announcements, assignment reminders, and campus updates will appear here"
          />
        ) : (
          items.map((n, i) => {
            const cfg = typeConfig[n.type] || typeConfig.system;
            const Icon = cfg.icon;
            return (
              <GlassCard key={n.id || i} variant="solid" className={"p-3.5 " + (!n.is_read ? "border-l-[3px] border-l-primary" : "")} delay={i * 0.04}>
                <div className="flex items-start gap-3">
                  <div className={"w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 " + cfg.color}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={"font-heading font-semibold text-[12px] " + (!n.is_read ? "text-foreground" : "text-muted-foreground")}>{n.title}</p>
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{n.time || (n.created_date ? new Date(n.created_date).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "")}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}