import { notFound } from "next/navigation";
import OperationsMfaClient from "../../operations/security/mfa/operations-mfa-client";

/**
 * Isolated MFA browser-test surface. It is unavailable in production and only
 * renders when the explicit E2E flag is set. Playwright stubs the HTTP boundary;
 * database authorization remains covered by PostgreSQL integration tests.
 */
export default function OperationsMfaBrowserTestPage() {
  if (process.env.NODE_ENV === "production" || process.env.UNIBUD_E2E_TEST_MODE !== "true") {
    notFound();
  }
  return <OperationsMfaClient />;
}
