import React from "react";
import { Outlet } from "react-router-dom";
import MainTabBar from "@/components/layout/MainTabBar";

export default function MainShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="app-content pb-24">
        <Outlet />
      </div>
      <MainTabBar />
    </div>
  );
}