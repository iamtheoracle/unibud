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

function noStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}

export async function GET(request: NextRequest) {
  const token = readSessionCookie(request);
  if (!token) return noStore({ ok: false, error: "Authentication is required." }, 401);
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStore({ ok: false, error: "Authentication is required." }, 401);
    const context = createSignedSessionContextFromEnvironment(validation.account.id, validation.session.id);
    const duties = await withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
      const result = await client.query<Record<string, unknown>>(
        "SELECT * FROM public.unibud_workforce_list_my_duties($1)", [50]
      );
      return result.rows;
    });
    return noStore({ ok: true, duties });
  } catch (error) {
    return routeError(error);
  }
}
