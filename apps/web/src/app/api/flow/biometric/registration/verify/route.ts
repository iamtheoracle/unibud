import { NextRequest, NextResponse } from "next/server";
import { FlowWebAuthnRepository } from "@/lib/server/flow/flow-webauthn-repository";
import { FlowWebAuthnService } from "@/lib/server/flow/flow-webauthn-service";
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

function createWebAuthnService(): FlowWebAuthnService {
  return new FlowWebAuthnService(new FlowWebAuthnRepository(getFlowAuthDatabasePool()));
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return reply({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body ||
      typeof body.registrationId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.registrationId) ||
      typeof body.response !== "object" || body.response === null || Array.isArray(body.response)) {
    return reply({ ok: false, error: "A registration challenge and authenticator response are required." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return reply({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return reply({ ok: false, error: "Authentication is required." }, 401);
    const registered = await createWebAuthnService().verifyRegistration({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      registrationId: body.registrationId,
      response: body.response
    });
    if (!registered) {
      return reply({ ok: false, error: "The authenticator response was invalid, expired or already consumed." }, 401);
    }
    return reply({ ok: true, state: "device_authenticator_registered" }, 201);
  } catch (error) {
    if (error instanceof Error && /UNIBUD_(?:WEBAUTHN_|FLOW_|DB_)/.test(error.message)) {
      return reply({ ok: false, error: "Device authentication verification is not configured." }, 503);
    }
    return routeError(error);
  }
}
