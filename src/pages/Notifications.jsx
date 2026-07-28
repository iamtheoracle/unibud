import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell } from "lucide-react";
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
      <NotificationCenter hook={hook} />
    </ScreenShell>
  );
}