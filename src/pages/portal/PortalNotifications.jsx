import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, Send, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PortalPageHeader, SectionCard, StatusPill, SmartList } from "@/components/portal/PortalUI";

const TABS = ["All", "Unread", "Sent"];

const TYPE_ICONS = {
  alert: AlertCircle,
  info: Info,
  success: CheckCircle2,
};

export default function PortalNotifications() {
  const [activeTab, setActiveTab] = useState("All");

  const { data: notifications } = useQuery({
    queryKey: ["portalNotifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 20),
    retry: false,
  });

  const filtered = (notifications || []).filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !n.is_read;
    if (activeTab === "Sent") return n.sent_by;
    return true;
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Notifications"
        subtitle="Platform-wide notification center and broadcast queue."
        action={
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap hover:opacity-90 transition-opacity">
            <Send className="w-4 h-4" /> New Broadcast
          </button>
        }
      />

      <div className="flex gap-2 p-1.5 bg-muted/50 rounded-[20px] w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-[16px] text-[12px] font-semibold transition-all ${
              activeTab === tab ? "bg-card text-foreground elevated-shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <SectionCard delay={0.1}>
        <SmartList
          items={filtered}
          emptyMessage="No notifications yet"
          renderRow={(n) => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            return (
              <div className="flex items-center gap-3 w-full">
                <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
                  n.type === "alert" ? "bg-error/10" : n.type === "success" ? "bg-success/10" : "bg-info/10"
                }`}>
                  <Icon className={`w-4 h-4 ${n.type === "alert" ? "text-error" : n.type === "success" ? "text-success" : "text-info"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{n.title || "Notification"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{n.body || n.message || "—"}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                {n.priority && <StatusPill status={n.priority === "urgent" ? "critical" : "info"} label={n.priority} />}
              </div>
            );
          }}
        />
      </SectionCard>
    </div>
  );
}