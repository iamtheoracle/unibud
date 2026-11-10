import { NextResponse } from "next/server";
import { authorizeOperationsRequest } from "@/lib/server/operations/operations-authorization";
import { buildVerificationDeliveryStatus } from "@/lib/server/account/verification-delivery-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Operator-only metadata diagnostic. It deliberately does not call the gateway:
 * the current delivery contract has no documented read-only health operation.
 */
export async function GET(request: Request) {
  if (!(await authorizeOperationsRequest(request, "operations.integrations.read"))) {
    return NextResponse.json(
      { error: "Operator authentication is required." },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        }
      }
    );
  }

  return NextResponse.json(buildVerificationDeliveryStatus(process.env, process.env.NODE_ENV), {
    headers: { "Cache-Control": "no-store" }
  });
}
