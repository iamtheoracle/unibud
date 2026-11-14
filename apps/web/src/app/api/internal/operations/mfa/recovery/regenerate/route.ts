import { NextRequest, NextResponse } from "next/server";
import { createOperationsMfaAssertionFromEnvironment } from "@/lib/server/operations/operations-mfa-assertions";
import { createOperationsMfaCryptographyFromEnvironment } from "@/lib/server/operations/operations-mfa-core";
import {
  createSignedSessionContextFromEnvironment,
  withSignedSessionTransaction
} from "@/lib/server/database/session-context";
import { getAppDatabasePool, getAuthDatabasePool } from "@/lib/server/database/postgres-pool";
import { verifyWorkforcePasscodeForAccount } from "@/lib/server/workforce/workforce-credentials-core";
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
  if (!body) {
    return noStoreJson({ ok: false, error: "Invalid recovery-code regeneration request." }, 400);
  }
  const workforceReauthentication =
    typeof body.username === "string" && /^ub-(staff|operator|admin)-[a-f0-9]{16}$/.test(body.username)
    && typeof body.passcode === "string" && /^\\d{6}$/.test(body.passcode);
  const accountReauthentication =
    (body.channel === "email" || body.channel === "phone")
    && typeof body.identifier === "string" && body.identifier.length <= 254
    && typeof body.password === "string" && body.password.length > 0 && body.password.length <= 128;
  if (!workforceReauthentication && !accountReauthentication) {
    return noStoreJson({ ok: false, error: "Invalid recovery-code regeneration request." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { authentication, sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

    const passwordVerified = workforceReauthentication
      ? await verifyWorkforcePasscodeForAccount({
          pool: getAuthDatabasePool(),
          accountId: validation.account.id,
          username: body.username as string,
          passcode: body.passcode as string
        })
      : await authentication.verifyCredentialsForAccount({
          accountId: validation.account.id,
          channel: body.channel as "email" | "phone",
          identifier: body.identifier as string,
          password: body.password as string
        });
    if (!passwordVerified) return noStoreJson({ ok: false, error: "The sign-in details were not accepted." }, 401);

    const cryptography = createOperationsMfaCryptographyFromEnvironment();
    const recoveryCodes = cryptography.generateRecoveryCodes(10);
    const recoveryDigests = recoveryCodes.map(code =>
      cryptography.digestRecoveryCode(validation.account.id, code).toString("hex")
    );
    const assertion = createOperationsMfaAssertionFromEnvironment({
      accountId: validation.account.id,
      sessionId: validation.session.id,
      purpose: "password_reauth",
      matchedTotpStep: null,
      ttlSeconds: 60
    });
    const context = createSignedSessionContextFromEnvironment(
      validation.account.id,
      validation.session.id
    );
    const regenerated = await withSignedSessionTransaction(
      getAppDatabasePool(),
      context,
      async client => {
        const result = await client.query<{ regenerated: boolean }>(
          "SELECT public.unibud_operator_mfa_regenerate_recovery_codes($1,$2,$3,$4,$5::text[]) AS regenerated",
          [assertion.issuedAt, assertion.expiresAt, assertion.nonce, assertion.signature, recoveryDigests]
        );
        return result.rows[0]?.regenerated === true;
      }
    );
    if (!regenerated) {
      return noStoreJson({
        ok: false,
        error: "Recovery codes can be regenerated only after a fresh authenticator challenge in this session."
      }, 403);
    }

    return noStoreJson({
      ok: true,
      recoveryCodes,
      recoveryCodesShownOnce: true,
      message: "Your previous recovery codes are invalid. Save this new set now."
    });
  } catch (error) {
    const response = routeError(error);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    return response;
  }
}
