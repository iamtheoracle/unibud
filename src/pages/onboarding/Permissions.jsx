import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ShieldCheck, ChevronRight } from "lucide-react";
import UnibudMark from "@/components/brand/UnibudMark";
import { hapticTap } from "@/lib/haptics";

const ease = [0.16, 1, 0.3, 1];

const PERMISSIONS = [
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    description: "Get alerts for deadlines, messages, campus events, and important updates.",
    accent: "text-info",
    bg: "bg-info/8",
  },
  {
    id: "privacy",
    icon: ShieldCheck,
    title: "Privacy & Data",
    description: "Allow UNIBUD to personalize your experience based on your activity and preferences.",
    accent: "text-primary",
    bg: "bg-primary/8",
  },
];

export default function Permissions() {
  const navigate = useNavigate();
  const [granted, setGranted] = useState({});

  const togglePermission = (id) => {
    hapticTap();
    setGranted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleContinue = () => {
    hapticTap();
    localStorage.setItem("unibud_permissions", JSON.stringify(granted));
    navigate("/onboarding/personalized-loading");
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      <motion.div
        className="absolute top-[-10%] left-[-5%] w-[60%] h-[35%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none"
        animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-center gap-2 px-6 pt-4 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top), 2rem)" }}
      >
        <span className="text-foreground"><UnibudMark className="w-5 h-5" /></span>
        <span className="font-heading font-extrabold text-[14px] text-foreground">UNIBUD</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10 no-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <h2 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground mb-1">
            Permissions
          </h2>
          <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
            Enable these to get the most out of UNIBUD. You can change these anytime in Settings.
          </p>
        </motion.div>

        <div className="space-y-3">
          {PERMISSIONS.map((perm, i) => {
            const Icon = perm.icon;
            const isGranted = granted[perm.id];
            return (
              <motion.div
                key={perm.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease }}
                className="bg-card rounded-[24px] border border-border/25 p-4 premium-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-[18px] ${perm.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${perm.accent}`} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-[15px] text-foreground mb-0.5">{perm.title}</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{perm.description}</p>
                  </div>
                  <button
                    onClick={() => togglePermission(perm.id)}
                    className={`w-12 h-7 rounded-full flex items-center transition-colors spring-tap flex-shrink-0 ${
                      isGranted ? "bg-primary justify-end" : "bg-muted justify-start"
                    }`}
                    aria-label={`Toggle ${perm.title}`}
                  >
                    <motion.div
                      animate={{ x: isGranted ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 rounded-full bg-white shadow-sm ml-0.5"
                    />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-6 pb-2 pt-3 relative z-10 bg-gradient-to-t from-background via-background/95 to-transparent"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          className="w-full h-[52px] rounded-full bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap shadow-[0_6px_24px_hsl(var(--primary)/0.3)]"
        >
          Continue
          <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </motion.button>
      </div>
    </div>
  );
}