import { NextRequest, NextResponse } from "next/server";
import { createOperationsMfaAssertionFromEnvironment } from "@/lib/server/operations/operations-mfa-assertions";
import { createOperationsMfaCryptographyFromEnvironment } from "@/lib/server/operations/operations-mfa-core";
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
  if (!body || typeof body.code !== "string"
      || !/^[A-F0-9]{5}(?:-[A-F0-9]{5}){3}$/i.test(body.code)) {
    return noStoreJson({ ok: false, error: "Enter a valid recovery code." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

    const cryptography = createOperationsMfaCryptographyFromEnvironment();
    const digests = cryptography.digestRecoveryCodeCandidates(validation.account.id, body.code).map(digest => digest.toString("hex"));
    const assertion = createOperationsMfaAssertionFromEnvironment({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      purpose: "recovery",
      matchedTotpStep: null,
      ttlSeconds: 60
    });
    const context = createSignedSessionContextFromEnvironment(
      validation.account.id,
      validation.session.id
    );
    const pool = getAppDatabasePool();
    const redeemed = await withSignedSessionTransaction(pool, context, async client => {
      const result = await client.query<{ redeemed: boolean }>(
        "SELECT public.unibud_operator_mfa_redeem_recovery_code_candidates($1::text[],$2,$3,$4,$5) AS redeemed",
        [digests, assertion.issuedAt, assertion.expiresAt, assertion.nonce, assertion.signature]
      );
      return result.rows[0]?.redeemed === true;
    });

    if (!redeemed) {
      const failures = await withSignedSessionTransaction(pool, context, async client => {
        const result = await client.query<{ failures: number | null }>(
          "SELECT public.unibud_operator_mfa_record_failed_attempt() AS failures"
        );
        return result.rows[0]?.failures ?? null;
      });
      return noStoreJson({
        ok: false,
        error: failures !== null && failures >= 10
          ? "Too many recovery attempts. Try again after the security lockout."
          : "The recovery code was not accepted."
      }, failures !== null && failures >= 10 ? 429 : 401);
    }

    return noStoreJson({
      ok: true,
      state: "authenticator_reset",
      next: "password_reauthenticated_enrollment",
      message: "The recovery code was used. Your previous authenticator and all Operations step-up sessions were invalidated. Reauthenticate with your password to enroll a new authenticator."
    });
  } catch (error) {
    const response = routeError(error);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    return response;
  }
}
