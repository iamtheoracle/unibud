import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";
import CommandDock from "@/components/layout/CommandDock";

export default function AppLayout() {
  const location = useLocation();
  const hideDock = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(40,20%,98%)] via-white to-[hsl(220,30%,97%)]">
      <div className="max-w-lg mx-auto relative pb-24">
        <Outlet />
      </div>
      {!hideDock && (
        <>
          <BottomNav />
          <CommandDock />
        </>
      )}
    </div>
  );
}