import { useMemo } from "react";
import { useContextSystem } from "./ContextProvider";
import { getModule } from "./moduleRegistry";
import { getContract } from "./experienceContract";

/**
 * useExperiencePlatformCore — generic Platform Core hook for experiences
 * that compose Platform Core services without owning complex section ordering.
 *
 * Used by Quad, Lens, Services, and Me — the four progressively simpler
 * migrations that inherit patterns from Campus, Square, and Connect.
 *
 *   • ContextProvider  — context is set by the Experience wrapper
 *   • Module Registry  — verifies all consumed modules are registered
 *   • Experience Contract — Platform Core adoption is validated
 *   • Bud              — context is built for proactive assistance
 *
 * References: Phases 9-12, OS Constitution.
 */
export function useExperiencePlatformCore(experienceId, budActions = []) {
  const ctx = useContextSystem();
  const contract = getContract(experienceId);

  const platformCore = useMemo(() => {
    const modules = contract?.modules || [];
    return {
      contextProvider: true,
      realtimeEngine: contract?.hooks?.realtime || false,
      bud: contract?.hooks?.bud || false,
      orbit: contract?.hooks?.orbit || false,
      spark: contract?.hooks?.spark || false,
      moduleRegistry: modules.length === 0 || modules.every((id) => getModule(id)),
      experienceContract: !!contract,
    };
  }, [contract]);

  const budContext = useMemo(() => ({
    experience: experienceId,
    context: ctx.contextId,
    isSocial: ctx.isSocial,
    proactiveAssist: budActions,
  }), [ctx.contextId, ctx.isSocial, experienceId]);

  return {
    contextId: ctx.contextId,
    isSocial: ctx.isSocial,
    platformCore,
    budContext,
    contract,
  };
}