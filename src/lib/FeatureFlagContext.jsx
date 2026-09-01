import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { PLATFORM_MODULES } from "@/lib/portalConfig";

const FeatureFlagContext = createContext();

export const FeatureFlagProvider = ({ children }) => {
  const { data: modules } = useQuery({
    queryKey: ["featureFlags"],
    queryFn: () => base44.entities.PlatformModule.list(),
    retry: false,
    staleTime: 60000,
  });

  const moduleList = modules || PLATFORM_MODULES;

  const isModuleEnabled = (key) => {
    const mod = moduleList.find((m) => m.key === key);
    if (!mod) return true;
    return mod.enabled !== false;
  };

  const getModule = (key) => moduleList.find((m) => m.key === key);

  const allModules = moduleList;

  return (
    <FeatureFlagContext.Provider value={{ isModuleEnabled, getModule, allModules, modules: moduleList }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    return { isModuleEnabled: () => true, getModule: () => null, allModules: [], modules: [] };
  }
  return context;
};