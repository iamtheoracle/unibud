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
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return noStore({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || typeof body.workforceId !== "string" || !UUID.test(body.workforceId)
      || typeof body.dutyCode !== "string" || !/^[a-z][a-z0-9_.-]{2,63}$/.test(body.dutyCode)
      || typeof body.title !== "string" || body.title.trim().length < 3 || body.title.length > 120
      || typeof body.description !== "string" || body.description.trim().length < 3 || body.description.length > 2000
      || (body.dueAt !== undefined && body.dueAt !== null
        && (typeof body.dueAt !== "string" || !Number.isFinite(Date.parse(body.dueAt))))) {
    return noStore({ ok: false, error: "Complete the duty assignment details." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return noStore({ ok: false, error: "Authentication is required." }, 401);
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStore({ ok: false, error: "Authentication is required." }, 401);
    const context = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    const assignmentId = await withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
      const result = await client.query<{ assignment_id: string | null }>(
        "SELECT public.unibud_workforce_assign_duty($1,$2,$3,$4,$5,$6) AS assignment_id",
        [body.workforceId,body.dutyCode,body.title.trim(),body.description.trim(),
          body.dueAt ?? null,randomUUID()]
      );
      return result.rows[0]?.assignment_id ?? null;
    });
    if (!assignmentId) return noStore({ ok: false, error: "Duty assignment was not accepted. Verify manager permission and MFA step-up." }, 403);
    return noStore({ ok: true, assignmentId, state: "assigned" }, 201);
  } catch (error) {
    return routeError(error);
  }
}
