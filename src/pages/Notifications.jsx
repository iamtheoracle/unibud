import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell } from "lucide-react";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import BudDailyDigest from "@/components/notifications/BudDailyDigest";

export default function Notifications() {
  const hook = useNotificationCenter();

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center gap-3 sticky top-0 z-10"
        style={{
          background: "linear-gradient(to bottom, hsl(var(--background)), hsl(var(--background) / 0.85) 70%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <Link to="/" className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-[18px] text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Notifications
          </h1>
          {hook.unreadCount > 0 && (
            <p className="text-[11px] text-muted-foreground">{hook.unreadCount} unread</p>
          )}
        </div>
      </motion.div>

      <div className="px-5">
        <Link to="/smart-notifications" className="block mb-3">
          <BudDailyDigest />
        </Link>
      </div>

      <NotificationCenter hook={hook} />
    </div>
  );
}