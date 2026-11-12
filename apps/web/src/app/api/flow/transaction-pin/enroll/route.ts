import { NextRequest, NextResponse } from "next/server";
import { FlowPinRepository } from "@/lib/server/flow/flow-pin-repository";
import { FlowPinService } from "@/lib/server/flow/flow-pin-service";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
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
  return new FlowPinService(new FlowPinRepository(getAppDatabasePool()));
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return reply({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || typeof body.pin !== "string" ||
      typeof body.confirmation !== "string") {
    return reply({ ok: false, error: "A transaction PIN and confirmation are required." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return reply({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return reply({ ok: false, error: "Authentication is required." }, 401);
    const enrolled = await createPinService().enroll({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      pin: body.pin,
      confirmation: body.confirmation
    });
    if (!enrolled) return reply({
      ok: false,
      error: "PIN enrollment is unavailable. A PIN may already be enrolled or the security limit may have been reached."
    }, 409);
    return reply({ ok: true, state: "pin_enrolled" }, 201);
  } catch (error) {
    if (error instanceof Error && /transaction PIN|UNIBUD_(?:FLOW_|DB_)/i.test(error.message)) {
      return reply({ ok: false, error: "The PIN request could not be completed." }, 400);
    }
    return routeError(error);
  }
}
