import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, SlidersHorizontal, ChevronRight } from "lucide-react";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import BudDailyDigest from "@/components/notifications/BudDailyDigest";
import ScreenShell from "@/components/layout/ScreenShell";

export default function Notifications() {
  const hook = useNotificationCenter();

  return (
    <ScreenShell back backTo="/home" title="Notifications" subtitle={hook.unreadCount > 0 ? `${hook.unreadCount} unread` : undefined}>
      <Link to="/smart-notifications" className="block mb-3">
        <BudDailyDigest />
      </Link>
      <Link to="/bud/notifications" className="block mb-3 rounded-[14px] glass-card px-3.5 py-2.5 flex items-center gap-2.5 spring-tap">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-foreground">Bud notification preferences</p>
          <p className="text-[10px] text-muted-foreground">Choose what Bud reminds you about, when, and how</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Link>
      <NotificationCenter hook={hook} />
    </ScreenShell>
  );
}