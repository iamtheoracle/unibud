import "server-only";

import {
  createSignedAccountContextFromEnvironment,
  withSignedAccountTransaction,
  type SqlPool
} from "../database/account-context-core";

export interface AccountDependencyDiscovery {
  version: string;
  accountId: string;
  generatedAt: string;
  counts: Record<string, number>;
  sharedOwnership: Record<string, number>;
  foreignKeys: Array<{ constraint: string; fromTable: string; toTable: string; definition: string }>;
  coverage: { registeredTables: string[]; notImplementedDomains: string[]; unknownExternalDependenciesBlockClosure: true };
  policy: { status: "not_approved"; missingPolicyDomains: string[]; canClose: false };
}

interface DiscoveryRow { discovery: Omit<AccountDependencyDiscovery, "generatedAt"> & { generatedAt: Date | string } }

export class AccountDependencyRepository {
  private readonly pool: SqlPool;

  constructor(pool: SqlPool) {
    this.pool = pool;
  }

  async getForAccount(accountId: string): Promise<AccountDependencyDiscovery> {
    return withSignedAccountTransaction(
      this.pool,
      createSignedAccountContextFromEnvironment(accountId),
      async client => {
        const result = await client.query<DiscoveryRow>(
          "SELECT public.account_dependency_discovery($1) AS discovery",
          [accountId]
        );
        const value = result.rows[0]?.discovery;
        if (!value) throw new Error("Account dependency discovery returned no result.");
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
