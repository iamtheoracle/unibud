import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Eye, MapPin, Clock, Wifi, UserPlus, Shield, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const PRIVACY_CONTROLS = [
  {
    id: "who_can_message",
    label: "Who Can Message Me",
    icon: Mail,
    options: ["Everyone", "Connections Only", "No One"],
    default: "Connections Only",
  },
  {
    id: "profile_visibility",
    label: "Profile Visibility",
    icon: Eye,
    options: ["Public", "University Only", "Friends Only", "Private"],
    default: "University Only",
  },
  {
    id: "location_visibility",
    label: "Location Visibility",
    icon: MapPin,
    options: ["On", "Friends Only", "Off"],
    default: "Friends Only",
  },
  {
    id: "availability_visible",
    label: "Show Availability",
    icon: Clock,
    options: ["On", "Off"],
    default: "On",
  },
  {
    id: "online_status",
    label: "Online Status",
    icon: Wifi,
    options: ["On", "Connections Only", "Off"],
    default: "Connections Only",
  },
  {
    id: "connection_requests",
    label: "Connection Requests",
    icon: UserPlus,
    options: ["Everyone", "University Only", "Friends of Friends"],
    default: "University Only",
  },
];

/**
 * CampusPrivacyControls — privacy control panel for campus connections.
 *
 * Props:
 *  - open: boolean
 *  - settings: object — { who_can_message: "Connections Only", ... }
 *  - onChange: (controlId, value) => void
 *  - onClose: () => void
 */
export default function CampusPrivacyControls({ open, settings = {}, onChange, onClose }) {
  const [local, setLocal] = useState(settings);

  const handleSelect = (controlId, value) => {
    setLocal((prev) => ({ ...prev, [controlId]: value }));
    onChange?.(controlId, value);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[7000] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-[7001] rounded-t-[24px] overflow-hidden safe-area-pb"
          >
            <div className="crystal-card rounded-t-[24px] pb-6 max-h-[80vh] overflow-y-auto no-scrollbar">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />

              <div className="flex items-center justify-between px-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Privacy</p>
                    <h3 className="font-heading font-bold text-[16px] text-foreground">Your Connections</h3>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                </button>
              </div>

              <div className="px-4 mt-4 space-y-3">
                {PRIVACY_CONTROLS.map((control, i) => {
                  const Icon = control.icon;
                  const current = local[control.id] || control.default;

                  return (
                    <motion.div
                      key={control.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="p-2.5 rounded-[12px] glass"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
                        <span className="text-[12px] font-bold text-foreground">{control.label}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {control.options.map((opt) => {
                          const isActive = current === opt;
                          return (
                            <motion.button
                              key={opt}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => handleSelect(control.id, opt)}
                              className={cn(
                                "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold spring-tap",
                                isActive ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"
                              )}
                            >
                              {isActive && <Check className="w-2.5 h-2.5" strokeWidth={2.5} />}
                              {opt}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mx-4 mt-4 px-3 py-2.5 rounded-[12px] glass">
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                  Bud respects your privacy. These settings control who can find you, message you, and see your activity across campus.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}