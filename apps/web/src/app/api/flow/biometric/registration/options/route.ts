import { NextRequest, NextResponse } from "next/server";
import { FlowWebAuthnRepository } from "@/lib/server/flow/flow-webauthn-repository";
import { FlowWebAuthnService } from "@/lib/server/flow/flow-webauthn-service";
import { getAuthDatabasePool } from "@/lib/server/database/postgres-pool";
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
  return new FlowWebAuthnService(new FlowWebAuthnRepository(getAppDatabasePool()));
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return reply({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body ||
      (body.channel !== "email" && body.channel !== "phone") ||
      typeof body.identifier !== "string" ||
      typeof body.password !== "string") {
    return reply({ ok: false, error: "Password reauthentication is required to register a device authenticator." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return reply({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { sessions, authentication } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return reply({ ok: false, error: "Authentication is required." }, 401);
    const reauthenticated = await authentication.verifyCredentialsForAccount({
      accountId: validation.account.id,
      channel: body.channel,
      identifier: body.identifier,
      password: body.password
    });
    if (!reauthenticated) {
      return reply({ ok: false, error: "Account password reauthentication failed." }, 401);
    }
    const registration = await createWebAuthnService().createRegistrationOptions({
      accountId: validation.account.id,
      sessionId: validation.session.id
    });
    return reply({
      ok: true,
      registrationId: registration.registrationId,
      options: registration.options
    }, 201);
  } catch (error) {
    if (error instanceof Error && /UNIBUD_(?:WEBAUTHN_|FLOW_|DB_)/.test(error.message)) {
      return reply({ ok: false, error: "Device authentication registration is not configured." }, 503);
    }
    if (error instanceof Error && /registration challenge could not be created/i.test(error.message)) {
      return reply({ ok: false, error: "A registration challenge is already active or the security rate limit was reached." }, 429);
    }
    return routeError(error);
  }
}
