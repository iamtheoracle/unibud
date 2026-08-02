import React from "react";
import { Outlet } from "react-router-dom";

/**
 * OperationsShell — the layout wrapper for the Operations Platform.
 *
 * Completely isolated from the Student Application. No student
 * navigation dock, no social features, no Bud hero. Each operations
 * page provides its own internal shell and navigation.
 *
 * This separation ensures students never see operations interfaces,
 * and operators get a focused workspace without student distractions.
 */
export default function OperationsShell() {
  return (
    <div className="min-h-screen bg-background safe-area-pt">
      <Outlet />
    </div>
  );
}