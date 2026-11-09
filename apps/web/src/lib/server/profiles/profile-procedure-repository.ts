import "server-only";

import { randomUUID } from "node:crypto";
import {
  createSignedAccountContextFromEnvironment,
  withSignedAccountTransaction,
  type SqlClient,
  type SqlPool
} from "../database/account-context-core";
import type { ProfileAccessRecord } from "../../../../../../packages/contracts/src/profile.ts";
import type {
  DelegatedProfileGrantInput,
  ProfileCreateInput,
  ProfileRepository
} from "./profile-service-core";

interface ProfileJoinRow {
  profile_id: string;
  owner_account_id: string;
  kind: ProfileAccessRecord["profile"]["kind"];
  handle: string;
  display_name: string;
  visibility: ProfileAccessRecord["profile"]["visibility"];
  profile_status: ProfileAccessRecord["profile"]["status"];
  account_id: string;
  relationship: ProfileAccessRecord["relationship"];
  membership_status: ProfileAccessRecord["membershipStatus"];
  can_switch_to_profile: boolean;
}

function mapAccess(row: ProfileJoinRow): ProfileAccessRecord {
  return {
    accountId: row.account_id as ProfileAccessRecord["accountId"],
    relationship: row.relationship,
    membershipStatus: row.membership_status,
    canSwitchToProfile: row.can_switch_to_profile,
    profile: {
      id: row.profile_id as ProfileAccessRecord["profile"]["id"],
      ownerAccountId: row.owner_account_id as ProfileAccessRecord["profile"]["ownerAccountId"],
      kind: row.kind,
      handle: row.handle,
      displayName: row.display_name,
      visibility: row.visibility,
      status: row.profile_status
    }
  };
}

const PROFILE_SELECT = `
  SELECT p.id AS profile_id,p.owner_account_id,p.kind,p.handle,p.display_name,
         p.visibility,p.status AS profile_status,m.account_id,m.relationship,
         m.status AS membership_status,m.can_switch_to_profile
  FROM public.profile_memberships m
  JOIN public.profiles p ON p.id=m.profile_id
`;

export class ProfileProcedureRepository implements ProfileRepository {
  private readonly pool: SqlPool;

  constructor(pool: SqlPool) {
    this.pool = pool;
  }

  private async inAccountContext<T>(accountId: string, work: (client: SqlClient) => Promise<T>): Promise<T> {
    return withSignedAccountTransaction(
      this.pool,
      createSignedAccountContextFromEnvironment(accountId),
      work
    );
  }

  async createOwnedProfile(ownerAccountId: string, input: ProfileCreateInput): Promise<ProfileAccessRecord> {
    return this.inAccountContext(ownerAccountId, async client => {
      const profileId = randomUUID();
      const membershipId = randomUUID();
      const result = await client.query<{
        profile_id: string;
        owner_account_id: string;
        kind: ProfileAccessRecord["profile"]["kind"];
        handle: string;
        display_name: string;
        visibility: ProfileAccessRecord["profile"]["visibility"];
        status: ProfileAccessRecord["profile"]["status"];
      }>(
        "SELECT * FROM public.profile_create_owned($1,$2,$3,$4,$5,$6,$7,$8)",
        [
          profileId,membershipId,ownerAccountId,input.kind,input.handle,
          input.handle,input.displayName,input.visibility ?? "private"
        ]
      );
      const row = result.rows[0];
      if (!row) throw new Error("Profile creation did not return a persisted profile.");
      return {
        accountId: ownerAccountId as ProfileAccessRecord["accountId"],
        relationship: "owner",
        membershipStatus: "active",
        canSwitchToProfile: true,
        profile: {
          id: row.profile_id as ProfileAccessRecord["profile"]["id"],
          ownerAccountId: row.owner_account_id as ProfileAccessRecord["profile"]["ownerAccountId"],
          kind: row.kind,
          handle: row.handle,
          displayName: row.display_name,
          visibility: row.visibility,
          status: row.status
        }
      };
    });
  }

  async grantDelegatedAccess(ownerAccountId: string, input: DelegatedProfileGrantInput): Promise<ProfileAccessRecord> {
    return this.inAccountContext(ownerAccountId, async client => {
      await client.query(
        "SELECT public.profile_grant_delegated_access($1,$2,$3,$4,$5)",
        [input.profileId,ownerAccountId,input.delegateAccountId,input.role,input.canSwitchToProfile]
      );
      const result = await client.query<ProfileJoinRow>(
        `${PROFILE_SELECT}
         WHERE p.id=$1 AND m.account_id=$2 AND m.relationship='delegated'`,
        [input.profileId,input.delegateAccountId]
      );
      if (!result.rows[0]) throw new Error("Delegated profile access was not persisted.");
      return mapAccess(result.rows[0]);
    });
  }

  async revokeDelegatedAccess(ownerAccountId: string, profileId: string, delegateAccountId: string): Promise<boolean> {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<{ revoked: boolean }>(
        "SELECT public.profile_revoke_delegated_access($1,$2,$3,$4) AS revoked",
        [profileId,ownerAccountId,delegateAccountId,new Date().toISOString()]
      );
      return result.rows[0]?.revoked === true;
    });
  }

  async listAccessibleProfiles(accountId: string): Promise<ProfileAccessRecord[]> {
    return this.inAccountContext(accountId, async client => {
      const result = await client.query<ProfileJoinRow>(
        `${PROFILE_SELECT}
         WHERE m.account_id=$1 AND m.status='active' AND p.status='active'
         ORDER BY p.created_at ASC`,
        [accountId]
      );
      return result.rows.map(mapAccess);
    });
  }

  async findProfileAccess(accountId: string, profileId: string): Promise<ProfileAccessRecord | undefined> {
    return this.inAccountContext(accountId, async client => {
      const result = await client.query<ProfileJoinRow>(
        `${PROFILE_SELECT}
         WHERE m.account_id=$1 AND p.id=$2
         LIMIT 1`,
        [accountId,profileId]
      );
      return result.rows[0] ? mapAccess(result.rows[0]) : undefined;
    });
  }

  async setActiveProfileContext(
    accountId: string,
    sessionId: string,
    profileId: string,
    contextVersion: string
  ): Promise<boolean> {
    return this.inAccountContext(accountId, async client => {
      const result = await client.query<{ switched: boolean }>(
        "SELECT public.profile_set_active_context($1,$2,$3,$4) AS switched",
        [accountId,sessionId,profileId,contextVersion]
      );
      return result.rows[0]?.switched === true;
    });
  }
}
