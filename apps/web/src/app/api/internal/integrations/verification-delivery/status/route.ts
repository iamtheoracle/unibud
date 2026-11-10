import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { readSessionCookie, routeError } from "@/lib/server/identity/http";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
import {
  createSignedAccountContextFromEnvironment,
  withSignedAccountTransaction
} from "@/lib/server/database/account-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_PERMISSION = "integrations.verification_delivery.read";

/**
 * Returns configuration metadata only. It never calls the delivery gateway:
 * no documented read-only health operation has been established.
 */
export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  let authenticatedAccountId: string | null = null;

  try {
    const token = readSessionCookie(request);
    if (!token) {
      await recordUnauthenticated(requestId);
      return denied(401);
    }

    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) {
      await recordUnauthenticated(requestId);
      return denied(401);
    }

    // The account ID is obtained only from the validated server-side session.
    // The database independently verifies its HMAC-bound transaction context.
    authenticatedAccountId = validation.account.id;
    const context = createSignedAccountContextFromEnvironment(authenticatedAccountId);
    const allowed = await withSignedAccountTransaction(
      getAppDatabasePool(),
      context,
      async (client) => {
        const result = await client.query<{ allowed: boolean }>(
          "SELECT public.unibud_operator_has_permission($1) AS allowed",
          [REQUIRED_PERMISSION]
        );
        const permitted = result.rows[0]?.allowed === true;
        await client.query(
          "SELECT public.unibud_operator_record_access($1, $2, $3)",
          [REQUIRED_PERMISSION, permitted ? "allowed" : "denied", requestId]
        );
        return permitted;
      }
    );

    if (!allowed) return denied(403);

    const { buildVerificationDeliveryStatus } = await import(
      "@/lib/server/account/verification-delivery-status"
    );
    return NextResponse.json(
      buildVerificationDeliveryStatus(process.env, process.env.NODE_ENV),
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    // Preserve error audit coverage, but only with a fresh signed context from
    // the account already obtained from the validated session.
    if (authenticatedAccountId) {
      try {
        await recordAuthenticatedError(authenticatedAccountId, requestId);
      } catch {
        // Fail closed and preserve the original request failure.
      }
    }
    return routeError(error);
  }
}

async function recordAuthenticatedError(accountId: string, requestId: string): Promise<void> {
  const context = createSignedAccountContextFromEnvironment(accountId);
  await withSignedAccountTransaction(getAppDatabasePool(), context, async (client) => {
    await client.query(
      "SELECT public.unibud_operator_record_access($1, $2, $3)",
      [REQUIRED_PERMISSION, "error", requestId]
    );
  });
}

async function recordUnauthenticated(requestId: string): Promise<void> {
  const client = await getAppDatabasePool().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "SELECT public.unibud_operator_record_access($1, $2, $3)",
      [REQUIRED_PERMISSION, "unauthenticated", requestId]
    );
    await client.query("COMMIT");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original audit failure.
    }
    throw error;
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
