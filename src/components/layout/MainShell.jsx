import React from "react";
import { Outlet } from "react-router-dom";

/**
 * MainShell — pass-through layout for the four primary tab routes.
 * The unified bottom tab bar (MainTabBar) is rendered by AppShell so
 * every authenticated screen shares the same navigation.
 */
export default function MainShell() {
  return <Outlet />;
}