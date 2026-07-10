import React from "react";
import { Utensils, Bus, HeartPulse, ShieldAlert, Map, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const services = [
  { icon: Utensils, label: "Dining", color: "bg-warning/10", iconColor: "text-warning", path: "/marketplace" },
  { icon: Bus, label: "Transport", color: "bg-info/10", iconColor: "text-info", path: "/discover" },
  { icon: HeartPulse, label: "Health", color: "bg-destructive/10", iconColor: "text-destructive", path: "/wellbeing" },
  { icon: ShieldAlert, label: "Safety", color: "bg-success/10", iconColor: "text-success", path: "/student-support" },
  { icon: Map, label: "Map", color: "bg-purple/10", iconColor: "text-purple", path: "/discover" },
  { icon: Wrench, label: "Services", color: "bg-warning/10", iconColor: "text-warning", path: "/discover" },
];

export default function CampusLife() {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Campus Life</h3>
      <div className="grid grid-cols-3 gap-2.5">
        {services.map((service, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(service.path)}
            className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3 flex flex-col items-center gap-2 card-hover"
          >
            <div className={`w-10 h-10 rounded-[14px] ${service.color} flex items-center justify-center`}>
              <service.icon className={`w-[18px] h-[18px] ${service.iconColor}`} strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-medium text-foreground">{service.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}