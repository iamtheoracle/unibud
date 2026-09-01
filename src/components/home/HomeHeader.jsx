import React from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";

export default function HomeHeader({ user }) {
  const { isDemoMode } = useDemoMode();
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 50),
    enabled: !isDemoMode,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = isDemoMode ? "Alex" : (user?.full_name?.split(" ")[0] || "Student");
  const unreadCount = isDemoMode ? 3 : (notifications || []).filter((n) => !n.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between pt-12 pb-4 px-5"
    >
      <div>
        <p className="text-[13px] text-muted-foreground font-medium">{greeting}</p>
        <h1 className="font-heading font-bold text-[22px] text-foreground tracking-tight">{firstName} 👋</h1>
      </div>
      <Link to="/notifications" className="relative w-9 h-9 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-sm">
        <Bell className="w-4 h-4 text-foreground" strokeWidth={1.8} />
        {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary rounded-full border-2 border-card text-[9px] font-bold text-primary-foreground flex items-center justify-center">{unreadCount}</span>}
      </Link>
    </motion.div>
  );
}