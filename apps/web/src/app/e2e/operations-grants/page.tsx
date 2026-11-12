import { notFound } from "next/navigation";
import OperationsGrantsClient from "../../operations/grants/operations-grants-client";

/** Isolated grant-console browser fixture; never available in production. */
export default function OperationsGrantsBrowserTestPage() {
  if (process.env.NODE_ENV === "production" || process.env.UNIBUD_E2E_TEST_MODE !== "true") {
    notFound();
  }
  return <OperationsGrantsClient />;
}
