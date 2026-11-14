import { createWorkforceUsername, createWorkforceActivationCode, workforceActivationDigest } from "@/lib/server/workforce/workforce-credentials-core";
import { NextRequest, NextResponse } from "next/server";
import {
  createSignedSessionContextFromEnvironment,
  withSignedSessionTransaction
} from "@/lib/server/database/session-context";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { hasSameOrigin, readJsonObject, readSessionCookie, routeError } from "@/lib/server/identity/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ requestId: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON = /^[a-z][a-z0-9_]{2,47}$/;

function noStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

export async function POST(request: NextRequest, context: Context) {
  if (!hasSameOrigin(request)) return noStore({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || (body.decision !== "approve" && body.decision !== "reject")
      || typeof body.reasonCode !== "string" || !REASON.test(body.reasonCode)) {
    return noStore({ ok: false, error: "Invalid workforce invitation decision." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return noStore({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { requestId } = await context.params;
    if (!UUID.test(requestId)) return noStore({ ok: false, error: "Invalid request identifier." }, 400);
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStore({ ok: false, error: "Authentication is required." }, 401);

    const username = body.decision === "approve"
      ? createWorkforceUsername((body.role === "staff" || body.role === "operator" || body.role === "admin")
        ? body.role : "staff")
      : null;
    const activationCode = body.decision === "approve" ? createWorkforceActivationCode() : null;
    const digest = username && activationCode
      ? workforceActivationDigest(username, activationCode)
      : null;
    const sessionContext = createSignedSessionContextFromEnvironment(
      validation.account.id, validation.session.id
    );
    const decision = await withSignedSessionTransaction(
      getAppDatabasePool(),
      sessionContext,
      async client => {
        const result = await client.query<{
          workforce_id: string | null;
          account_id: string | null;
          username: string | null;
          decision_state: string;
        }>(
          "SELECT * FROM public.unibud_workforce_decide_invitation($1,$2,$3,$4,$5)",
          [requestId, body.decision, body.reasonCode, username, digest]
        );
        return result.rows[0] ?? null;
      }
    );
    if (!decision || decision.decision_state !== body.decision + "d" && decision.decision_state !== body.decision) {
      return noStore({
        ok: false,
        error: "The invitation decision was not accepted. It may be expired, already decided, or outside your independent approval authority."
      }, 409);
    }
    if (body.decision === "reject") {
      return noStore({ ok: true, state: "rejected" });
    }
    return noStore({
      ok: true,
      state: "approved",
      workforceId: decision.workforce_id,
      username: decision.username,
      activationCode,
      activationExpiresInSeconds: 900,
      deliveryInstruction: "Share this one-time code with the named person through a verified, separate company-controlled channel. It is shown only once."
    }, 201);
  } catch (error) {
    return routeError(error);
  }
}
