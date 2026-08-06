import React, { createContext, useContext, useState, useCallback } from "react";

const BudLauncherContext = createContext(null);

export function BudLauncherProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);

  const openWithPrompt = useCallback((prompt) => {
    if (prompt && prompt.trim()) setPendingPrompt(prompt.trim());
    setVoiceMode(false);
    setOpen(true);
  }, []);

  const openVoice = useCallback(() => {
    setVoiceMode(true);
    setOpen(true);
  }, []);

  const clearPrompt = useCallback(() => setPendingPrompt(null), []);

  return (
    <BudLauncherContext.Provider
      value={{ open, setOpen, voiceMode, setVoiceMode, pendingPrompt, openWithPrompt, openVoice, clearPrompt }}
    >
      {children}
    </BudLauncherContext.Provider>
  );
}

export function useBudLauncher() {
  const ctx = useContext(BudLauncherContext);
  if (!ctx) {
    return {
      open: false, setOpen: () => {}, voiceMode: false, setVoiceMode: () => {},
      pendingPrompt: null, openWithPrompt: () => {}, openVoice: () => {}, clearPrompt: () => {},
    };
  }
  return ctx;
}