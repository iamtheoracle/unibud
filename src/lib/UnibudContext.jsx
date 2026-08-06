import React, { createContext, useContext } from "react";
import { useHomeContext } from "@/hooks/useHomeContext";
import { computePulse } from "@/lib/bud/contextPulse";

/**
 * UnibudContext — the single shared context layer for the whole OS.
 * One observation pass (weather, time, exams, deadlines, wallet, messages,
 * attendance, timetable, community) feeds every screen and the global
 * contextual pulse, so features communicate instead of living in silos.
 */
const Ctx = createContext(null);
export const useUnibudContext = () => useContext(Ctx);

export function UnibudContextProvider({ children }) {
  const ctx = useHomeContext();
  const pulse = computePulse(ctx);
  return <Ctx.Provider value={{ ...ctx, pulse }}>{children}</Ctx.Provider>;
}