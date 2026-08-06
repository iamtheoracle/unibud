import React from "react";

/** Neutralized — demo mode removed. Pass-through provider for compatibility. */
export function DemoModeProvider({ children }) {
  return children;
}

export function useDemoMode() {
  return { isDemoMode: false, enterDemoMode: () => {}, exitDemoMode: () => {} };
}