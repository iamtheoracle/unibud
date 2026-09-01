import React from "react";
import { motion } from "framer-motion";
import { Wind, Phone, Heart, BookOpen, Moon, Activity } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const RESOURCES = [
  {
    icon: Wind,
    title: "Breathing Exercise",
    subtitle: "4-7-8 breathing technique",
    color: "text-info",
    bg: "bg-info/10",
    action: "Breathe in for 4s, hold for 7s, exhale for 8s. Repeat 4 times.",
  },
  {
    icon: Moon,
    title: "Sleep Tips",
    subtitle: "Better rest for better focus",
    color: "text-purple",
    bg: "bg-purple/10",
    action: "Avoid screens 30min before bed. Keep a consistent sleep schedule.",
  },
  {
    icon: Activity,
    title: "Quick Stretch",
    subtitle: "Release tension in 2 minutes",
    color: "text-success",
    bg: "bg-success/10",
    action: "Roll shoulders, stretch neck, touch toes, reach for the sky.",
  },
  {
    icon: Phone,
    title: "Campus Support",
    subtitle: "Talk to someone who can help",
    color: "text-destructive",
    bg: "bg-destructive/10",
    action: "Visit your university's student counselling centre or student affairs office.",
  },
  {
    icon: BookOpen,
    title: "Study Stress Relief",
    subtitle: "Manage academic pressure",
    color: "text-warning",
    bg: "bg-warning/10",
    action: "Break tasks into small steps. Use the 25-minute study method. Take breaks.",
  },
  {
    icon: Heart,
    title: "Self-Care Checklist",
    subtitle: "Daily wellness basics",
    color: "text-primary",
    bg: "bg-primary/10",
    action: "Did you eat, drink water, sleep 7+ hours, move your body, and talk to someone today?",
  },
];

export default function WellnessResources() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {RESOURCES.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <GlassCard variant="solid" className="p-4 h-full">
            <div className={`w-10 h-10 rounded-[12px] ${r.bg} flex items-center justify-center mb-2.5`}>
              <r.icon className={`w-5 h-5 ${r.color}`} />
            </div>
            <p className="font-heading font-semibold text-[12px] text-foreground">{r.title}</p>
            <p className="text-[10px] text-muted-foreground mb-2">{r.subtitle}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{r.action}</p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}