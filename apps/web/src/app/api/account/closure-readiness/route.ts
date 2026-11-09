import { NextRequest, NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "../../../../lib/server/identity/identity-runtime";
import { ProfileAccessDeniedError } from "../../../../lib/server/profiles/profile-service-core";
import { readSessionCookie, routeError } from "../../../../lib/server/identity/http";
import { buildClosureReadiness, type ClosureReadinessSnapshot } from "../../../../lib/account/closure-readiness";

export async function GET(request: NextRequest) {
  const token = readSessionCookie(request);
  if (!token) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
  try {
    const { sessions, profiles } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });

    const accountId = validation.account.id;
    const [preflight, accessible, archived, incomingTransfers] = await Promise.all([
      profiles.getAccountClosurePreflight(accountId),
      profiles.listAccessibleProfiles(accountId),
      profiles.listArchivedOwnedProfiles(accountId),
      profiles.listIncomingOwnershipTransfers(accountId)
    ]);

    const owned = accessible.filter((entry) => entry.relationship === "owner" && entry.profile.ownerAccountId === accountId);
    const allOwned = [...owned, ...archived];
    const [delegatedLists, outgoingLists] = await Promise.all([
      Promise.all(allOwned.map((entry) => profiles.listDelegatedAccess(accountId, entry.profile.id))),
      Promise.all(allOwned.filter((entry) => entry.profile.kind === "creator" || entry.profile.kind === "page_community").map(async (entry) => ({
        profile: entry.profile,
        transfers: await profiles.listOutgoingOwnershipTransfers(accountId, entry.profile.id)
      })))
    ]);

    const snapshot: ClosureReadinessSnapshot = {
      preflight,
      profiles: owned.filter((entry) => entry.profile.status !== "archived").map((entry) => ({
        id: entry.profile.id, kind: entry.profile.kind, handle: entry.profile.handle,
        displayName: entry.profile.displayName, status: entry.profile.status
      })),
      archivedProfiles: archived.map((entry) => ({
        id: entry.profile.id, kind: entry.profile.kind, handle: entry.profile.handle,
        displayName: entry.profile.displayName, status: entry.profile.status
      })),
      delegatedAccess: delegatedLists.flat().map((entry) => ({
        profileId: entry.profile.id, profileName: entry.profile.displayName,
        profileHandle: entry.profile.handle, role: entry.role, status: entry.membershipStatus
      })).filter((entry) => entry.status === "active" || entry.status === "suspended"),
      incomingTransfers: incomingTransfers.map((entry) => ({
        transferId: entry.transferId, profileName: entry.profileName,
        profileHandle: entry.profileHandle, ownerHandle: entry.ownerHandle, expiresAt: entry.expiresAt
      })),
      outgoingTransfers: outgoingLists.flatMap(({ profile, transfers }) => transfers.map((entry) => ({
        profileId: profile.id, profileName: profile.displayName, profileHandle: profile.handle,
        transferId: entry.transferId, recipientHandle: entry.recipientHandle,
        status: entry.status, expiresAt: entry.expiresAt
      })))
    };
    const readiness = buildClosureReadiness(snapshot);
    return NextResponse.json({ ok: true, readiness, snapshot }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ProfileAccessDeniedError) return NextResponse.json({ ok: false, error: "Account access denied." }, { status: 403 });
    return routeError(error);
  }
}
