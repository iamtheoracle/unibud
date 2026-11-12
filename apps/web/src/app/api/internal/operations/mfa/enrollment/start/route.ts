import { NextRequest, NextResponse } from "next/server";
import { createOperationsMfaAssertionFromEnvironment } from "@/lib/server/operations/operations-mfa-assertions";
import { createOperationsMfaCryptographyFromEnvironment } from "@/lib/server/operations/operations-mfa-core";
import { createSignedSessionContextFromEnvironment, withSignedSessionTransaction } from "@/lib/server/database/session-context";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { hasSameOrigin, readJsonObject, readSessionCookie, routeError } from "@/lib/server/identity/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return noStoreJson({ ok: false, error: "Forbidden." }, 403);
  }
  const body = await readJsonObject(request);
  if (!body || (body.channel !== "email" && body.channel !== "phone")
      || typeof body.identifier !== "string" || typeof body.password !== "string"
      || body.identifier.length > 254 || body.password.length > 128) {
    return noStoreJson({ ok: false, error: "Invalid authenticator enrollment request." }, 400);
  }

  const token = readSessionCookie(request);
  if (!token) {
    return noStoreJson({ ok: false, error: "Authentication is required." }, 401);
  }

  try {
    const { authentication, sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) {
      return NextResponse.json({ ok: false, error: "Authentication is required." }, { status: 401 });
    }

    // Reauthenticate the current account's password without creating or rotating a session.
    const passwordVerified = await authentication.verifyCredentialsForAccount({
      accountId: validation.account.id,
      channel: body.channel,
      identifier: body.identifier,
      password: body.password
    });
    if (!passwordVerified) {
      return noStoreJson({ ok: false, error: "The sign-in details were not accepted." }, 401);
    }

    const cryptography = createOperationsMfaCryptographyFromEnvironment();
    const seed = cryptography.generateSecret();
    const secretBase32 = cryptography.encodeSecret(seed);
    const encrypted = cryptography.encryptSecret(validation.account.id, seed);
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

    const started = await withSignedSessionTransaction(
      getAppDatabasePool(),
      context,
      async (client) => {
        const result = await client.query<{ started: boolean }>(
          "SELECT public.unibud_operator_mfa_begin_enrollment($1,$2,$3,$4,$5) AS started",
          [
            encrypted.ciphertext,
            assertion.issuedAt,
            assertion.expiresAt,
            assertion.nonce,
            assertion.signature
          ]
        );
        return result.rows[0]?.started === true;
      }
    );

    if (!started) {
      return noStoreJson(
        { ok: false, error: "Authenticator enrollment is unavailable for this account." },
        403
      );
    }

    return noStoreJson({
      ok: true,
      state: "pending_confirmation",
      provisioningUri: cryptography.provisioningUri(validation.account.id, secretBase32)
    });
  } catch (error) {
    const response = routeError(error);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    return response;
  }
}

function noStoreJson(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}
