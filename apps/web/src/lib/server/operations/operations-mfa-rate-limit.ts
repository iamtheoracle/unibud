import "server-only";

import { createSignedSessionContextFromEnvironment, withSignedSessionTransaction } from "@/lib/server/database/session-context";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";

export type OperationsMfaApiAction =
  | "request_create"
  | "request_decide"
  | "request_cancel"
  | "request_read"
  | "notification_read"
  | "audit_read";

/** The database fixes each action's limit and verifies the caller's live grant/MFA step-up. */
export async function consumeOperationsMfaApiRateLimit(
  accountId: string,
  sessionId: string,
  action: OperationsMfaApiAction
): Promise<boolean> {
  const context = createSignedSessionContextFromEnvironment(accountId, sessionId);
  return withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
    const result = await client.query<{ allowed: boolean }>(
      "SELECT public.unibud_operator_mfa_consume_api_rate_limit($1) AS allowed",
      [action]
    );
    return result.rows[0]?.allowed === true;
  });
}
