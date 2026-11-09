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
  ProfileCreateInput,
  ProfileUpdateInput,
  ProfilePermission,
  ProfileInvitationInput,
  ProfileInvitationRecord,
  ProfileRepository,
  ProfileLifecycleEvent
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
  role: ProfileAccessRecord["role"];
  can_switch_to_profile: boolean;
}

function mapAccess(row: ProfileJoinRow): ProfileAccessRecord {
  return {
    accountId: row.account_id as ProfileAccessRecord["accountId"],
    relationship: row.relationship,
    membershipStatus: row.membership_status,
    role: row.role,
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
         m.status AS membership_status,m.role,m.can_switch_to_profile
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

  async archiveOwnedProfile(ownerAccountId: string, profileId: string): Promise<boolean> {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<{ archived: boolean }>("SELECT public.profile_archive_owned($1,$2) AS archived", [profileId,ownerAccountId]);
      return result.rows[0]?.archived === true;
    });
  }

  async restoreOwnedProfile(ownerAccountId: string, profileId: string): Promise<boolean> {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<{ restored: boolean }>("SELECT public.profile_restore_owned($1,$2) AS restored", [profileId,ownerAccountId]);
      return result.rows[0]?.restored === true;
    });
  }

  async listProfileLifecycleHistory(ownerAccountId: string, profileId: string): Promise<ProfileLifecycleEvent[]> {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<{id:string;occurred_at:Date;action:ProfileLifecycleEvent["action"];outcome:ProfileLifecycleEvent["outcome"];reason_code:string|null;event_data:Record<string,unknown>}>("SELECT * FROM public.profile_list_lifecycle_history($1,$2)", [profileId,ownerAccountId]);
      return result.rows.map(row => ({id:row.id,occurredAt:row.occurred_at.toISOString(),action:row.action,outcome:row.outcome,reasonCode:row.reason_code,eventData:row.event_data}));
    });
  }

  async updateOwnedProfile(ownerAccountId: string, input: ProfileUpdateInput): Promise<ProfileAccessRecord> {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<{
        profile_id:string; owner_account_id:string; kind:ProfileAccessRecord["profile"]["kind"];
        handle:string; display_name:string; visibility:ProfileAccessRecord["profile"]["visibility"];
        status:ProfileAccessRecord["profile"]["status"];
      }>(
        "SELECT * FROM public.profile_update_owned($1,$2,$3,$4,$5,$6)",
        [input.profileId,ownerAccountId,input.displayName,input.handle,input.handle,input.visibility]
      );
      const row=result.rows[0];
      if(!row) throw new Error("Profile update did not return a persisted profile.");
      return {
        accountId:ownerAccountId as ProfileAccessRecord["accountId"],relationship:"owner",
        membershipStatus:"active",role:"owner",canSwitchToProfile:true,
        profile:{id:row.profile_id as ProfileAccessRecord["profile"]["id"],
          ownerAccountId:row.owner_account_id as ProfileAccessRecord["profile"]["ownerAccountId"],
          kind:row.kind,handle:row.handle,displayName:row.display_name,
          visibility:row.visibility,status:row.status}
      };
    });
  }

  async authorizeAction(accountId:string,profileId:string,permission:ProfilePermission):Promise<boolean>{
    return this.inAccountContext(accountId,async client=>{
      const result=await client.query<{allowed:boolean}>(
        "SELECT public.profile_authorize_action($1,$2,$3) AS allowed",[profileId,accountId,permission]
      );
      return result.rows[0]?.allowed===true;
    });
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
        role: "owner",
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

  async manageDelegatedAccess(ownerAccountId: string, profileId: string, delegateAccountId: string, role: ProfileInvitationInput["role"], status: "active" | "suspended"): Promise<boolean> {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<{ managed: boolean }>(
        "SELECT public.profile_manage_delegated_access($1,$2,$3,$4,$5) AS managed",
        [profileId,ownerAccountId,delegateAccountId,role,status]
      );
      return result.rows[0]?.managed === true;
    });
  }

  async cancelInvitation(ownerAccountId: string, invitationId: string): Promise<boolean> {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<{ cancelled: boolean }>(
        "SELECT public.profile_cancel_invitation($1,$2) AS cancelled",[invitationId,ownerAccountId]
      );
      return result.rows[0]?.cancelled === true;
    });
  }

  async listOutgoingInvitations(ownerAccountId: string, profileId: string) {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<{
        id:string; profile_id:string; invitee_handle:string; role:ProfileInvitationInput["role"];
        status:"pending"|"expired"; created_at:Date; expires_at:Date;
      }>("SELECT * FROM public.profile_list_outgoing_invitations($1,$2)",[ownerAccountId,profileId]);
      return result.rows.map(row=>({
        id:row.id,profileId:row.profile_id,inviteeHandle:row.invitee_handle,role:row.role,
        status:row.status,createdAt:row.created_at.toISOString(),expiresAt:row.expires_at.toISOString()
      }));
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

  async listDelegatedAccess(ownerAccountId: string, profileId: string): Promise<ProfileAccessRecord[]> {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<ProfileJoinRow>(
        `${PROFILE_SELECT}
         WHERE p.id=$1 AND m.profile_owner_account_id=$2
           AND m.relationship='delegated'
         ORDER BY m.granted_at ASC`,
        [profileId,ownerAccountId]
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

  async inviteDelegateByHandle(ownerAccountId: string, input: ProfileInvitationInput) {
    return this.inAccountContext(ownerAccountId, async client => {
      const result = await client.query<{ invitation_id:string; invitee_handle:string; invitee_display_name:string }>(
        "SELECT * FROM public.profile_invite_by_handle($1,$2,$3,$4,$5,$6)",
        [randomUUID(),input.profileId,ownerAccountId,input.inviteeHandle,input.role,input.canSwitchToProfile]
      );
      const row=result.rows[0];
      if(!row) throw new Error("Invitation was not created.");
      return {id:row.invitation_id,inviteeHandle:row.invitee_handle,inviteeDisplayName:row.invitee_display_name};
    });
  }

  async listIncomingInvitations(inviteeAccountId: string): Promise<ProfileInvitationRecord[]> {
    return this.inAccountContext(inviteeAccountId, async client => {
      const result=await client.query<{
        id:string; profile_id:string; profile_name:string; profile_handle:string;
        owner_display_name:string; owner_handle:string; role:ProfileInvitationRecord["role"];
        can_switch_to_profile:boolean; created_at:Date; expires_at:Date;
      }>("SELECT * FROM public.profile_list_incoming_invitations($1)",[inviteeAccountId]);
      return result.rows.map(row=>({
        id:row.id,profileId:row.profile_id,profileName:row.profile_name,profileHandle:row.profile_handle,
        ownerDisplayName:row.owner_display_name,ownerHandle:row.owner_handle,role:row.role,
        canSwitchToProfile:row.can_switch_to_profile,createdAt:row.created_at.toISOString(),expiresAt:row.expires_at.toISOString()
      }));
    });
  }

  async respondToInvitation(inviteeAccountId: string, invitationId: string, accept: boolean): Promise<boolean> {
    return this.inAccountContext(inviteeAccountId, async client => {
      const result=await client.query<{responded:boolean}>(
        "SELECT public.profile_respond_to_invitation($1,$2,$3) AS responded",
        [invitationId,inviteeAccountId,accept]
      );
      return result.rows[0]?.responded===true;
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
