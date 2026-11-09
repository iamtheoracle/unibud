export type RuntimeIntegrationConfigurationState = "configured_unverified" | "partially_configured" | "not_configured";

export interface ConcreteIntegrationInventoryEntry {
  integrationKey: string;
  domain: string;
  provider: string | null;
  purpose: string;
  state: RuntimeIntegrationConfigurationState;
  configuredSettings: string[];
  missingSettings: string[];
  dataCategories: string[];
  evidence: string[];
  explanation: string;
}

export interface ConcreteIntegrationInventory {
  version: "concrete-integration-inventory-1";
  scope: "platform_runtime_configuration_only";
  integrations: ConcreteIntegrationInventoryEntry[];
  limitations: string[];
}

type Environment = Readonly<Record<string, string | undefined>>;

function configured(env: Environment, key: string): boolean {
  return typeof env[key] === "string" && env[key]!.trim().length > 0;
}

function entry(input: Omit<ConcreteIntegrationInventoryEntry, "state" | "configuredSettings" | "missingSettings" | "explanation"> & {
  requiredSettings: string[];
}, env: Environment): ConcreteIntegrationInventoryEntry {
  const configuredSettings = input.requiredSettings.filter(key => configured(env, key));
  const missingSettings = input.requiredSettings.filter(key => !configured(env, key));
  const state: RuntimeIntegrationConfigurationState = missingSettings.length === 0
    ? "configured_unverified"
    : configuredSettings.length === 0
      ? "not_configured"
      : "partially_configured";
  return {
    integrationKey: input.integrationKey,
    domain: input.domain,
    provider: input.provider,
    purpose: input.purpose,
    state,
    configuredSettings,
    missingSettings,
    dataCategories: input.dataCategories,
    evidence: input.evidence,
    explanation: state === "configured_unverified"
      ? "Required server settings are present. This does not prove the endpoint is reachable, credentials are valid, or provider-side data has been discovered."
      : state === "partially_configured"
        ? "Some required server settings are present and others are missing. The integration is not ready for verification."
        : "No required server settings are present. This is not proof that no external copy or dependency exists."
  };
}

/**
 * Audits only known executable integration boundaries and the presence of their
 * server-side setting names. It never returns environment values, URLs, tokens,
 * database hosts, or credentials, and it performs no network/provider calls.
 */
export function buildConcreteIntegrationInventory(env: Environment): ConcreteIntegrationInventory {
  return {
    version: "concrete-integration-inventory-1",
    scope: "platform_runtime_configuration_only",
    integrations: [
      entry({
        integrationKey: "postgresql_auth_pool",
        domain: "identity_and_authentication",
        provider: "PostgreSQL",
        purpose: "Dedicated authentication RPC database connection pool.",
        requiredSettings: ["UNIBUD_AUTH_DATABASE_URL"],
        dataCategories: ["account_identity", "password_credentials", "verification_challenges", "sessions"],
        evidence: [
          "apps/web/src/lib/server/database/postgres-pool.ts",
          "apps/web/src/lib/server/identity/identity-runtime.ts"
        ]
      }, env),
      entry({
        integrationKey: "postgresql_app_pool",
        domain: "application_data",
        provider: "PostgreSQL",
        purpose: "Tenant-scoped application database connection pool using the unibud_app principal.",
        requiredSettings: ["UNIBUD_APP_DATABASE_URL"],
        dataCategories: ["profiles", "delegations", "account_dependencies", "external_dependency_references"],
        evidence: [
          "apps/web/src/lib/server/database/postgres-pool.ts",
          "apps/web/src/lib/server/account/account-external-dependency-repository.ts"
        ]
      }, env),
      entry({
        integrationKey: "verification_delivery_gateway",
        domain: "identity_verification",
        provider: null,
        purpose: "Private HTTP gateway used to deliver email and SMS verification challenges.",
        requiredSettings: ["UNIBUD_VERIFICATION_DELIVERY_URL", "UNIBUD_VERIFICATION_DELIVERY_TOKEN"],
        dataCategories: ["recipient_identifier", "one_time_verification_code", "delivery_status"],
        evidence: [
          "apps/web/src/lib/server/auth/verification-delivery.ts",
          "apps/web/src/lib/server/identity/identity-runtime.ts",
          "apps/web/src/app/api/auth/register/route.ts"
        ]
      }, env),
      entry({
        integrationKey: "oracle_arc",
        domain: "ai_assistance",
        provider: "Oracle Arc",
        purpose: "Server-to-server authenticated integration status connection; not an inference or data-deletion adapter.",
        requiredSettings: ["ORACLE_ARC_API_URL", "ORACLE_ARC_MODEL", "ORACLE_ARC_API_KEY"],
        dataCategories: ["prompt_context", "authorised_tool_results"],
        evidence: [
          "apps/web/src/lib/server/oracle-arc.ts",
          "apps/web/src/app/api/internal/integrations/oracle-arc/status/route.ts",
          "docs/oracle-arc/UNIBUD-INTEGRATION.md"
        ]
      }, env)
    ],
    limitations: [
      "Configuration presence is not a successful connection, provider identity proof, or evidence of provider-side data discovery.",
      "PostgreSQL authentication and application pools are separate least-privilege connection roles; neither pool's health is tested by this inventory.",
      "The verification gateway's underlying email and SMS vendors are unresolved because the repository exposes only a private gateway contract.",
      "Oracle Arc status diagnostics are implemented separately; this inventory does not call the diagnostic endpoint or claim inference readiness.",
      "No executable provider adapter was found in this inventory for object storage, payment processing, maps/geocoding, analytics, push delivery, or backup services. Their absence here is an implementation gap, not proof that no external data exists."
    ]
  };
}
