import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { BudLauncherProvider } from "@/lib/BudLauncherContext";
import BottomNav from "@/components/layout/BottomNav";
import EcosystemRail from "@/components/layout/EcosystemRail";
import BudSheet from "@/components/bud/BudSheet";
import ContextPulse from "@/components/layout/ContextPulse";
import { UnibudContextProvider } from "@/lib/UnibudContext";

/**
 * AppShell — the authenticated student shell: page content + floating
 * Bud Orb + bottom navigation. Guards auth for all tab routes.
 */
export default function AppShell() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      if (!ok) navigate("/login", { replace: true });
      setChecking(false);
    });
  }, [navigate]);

  useEffect(() => {
    try {
      if (localStorage.getItem("ux_reduce_motion") === "1") document.documentElement.classList.add("reduce-motion");
      if (localStorage.getItem("ux_large_text") === "1") document.documentElement.classList.add("ux-large-text");
    } catch {}
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <BudLauncherProvider>
      <UnibudContextProvider>
        <div className="min-h-screen w-full">
          <ContextPulse />
          <Outlet />
          <EcosystemRail />
          <BottomNav />
          <BudSheet />
        </div>
      </UnibudContextProvider>
    </BudLauncherProvider>
  );
}