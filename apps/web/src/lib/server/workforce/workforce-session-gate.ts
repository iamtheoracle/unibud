import "server-only";
import {
  createSignedSessionContextFromEnvironment,
  withSignedSessionTransaction
} from "../database/session-context";
import { getAppDatabasePool } from "../database/postgres-pool";

export type WorkforceSessionGate =
  | "not_workforce"
  | "mfa_enrollment_required"
  | "mfa_verification_required"
  | "ready"
  | "blocked";

export async function getWorkforceSessionGate(
  accountId: string,
  sessionId: string
): Promise<WorkforceSessionGate> {
  const context = createSignedSessionContextFromEnvironment(accountId, sessionId);
  const gate = await withSignedSessionTransaction(
    getAppDatabasePool(),
    context,
    async client => {
      const result = await client.query<{ gate: WorkforceSessionGate | null }>(
        "SELECT public.unibud_workforce_get_session_gate() AS gate"
      );
      return result.rows[0]?.gate ?? null;
    }
  );
  if (!gate) throw new Error("Workforce session gate could not be evaluated.");
  return gate;
}
