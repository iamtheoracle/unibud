import React from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import GoogleIcon from "@/components/GoogleIcon";
import { Building2 } from "lucide-react";

const AppleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const MicrosoftIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 3h8.5v8.5H3V3zm9.5 0H21v8.5h-8.5V3zM3 12.5h8.5V21H3v-8.5zm9.5 0H21V21h-8.5v-8.5z" />
  </svg>
);

const BUTTONS = [
  { provider: "google", label: "Google", Icon: GoogleIcon },
  { provider: "apple", label: "Apple", Icon: AppleIcon },
  { provider: "microsoft", label: "Microsoft", Icon: MicrosoftIcon },
];

export default function SocialButtons({ redirectTo = "/" }) {
  const handleProvider = (provider) => {
    base44.auth.loginWithProvider(provider, redirectTo);
  };

  return (
    <div className="space-y-2.5">
      {BUTTONS.map(({ provider, label, Icon }) => (
        <motion.button
          key={provider}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleProvider(provider)}
          className="w-full h-[48px] rounded-2xl bg-card text-foreground font-heading font-semibold text-[14px] border border-border/50 premium-shadow flex items-center justify-center gap-2.5 hover:bg-muted/50 transition-colors"
        >
          <Icon className="w-[18px] h-[18px]" />
          Continue with {label}
        </motion.button>
      ))}
      <motion.button
        whileTap={{ scale: 0.98 }}
        className="w-full h-[48px] rounded-2xl bg-transparent text-muted-foreground font-heading font-semibold text-[14px] border border-dashed border-border/50 flex items-center justify-center gap-2.5"
      >
        <Building2 className="w-[18px] h-[18px]" />
        University SSO
        <span className="text-[10px] font-medium text-muted-foreground/60">when supported</span>
      </motion.button>
    </div>
  );
}