import {
  createSignedAccountContextFromEnvironment,
  withSignedAccountTransaction,
  type SqlPool
} from "../database/account-context-core.ts";

export interface AccountExternalDependencyDiscovery {
  version: string;
  accountId: string;
  generatedAt: string;
  counts: {
    linkedReferences: number;
    unverifiedReferences: number;
    unknownDispositionReferences: number;
    unavailableReferences: number;
    staleReferences: number;
  };
  countsByDomain: Record<string, number>;
  integrations: Array<{
    integrationKey: string;
    domain: string;
    kind: string;
    provider: string | null;
    verificationState: string;
    evidenceSource: string;
    dataCategories: string[];
    capabilities: {
      lookup: boolean;
      export: boolean;
      delete: boolean;
      deletionReceipt: boolean;
      backupExpiry: boolean;
    };
    lastVerifiedAt: string | null;
  }>;
  coverage: {
    accountReferencesAreOpaqueDigests: true;
    rawProviderIdentifiersExposed: false;
    providerVerificationRequired: true;
    unknownExternalDependenciesBlockClosure: true;
  };
  policy: {
    status: "not_approved";
    missingPolicyDomains: string[];
    canClose: false;
  };
}

interface DiscoveryRow {
  discovery: Omit<AccountExternalDependencyDiscovery, "generatedAt"> & {
    generatedAt: Date | string;
  };
}

/** Read-only account-scoped registry view; caller must supply session-derived identity. */
export class AccountExternalDependencyRepository {
  private readonly pool: SqlPool;

  constructor(pool: SqlPool) {
    this.pool = pool;
  }

  async getForAccount(accountId: string): Promise<AccountExternalDependencyDiscovery> {
    return withSignedAccountTransaction(
      this.pool,
      createSignedAccountContextFromEnvironment(accountId),
      async client => {
        const result = await client.query<DiscoveryRow>(
          "SELECT public.account_external_dependency_discovery($1) AS discovery",
          [accountId]
        );
        const value = result.rows[0]?.discovery;
        if (!value) throw new Error("External dependency discovery returned no result.");
        return {
          ...value,
          generatedAt: value.generatedAt instanceof Date
            ? value.generatedAt.toISOString()
            : new Date(value.generatedAt).toISOString()
        };
      }
    );
  }
}
