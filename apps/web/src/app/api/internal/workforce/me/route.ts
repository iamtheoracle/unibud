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
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

export async function GET(request: NextRequest) {
  const token = readSessionCookie(request);
  if (!token) return noStore({ ok: false, error: "Authentication is required." }, 401);
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStore({ ok: false, error: "Authentication is required." }, 401);
    const context = createSignedSessionContextFromEnvironment(
      validation.account.id, validation.session.id
    );
    const workforce = await withSignedSessionTransaction(
      getAppDatabasePool(), context,
      async client => {
        const result = await client.query<{ workforce: Record<string, unknown> | null }>(
          "SELECT public.unibud_workforce_get_self() AS workforce"
        );
        const workforce = result.rows[0]?.workforce ?? null;
        if (!workforce) return null;
        const duties = await client.query<Record<string, unknown>>(
          "SELECT * FROM public.unibud_workforce_list_my_duties($1)", [50]
        );
        return { workforce, duties: duties.rows };
      }
    );
    if (!workforce) {
      return noStore({
        ok: false,
        error: "Workforce access is unavailable until email verification, MFA enrollment and session verification are complete."
      }, 403);
    }
    return noStore({ ok: true, workforce: workforce.workforce, duties: workforce.duties });
  } catch (error) {
    return routeError(error);
  }
}
