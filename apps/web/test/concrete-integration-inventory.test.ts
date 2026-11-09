import test from "node:test";
import assert from "node:assert/strict";
import { buildConcreteIntegrationInventory } from "../src/lib/server/account/concrete-integration-inventory.ts";

test("inventory identifies the four executable integration boundaries without exposing configuration values", () => {
  const env = {
    UNIBUD_AUTH_DATABASE_URL: "postgresql://private-user:private-password@db.example/private",
    UNIBUD_APP_DATABASE_URL: "postgresql://app-user:app-password@db.example/private",
    UNIBUD_VERIFICATION_DELIVERY_URL: "https://gateway.example/private",
    UNIBUD_VERIFICATION_DELIVERY_TOKEN: "verification-secret-value",
    ORACLE_ARC_API_URL: "https://oracle.example/v1",
    ORACLE_ARC_MODEL: "private-model-name",
    ORACLE_ARC_API_KEY: "oracle-secret-value"
  };
  const result = buildConcreteIntegrationInventory(env);
  assert.equal(result.integrations.length, 4);
  assert.deepEqual(result.integrations.map(item => item.integrationKey), [
    "postgresql_auth_pool", "postgresql_app_pool", "verification_delivery_gateway", "oracle_arc"
  ]);
  assert.ok(result.integrations.every(item => item.state === "configured_unverified"));
  const serialized = JSON.stringify(result);
  for (const secret of ["private-user", "private-password", "app-password", "gateway.example", "verification-secret-value", "oracle-secret-value", "private-model-name"]) {
    assert.equal(serialized.includes(secret), false);
  }
  assert.equal(result.scope, "platform_runtime_configuration_only");
});

test("partial and absent settings are distinguished instead of treated as connected", () => {
  const result = buildConcreteIntegrationInventory({
    UNIBUD_AUTH_DATABASE_URL: "postgresql://secret",
    UNIBUD_VERIFICATION_DELIVERY_URL: "https://gateway.invalid",
    ORACLE_ARC_API_URL: "https://arc.invalid/v1",
    ORACLE_ARC_MODEL: "model"
  });
  const byKey = Object.fromEntries(result.integrations.map(item => [item.integrationKey, item]));
  assert.equal(byKey.postgresql_auth_pool.state, "configured_unverified");
  assert.equal(byKey.postgresql_app_pool.state, "not_configured");
  assert.equal(byKey.verification_delivery_gateway.state, "partially_configured");
  assert.deepEqual(byKey.verification_delivery_gateway.missingSettings, ["UNIBUD_VERIFICATION_DELIVERY_TOKEN"]);
  assert.equal(byKey.oracle_arc.state, "partially_configured");
  assert.deepEqual(byKey.oracle_arc.missingSettings, ["ORACLE_ARC_API_KEY"]);
});

test("blank and whitespace-only settings are not considered configured", () => {
  const result = buildConcreteIntegrationInventory({
    UNIBUD_AUTH_DATABASE_URL: "   ",
    UNIBUD_APP_DATABASE_URL: "",
    UNIBUD_VERIFICATION_DELIVERY_URL: undefined,
    UNIBUD_VERIFICATION_DELIVERY_TOKEN: "  ",
    ORACLE_ARC_API_URL: "",
    ORACLE_ARC_MODEL: undefined,
    ORACLE_ARC_API_KEY: " "
  });
  assert.ok(result.integrations.every(item => item.state === "not_configured"));
});

test("inventory never claims provider-side discovery or data-deletion capability", () => {
  const result = buildConcreteIntegrationInventory({});
  assert.ok(result.integrations.every(item => !("lookup" in item) && !("delete" in item)));
  assert.ok(result.limitations.some(item => item.includes("not proof that no external data exists")));
});
