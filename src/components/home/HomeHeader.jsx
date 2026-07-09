import React from "react";
import { Bell, Sun, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HomeHeader({ user }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "Student";

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
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-semibold text-amber-700">28°</span>
        </div>
        <Link to="/notifications" className="relative w-9 h-9 rounded-full bg-white border border-border/60 flex items-center justify-center shadow-sm">
          <Bell className="w-4 h-4 text-foreground" strokeWidth={1.8} />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full border-2 border-white" />
        </Link>
      </div>
    </motion.div>
  );
}