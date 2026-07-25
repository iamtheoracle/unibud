import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { BudLauncherProvider } from "@/lib/BudLauncherContext";
import BottomNav from "@/components/layout/BottomNav";
import BudOrb from "@/components/brand/BudOrb";
import BudSheet from "@/components/bud/BudSheet";

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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <BudLauncherProvider>
      <div className="min-h-screen w-full">
        <Outlet />
        <BudOrb />
        <BottomNav />
        <BudSheet />
      </div>
    </BudLauncherProvider>
  );
}