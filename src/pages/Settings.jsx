import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Eye, Rocket, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SettingsSection from "@/components/me/SettingsSection";

/**
 * Settings — dedicated settings page, accessed from the profile action bar.
 * Wraps the existing SettingsSection with a premium header and back navigation.
 */
export default function Settings() {
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  return (
    <div className="min-h-screen pb-32 safe-area-pt">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-[520px] mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
            aria-label="Back"
          >
            <ChevronLeft className="w-[20px] h-[20px] text-foreground" strokeWidth={2} />
          </button>
          <h1 className="text-[18px] font-bold tracking-tight text-foreground">Settings</h1>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4">
        <div className="flex flex-col gap-2.5 mb-4">
          <Link to="/accessibility" className="flex items-center gap-3 p-3.5 rounded-[16px] glass-card spring-tap">
            <div className="w-9 h-9 rounded-full grid place-items-center bg-primary/10">
              <Eye className="w-[18px] h-[18px] text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-foreground">Accessibility</p>
              <p className="text-[12px] text-muted-foreground">High contrast, motion, text size</p>
            </div>
          </Link>
          <Link to="/launch-readiness" className="flex items-center gap-3 p-3.5 rounded-[16px] glass-card spring-tap">
            <div className="w-9 h-9 rounded-full grid place-items-center bg-primary/10">
              <Rocket className="w-[18px] h-[18px] text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-foreground">Launch Readiness</p>
              <p className="text-[12px] text-muted-foreground">Production status & system health</p>
            </div>
          </Link>
          <Link to="/automation-settings" className="flex items-center gap-3 p-3.5 rounded-[16px] glass-card spring-tap">
            <div className="w-9 h-9 rounded-full grid place-items-center bg-primary/10">
              <Sparkles className="w-[18px] h-[18px] text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-foreground">Autonomous Intelligence</p>
              <p className="text-[12px] text-muted-foreground">Proactive automations & AI briefings</p>
            </div>
          </Link>
        </div>
        <SettingsSection user={user} />
      </div>
    </div>
  );
}