import React, { createContext, useContext, useState } from "react";

const DemoModeContext = createContext(null);

export function DemoModeProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      return localStorage.getItem("unibud_demo_mode") === "true";
    } catch {
      return false;
    }
  });

  const enterDemoMode = () => {
    try {
      localStorage.setItem("unibud_demo_mode", "true");
    } catch {}
    setIsDemoMode(true);
  };

  const exitDemoMode = () => {
    try {
      localStorage.removeItem("unibud_demo_mode");
    } catch {}
    setIsDemoMode(false);
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, enterDemoMode, exitDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) return { isDemoMode: false, enterDemoMode: () => {}, exitDemoMode: () => {} };
  return ctx;
}