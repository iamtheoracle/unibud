import { NextRequest, NextResponse } from "next/server";
import {
  createSignedSessionContextFromEnvironment,
  withSignedSessionTransaction
} from "@/lib/server/database/session-context";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { readSessionCookie, routeError } from "@/lib/server/identity/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStoreJson(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

export async function GET(request: NextRequest) {
  const token = readSessionCookie(request);
  if (!token) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

    const context = createSignedSessionContextFromEnvironment(
      validation.account.id,
      validation.session.id
    );
    const status = await withSignedSessionTransaction(
      getAppDatabasePool(),
      context,
      async client => {
        const result = await client.query<{ status: Record<string, unknown> }>(
          "SELECT public.unibud_operator_mfa_get_status() AS status"
        );
        return result.rows[0]?.status ?? {
          operator: false,
          credentialState: "none",
          locked: false,
          stepUpExpiresAt: null
        };
      }
    );
    return noStoreJson({ ok: true, status });
  } catch (error) {
    const response = routeError(error);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    return response;
  }
}
