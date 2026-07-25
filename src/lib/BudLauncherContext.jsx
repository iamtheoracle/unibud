import React, { createContext, useContext, useState } from "react";

const BudLauncherContext = createContext(null);

export function BudLauncherProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <BudLauncherContext.Provider value={{ open, setOpen }}>
      {children}
    </BudLauncherContext.Provider>
  );
}

export function useBudLauncher() {
  const ctx = useContext(BudLauncherContext);
  if (!ctx) return { open: false, setOpen: () => {} };
  return ctx;
}