import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/app/operations/security/mfa/page.tsx", import.meta.url), "utf8");
const client = readFileSync(new URL("../src/app/operations/security/mfa/operations-mfa-client.tsx", import.meta.url), "utf8");

test("Operations MFA page requires a validated persisted session before rendering", () => {
  assert.match(page, /cookies\(\)/);
  assert.match(page, /sessionCookieName\(\)/);
  assert.match(page, /sessions\.validate\(token\)/);
  assert.match(page, /if \(!validation\.valid\) redirect\("\/login"\)/);
});

test("MFA interface supports enrollment, resume, confirmation, challenge and recovery", () => {
  assert.match(client, /\/api\/internal\/operations\/mfa\/status/);
  assert.match(client, /\/api\/internal\/operations\/mfa\/enrollment\/start/);
  assert.match(client, /\/api\/internal\/operations\/mfa\/enrollment\/resume/);
  assert.match(client, /\/api\/internal\/operations\/mfa\/enrollment\/confirm/);
  assert.match(client, /\/api\/internal\/operations\/mfa\/challenge/);
  assert.match(client, /\/api\/internal\/operations\/mfa\/recovery\/redeem/);
  assert.match(client, /\/api\/internal\/operations\/mfa\/recovery\/regenerate/);
  assert.match(client, /status\.stepUpExpiresAt/);
  assert.match(client, /recoveryCodesShownOnce/);
  assert.match(client, /I have saved these recovery codes/);
});

test("MFA UI does not persist provisioning secrets or recovery codes in browser storage", () => {
  assert.doesNotMatch(client, /localStorage|sessionStorage|indexedDB/);
  assert.match(client, /cache: "no-store"/);
  assert.match(client, /QR scanning is not available in this build/);
});


test("MFA browser test fixture is unavailable in production and CI invokes the real UI workflow", () => {
  const fixture = readFileSync(new URL("../src/app/e2e/operations-mfa/page.tsx", import.meta.url), "utf8");
  const workflow = readFileSync(new URL("../../../.github/workflows/web.yml", import.meta.url), "utf8");
  assert.match(fixture, /process\.env\.NODE_ENV === "production"/);
  assert.match(fixture, /UNIBUD_E2E_TEST_MODE !== "true"/);
  assert.match(workflow, /scripts\/e2e\/operations-mfa\.mjs/);
});
