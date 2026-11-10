import "server-only";

import { getAppDatabasePool } from "../database/postgres-pool";
import { createConfiguredIdentityServices } from "../identity/identity-runtime";
import { readSessionCookie } from "../identity/http";

export type OperationsPermission =
  | "operations.integrations.read"
  | "operations.integrations.manage"
  | "operations.audit.read"
  | "operations.accounts.support";

/**
 * The browser supplies only the opaque HttpOnly session cookie.
 * Account and session identifiers come exclusively from server-side validation.
 * No profile role, request body, header claim or user-supplied account ID is trusted.
 */
export async function authorizeOperationsRequest(
  request: Request,
  permission: OperationsPermission
): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Host-unibud_session"
    : "unibud_session";
  const token = cookieHeader.split(";").map(part => part.trim())
    .find(part => part.startsWith(cookieName + "="))
    ?.slice(cookieName.length + 1);
  if (!token) return false;

  try {
    const services = createConfiguredIdentityServices();
    const validation = await services.sessions.validate(decodeURIComponent(token));
    if (!validation.valid) return false;

    const pool = getAppDatabasePool();
    const client = await pool.connect();
    try {
      const requestId = request.headers.get("x-request-id")?.slice(0, 120) ?? null;
      const result = await client.query<{ allowed: boolean }>(
        "SELECT public.operations_authorize_session($1::uuid, $2::uuid, $3::text, $4::text) AS allowed",
        [validation.account.id, validation.session.id, permission, requestId]
      );
      return result.rows[0]?.allowed === true;
    } finally {
      client.release();
    }
  } catch {
    // Fail closed on missing configuration, database failure, malformed cookie,
    // session errors or an unavailable authorization procedure.
    return false;
  }
}
