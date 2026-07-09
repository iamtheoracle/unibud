import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/layout/BottomNav";
import CommandDock from "@/components/layout/CommandDock";
import BudOnboarding from "@/components/onboarding/BudOnboarding";

export default function AppLayout() {
  const location = useLocation();
  const hideDock = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const showOnboarding = user && !user.onboarding_completed && !hideDock;

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-lg mx-auto relative pb-28">
        <Outlet />
      </div>
      {!hideDock && (
        <>
          <BottomNav />
          <CommandDock />
        </>
      )}
      {showOnboarding && <BudOnboarding />}
    </div>
  );
}