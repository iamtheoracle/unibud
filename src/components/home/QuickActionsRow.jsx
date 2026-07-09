import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ShoppingBag, Briefcase, MessageCircle, GraduationCap, Users } from "lucide-react";

const actions = [
  { icon: BookOpen, label: "Courses", path: "/academics", gradient: "from-blue-500 to-blue-600" },
  { icon: GraduationCap, label: "Results", path: "/academics", gradient: "from-purple-500 to-purple-600" },
  { icon: Briefcase, label: "Opportunities", path: "/opportunities", gradient: "from-emerald-500 to-emerald-600" },
  { icon: ShoppingBag, label: "Market", path: "/marketplace", gradient: "from-orange-400 to-orange-500" },
  { icon: Users, label: "Connect", path: "/connect", gradient: "from-pink-500 to-rose-500" },
  { icon: MessageCircle, label: "Bud", path: "/bud", gradient: "from-indigo-500 to-violet-500" },
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
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-border/40 shadow-sm card-hover"
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