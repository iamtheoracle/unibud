import type { AccountExternalDependencyDiscovery } from "../server/account/account-external-dependency-repository";

export type ExternalDependencyDisplayState = "verified" | "unknown" | "unavailable" | "unclassified";

export interface ExternalDependencyReadinessRow {
  integrationKey: string;
  domain: string;
  provider: string | null;
  state: ExternalDependencyDisplayState;
  explanation: string;
  lastVerifiedAt: string | null;
  lookupAvailable: boolean;
  exportAvailable: false;
  deleteAvailable: false;
}

export function classifyIntegrationState(
  verificationState: string,
  lastVerifiedAt: string | null
): ExternalDependencyDisplayState {
  if (verificationState === "verified" && lastVerifiedAt) return "verified";
  if (["disabled", "degraded", "not_configured"].includes(verificationState)) return "unavailable";
  if (["unknown", "provider_unresolved", "configured_unverified", "verified"].includes(verificationState)) return "unknown";
  return "unclassified";
}

export function buildExternalDependencyReadiness(discovery: AccountExternalDependencyDiscovery) {
  const integrations: ExternalDependencyReadinessRow[] = discovery.integrations.map(integration => {
    const state = classifyIntegrationState(integration.verificationState, integration.lastVerifiedAt);
    const explanation = state === "verified"
      ? "Provider identity and verification evidence are recorded. This does not establish export or deletion capability."
      : state === "unavailable"
        ? "The integration is disabled, degraded or not configured; its external data cannot currently be checked."
        : state === "unknown"
          ? "Provider identity or current verification evidence is incomplete."
          : "This integration state is not recognised and requires review.";
    return {
      integrationKey: integration.integrationKey,
      domain: integration.domain,
      provider: integration.provider,
      state,
      explanation,
      lastVerifiedAt: integration.lastVerifiedAt,
      lookupAvailable: state === "verified" && integration.capabilities.lookup,
      exportAvailable: false as const,
      deleteAvailable: false as const
    };
  });
  const counts = {
    verified: integrations.filter(item => item.state === "verified").length,
    unknown: integrations.filter(item => item.state === "unknown").length,
    unavailable: integrations.filter(item => item.state === "unavailable").length,
    unclassified: discovery.policy.missingPolicyDomains.length
  };
  return {
    integrations,
    counts,
    unclassifiedDomains: discovery.policy.missingPolicyDomains,
    references: {
      total: discovery.counts.linkedReferences,
      unverified: discovery.counts.unverifiedReferences,
      unknownDisposition: discovery.counts.unknownDispositionReferences,
      unavailable: discovery.counts.unavailableReferences,
      stale: discovery.counts.staleReferences,
      shared: discovery.counts.sharedReferences
    },
    canExport: false as const,
    canDelete: false as const,
    canClose: false as const
  };
}
