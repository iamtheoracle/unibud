import { randomUUID } from "node:crypto";
import {
  createSignedAccountContextFromEnvironment,
  withSignedAccountTransaction,
  type SqlClient,
  type SqlPool
} from "../database/account-context-core.ts";
import type { OnboardingProfile, OnboardingRepository } from "./onboarding-core.ts";

interface ProfileRow {
  id: string;
  kind: "personal";
  handle: string;
  display_name: string;
  status: "active";
}

/**
 * The pool must use the restricted unibud_app LOGIN principal. Account scope
 * comes from the verified session and is signed for one transaction only.
 */
export class OnboardingProcedureRepository implements OnboardingRepository {
  private readonly pool: SqlPool;

  constructor(pool: SqlPool) {
    this.pool = pool;
  }

  async completeOnboarding(accountId: string, input: {
    handle: string;
    displayName: string;
    termsVersion: string;
    privacyVersion: string;
    acceptedAt: string;
  }): Promise<OnboardingProfile> {
    return withSignedAccountTransaction(
      this.pool,
      createSignedAccountContextFromEnvironment(accountId),
      async (client: SqlClient) => {
        // Serialize retries for this account so concurrent requests cannot race
        // the one-personal-profile partial unique index.
        await client.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
          [accountId]
        );

        let result = await client.query<ProfileRow>(
          `SELECT id,kind,handle,display_name,status
           FROM public.profiles
           WHERE owner_account_id=$1 AND kind='personal' AND status<>'archived'
           LIMIT 1`,
          [accountId]
        );
        let profile = result.rows[0];

        if (!profile) {
          result = await client.query<ProfileRow>(
            "SELECT * FROM public.profile_create_owned($1,$2,$3,$4,$5,$6,$7,$8)",
            [
              randomUUID(),randomUUID(),accountId,"personal",
              input.handle,input.handle,input.displayName,"private"
            ]
          );
          profile = result.rows[0];
        }

        if (!profile || profile.status !== "active") {
          throw new Error("The account's personal profile is unavailable.");
        }

        await client.query(
          `INSERT INTO public.account_policy_acceptances
           (id,account_id,policy_type,policy_version,accepted_at)
           VALUES ($1,$2,'terms',$3,$4)
           ON CONFLICT (account_id,policy_type,policy_version) DO NOTHING`,
          [randomUUID(),accountId,input.termsVersion,input.acceptedAt]
        );
        await client.query(
          `INSERT INTO public.account_policy_acceptances
           (id,account_id,policy_type,policy_version,accepted_at)
           VALUES ($1,$2,'privacy',$3,$4)
           ON CONFLICT (account_id,policy_type,policy_version) DO NOTHING`,
          [randomUUID(),accountId,input.privacyVersion,input.acceptedAt]
        );

        return {
          id: profile.id,
          kind: "personal",
          handle: profile.handle,
          displayName: profile.display_name,
          status: "active"
        };
      }
    );
  }
}
