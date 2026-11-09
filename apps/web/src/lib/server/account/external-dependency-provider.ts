export type ExternalDependencyRelationship =
  | "owner"
  | "participant"
  | "controller"
  | "processor_copy"
  | "shared_participant";

export interface ProviderLookupRequest {
  accountId: string;
  integrationKey: string;
  /** Keyed digests only. Provider adapters must resolve them through a secret-safe vault. */
  referenceDigests: readonly string[];
}

export interface ProviderLookupReference {
  referenceDigest: string;
  relationshipKind: ExternalDependencyRelationship;
  exists: boolean;
}

export interface ProviderLookupResponse {
  observedAt: string;
  references: ProviderLookupReference[];
}

export interface ProviderVerificationRequest {
  accountId: string;
  integrationKey: string;
}

export interface ProviderVerificationEvidence {
  providerIdentity: string;
  verifiedAt: string;
  evidenceSource: "runtime_attestation" | "provider_confirmation" | "operator_review";
  lookupSupported: boolean;
}

/**
 * Deliberately excludes export/delete methods. Those operations require separate
 * approved policy, explicit capabilities, user authorization and provider receipts.
 */
export interface ExternalDependencyProviderAdapter {
  readonly integrationKey: string;
  lookup(request: ProviderLookupRequest): Promise<ProviderLookupResponse>;
  verify(request: ProviderVerificationRequest): Promise<ProviderVerificationEvidence>;
}

export type ProviderLookupOutcome =
  | {
      state: "available" | "stale";
      observedAt: string;
      references: ProviderLookupReference[];
      sharedReferenceCount: number;
    }
  | {
      state: "unavailable";
      reason: "provider_not_registered" | "lookup_failed" | "invalid_provider_response";
      references: [];
      sharedReferenceCount: 0;
    };

export type ProviderVerificationOutcome =
  | { state: "verified"; evidence: ProviderVerificationEvidence }
  | { state: "unknown"; reason: "provider_not_registered" | "verification_failed" | "invalid_verification_evidence" | "verification_stale" };

export class ExternalDependencyProviderRegistry {
  private readonly adapters: ReadonlyMap<string, ExternalDependencyProviderAdapter>;
  private readonly now: () => number;
  private readonly maxEvidenceAgeMs: number;

  constructor(
    adapters: readonly ExternalDependencyProviderAdapter[] = [],
    options: { now?: () => number; maxEvidenceAgeMs?: number } = {}
  ) {
    this.adapters = new Map(adapters.map(adapter => [adapter.integrationKey, adapter]));
    this.now = options.now ?? Date.now;
    this.maxEvidenceAgeMs = options.maxEvidenceAgeMs ?? 24 * 60 * 60 * 1000;
  }

  async lookup(request: ProviderLookupRequest): Promise<ProviderLookupOutcome> {
    const adapter = this.adapters.get(request.integrationKey);
    if (!adapter) {
      return { state: "unavailable", reason: "provider_not_registered", references: [], sharedReferenceCount: 0 };
    }

    try {
      const response = await adapter.lookup(request);
      const observedAt = Date.parse(response.observedAt);
      if (!Number.isFinite(observedAt) || !Array.isArray(response.references)) {
        return { state: "unavailable", reason: "invalid_provider_response", references: [], sharedReferenceCount: 0 };
      }
      const allowed = new Set(request.referenceDigests);
      if (response.references.some(reference => !allowed.has(reference.referenceDigest))) {
        return { state: "unavailable", reason: "invalid_provider_response", references: [], sharedReferenceCount: 0 };
      }
      const sharedReferenceCount = response.references.filter(reference =>
        reference.relationshipKind === "participant" || reference.relationshipKind === "shared_participant"
      ).length;
      return {
        state: this.now() - observedAt > this.maxEvidenceAgeMs ? "stale" : "available",
        observedAt: new Date(observedAt).toISOString(),
        references: response.references,
        sharedReferenceCount
      };
    } catch {
      return { state: "unavailable", reason: "lookup_failed", references: [], sharedReferenceCount: 0 };
    }
  }

  async verify(request: ProviderVerificationRequest): Promise<ProviderVerificationOutcome> {
    const adapter = this.adapters.get(request.integrationKey);
    if (!adapter) return { state: "unknown", reason: "provider_not_registered" };
    try {
      const evidence = await adapter.verify(request);
      const verifiedAt = Date.parse(evidence.verifiedAt);
      if (!evidence.providerIdentity.trim() || !Number.isFinite(verifiedAt) || verifiedAt > this.now()
        || !["runtime_attestation", "provider_confirmation", "operator_review"].includes(evidence.evidenceSource)) {
        return { state: "unknown", reason: "invalid_verification_evidence" };
      }
      if (this.now() - verifiedAt > this.maxEvidenceAgeMs) {
        return { state: "unknown", reason: "verification_stale" };
      }
      return { state: "verified", evidence: { ...evidence, verifiedAt: new Date(verifiedAt).toISOString() } };
    } catch {
      return { state: "unknown", reason: "verification_failed" };
    }
  }
}
