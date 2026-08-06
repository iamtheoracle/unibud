import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Bell, Palette, Smartphone, ChevronRight, Lock, Globe, HelpCircle,
} from "lucide-react";
import MatriculationCard from "@/components/me/MatriculationCard";
import SettingsSection from "@/components/me/SettingsSection";
import DownloadsSection from "@/components/me/DownloadsSection";
import BudMemorySection from "@/components/me/BudMemorySection";

const SECURITY_LINKS = [
  { label: "Security Center", to: "/security", icon: Shield },
  { label: "Privacy Controls", to: "/security", icon: Lock },
  { label: "Devices & Sessions", to: "/security", icon: Smartphone },
  { label: "Connected Accounts", to: "/settings/connected-accounts", icon: Globe },
];

const PREFERENCES_LINKS = [
  { label: "Notifications", to: "/smart-notifications", icon: Bell },
  { label: "Appearance", to: "/accessibility", icon: Palette },
  { label: "Help & Support", to: "/help", icon: HelpCircle },
];

export default function IdentitySettingsSection({ user, isOwnProfile }) {
  const navigate = useNavigate();

  const renderLink = (link) => (
    <button
      key={link.label}
      onClick={() => navigate(link.to)}
      className="w-full flex items-center gap-3 p-3.5 rounded-[16px] bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
    >
      <link.icon className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
      <span className="text-[13px] font-bold text-foreground flex-1">{link.label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Matriculation / Student ID */}
      <MatriculationCard user={user} />

      {/* Security */}
      <div>
        <h3 className="text-[13px] font-bold text-foreground tracking-tight mb-2 px-1">Security & Privacy</h3>
        <div className="space-y-2">{SECURITY_LINKS.map(renderLink)}</div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-[13px] font-bold text-foreground tracking-tight mb-2 px-1">Preferences</h3>
        <div className="space-y-2">{PREFERENCES_LINKS.map(renderLink)}</div>
      </div>

      {/* Settings (full account management) */}
      <SettingsSection user={user} />

      {/* Bud Memory */}
      <BudMemorySection />

      {/* Downloads */}
      <DownloadsSection />
    </div>
  );
}