import { NextRequest, NextResponse } from "next/server";
import { createOperationsMfaAssertionFromEnvironment } from "@/lib/server/operations/operations-mfa-assertions";
import { createSignedSessionContextFromEnvironment, withSignedSessionTransaction } from "@/lib/server/database/session-context";
import { getAppDatabasePool, getAuthDatabasePool } from "@/lib/server/database/postgres-pool";
import { verifyWorkforcePasscodeForAccount } from "@/lib/server/workforce/workforce-credentials-core";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { hasSameOrigin, readJsonObject, readSessionCookie, routeError } from "@/lib/server/identity/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON = /^[a-z][a-z0-9_]{2,47}$/;
const ROLES = new Set(["platform_admin", "operations_admin", "integration_operator", "support_readonly"]);
const PERMISSIONS = new Set([
  "integrations.verification_delivery.read", "integrations.oracle_arc.read", "dependencies.read",
  "operations.audit.read", "operations.accounts.support_read",
  "operations.mfa.security.request", "operations.mfa.security.approve",
  "operations.workforce.read", "operations.workforce.request", "operations.workforce.approve"
]);
type ActiveGrantRow = { grant_id: string; account_id: string; operator_role: string; permissions: string[]; granted_by: string | null; granted_at: Date | string; expires_at: Date | string | null };
type GrantRequestRow = {
  request_id: string; requested_action: "grant" | "revoke"; target_account_id: string;
  target_grant_id: string | null; requested_role: string | null; requested_permissions: string[] | null;
  requested_expires_at: Date | string | null; state: string; requester_account_id: string;
  approver_account_id: string | null; reason_code: string; created_at: Date | string;
  expires_at: Date | string; decided_at: Date | string | null;
};

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && !hasSameOrigin(request)) return response({ ok: false, error: "Forbidden." }, 403);
  const token = readSessionCookie(request);
  if (!token) return response({ ok: false, error: "Authentication is required." }, 401);
  const params = request.nextUrl.searchParams;
  const requestId = params.get("requestId");
  const limitRaw = params.get("limit");
  const beforeCreatedAt = params.get("beforeCreatedAt");
  const beforeRequestId = params.get("beforeRequestId");
  const limit = limitRaw === null ? 50 : Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100
      || (requestId !== null && !UUID.test(requestId))
      || ((beforeCreatedAt === null) !== (beforeRequestId === null))
      || (beforeCreatedAt !== null && (!Number.isFinite(Date.parse(beforeCreatedAt))
        || new Date(beforeCreatedAt).toISOString() !== beforeCreatedAt
        || !beforeRequestId || !UUID.test(beforeRequestId)))) {
    return response({ ok: false, error: "Invalid grant request query." }, 400);
  }
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return response({ ok: false, error: "Authentication is required." }, 401);
    const sessionContext = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    if (params.get("view") === "active-grants") {
      const accountId = params.get("accountId");
      if (accountId !== null && !UUID.test(accountId)) return response({ ok: false, error: "Invalid account identifier." }, 400);
      const grants = await withSignedSessionTransaction(getAppDatabasePool(), sessionContext, async client => {
        const result = await client.query<ActiveGrantRow>(
          "SELECT * FROM public.unibud_operator_list_active_grants($1,$2)",
          [accountId, limit]
        );
        return result.rows;
      });
      return response({ ok: true, viewerAccountId: validation.account.id, grants });
    }
    const rows = await withSignedSessionTransaction(getAppDatabasePool(), sessionContext, async client => {
      const result = await client.query<GrantRequestRow>(
        "SELECT * FROM public.unibud_operator_list_grant_requests($1,$2,$3,$4)",
        [requestId, limit, beforeCreatedAt, beforeRequestId]
      );
      return result.rows;
    });
    return response({
      ok: true, viewerAccountId: validation.account.id, requests: rows,
      nextCursor: requestId || rows.length < limit ? null : {
        beforeCreatedAt: rows[rows.length - 1]!.created_at instanceof Date
          ? (rows[rows.length - 1]!.created_at as Date).toISOString()
          : new Date(rows[rows.length - 1]!.created_at as string).toISOString(),
        beforeRequestId: rows[rows.length - 1]!.request_id
      }
    });
  } catch (error) {
    const result = routeError(error);
    result.headers.set("Cache-Control", "no-store");
    result.headers.set("Pragma", "no-cache");
    return result;
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return response({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || (body.action !== "grant" && body.action !== "revoke")
      || typeof body.targetAccountId !== "string" || !UUID.test(body.targetAccountId)
      || typeof body.reasonCode !== "string" || !REASON.test(body.reasonCode)) {
    return response({ ok: false, error: "Invalid grant change request." }, 400);
  }
  const workforceReauthentication =
    typeof body.username === "string" && /^ub-(staff|operator|admin)-[a-f0-9]{16}$/.test(body.username)
    && typeof body.passcode === "string" && /^\\d{6}$/.test(body.passcode);
  const accountReauthentication =
    (body.channel === "email" || body.channel === "phone")
    && typeof body.identifier === "string" && body.identifier.length >= 1 && body.identifier.length <= 254
    && typeof body.password === "string" && body.password.length >= 1 && body.password.length <= 128;
  if (!workforceReauthentication && !accountReauthentication) {
    return response({ ok: false, error: "Reauthenticate with your account password or workforce passcode." }, 400);
  }
  let role: string | null = null;
  let permissions: string[] | null = null;
  let expiresAt: string | null = null;
  let targetGrantId: string | null = null;
  if (body.action === "grant") {
    if (typeof body.role !== "string" || !ROLES.has(body.role)
        || !Array.isArray(body.permissions) || body.permissions.length < 1 || body.permissions.length > 13
        || !body.permissions.every((item: unknown) => typeof item === "string" && PERMISSIONS.has(item))
        || new Set(body.permissions).size !== body.permissions.length
        || typeof body.expiresAt !== "string" || !Number.isFinite(Date.parse(body.expiresAt))
        || new Date(body.expiresAt).toISOString() !== body.expiresAt) {
      return response({ ok: false, error: "The selected role, permissions or expiry are invalid." }, 400);
    }
    role = body.role;
    permissions = body.permissions as string[];
    expiresAt = body.expiresAt;
  } else {
    if (typeof body.targetGrantId !== "string" || !UUID.test(body.targetGrantId)) {
      return response({ ok: false, error: "A valid target grant is required for revocation." }, 400);
    }
    targetGrantId = body.targetGrantId;
  }

  const token = readSessionCookie(request);
  if (!token) return response({ ok: false, error: "Authentication is required." }, 401);
  try {
    const { authentication, sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return response({ ok: false, error: "Authentication is required." }, 401);
    const passwordVerified = workforceReauthentication
      ? await verifyWorkforcePasscodeForAccount({
          pool: getAuthDatabasePool(), accountId: validation.account.id,
          username: body.username as string, passcode: body.passcode as string
        })
      : await authentication.verifyCredentialsForAccount({
          accountId: validation.account.id, channel: body.channel as "email" | "phone",
          identifier: body.identifier as string, password: body.password as string
        });
    if (!passwordVerified) return response({ ok: false, error: "The sign-in details were not accepted." }, 401);
    const assertion = createOperationsMfaAssertionFromEnvironment({
      accountId: validation.account.id, sessionId: validation.session.id,
      purpose: "password_reauth", matchedTotpStep: null, ttlSeconds: 60
    });
    const sessionContext = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    const requestId = await withSignedSessionTransaction(getAppDatabasePool(), sessionContext, async client => {
      const result = await client.query<{ request_id: string | null }>(
        "SELECT public.unibud_operator_request_grant_change($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) AS request_id",
        [body.action, body.targetAccountId, targetGrantId, role, permissions, expiresAt, body.reasonCode,
          assertion.issuedAt, assertion.expiresAt, assertion.nonce, assertion.signature]
      );
      return result.rows[0]?.request_id ?? null;
    });
    if (!requestId) return response({ ok: false, error: "The request was not accepted. Verify your grant-request permission, current MFA step-up, target eligibility and grant policy." }, 403);
    return response({ ok: true, requestId, state: "pending", expiresInSeconds: 1800 }, 201);
  } catch (error) {
    const result = routeError(error);
    result.headers.set("Cache-Control", "no-store");
    result.headers.set("Pragma", "no-cache");
    return result;
  }
}
