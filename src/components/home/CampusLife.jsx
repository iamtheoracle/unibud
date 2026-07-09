import React from "react";
import { Utensils, Bus, HeartPulse, ShieldAlert, Map, Wrench } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { icon: Utensils, label: "Dining", color: "bg-orange-500/10", iconColor: "text-orange-500" },
  { icon: Bus, label: "Transport", color: "bg-blue-500/10", iconColor: "text-blue-500" },
  { icon: HeartPulse, label: "Health", color: "bg-red-500/10", iconColor: "text-red-500" },
  { icon: ShieldAlert, label: "Safety", color: "bg-emerald-500/10", iconColor: "text-emerald-500" },
  { icon: Map, label: "Map", color: "bg-purple-500/10", iconColor: "text-purple-500" },
  { icon: Wrench, label: "Services", color: "bg-amber-500/10", iconColor: "text-amber-500" },
];

export default function CampusLife() {
  return (
    <div>
      <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A] mb-3 px-1">Campus Life</h3>
      <div className="grid grid-cols-3 gap-2">
        {services.map((service, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3 flex flex-col items-center gap-1.5"
          >
            <div className={`w-9 h-9 rounded-xl ${service.color} flex items-center justify-center`}>
              <service.icon className={`w-[18px] h-[18px] ${service.iconColor}`} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium text-[#1A1A1A]">{service.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}