import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const playwrightModule = process.env.PLAYWRIGHT_MODULE;
if (!playwrightModule) throw new Error("PLAYWRIGHT_MODULE must point to the installed Playwright package.");
const { chromium } = await import(pathToFileURL(playwrightModule).href);
const baseURL = process.env.UNIBUD_E2E_BASE_URL ?? "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

const response = {
  ok: true,
  readiness: {
    status: "blocked",
    canClose: false,
    items: [],
    blockers: { ownedProfiles: 0, activeOwnedProfiles: 0, archivedOwnedProfiles: 0, delegatedRelationships: 0, incomingTransfers: 0, outgoingTransfers: 0 },
    policyGate: { status: "not_approved", message: "Permanent closure remains unavailable until policy approval and provider evidence are complete." },
    explanation: "Outstanding external data and policy obligations must be reviewed."
  },
  snapshot: {
    preflight: { canClose: false, ownedProfiles: 0, activeOwnedProfiles: 0, archivedOwnedProfiles: 0, delegatedRelationships: 0, requiresOwnershipTransferWorkflow: false, requiresDelegationRelease: false },
    profiles: [], archivedProfiles: [], delegatedAccess: [], incomingTransfers: [], outgoingTransfers: []
  },
  dependencies: {
    version: "account-dependency-inventory-1",
    domains: [{
      id: "profiles", label: "Profiles", status: "registered_unclassified",
      explanation: "Registered account-owned profile data.", sourceTables: ["profiles"]
    }],
    summary: { totalDomains: 1, registeredDomains: 1, unimplementedDomains: 0, unclassifiedRegisteredDomains: 1, unregisteredDomainsBlockClosure: 0 },
    policy: { status: "not_approved", canClose: false, reason: "Retention policy remains unapproved." }
  },
  dependencyDiscovery: {
    version: "account-dependency-discovery-1",
    generatedAt: "2026-11-09T12:00:00.000Z",
    counts: { accounts: 1 },
    sharedOwnership: { activeDelegations: 0 },
    foreignKeys: [],
    coverage: { registeredTables: ["profiles"], notImplementedDomains: [], unknownExternalDependenciesBlockClosure: true },
    policy: { status: "not_approved", missingPolicyDomains: ["retention"], canClose: false }
  },
  externalDependencyDiscovery: {
    version: "external-dependency-registry-1",
    accountId: "account-a",
    generatedAt: "2026-11-09T12:00:00.000Z",
    counts: {
      linkedReferences: 3, unverifiedReferences: 3, unknownDispositionReferences: 3,
      unavailableReferences: 1, staleReferences: 1, sharedReferences: 1
    },
    countsByDomain: { storage: 1, identity_verification: 1, event_delivery: 1 },
    integrations: [
      {
        integrationKey: "verified_storage", domain: "storage", kind: "object_storage",
        provider: "Verified Storage", verificationState: "verified", evidenceSource: "provider_confirmation",
        dataCategories: ["uploaded_files"],
        capabilities: { lookup: true, export: false, delete: false, deletionReceipt: false, backupExpiry: false },
        lastVerifiedAt: "2026-11-09T11:00:00.000Z"
      },
      {
        integrationKey: "unknown_verification", domain: "identity_verification", kind: "delivery_gateway",
        provider: null, verificationState: "unknown", evidenceSource: "repository_declaration",
        dataCategories: ["verification"], capabilities: { lookup: false, export: false, delete: false, deletionReceipt: false, backupExpiry: false },
        lastVerifiedAt: null
      },
      {
        integrationKey: "unavailable_events", domain: "event_delivery", kind: "event_delivery",
        provider: "Events Provider", verificationState: "disabled", evidenceSource: "operator_review",
        dataCategories: ["events"], capabilities: { lookup: false, export: false, delete: false, deletionReceipt: false, backupExpiry: false },
        lastVerifiedAt: null
      }
    ],
    coverage: { accountReferencesAreOpaqueDigests: true, rawProviderIdentifiersExposed: false, providerVerificationRequired: true, unknownExternalDependenciesBlockClosure: true },
    policy: { status: "not_approved", missingPolicyDomains: ["external_dependencies", "provider_retention"], canClose: false }
  }
};

try {
  const page = await browser.newPage();
  await page.route("**/api/account/closure-readiness", route =>
    route.fulfill({ status: 200, contentType: "application/json", headers: { "Cache-Control": "no-store" }, body: JSON.stringify(response) })
  );
  await page.goto(baseURL + "/account/closure");
  await page.getByRole("heading", { name: "Account closure readiness" }).waitFor();
  await page.getByRole("heading", { name: "External services and shared data" }).waitFor();

  for (const label of ["Verified providers", "Unknown providers", "Unavailable providers", "Unclassified integrations", "Policy gaps"]) {
    await page.getByText(label, { exact: true }).waitFor();
  }
  for (const label of ["Stale evidence", "Unavailable references", "Shared relationships"]) {
    await page.getByText(label, { exact: true }).waitFor();
  }
  await page.getByText("Verified Storage", { exact: true }).waitFor();
  await page.getByText("Unknown", { exact: true }).waitFor();
  await page.getByText("Unavailable", { exact: true }).waitFor();
  await page.getByText("Export: unavailable · Deletion: unavailable").first().waitFor();
  await page.getByText(/Export and deletion are disabled/).waitFor();
  await page.getByText("Closure action: unavailable by design.").waitFor();
  assert.equal(await page.getByText("a".repeat(64), { exact: true }).count(), 0);
  await page.close();

  process.stdout.write("PASS: account closure readiness renders verified, unknown, unavailable and unclassified provider states, stale/unavailable/shared reference counts, policy gaps and disabled export/deletion.\\n");
} finally {
  await browser.close();
}
