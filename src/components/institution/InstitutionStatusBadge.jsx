import React from "react";
import { CheckCircle2, Users, Clock, HelpCircle } from "lucide-react";
import { getVerificationStatus } from "@/lib/institutionConfig";

const ICONS = {
  verified: CheckCircle2,
  community_supported: Users,
  awaiting_verification: Clock,
  not_onboarded: HelpCircle,
};

export default function InstitutionStatusBadge({ status, size = "md", showLabel = true, className = "" }) {
  const config = getVerificationStatus(status);
  const Icon = ICONS[status] || HelpCircle;

  const sizes = {
    sm: { badge: "px-2 py-0.5 text-[9px]", icon: "w-3 h-3" },
    md: { badge: "px-2.5 py-1 text-[10px]", icon: "w-3.5 h-3.5" },
    lg: { badge: "px-3 py-1.5 text-[11px]", icon: "w-4 h-4" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${config.bg} ${config.text} ${s.badge} ${className}`}>
      <Icon className={s.icon} strokeWidth={2.2} />
      {showLabel && config.label}
    </span>
  );
}