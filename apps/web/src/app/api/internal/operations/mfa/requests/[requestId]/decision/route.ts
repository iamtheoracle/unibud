import { NextRequest, NextResponse } from "next/server";
import { createOperationsMfaAssertionFromEnvironment } from "@/lib/server/operations/operations-mfa-assertions";
import { createSignedSessionContextFromEnvironment, withSignedSessionTransaction } from "@/lib/server/database/session-context";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { hasSameOrigin, readJsonObject, readSessionCookie, routeError } from "@/lib/server/identity/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ requestId: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON = /^[a-z][a-z0-9_]{2,47}$/;

function response(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}

export async function POST(request: NextRequest, context: Context) {
  if (!hasSameOrigin(request)) return response({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || (body.decision !== "approve" && body.decision !== "reject")
      || typeof body.reasonCode !== "string" || !REASON.test(body.reasonCode)
      || (body.channel !== "email" && body.channel !== "phone")
      || typeof body.identifier !== "string" || body.identifier.length > 254
      || typeof body.password !== "string" || body.password.length < 1 || body.password.length > 128) {
    return response({ ok: false, error: "Invalid security decision." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return response({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { requestId } = await context.params;
    if (!UUID.test(requestId)) return response({ ok: false, error: "Invalid request identifier." }, 400);
    const { authentication, sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return response({ ok: false, error: "Authentication is required." }, 401);
    const passwordVerified = await authentication.verifyCredentialsForAccount({
      accountId: validation.account.id, channel: body.channel,
      identifier: body.identifier, password: body.password
    });
    if (!passwordVerified) return response({ ok: false, error: "The sign-in details were not accepted." }, 401);

    const assertion = createOperationsMfaAssertionFromEnvironment({
      accountId: validation.account.id, sessionId: validation.session.id,
      purpose: "password_reauth", matchedTotpStep: null, ttlSeconds: 60
    });
    const sessionContext = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    const decided = await withSignedSessionTransaction(getAppDatabasePool(), sessionContext, async client => {
      const result = await client.query<{ decided: boolean }>(
        "SELECT public.unibud_operator_mfa_decide_security_change($1,$2,$3,$4,$5,$6,$7) AS decided",
        [requestId, body.decision, body.reasonCode, assertion.issuedAt,
          assertion.expiresAt, assertion.nonce, assertion.signature]
      );
      return result.rows[0]?.decided === true;
    });
    if (!decided) return response({ ok: false, error: "The decision was not accepted. The request may be expired, already decided, or outside your independent approval permissions." }, 409);
    return response({ ok: true, state: body.decision === "approve" ? "completed" : "rejected" });
  } catch (error) {
    const result = routeError(error);
    result.headers.set("Cache-Control", "no-store");
    result.headers.set("Pragma", "no-cache");
    return result;
  }
}
