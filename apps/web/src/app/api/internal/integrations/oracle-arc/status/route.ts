import { NextResponse } from "next/server";
import { authorizeOperationsRequest } from "@/lib/server/operations/operations-authorization";
import { checkOracleArcConnection } from "@/lib/server/oracle-arc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const result = await checkOracleArcConnection();
  return NextResponse.json(result, {
    status: 200,
    headers: { "Cache-Control": "no-store" }
  });
}
