import test from "node:test";
import assert from "node:assert/strict";
import { checkOracleArcConnection, isIntegrationOperatorRequest } from "../src/lib/server/oracle-arc-core.ts";

const settingKeys = [
  "ORACLE_ARC_API_URL",
  "ORACLE_ARC_MODEL",
  "ORACLE_ARC_API_KEY"
] as const;

function configure(values: Partial<Record<(typeof settingKeys)[number], string>>, t: { after(callback: () => void): void }) {
  const previous = Object.fromEntries(settingKeys.map(key => [key, process.env[key]]));
  for (const key of settingKeys) {
    delete process.env[key];
    if (values[key] !== undefined) process.env[key] = values[key];
  }
  t.after(() => {
    for (const key of settingKeys) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

function fakeFetch(
  implementation: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  t: { after(callback: () => void): void }
) {
  const original = globalThis.fetch;
  globalThis.fetch = implementation as typeof fetch;
  t.after(() => { globalThis.fetch = original; });
}

function statusResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

const baseConfig = {
  ORACLE_ARC_API_URL: "https://oracle.example.test/v1",
  ORACLE_ARC_MODEL: "local/qwen2.5:7b",
  ORACLE_ARC_API_KEY: "oracle-test-secret-never-return"
};

test("missing settings are not configured and make no network request", async t => {
  configure({}, t);
  let called = false;
  fakeFetch(async () => { called = true; return statusResponse({}); }, t);
  const result = await checkOracleArcConnection();
  assert.equal(result.state, "not_configured");
  assert.equal(result.inference, "unknown");
  assert.equal(called, false);
});

test("authenticated Oracle Arc identity is confirmed without overstating inference readiness", async t => {
  configure(baseConfig, t);
  let requestInit: RequestInit | undefined;
  fakeFetch(async (input, init) => {
    assert.equal(String(input), "https://oracle.example.test/v1/integration/status");
    requestInit = init;
    return statusResponse({
      service: "oracle-arc",
      authenticated: true,
      model_configured: true,
      inference: "not-configured"
    });
  }, t);
  const result = await checkOracleArcConnection();
  assert.equal(result.state, "connected");
  assert.equal(result.modelConfigured, true);
  assert.equal(result.inference, "not_configured");
  assert.equal(requestInit?.method, "GET");
  assert.equal(requestInit?.redirect, "error");
  assert.equal((requestInit?.headers as Record<string, string>).Authorization, `Bearer ${baseConfig.ORACLE_ARC_API_KEY}`);
  assert.equal(JSON.stringify(result).includes(baseConfig.ORACLE_ARC_API_KEY), false);
});

test("inference cannot be reported ready when Oracle Arc says no model is configured", async t => {
  configure(baseConfig, t);
  fakeFetch(async () => statusResponse({
    service: "oracle-arc",
    authenticated: true,
    model_configured: false,
    inference: "ready"
  }), t);
  const result = await checkOracleArcConnection();
  assert.equal(result.state, "connected");
  assert.equal(result.modelConfigured, false);
  assert.equal(result.inference, "unknown");
});

test("invalid service identity or incomplete status schema is rejected", async t => {
  configure(baseConfig, t);
  fakeFetch(async () => statusResponse({
    service: "untrusted-service",
    authenticated: true,
    model_configured: true,
    inference: "ready"
  }), t);
  const result = await checkOracleArcConnection();
  assert.equal(result.state, "misconfigured");
  assert.equal(result.inference, "unknown");
});

test("invalid content type and malformed JSON are rejected without exposing upstream body", async t => {
  configure(baseConfig, t);
  fakeFetch(async () => new Response("private-upstream-error", {
    status: 200,
    headers: { "content-type": "text/html" }
  }), t);
  const contentTypeResult = await checkOracleArcConnection();
  assert.equal(contentTypeResult.state, "misconfigured");
  assert.equal(JSON.stringify(contentTypeResult).includes("private-upstream-error"), false);

  fakeFetch(async () => new Response("not-json", {
    status: 200,
    headers: { "content-type": "application/json" }
  }), t);
  const jsonResult = await checkOracleArcConnection();
  assert.equal(jsonResult.state, "misconfigured");
  assert.equal(JSON.stringify(jsonResult).includes("not-json"), false);
});

test("oversized upstream status bodies are rejected", async t => {
  configure(baseConfig, t);
  fakeFetch(async () => new Response("x".repeat(8193), {
    status: 200,
    headers: { "content-type": "application/json" }
  }), t);
  const result = await checkOracleArcConnection();
  assert.equal(result.state, "misconfigured");
  assert.equal(result.inference, "unknown");
});

test("unauthorized credentials and non-success provider responses remain distinct", async t => {
  configure(baseConfig, t);
  fakeFetch(async () => statusResponse({ detail: "private auth details" }, 401), t);
  const unauthorized = await checkOracleArcConnection();
  assert.equal(unauthorized.state, "unauthorized");
  assert.equal(JSON.stringify(unauthorized).includes("private auth details"), false);

  fakeFetch(async () => statusResponse({ detail: "private upstream details" }, 503), t);
  const unavailable = await checkOracleArcConnection();
  assert.equal(unavailable.state, "unreachable");
  assert.match(unavailable.message, /503/);
  assert.equal(JSON.stringify(unavailable).includes("private upstream details"), false);
});

test("redirects and network failures fail closed as unreachable", async t => {
  configure(baseConfig, t);
  fakeFetch(async (_input, init) => {
    assert.equal(init?.redirect, "error");
    throw new Error("redirect target contained secret");
  }, t);
  const result = await checkOracleArcConnection();
  assert.equal(result.state, "unreachable");
  assert.equal(JSON.stringify(result).includes("redirect target"), false);
});

test("non-HTTPS remote URLs are rejected before making a request", async t => {
  configure({ ...baseConfig, ORACLE_ARC_API_URL: "http://oracle.example.test/v1" }, t);
  let called = false;
  fakeFetch(async () => { called = true; return statusResponse({}); }, t);
  const result = await checkOracleArcConnection();
  assert.equal(result.state, "misconfigured");
  assert.equal(called, false);
});


test("operator diagnostic gate requires the configured bearer credential", t => {
  const previous = process.env.UNIBUD_INTEGRATION_ADMIN_TOKEN;
  t.after(() => {
    if (previous === undefined) delete process.env.UNIBUD_INTEGRATION_ADMIN_TOKEN;
    else process.env.UNIBUD_INTEGRATION_ADMIN_TOKEN = previous;
  });
  delete process.env.UNIBUD_INTEGRATION_ADMIN_TOKEN;
  assert.equal(isIntegrationOperatorRequest("Bearer any-token"), false);
  process.env.UNIBUD_INTEGRATION_ADMIN_TOKEN = "short";
  assert.equal(isIntegrationOperatorRequest("Bearer short"), false);
  process.env.UNIBUD_INTEGRATION_ADMIN_TOKEN = "operator-test-token-with-sufficient-entropy";
  assert.equal(isIntegrationOperatorRequest(null), false);
  assert.equal(isIntegrationOperatorRequest("Basic operator-test-token-with-sufficient-entropy"), false);
  assert.equal(isIntegrationOperatorRequest("Bearer wrong-token"), false);
  assert.equal(isIntegrationOperatorRequest("Bearer operator-test-token-with-sufficient-entropy extra"), false);
  assert.equal(isIntegrationOperatorRequest("Bearer\toperator-test-token-with-sufficient-entropy"), false);
  assert.equal(isIntegrationOperatorRequest("Bearer operator-test-token-with-sufficient-entropy"), true);
});
