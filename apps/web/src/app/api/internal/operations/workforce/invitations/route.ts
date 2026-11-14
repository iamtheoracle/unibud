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

const ROLES = new Set(["staff", "operator", "admin"]);
const REASON = /^[a-z][a-z0-9_]{2,47}$/;

function noStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && !hasSameOrigin(request)) return noStore({ ok: false, error: "Forbidden." }, 403);
  const token = readSessionCookie(request);
  if (!token) return noStore({ ok: false, error: "Authentication is required." }, 401);
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStore({ ok: false, error: "Authentication is required." }, 401);
    const context = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    const requests = await withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
      const result = await client.query<Record<string, unknown>>(
        "SELECT * FROM public.unibud_workforce_list_invitation_requests($1)",
        [50]
      );
      return result.rows;
    });
    return noStore({ ok: true, requests });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return noStore({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || typeof body.role !== "string" || !ROLES.has(body.role)
      || typeof body.reasonCode !== "string" || !REASON.test(body.reasonCode)) {
    return noStore({ ok: false, error: "Select a valid workforce role and reason." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return noStore({ ok: false, error: "Authentication is required." }, 401);
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStore({ ok: false, error: "Authentication is required." }, 401);
    const context = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    const requestId = await withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
      const result = await client.query<{ request_id: string | null }>(
        "SELECT public.unibud_workforce_request_invitation($1,$2) AS request_id",
        [body.role, body.reasonCode]
      );
      return result.rows[0]?.request_id ?? null;
    });
    if (!requestId) {
      return noStore({
        ok: false,
        error: "The invitation request was not accepted. Verify workforce-request permission and current MFA step-up."
      }, 403);
    }
    return noStore({ ok: true, requestId, state: "pending", expiresInSeconds: 1800 }, 201);
  } catch (error) {
    return routeError(error);
  }
}
