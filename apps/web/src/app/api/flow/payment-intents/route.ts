import { NextRequest, NextResponse } from "next/server";
import { createFlowDataProtectionFromEnvironment } from "@/lib/server/flow/flow-crypto";
import { FlowPaymentIntentRepository } from "@/lib/server/flow/flow-payment-intent-repository";
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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]{0,15})(?:\.[0-9]{1,4})?$/;
const CURRENCY = /^[A-Z]{3}$/;
const PURPOSE = /^[a-z][a-z0-9_]{1,47}$/;

function response(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return response({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body ||
      typeof body.flowAccountId !== "string" || !UUID.test(body.flowAccountId) ||
      typeof body.recipientReference !== "string" ||
      body.recipientReference.length < 1 || Buffer.byteLength(body.recipientReference, "utf8") > 1024 ||
      body.recipientReference.trim() !== body.recipientReference ||
      typeof body.amount !== "string" || !DECIMAL.test(body.amount) || Number(body.amount) <= 0 ||
      typeof body.currency !== "string" || !CURRENCY.test(body.currency) ||
      (body.feeAmount !== undefined &&
        (typeof body.feeAmount !== "string" || !DECIMAL.test(body.feeAmount))) ||
      typeof body.purposeCode !== "string" || !PURPOSE.test(body.purposeCode) ||
      typeof body.idempotencyKey !== "string") {
    return response({ ok: false, error: "Payment instruction details are invalid." }, 400);
  }

  const token = readSessionCookie(request);
  if (!token) return response({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return response({ ok: false, error: "Authentication is required." }, 401);

    const protection = createFlowDataProtectionFromEnvironment();
    const protectedRecipient = protection.protectRecipientReference(
      validation.account.id,
      body.flowAccountId,
      body.recipientReference
    );
    const idempotencyKeyDigest = protection.digestIdempotencyKey(body.idempotencyKey);
    const repository = new FlowPaymentIntentRepository(getAppDatabasePool());
    const paymentIntent = await repository.create({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      flowAccountId: body.flowAccountId,
      idempotencyKeyDigest,
      recipientCiphertext: protectedRecipient.ciphertext,
      recipientLookupDigest: protectedRecipient.lookupDigest,
      amount: body.amount,
      currency: body.currency,
      feeAmount: typeof body.feeAmount === "string" ? body.feeAmount : "0",
      purposeCode: body.purposeCode
    });

    if (!paymentIntent) {
      return response({
        ok: false,
        error: "The Flow account is unavailable or the idempotency key was already used with different details."
      }, 409);
    }

    return response({
      ok: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status
      }
    });
  } catch (error) {
    return routeError(error);
  }
}
