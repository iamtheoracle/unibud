import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Globe, Users, Building, FlaskConical } from "lucide-react";
import { PortalPageHeader, SectionCard, StatusPill } from "@/components/portal/PortalUI";

const FLAGS = [
  { id: 1, name: "AI Study Planner", description: "Intelligent study schedule generation powered by Bud", enabled: true, audience: "All Universities", category: "Academic", icon: FlaskConical },
  { id: 2, name: "Live Class Recording", description: "Automatic recording of all live lectures", enabled: true, audience: "Beta Cohort", category: "Academic", icon: Flag },
  { id: 3, name: "Marketplace Payments", description: "In-app payment processing for marketplace listings", enabled: false, audience: "Internal Only", category: "Commerce", icon: Flag },
  { id: 4, name: "Mentorship Booking", description: "Calendar-based mentorship session scheduling", enabled: true, audience: "All Universities", category: "Social", icon: Users },
  { id: 5, name: "Campus Navigation", description: "Interactive campus maps with turn-by-turn directions", enabled: false, audience: "Coming Soon", category: "Services", icon: Globe },
  { id: 6, name: "FYP Hub", description: "Final year project showcase and collaboration", enabled: true, audience: "All Universities", category: "Academic", icon: Building },
  { id: 7, name: "Wellbeing Tracker", description: "Private mood tracking and journaling space", enabled: true, audience: "All Universities", category: "Wellbeing", icon: Flag },
  { id: 8, name: "Study Groups Chat", description: "Real-time messaging in study groups", enabled: true, audience: "All Universities", category: "Social", icon: Users },
];

export default function FeatureFlags() {
  const [flags, setFlags] = useState(FLAGS);

  const toggleFlag = (id) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Feature Flags"
        subtitle="Control platform features and rollouts across universities."
        action={
          <div className="flex items-center gap-2 px-4 py-2 rounded-[16px] bg-muted/50 border border-border/30">
            <span className="text-[12px] text-muted-foreground">Active:</span>
            <span className="text-[14px] font-heading font-bold text-success">{enabledCount}</span>
            <span className="text-[12px] text-muted-foreground">/ {flags.length}</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flags.map((flag, i) => (
          <motion.div
            key={flag.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionCard delay={0}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center ${flag.enabled ? "bg-success/10" : "bg-muted/50"}`}>
                    <flag.icon className={`w-5 h-5 ${flag.enabled ? "text-success" : "text-muted-foreground"}`} />
                  </div>
                  <StatusPill status={flag.enabled ? "enabled" : "disabled"} label={flag.enabled ? "Enabled" : "Disabled"} />
                </div>
                <p className="text-[14px] font-heading font-bold text-foreground mb-1">{flag.name}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{flag.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Audience</p>
                    <p className="text-[11px] font-medium text-foreground">{flag.audience}</p>
                  </div>
                  <button
                    onClick={() => toggleFlag(flag.id)}
                    className={`w-12 h-7 rounded-full flex items-center transition-all spring-tap ${
                      flag.enabled ? "bg-success justify-end pr-0.5" : "bg-muted justify-start pl-0.5"
                    }`}
                  >
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-6 h-6 rounded-full bg-white shadow-md"
                    />
                  </button>
                </div>
              </div>
            </SectionCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}