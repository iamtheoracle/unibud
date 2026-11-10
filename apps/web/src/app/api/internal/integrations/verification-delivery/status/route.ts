import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { readSessionCookie, routeError } from "@/lib/server/identity/http";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_PERMISSION = "integrations.verification_delivery.read";

/**
 * Returns configuration metadata only. It never calls the delivery gateway:
 * no documented read-only health operation has been established.
 */
export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  let actorAccountId: string | null = null;

  try {
    const token = readSessionCookie(request);
    if (!token) {
      await recordAttempt(null, "unauthenticated", requestId);
      return denied(401);
    }

    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) {
      await recordAttempt(null, "unauthenticated", requestId);
      return denied(401);
    }

    actorAccountId = validation.account.id;
    const client = await getAppDatabasePool().connect();
    let allowed = false;
    try {
      const result = await client.query<{ allowed: boolean }>(
        "SELECT public.unibud_operator_has_permission($1, $2) AS allowed",
        [actorAccountId, REQUIRED_PERMISSION]
      );
      allowed = result.rows[0]?.allowed === true;
    } finally {
      client.release();
    }

    await recordAttempt(actorAccountId, allowed ? "allowed" : "denied", requestId);
    if (!allowed) return denied(403);

    const { buildVerificationDeliveryStatus } = await import(
      "@/lib/server/account/verification-delivery-status"
    );
    return NextResponse.json(
      buildVerificationDeliveryStatus(process.env, process.env.NODE_ENV),
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    // Fail closed. Audit failures must not turn into an allow decision.
    try {
      await recordAttempt(actorAccountId, "error", requestId);
    } catch {
      // Do not leak database details or mask the original service failure.
    }
    return routeError(error);
  }
}

async function recordAttempt(
  actorAccountId: string | null,
  outcome: "allowed" | "denied" | "unauthenticated" | "error",
  requestId: string
): Promise<void> {
  const client = await getAppDatabasePool().connect();
  try {
    await client.query(
      "SELECT public.unibud_operator_record_access($1, $2, $3, $4)",
      [actorAccountId, REQUIRED_PERMISSION, outcome, requestId]
    );
  } finally {
    client.release();
  }
}

function denied(status: 401 | 403) {
  return NextResponse.json(
    { error: status === 401 ? "Authentication is required." : "Operations permission is required." },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 401 ? { "WWW-Authenticate": "Session" } : {})
      }
    }
  );
}
