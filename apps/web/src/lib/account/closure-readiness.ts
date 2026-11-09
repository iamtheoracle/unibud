export interface ClosureReadinessSnapshot {
  preflight: {
    canClose: boolean;
    ownedProfiles: number;
    activeOwnedProfiles: number;
    archivedOwnedProfiles: number;
    delegatedRelationships: number;
    requiresOwnershipTransferWorkflow: boolean;
    requiresDelegationRelease: boolean;
  };
  profiles: Array<{ id: string; kind: string; handle: string; displayName: string; status: string }>;
  archivedProfiles: Array<{ id: string; kind: string; handle: string; displayName: string; status: string }>;
  delegatedAccess: Array<{ profileId: string; profileName: string; profileHandle: string; role: string; status: string }>;
  incomingTransfers: Array<{ transferId: string; profileName: string; profileHandle: string; ownerHandle: string; expiresAt: string }>;
  outgoingTransfers: Array<{ profileId: string; profileName: string; profileHandle: string; transferId: string; recipientHandle: string; status: string; expiresAt: string }>;
}

export interface ClosureReadinessItem {
  id: string;
  title: string;
  description: string;
  action: string;
  href: string;
  blocking: boolean;
}

export function buildClosureReadiness(snapshot: ClosureReadinessSnapshot) {
  const items: ClosureReadinessItem[] = [];
  for (const profile of snapshot.profiles) {
    items.push({
      id: `active-profile-${profile.id}`,
      title: profile.displayName || `@${profile.handle}`,
      description: `Your ${profile.kind.replaceAll("_", " ")} profile remains owned by this account.`,
      action: "Review profile ownership",
      href: "/profiles",
      blocking: true
    });
  }
  for (const profile of snapshot.archivedProfiles) {
    items.push({
      id: `archived-profile-${profile.id}`,
      title: profile.displayName || `@${profile.handle}`,
      description: "Archived profiles remain yours and still prevent account closure.",
      action: "Review archived profile",
      href: "/profiles",
      blocking: true
    });
  }
  for (const access of snapshot.delegatedAccess) {
    items.push({
      id: `delegation-${access.profileId}-${access.role}`,
      title: `${access.profileName} · ${access.role}`,
      description: `Delegated access is currently ${access.status}. Review or release it before account closure.`,
      action: "Manage delegated access",
      href: "/profiles",
      blocking: true
    });
  }
  for (const transfer of snapshot.incomingTransfers) {
    items.push({
      id: `incoming-transfer-${transfer.transferId}`,
      title: `Ownership request for ${transfer.profileName}`,
      description: `@${transfer.ownerHandle} has requested a transfer. Resolve the request before proceeding.`,
      action: "Review ownership request",
      href: "/profiles",
      blocking: true
    });
  }
  for (const transfer of snapshot.outgoingTransfers) {
    items.push({
      id: `outgoing-transfer-${transfer.transferId}`,
      title: `Transfer of ${transfer.profileName}`,
      description: `Pending with @${transfer.recipientHandle}; status: ${transfer.status}.`,
      action: "Review transfer",
      href: "/profiles",
      blocking: true
    });
  }
  const counts = snapshot.preflight;
  const blocked = !counts.canClose || items.length > 0;
  return {
    status: blocked ? "blocked" as const : "eligible_for_policy_review" as const,
    canClose: false as const,
    items,
    blockers: {
      ownedProfiles: counts.ownedProfiles,
      activeOwnedProfiles: counts.activeOwnedProfiles,
      archivedOwnedProfiles: counts.archivedOwnedProfiles,
      delegatedRelationships: counts.delegatedRelationships,
      incomingTransfers: snapshot.incomingTransfers.length,
      outgoingTransfers: snapshot.outgoingTransfers.length
    },
    policyGate: {
      status: "not_approved" as const,
      message: "Permanent closure is unavailable until retention, legal notice, dependent-record ownership, and recovery-window policies are approved and verified."
    },
    explanation: blocked
      ? "This account still owns profiles or has access and transfer obligations that must be resolved."
      : "No profile or delegation blockers were reported. This is not permission to close the account; policy approval and a supported closure workflow are still required."
  };
}
