import { NextResponse } from "next/server";
import { isIntegrationOperatorRequest } from "@/lib/server/oracle-arc";
import { buildVerificationDeliveryStatus } from "@/lib/server/account/verification-delivery-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Operator-only metadata diagnostic. It deliberately does not call the gateway:
 * the current delivery contract has no documented read-only health operation.
 */
export async function GET(request: Request) {
  if (!isIntegrationOperatorRequest(request.headers.get("authorization"))) {
    return NextResponse.json(
      { error: "Operator authentication is required." },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
          "WWW-Authenticate": "Bearer"
        }
      }
    );
  }

  return NextResponse.json(buildVerificationDeliveryStatus(process.env, process.env.NODE_ENV), {
    headers: { "Cache-Control": "no-store" }
  });
}
