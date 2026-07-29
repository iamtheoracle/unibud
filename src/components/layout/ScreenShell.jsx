import React from "react";
import ScreenHeader from "./ScreenHeader";

/**
 * ScreenShell — the unified page container for every UNIBUD surface.
 *
 * One consistent chrome across the entire app:
 *   • max-w-[520px] centered column
 *   • safe-area + top/bottom spacing (pb-32 clears the floating dock)
 *   • optional unified ScreenHeader (back button, title, subtitle, actions)
 *
 * Pass `sticky={false}` when the page has its own sticky sub-control
 * (e.g. a tab rail) that should own the sticky slot instead of the header.
 */
export default function ScreenShell({ title, subtitle, back, backTo, actions, sticky = true, children, className = "" }) {
  const showHeader = title || actions || back;
  return (
    <div className={`w-full max-w-[520px] mx-auto px-4 pt-4 pb-28 safe-area-pt ${className}`}>
      {showHeader && (
        <ScreenHeader title={title} subtitle={subtitle} back={back} backTo={backTo} actions={actions} sticky={sticky} />
      )}
      {children}
    </div>
  );
}