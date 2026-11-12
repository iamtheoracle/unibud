import { NextRequest, NextResponse } from "next/server";
import { FlowPaymentIntentRepository } from "@/lib/server/flow/flow-payment-intent-repository";
import { FlowPinRepository } from "@/lib/server/flow/flow-pin-repository";
import { FlowPinService } from "@/lib/server/flow/flow-pin-service";
import { FlowWebAuthnRepository } from "@/lib/server/flow/flow-webauthn-repository";
import { FlowTransactionAuthorizationService } from "@/lib/server/flow/flow-transaction-authorization-service";
import { getFlowAuthDatabasePool } from "@/lib/server/database/postgres-pool";
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
  const pool = getFlowAuthDatabasePool();
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

export async function POST(request: NextRequest, context: Context) {
  if (!hasSameOrigin(request)) return reply({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || typeof body.pin !== "string" ||
      typeof body.confirmationDigest !== "string" ||
      !/^[0-9a-f]{64}$/i.test(body.confirmationDigest)) {
    return reply({ ok: false, error: "Transaction PIN and confirmation digest are required." }, 400);
  }
  try {
    const validation = await validateSession(request);
    if (!validation) return reply({ ok: false, error: "Authentication is required." }, 401);
    const { paymentIntentId } = await context.params;
    if (!validIntentId(paymentIntentId)) return reply({ ok: false, error: "Invalid payment reference." }, 400);
    const result = await createAuthorizationService().authorizeWithPin({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      paymentIntentId,
      confirmationDigest: body.confirmationDigest,
      pin: body.pin
    });
    switch (result.state) {
      case "authorized":
        return reply({ ok: true, state: "authorized", paymentIntentId: result.paymentIntentId });
      case "invalid_pin":
        return reply({ ok: false, error: "Transaction PIN is incorrect." }, 401);
      case "pin_locked":
        return reply({ ok: false, error: "Transaction PIN is temporarily locked.", lockedUntil: result.lockedUntil }, 429);
      case "pin_not_enrolled":
        return reply({ ok: false, error: "A transaction PIN has not been enrolled." }, 409);
      case "details_changed":
        return reply({ ok: false, error: "Payment details changed. Review the latest confirmation before retrying." }, 409);
      case "intent_unavailable":
        return reply({ ok: false, error: "Payment instruction is unavailable." }, 404);
      case "challenge_unavailable":
        return reply({ ok: false, error: "Authorization challenge is unavailable or rate limited." }, 429);
      default:
        return reply({ ok: false, error: "Transaction authorization is temporarily unavailable." }, 503);
    }
  } catch (error) {
    if (error instanceof Error && /UNIBUD_(?:FLOW_|DB_)/.test(error.message)) {
      return reply({ ok: false, error: "Transaction authorization is not configured." }, 503);
    }
    return routeError(error);
  }
}
