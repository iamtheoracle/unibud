import { NextRequest, NextResponse } from "next/server";
import { FlowPinRepository } from "@/lib/server/flow/flow-pin-repository";
import { FlowPinService } from "@/lib/server/flow/flow-pin-service";
import { getFlowAuthDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import {
  hasSameOrigin,
  readJsonObject,
  readSessionCookie,
  routeError
} from "@/lib/server/identity/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

function createPinService(): FlowPinService {
  return new FlowPinService(new FlowPinRepository(getFlowAuthDatabasePool()));
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return reply({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || typeof body.pin !== "string" || body.pin.length > 32) {
    return reply({ ok: false, error: "A transaction PIN is required." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return reply({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return reply({ ok: false, error: "Authentication is required." }, 401);
    const result = await createPinService().verify({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      pin: body.pin
    });
    if (result.state === "verified") {
      // This is deliberately not a reusable payment-authorization proof.
      return reply({ ok: true, pinVerified: true });
    }
    if (result.state === "locked") {
      return reply({ ok: false, error: "Transaction PIN verification is temporarily locked." }, 429);
    }
    if (result.state === "not_enrolled") {
      return reply({ ok: false, error: "A transaction PIN has not been enrolled." }, 409);
    }
    if (result.state === "unavailable") {
      return reply({ ok: false, error: "Transaction PIN verification is temporarily unavailable." }, 503);
    }
    return reply({ ok: false, error: "Transaction PIN is incorrect." }, 401);
  } catch (error) {
    if (error instanceof Error && /UNIBUD_(?:FLOW_|DB_)/.test(error.message)) {
      return reply({ ok: false, error: "Transaction PIN verification is unavailable." }, 503);
    }
    return routeError(error);
  }
}
