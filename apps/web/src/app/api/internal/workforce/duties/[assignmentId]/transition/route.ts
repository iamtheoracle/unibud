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

function noStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}

export async function POST(request: NextRequest, context: Context) {
  if (!hasSameOrigin(request)) return noStore({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || !["accepted", "in_progress", "submitted"].includes(String(body.transition))
      || (body.completionNote !== undefined && typeof body.completionNote !== "string")
      || (body.evidenceReference !== undefined && typeof body.evidenceReference !== "string")) {
    return noStore({ ok: false, error: "Invalid duty update." }, 400);
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
    const updated = await withSignedSessionTransaction(getAppDatabasePool(), sessionContext, async client => {
      const result = await client.query<{ updated: boolean }>(
        "SELECT public.unibud_workforce_update_duty($1,$2,$3,$4,$5) AS updated",
        [assignmentId,body.transition,body.completionNote ?? null,body.evidenceReference ?? null,randomUUID()]
      );
      return result.rows[0]?.updated === true;
    });
    if (!updated) return noStore({ ok: false, error: "The duty transition was not accepted. Check its current state and your MFA session." }, 409);
    return noStore({ ok: true, state: body.transition });
  } catch (error) {
    return routeError(error);
  }
}
