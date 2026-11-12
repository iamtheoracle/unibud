import { NextRequest, NextResponse } from "next/server";
import { FlowPaymentIntentRepository } from "@/lib/server/flow/flow-payment-intent-repository";
import { FlowPinRepository } from "@/lib/server/flow/flow-pin-repository";
import { FlowPinService } from "@/lib/server/flow/flow-pin-service";
import { FlowWebAuthnRepository } from "@/lib/server/flow/flow-webauthn-repository";
import { FlowTransactionAuthorizationService } from "@/lib/server/flow/flow-transaction-authorization-service";
import { getAuthDatabasePool } from "@/lib/server/database/postgres-pool";
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
  const pool = getAuthDatabasePool();
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

export async function GET(request: NextRequest, context: Context) {
  if (!hasSameOrigin(request)) return reply({ ok: false, error: "Forbidden." }, 403);
  try {
    const validation = await validateSession(request);
    if (!validation) return reply({ ok: false, error: "Authentication is required." }, 401);
    const { paymentIntentId } = await context.params;
    if (!validIntentId(paymentIntentId)) return reply({ ok: false, error: "Invalid payment reference." }, 400);
    const confirmation = await createAuthorizationService().getConfirmation({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      paymentIntentId
    });
    if (!confirmation) return reply({ ok: false, error: "Payment instruction is unavailable." }, 404);
    return reply({ ok: true, confirmation });
  } catch (error) {
    if (error instanceof Error && /UNIBUD_(?:FLOW_|DB_)/.test(error.message)) {
      return reply({ ok: false, error: "Flow confirmation details are not configured." }, 503);
    }
    return routeError(error);
  }
}
