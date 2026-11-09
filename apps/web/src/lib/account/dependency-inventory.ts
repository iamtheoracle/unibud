export type DependencyDisposition = "registered_unclassified" | "not_implemented" | "policy_unapproved";

export interface AccountDependencyDomain {
  id: string;
  label: string;
  status: DependencyDisposition;
  sourceTables: string[];
  accountScope: string;
  knownReferences: string;
  closureEffect: "block_until_policy_approved" | "unregistered_domain_blocks_closure";
  explanation: string;
}

/**
 * Schema-grounded inventory. Only tables verified in migrations 0001–0017
 * are called registered. Product areas without persisted domain schemas are
 * explicitly marked not implemented; they are not represented as empty.
 */
export const ACCOUNT_DEPENDENCY_DOMAINS: readonly AccountDependencyDomain[] = [
  {
    id: "identity",
    label: "Account identity and sign-in",
    status: "registered_unclassified",
    sourceTables: ["accounts", "authentication_identities", "password_credentials", "verification_challenges"],
    accountScope: "Canonical account ID and account_id foreign keys",
    knownReferences: "Authentication identities, password credentials and verification challenges",
    closureEffect: "block_until_policy_approved",
    explanation: "Credential and identity records need approved retention, security and recovery treatment."
  },
  {
    id: "sessions",
    label: "Sessions and active profile context",
    status: "registered_unclassified",
    sourceTables: ["account_sessions"],
    accountScope: "account_id",
    knownReferences: "Session credentials are stored as digests; sessions may reference an active profile",
    closureEffect: "block_until_policy_approved",
    explanation: "Session revocation, evidence retention and recovery handling have not been approved as a closure policy."
  },
  {
    id: "profiles",
    label: "Personal, Creator and Page/Community profiles",
    status: "registered_unclassified",
    sourceTables: ["profiles", "profile_memberships"],
    accountScope: "owner_account_id and account_id",
    knownReferences: "Ownership and delegated memberships; archived profiles remain owned",
    closureEffect: "block_until_policy_approved",
    explanation: "Profile content ownership, shared content, transfer and deletion rules remain unapproved."
  },
  {
    id: "delegation-and-grants",
    label: "Delegated access and resource permissions",
    status: "registered_unclassified",
    sourceTables: ["profile_memberships", "resource_grants", "profile_invitations"],
    accountScope: "account_id, subject_account_id, profile owner and exact resource scope",
    knownReferences: "Active/suspended memberships, pending invitations and profile-scoped grants",
    closureEffect: "block_until_policy_approved",
    explanation: "Access revocation is implemented for profile lifecycle; complete account-closure disposition and evidence retention are not approved."
  },
  {
    id: "profile-lifecycle",
    label: "Profile recovery and ownership-transfer history",
    status: "registered_unclassified",
    sourceTables: ["profile_lifecycle_notifications", "profile_ownership_transfers", "security_audit_events"],
    accountScope: "Account participant, profile owner, actor and resource references",
    knownReferences: "Archive/restore notifications, transfer participants and append-only audit events",
    closureEffect: "block_until_policy_approved",
    explanation: "Audit and lifecycle evidence must not be silently deleted; retention duration and post-closure access are undecided."
  },
  {
    id: "messaging",
    label: "Messages and conversations",
    status: "not_implemented",
    sourceTables: [],
    accountScope: "No messaging schema is present in migrations 0001–0017",
    knownReferences: "Conversation, participant, attachment and contextual-order dependencies are not yet represented in this database foundation",
    closureEffect: "unregistered_domain_blocks_closure",
    explanation: "Messaging is a planned capability. Its schema, export, shared-participant and retention rules must be designed before closure can be evaluated."
  },
  {
    id: "media",
    label: "Media and uploaded files",
    status: "not_implemented",
    sourceTables: [],
    accountScope: "No media or upload schema is present in migrations 0001–0017",
    knownReferences: "Object storage, derivatives, shared links, malware-scan results and processor copies are not represented",
    closureEffect: "unregistered_domain_blocks_closure",
    explanation: "Media storage and deletion lifecycle are not implemented in this schema foundation."
  },
  {
    id: "commerce-and-services",
    label: "Payments, bookings, orders, contracts and disputes",
    status: "not_implemented",
    sourceTables: [],
    accountScope: "No commerce or transaction schema is present in migrations 0001–0017",
    knownReferences: "Counterparties, provider records, settlement, refunds, disputes and contractual obligations are not represented",
    closureEffect: "unregistered_domain_blocks_closure",
    explanation: "These are planned capabilities; financial and contractual retention cannot be inferred or guessed."
  },
  {
    id: "education",
    label: "School, student, tutor and academic records",
    status: "not_implemented",
    sourceTables: [],
    accountScope: "No education-domain schema is present in migrations 0001–0017",
    knownReferences: "Institution authority, student/tutor records and academic evidence are not represented",
    closureEffect: "unregistered_domain_blocks_closure",
    explanation: "Education identities are planned and require separate authority and retention policies."
  },
  {
    id: "subscriptions-and-operations",
    label: "Subscriptions, support and operational cases",
    status: "not_implemented",
    sourceTables: [],
    accountScope: "No subscription, support-case or processor schema is present in migrations 0001–0017",
    knownReferences: "Entitlements, invoices, support evidence, processor copies and operational records are not represented",
    closureEffect: "unregistered_domain_blocks_closure",
    explanation: "Account-level entitlements and support dependencies need their own schema and approved disposition."
  }
] as const;

export function buildAccountDependencyInventory() {
  const registered = ACCOUNT_DEPENDENCY_DOMAINS.filter((domain) => domain.status === "registered_unclassified");
  const unimplemented = ACCOUNT_DEPENDENCY_DOMAINS.filter((domain) => domain.status === "not_implemented");
  return {
    version: "schema-inventory-1",
    sourceMigrations: ["0001_identity_foundation", "0003_credentials_and_verification", "0005_profile_access_and_context", "0008_auth_session_maintenance", "0011_profile_invitations", "0014_profile_delegation_lifecycle", "0016_profile_recovery_notifications_and_ownership_guards", "0017_profile_ownership_transfer"],
    domains: ACCOUNT_DEPENDENCY_DOMAINS,
    summary: {
      totalDomains: ACCOUNT_DEPENDENCY_DOMAINS.length,
      registeredDomains: registered.length,
      unimplementedDomains: unimplemented.length,
      unclassifiedRegisteredDomains: registered.length,
      unregisteredDomainsBlockClosure: unimplemented.length
    },
    policy: {
      status: "not_approved" as const,
      canClose: false as const,
      reason: "No retention or deletion disposition has been approved for every registered dependency, and some planned domains do not yet have schemas."
    }
  };
}
