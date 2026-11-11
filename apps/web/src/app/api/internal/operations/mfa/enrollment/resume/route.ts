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
  if (!body || (body.channel !== "email" && body.channel !== "phone")
      || typeof body.identifier !== "string" || typeof body.password !== "string"
      || body.identifier.length > 254 || body.password.length > 128) {
    return noStoreJson({ ok: false, error: "Invalid authenticator resume request." }, 400);
  }
  const token = readSessionCookie(request);
  if (!token) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

  try {
    const { authentication, sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return noStoreJson({ ok: false, error: "Authentication is required." }, 401);

    const accepted = await authentication.verifyCredentialsForAccount({
      accountId: validation.account.id,
      channel: body.channel,
      identifier: body.identifier,
      password: body.password
    });
    if (!accepted) return noStoreJson({ ok: false, error: "The sign-in details were not accepted." }, 401);

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
    const encryptedSecret = await withSignedSessionTransaction(
      getAppDatabasePool(),
      context,
      async client => {
        const result = await client.query<{ encrypted_secret: string | null }>(
          "SELECT public.unibud_operator_mfa_read_pending_secret($1,$2,$3,$4) AS encrypted_secret",
          [assertion.issuedAt, assertion.expiresAt, assertion.nonce, assertion.signature]
        );
        return result.rows[0]?.encrypted_secret ?? null;
      }
    );
    if (!encryptedSecret) {
      return noStoreJson({ ok: false, error: "There is no active pending enrollment to resume." }, 409);
    }

    const cryptography = createOperationsMfaCryptographyFromEnvironment();
    const secret = cryptography.decryptSecret(validation.account.id, { ciphertext: encryptedSecret });
    return noStoreJson({
      ok: true,
      state: "pending_confirmation",
      provisioningUri: cryptography.provisioningUri(
        validation.account.id,
        cryptography.encodeSecret(secret)
      )
    });
  } catch (error) {
    const response = routeError(error);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    return response;
  }
}
