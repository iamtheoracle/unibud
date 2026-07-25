import React, { createContext, useContext, useState } from "react";

const BudLauncherContext = createContext(null);

export function BudLauncherProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  return (
    <BudLauncherContext.Provider value={{ open, setOpen, voiceMode, setVoiceMode }}>
      {children}
    </BudLauncherContext.Provider>
  );
}

export function useBudLauncher() {
  const ctx = useContext(BudLauncherContext);
  if (!ctx) return { open: false, setOpen: () => {}, voiceMode: false, setVoiceMode: () => {} };
  return ctx;
}