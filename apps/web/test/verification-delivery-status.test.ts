import test from "node:test";
import assert from "node:assert/strict";
import { buildVerificationDeliveryStatus } from "../src/lib/server/account/verification-delivery-status.ts";

const valid = {
  UNIBUD_VERIFICATION_DELIVERY_URL: "https://gateway.example.test/send",
  UNIBUD_VERIFICATION_DELIVERY_TOKEN: "verification-gateway-test-token-which-is-long-enough"
};

test("unconfigured gateway remains unknown and no provider is inferred", () => {
  const result = buildVerificationDeliveryStatus({});
  assert.equal(result.state, "not_configured");
  assert.equal(result.providerIdentity, null);
  assert.equal(result.connectivity, "not_tested");
  assert.equal(result.readOnlyHealthCheck, "not_defined");
});

test("partial gateway settings are not treated as configured or connected", () => {
  const result = buildVerificationDeliveryStatus({
    UNIBUD_VERIFICATION_DELIVERY_URL: valid.UNIBUD_VERIFICATION_DELIVERY_URL
  });
  assert.equal(result.state, "partially_configured");
  assert.equal(result.endpointConfigured, true);
  assert.equal(result.credentialConfigured, false);
  assert.equal(result.connectivity, "not_tested");
});

test("complete settings remain configured but unverified without a health contract", () => {
  const result = buildVerificationDeliveryStatus(valid);
  assert.equal(result.state, "configured_unverified");
  assert.equal(result.providerIdentity, null);
  assert.equal(result.connectivity, "not_tested");
  assert.equal(result.readOnlyHealthCheck, "not_defined");
  assert.ok(result.limitations.some(item => item.includes("downstream email, SMS, WhatsApp or RCS vendors")));
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes("gateway.example.test"), false);
  assert.equal(serialized.includes(valid.UNIBUD_VERIFICATION_DELIVERY_TOKEN), false);
});

test("production rejects insecure HTTP and short gateway credentials", () => {
  const insecure = buildVerificationDeliveryStatus({
    ...valid,
    UNIBUD_VERIFICATION_DELIVERY_URL: "http://gateway.example.test/send"
  }, "production");
  assert.equal(insecure.state, "misconfigured");

  const shortToken = buildVerificationDeliveryStatus({
    ...valid,
    UNIBUD_VERIFICATION_DELIVERY_TOKEN: "too-short"
  }, "production");
  assert.equal(shortToken.state, "misconfigured");
});

test("endpoint rejects embedded credentials, query strings and fragments", () => {
  for (const endpoint of [
    "https://user:password@gateway.example.test/send",
    "https://gateway.example.test/send?token=secret",
    "https://gateway.example.test/send#secret"
  ]) {
    const result = buildVerificationDeliveryStatus({
      ...valid,
      UNIBUD_VERIFICATION_DELIVERY_URL: endpoint
    }, "production");
    assert.equal(result.state, "misconfigured");
    assert.equal(JSON.stringify(result).includes("secret"), false);
  }
});

test("non-production HTTP is limited to loopback development endpoints", () => {
  const local = buildVerificationDeliveryStatus({
    ...valid,
    UNIBUD_VERIFICATION_DELIVERY_URL: "http://localhost:8080/send"
  }, "development");
  assert.equal(local.state, "configured_unverified");

  const remote = buildVerificationDeliveryStatus({
    ...valid,
    UNIBUD_VERIFICATION_DELIVERY_URL: "http://gateway.example.test/send"
  }, "development");
  assert.equal(remote.state, "misconfigured");
});

test("invalid endpoint URL is classified without exposing its value", () => {
  const result = buildVerificationDeliveryStatus({
    ...valid,
    UNIBUD_VERIFICATION_DELIVERY_URL: "not a url"
  }, "production");
  assert.equal(result.state, "misconfigured");
  assert.equal(JSON.stringify(result).includes("not a url"), false);
});

test("diagnostic contract explicitly avoids sending test messages or verification data", () => {
  const result = buildVerificationDeliveryStatus(valid);
  assert.ok(result.limitations.some(item => item.includes("No delivery request, test message")));
  assert.ok(result.limitations.some(item => item.includes("WhatsApp or RCS routing")));
  assert.equal("deliver" in result, false);
});
