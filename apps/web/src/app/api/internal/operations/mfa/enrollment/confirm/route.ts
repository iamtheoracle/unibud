import { NextRequest, NextResponse } from "next/server";
import { createOperationsMfaAssertionFromEnvironment } from "@/lib/server/operations/operations-mfa-assertions";
import {
  createOperationsMfaCryptographyFromEnvironment,
  verifyTotpCode
} from "@/lib/server/operations/operations-mfa-core";
import {
  createSignedSessionContextFromEnvironment,
  withSignedSessionTransaction
} from "@/lib/server/database/session-context";
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

function noStoreJson(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return noStoreJson({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || typeof body.code !== "string" || !/^\d{6}$/.test(body.code)) {
    return noStoreJson({ ok: false, error: "Enter the six-digit authenticator code." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

    const context = createSignedSessionContextFromEnvironment(
      validation.account.id,
      validation.session.id
    );
    const pool = getAppDatabasePool();
    const encryptedSecret = await withSignedSessionTransaction(pool, context, async client => {
      const result = await client.query<{ encrypted_secret: string | null }>(
        "SELECT public.unibud_operator_mfa_read_encrypted_secret() AS encrypted_secret"
      );
      return result.rows[0]?.encrypted_secret ?? null;
    });
    if (!encryptedSecret) {
      return noStoreJson({ ok: false, error: "Authenticator enrollment is unavailable or expired." }, 409);
    }

    const cryptography = createOperationsMfaCryptographyFromEnvironment();
    const secret = cryptography.decryptSecret(validation.account.id, { ciphertext: encryptedSecret });
    const verified = verifyTotpCode(secret, body.code, Date.now());
    if (!verified) {
      const failures = await withSignedSessionTransaction(pool, context, async client => {
        const result = await client.query<{ failures: number | null }>(
          "SELECT public.unibud_operator_mfa_record_failed_attempt() AS failures"
        );
        return result.rows[0]?.failures ?? null;
      });
      return noStoreJson({
        ok: false,
        error: failures !== null && failures >= 10
          ? "Too many authenticator attempts. Try again after the security lockout."
          : "The authenticator code was not accepted."
      }, failures !== null && failures >= 10 ? 429 : 401);
    }

    const recoveryCodes = cryptography.generateRecoveryCodes(10);
    const recoveryDigests = recoveryCodes.map(code =>
      cryptography.digestRecoveryCode(validation.account.id, code).toString("hex")
    );
    const assertion = createOperationsMfaAssertionFromEnvironment({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      purpose: "enrollment_confirm",
      matchedTotpStep: verified.acceptedStep,
      ttlSeconds: 60
    });
    const activated = await withSignedSessionTransaction(pool, context, async client => {
      const result = await client.query<{ activated: boolean }>(
        "SELECT public.unibud_operator_mfa_confirm_enrollment($1,$2,$3,$4,$5,$6::text[]) AS activated",
        [
          assertion.issuedAt,
          assertion.expiresAt,
          assertion.nonce,
          verified.acceptedStep,
          assertion.signature,
          recoveryDigests
        ]
      );
      return result.rows[0]?.activated === true;
    });

    if (!activated) {
      return noStoreJson({
        ok: false,
        error: "Authenticator enrollment could not be confirmed. Start a new enrollment if the pending setup has expired."
      }, 409);
    }

    return noStoreJson({
      ok: true,
      state: "active",
      recoveryCodes,
      recoveryCodesShownOnce: true,
      message: "Save these recovery codes now. They cannot be displayed again."
    });
  } catch (error) {
    const response = routeError(error);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    return response;
  }
}
