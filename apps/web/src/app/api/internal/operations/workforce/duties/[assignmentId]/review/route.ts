import { randomUUID } from "node:crypto";
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
type Context = { params: Promise<{ assignmentId: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON = /^[a-z][a-z0-9_]{2,47}$/;

function noStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}

export async function POST(request: NextRequest, context: Context) {
  if (!hasSameOrigin(request)) return noStore({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || (body.decision !== "approve" && body.decision !== "reject")
      || typeof body.reasonCode !== "string" || !REASON.test(body.reasonCode)) {
    return noStore({ ok: false, error: "Invalid duty review decision." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return noStore({ ok: false, error: "Authentication is required." }, 401);
  try {
    const { assignmentId } = await context.params;
    if (!UUID.test(assignmentId)) return noStore({ ok: false, error: "Invalid assignment identifier." }, 400);
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStore({ ok: false, error: "Authentication is required." }, 401);
    const sessionContext = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    const reviewed = await withSignedSessionTransaction(getAppDatabasePool(), sessionContext, async client => {
      const result = await client.query<{ reviewed: boolean }>(
        "SELECT public.unibud_workforce_review_duty($1,$2,$3,$4) AS reviewed",
        [assignmentId,body.decision,body.reasonCode,randomUUID()]
      );
      return result.rows[0]?.reviewed === true;
    });
    if (!reviewed) return noStore({ ok: false, error: "The duty is not awaiting review or your approval is not authorised." }, 409);
    return noStore({ ok: true, state: body.decision === "approve" ? "completed" : "rejected" });
  } catch (error) {
    return routeError(error);
  }
}
