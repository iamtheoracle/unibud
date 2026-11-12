import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("WebAuthn registration options require exact-account password step-up and server-derived session", () => {
  const route = source("../src/app/api/flow/biometric/registration/options/route.ts");
  assert.ok(route.includes("hasSameOrigin(request)"));
  assert.ok(route.includes("readSessionCookie(request)"));
  assert.ok(route.includes("sessions.validate(token)"));
  assert.ok(route.includes("authentication.verifyCredentialsForAccount"));
  assert.ok(route.includes("accountId: validation.account.id"));
  assert.ok(route.includes("sessionId: validation.session.id"));
  assert.doesNotMatch(route, /body\.(accountId|sessionId|role|approved|authorized)/);
});

test("WebAuthn registration verification is bound to active persisted session and challenge", () => {
  const route = source("../src/app/api/flow/biometric/registration/verify/route.ts");
  const service = source("../src/lib/server/flow/flow-webauthn-service-core.ts");
  assert.ok(route.includes("hasSameOrigin(request)"));
  assert.ok(route.includes("sessions.validate(token)"));
  assert.ok(route.includes("validation.account.id"));
  assert.ok(route.includes("validation.session.id"));
  assert.ok(route.includes("registrationId: body.registrationId"));
  assert.ok(service.includes("expectedChallenge: challenge.challenge.toString"));
  assert.ok(service.includes("expectedOrigin: config.origin"));
  assert.ok(service.includes("expectedRPID: config.rpId"));
  assert.ok(service.includes("requireUserVerification: true"));
  assert.ok(service.includes("flow-step-up:v1"));
  assert.doesNotMatch(route, /body\.(accountId|sessionId|role|approved|authorized)/);
});

test("WebAuthn stores public keys and counters, never biometric templates", () => {
  const migration = source("../../../database/migrations/0052_flow_webauthn_registration.sql");
  assert.ok(migration.includes("public_key_cose"));
  assert.ok(migration.includes("signature_counter"));
  assert.ok(migration.includes("flow_webauthn_registration_challenges"));
  assert.doesNotMatch(migration, /biometric_template|face_id_template|fingerprint_template/i);
});
