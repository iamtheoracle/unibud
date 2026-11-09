import { NextResponse } from "next/server";
import {
  checkOracleArcConnection,
  isIntegrationOperatorRequest
} from "@/lib/server/oracle-arc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const result = await checkOracleArcConnection();
  return NextResponse.json(result, {
    status: 200,
    headers: { "Cache-Control": "no-store" }
  });
}
