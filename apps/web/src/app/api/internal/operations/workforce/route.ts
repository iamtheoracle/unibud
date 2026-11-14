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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

function noStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

export async function GET(request: NextRequest) {
  const token = readSessionCookie(request);
  if (!token) return noStore({ ok: false, error: "Authentication is required." }, 401);
  const params = request.nextUrl.searchParams;
  const workforceId = params.get("workforceId");
  const limit = params.has("limit") ? Number(params.get("limit")) : 50;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100
      || (workforceId !== null && !UUID.test(workforceId))) {
    return noStore({ ok: false, error: "Invalid workforce query." }, 400);
  }
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStore({ ok: false, error: "Authentication is required." }, 401);
    const context = createSignedSessionContextFromEnvironment(
      validation.account.id, validation.session.id
    );
    const data = await withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
      const access = await client.query<{ allowed: boolean }>(
        "SELECT (public.unibud_operator_has_permission('operations.workforce.read') OR public.unibud_operator_has_permission('operations.workforce.approve')) AS allowed"
      );
      if (access.rows[0]?.allowed !== true) return null;
      if (workforceId) {
        const activity = await client.query<Record<string, unknown>>(
          "SELECT * FROM public.unibud_workforce_list_activity($1,$2)",
          [workforceId, limit]
        );
        const duties = await client.query<Record<string, unknown>>(
          "SELECT * FROM public.unibud_workforce_list_duties($1,$2)",
          [workforceId, limit]
        );
        return { activity: activity.rows, duties: duties.rows };
      }
      const directory = await client.query<Record<string, unknown>>(
        "SELECT * FROM public.unibud_workforce_list_directory($1)",
        [limit]
      );
      const requests = await client.query<Record<string, unknown>>(
        "SELECT * FROM public.unibud_workforce_list_invitation_requests($1)",
        [limit]
      );
      const metrics = await client.query<{ metrics: Record<string, number> | null }>(
        "SELECT public.unibud_workforce_get_metrics() AS metrics"
      );
      return { directory: directory.rows, pendingInvitations: requests.rows, metrics: metrics.rows[0]?.metrics ?? null };
    });
    if (!data) return noStore({ ok: false, error: "Workforce directory access is not assigned to this account." }, 403);
    return noStore({ ok: true, ...data });
  } catch (error) {
    return routeError(error);
  }
}
