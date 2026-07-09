import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ShoppingBag, Briefcase, MessageCircle, GraduationCap, Users } from "lucide-react";

const actions = [
  { icon: BookOpen, label: "Courses", path: "/academics", gradient: "from-info to-info/80" },
  { icon: GraduationCap, label: "Results", path: "/academics", gradient: "from-purple to-purple/80" },
  { icon: Briefcase, label: "Opportunities", path: "/opportunities", gradient: "from-success to-success/80" },
  { icon: ShoppingBag, label: "Market", path: "/marketplace", gradient: "from-warning to-warning/80" },
  { icon: Users, label: "Connect", path: "/connect", gradient: "from-destructive to-destructive/80" },
  { icon: MessageCircle, label: "Bud", path: "/bud", gradient: "from-info to-purple" },
];

export default function QuickActionsRow() {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 + i * 0.04 }}
        >
          <Link
            to={action.path}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/40 shadow-sm card-hover"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
              <action.icon className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <span className="text-[11px] font-semibold text-foreground">{action.label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}