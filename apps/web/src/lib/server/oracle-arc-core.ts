export type OracleArcConnectionState =
  | "not_configured"
  | "connected"
  | "unreachable"
  | "unauthorized"
  | "misconfigured";

export interface OracleArcConnectionResult {
  state: OracleArcConnectionState;
  checkedAt: string;
  apiUrlConfigured: boolean;
  modelConfigured: boolean;
  inference: "ready" | "not_configured" | "unknown";
  message: string;
}

interface OracleArcStatusPayload {
  service?: unknown;
  authenticated?: unknown;
  model_configured?: unknown;
  inference?: unknown;
}

function readConfig() {
  const apiUrl = process.env.ORACLE_ARC_API_URL?.trim() ?? "";
  const model = process.env.ORACLE_ARC_MODEL?.trim() ?? "";
  const apiKey = process.env.ORACLE_ARC_API_KEY?.trim() ?? "";
  return { apiUrl, model, apiKey };
}

function resolveStatusUrl(apiUrl: string): URL {
  const base = new URL(apiUrl);
  const isLocal =
    base.hostname === "localhost" ||
    base.hostname === "127.0.0.1" ||
    base.hostname === "::1";

  if (base.protocol !== "https:" && !(isLocal && base.protocol === "http:")) {
    throw new Error("Oracle Arc URL must use HTTPS outside local development.");
  }
  if (base.username || base.password || base.search || base.hash) {
    throw new Error("Oracle Arc URL must not contain credentials, query, or fragment.");
  }

  const normalized = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
  return new URL("integration/status", normalized);
}

async function readBoundedBody(response: Response, maximumBytes: number): Promise<string | null> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export async function checkOracleArcConnection(): Promise<OracleArcConnectionResult> {
  const checkedAt = new Date().toISOString();
  const { apiUrl, model, apiKey } = readConfig();

  if (!apiUrl || !model || !apiKey) {
    return {
      state: "not_configured",
      checkedAt,
      apiUrlConfigured: Boolean(apiUrl),
      modelConfigured: Boolean(model),
      inference: "unknown",
      message: "The server-side Oracle Arc settings are incomplete."
    };
  }

  let statusUrl: URL;
  try {
    statusUrl = resolveStatusUrl(apiUrl);
  } catch {
    return {
      state: "misconfigured",
      checkedAt,
      apiUrlConfigured: true,
      modelConfigured: true,
      inference: "unknown",
      message: "The Oracle Arc API URL is invalid or does not meet transport security requirements."
    };
  }

  try {
    const response = await fetch(statusUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5000)
    });

    if (response.status === 401 || response.status === 403) {
      return {
        state: "unauthorized",
        checkedAt,
        apiUrlConfigured: true,
        modelConfigured: true,
        inference: "unknown",
        message: "Oracle Arc rejected the configured service credentials."
      };
    }

    if (!response.ok) {
      return {
        state: "unreachable",
        checkedAt,
        apiUrlConfigured: true,
        modelConfigured: true,
        inference: "unknown",
        message: `Oracle Arc returned HTTP ${response.status}.`
      };
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/json")) {
      return {
        state: "misconfigured",
        checkedAt,
        apiUrlConfigured: true,
        modelConfigured: true,
        inference: "unknown",
        message: "Oracle Arc responded with an unexpected content type."
      };
    }

    let responseBody: string | null;
    try {
      responseBody = await readBoundedBody(response, 8192);
    } catch {
      responseBody = null;
    }
    if (responseBody === null) {
      return {
        state: "misconfigured",
        checkedAt,
        apiUrlConfigured: true,
        modelConfigured: true,
        inference: "unknown",
        message: "Oracle Arc returned an oversized status response."
      };
    }

    let payload: OracleArcStatusPayload;
    try {
      payload = JSON.parse(responseBody) as OracleArcStatusPayload;
    } catch {
      return {
        state: "misconfigured",
        checkedAt,
        apiUrlConfigured: true,
        modelConfigured: true,
        inference: "unknown",
        message: "Oracle Arc returned an invalid status response."
      };
    }

    if (payload.service !== "oracle-arc" || payload.authenticated !== true || typeof payload.model_configured !== "boolean") {
      return {
        state: "misconfigured",
        checkedAt,
        apiUrlConfigured: true,
        modelConfigured: true,
        inference: "unknown",
        message: "The endpoint responded, but its identity or authentication result was not valid."
      };
    }

    const inference =
      payload.model_configured === true && payload.inference === "ready"
        ? "ready"
        : payload.inference === "not-configured"
          ? "not_configured"
          : "unknown";

    return {
      state: "connected",
      checkedAt,
      apiUrlConfigured: true,
      modelConfigured: payload.model_configured === true,
      inference,
      message:
        inference === "ready"
          ? "Oracle Arc authenticated successfully and reports inference ready."
          : "Oracle Arc authenticated successfully, but inference is not confirmed ready."
    };
  } catch {
    return {
      state: "unreachable",
      checkedAt,
      apiUrlConfigured: true,
      modelConfigured: true,
      inference: "unknown",
      message: "UNIBUD could not reach Oracle Arc. Check the service URL and deployment health."
    };
  }
}

export function isIntegrationOperatorRequest(authorization: string | null): boolean {
  const expected = process.env.UNIBUD_INTEGRATION_ADMIN_TOKEN?.trim() ?? "";
  if (!expected || !authorization) return false;

  const [scheme, token, extra] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token || extra) return false;

  // Constant-time comparison for equal-length UTF-8 credentials.
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

import { timingSafeEqual } from "node:crypto";
