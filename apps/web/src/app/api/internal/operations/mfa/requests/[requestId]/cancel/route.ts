import { NextRequest, NextResponse } from "next/server";
import { createSignedSessionContextFromEnvironment, withSignedSessionTransaction } from "@/lib/server/database/session-context";
import { consumeOperationsMfaApiRateLimit } from "@/lib/server/operations/operations-mfa-rate-limit";
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
  if (!body || typeof body.reasonCode !== "string" || !REASON.test(body.reasonCode)) {
    return response({ ok: false, error: "A valid cancellation reason is required." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return response({ ok: false, error: "Authentication is required." }, 401);
  try {
    const { requestId } = await context.params;
    if (!UUID.test(requestId)) return response({ ok: false, error: "Invalid request identifier." }, 400);
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return response({ ok: false, error: "Authentication is required." }, 401);
    if (!await consumeOperationsMfaApiRateLimit(validation.account.id, validation.session.id, "request_cancel")) {
      return response({ ok: false, error: "Too many cancellation attempts. Wait before trying again." }, 429);
    }
    const sessionContext = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    const cancelled = await withSignedSessionTransaction(getAppDatabasePool(), sessionContext, async client => {
      const result = await client.query<{ cancelled: boolean }>(
        "SELECT public.unibud_operator_mfa_cancel_security_change($1,$2) AS cancelled",
        [requestId, body.reasonCode]
      );
      return result.rows[0]?.cancelled === true;
    });
    if (!cancelled) return response({ ok: false, error: "Only the original requester can cancel their own still-pending request from the same verified session." }, 409);
    return response({ ok: true, state: "cancelled" });
  } catch (error) {
    const result = routeError(error);
    result.headers.set("Cache-Control", "no-store");
    result.headers.set("Pragma", "no-cache");
    return result;
  }
}
