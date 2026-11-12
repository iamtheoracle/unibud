import { NextRequest, NextResponse } from "next/server";
import { FlowPaymentIntentRepository } from "@/lib/server/flow/flow-payment-intent-repository";
import { FlowPinRepository } from "@/lib/server/flow/flow-pin-repository";
import { FlowPinService } from "@/lib/server/flow/flow-pin-service";
import { FlowWebAuthnRepository } from "@/lib/server/flow/flow-webauthn-repository";
import { FlowTransactionAuthorizationService } from "@/lib/server/flow/flow-transaction-authorization-service";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import {
  hasSameOrigin,
  readJsonObject,
  readSessionCookie,
  routeError
} from "@/lib/server/identity/http";

type Context = { params: Promise<{ paymentIntentId: string }> };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

function createAuthorizationService(): FlowTransactionAuthorizationService {
  const pool = getAppDatabasePool();
  return new FlowTransactionAuthorizationService({
    payments: new FlowPaymentIntentRepository(pool),
    pins: new FlowPinService(new FlowPinRepository(pool)),
    webAuthn: new FlowWebAuthnRepository(pool)
  });
}

async function validateSession(request: NextRequest) {
  const token = readSessionCookie(request);
  if (!token) return null;
  const { sessions } = createConfiguredIdentityServices();
  const validation = await sessions.validate(token);
  return validation.valid ? validation : null;
}

function validIntentId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return reply({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || typeof body.authorizationId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.authorizationId) ||
      typeof body.response !== "object" || body.response === null || Array.isArray(body.response)) {
    return reply({ ok: false, error: "Authorization challenge and authenticator response are required." }, 400);
  }
  try {
    const validation = await validateSession(request);
    if (!validation) return reply({ ok: false, error: "Authentication is required." }, 401);
    const result = await createAuthorizationService().authorizeWithWebAuthn({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      authorizationId: body.authorizationId,
      response: body.response
    });
    if (result.state === "authorized") {
      return reply({ ok: true, state: "authorized", paymentIntentId: result.paymentIntentId });
    }
    if (result.state === "challenge_unavailable") return reply({ ok: false, error: "Authorization challenge expired or was already consumed." }, 409);
    if (result.state === "invalid_authenticator") return reply({ ok: false, error: "Device authenticator verification failed." }, 401);
    return reply({ ok: false, error: "WebAuthn transaction authorization is temporarily unavailable." }, 503);
  } catch (error) {
    if (error instanceof Error && /UNIBUD_(?:WEBAUTHN_|FLOW_|DB_)/.test(error.message)) {
      return reply({ ok: false, error: "WebAuthn transaction authorization is not configured." }, 503);
    }
    return routeError(error);
  }
}
