import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../src/app/api/internal/operations/mfa/recovery/regenerate/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../../database/migrations/0030_operations_mfa_recovery_regeneration.sql", import.meta.url), "utf8");

test("recovery regeneration requires same-origin, validated session and password reauthentication", () => {
  assert.match(route, /hasSameOrigin\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /verifyCredentialsForAccount\(/);
  assert.match(route, /validation\.account\.id/);
  assert.match(route, /validation\.session\.id/);
  assert.match(route, /purpose: "password_reauth"/);
  assert.match(route, /matchedTotpStep: null/);
  assert.match(route, /Cache-Control.*no-store/);
});

test("database regeneration requires a fresh exact-session MFA step-up and replaces all digests atomically", () => {
  assert.match(migration, /current_session_has_mfa_step_up\(\)/);
  assert.match(migration, /state='active'/);
  assert.match(migration, /DELETE FROM public\.unibud_operator_mfa_recovery_codes WHERE account_id=v_account/);
  assert.match(migration, /INSERT INTO public\.unibud_operator_mfa_recovery_codes/);
  assert.match(migration, /recovery_codes_regenerated/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.unibud_operator_mfa_regenerate_recovery_codes/);
});
