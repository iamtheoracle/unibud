import { NextRequest, NextResponse } from "next/server";
import { createOperationsMfaAssertionFromEnvironment } from "@/lib/server/operations/operations-mfa-assertions";
import { createSignedSessionContextFromEnvironment, withSignedSessionTransaction } from "@/lib/server/database/session-context";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { hasSameOrigin, readJsonObject, readSessionCookie, routeError } from "@/lib/server/identity/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON = /^[a-z][a-z0-9_]{2,47}$/;

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return response({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || typeof body.targetAccountId !== "string" || !UUID.test(body.targetAccountId)
      || (body.action !== "disable" && body.action !== "reset")
      || typeof body.reasonCode !== "string" || !REASON.test(body.reasonCode)
      || (body.channel !== "email" && body.channel !== "phone")
      || typeof body.identifier !== "string" || body.identifier.length > 254
      || typeof body.password !== "string" || body.password.length < 1 || body.password.length > 128) {
    return response({ ok: false, error: "Invalid security-change request." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return response({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { authentication, sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return response({ ok: false, error: "Authentication is required." }, 401);
    const passwordVerified = await authentication.verifyCredentialsForAccount({
      accountId: validation.account.id,
      channel: body.channel,
      identifier: body.identifier,
      password: body.password
    });
    if (!passwordVerified) return response({ ok: false, error: "The sign-in details were not accepted." }, 401);

    const assertion = createOperationsMfaAssertionFromEnvironment({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      purpose: "password_reauth",
      matchedTotpStep: null,
      ttlSeconds: 60
    });
    const context = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    const requestId = await withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
      const result = await client.query<{ request_id: string | null }>(
        "SELECT public.unibud_operator_mfa_request_security_change($1,$2,$3,$4,$5,$6,$7) AS request_id",
        [body.targetAccountId, body.action, body.reasonCode, assertion.issuedAt,
          assertion.expiresAt, assertion.nonce, assertion.signature]
      );
      return result.rows[0]?.request_id ?? null;
    });
    if (!requestId) return response({ ok: false, error: "The request was not accepted. Check your Operations permission, MFA step-up, target eligibility and pending requests." }, 403);
    return response({ ok: true, requestId, state: "pending", expiresInSeconds: 1800 }, 201);
  } catch (error) {
    const result = routeError(error);
    result.headers.set("Cache-Control", "no-store");
    result.headers.set("Pragma", "no-cache");
    return result;
  }
}
