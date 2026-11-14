import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { IdentifierProtector } from "@/lib/server/auth/auth-rpc-repository-core";
import { getAuthDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { hasSameOrigin, readJsonObject, routeError } from "@/lib/server/identity/http";
import {
  assertWorkforceKeySeparation,
  hashWorkforcePasscode,
  workforceActivationDigest
} from "@/lib/server/workforce/workforce-credentials-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

function readKey(name: string, exact = false): Buffer {
  const value = process.env[name]?.trim() ?? "";
  if (!/^(?:[0-9a-f]{2}){32,}$/i.test(value) || (exact && value.length !== 64)) {
    throw new Error(name + " is not configured with valid key material.");
  }
  return Buffer.from(value, "hex");
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return noStore({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body
      || typeof body.username !== "string"
      || !/^ub-(staff|operator|admin)-[a-f0-9]{16}$/.test(body.username)
      || typeof body.activationCode !== "string" || !/^\d{6}$/.test(body.activationCode)
      || typeof body.firstName !== "string" || body.firstName.trim().length < 1 || body.firstName.length > 80
      || typeof body.lastName !== "string" || body.lastName.trim().length < 1 || body.lastName.length > 80
      || typeof body.email !== "string" || body.email.length > 254
      || typeof body.passcode !== "string" || !/^\d{6}$/.test(body.passcode)
      || body.passcode !== body.confirmPasscode) {
    return noStore({ ok: false, error: "Complete every required activation field with valid details." }, 400);
  }

  const username = body.username;
  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return noStore({ ok: false, error: "Enter a valid email address." }, 400);
  }

  try {
    assertWorkforceKeySeparation();
    const identityId = randomUUID();
    const activationDigest = workforceActivationDigest(username, body.activationCode);
    const passcodeHash = await hashWorkforcePasscode(username, body.passcode);
    const protector = new IdentifierProtector(
      readKey("UNIBUD_IDENTITY_ENCRYPTION_KEY", true),
      readKey("UNIBUD_IDENTITY_LOOKUP_HMAC_KEY")
    );
    const protectedEmail = protector.protect(email, "email");
    const pool = getAuthDatabasePool();
    const client = await pool.connect();
    let activated: { account_id: string; identity_id: string } | null = null;
    try {
      const result = await client.query<{ account_id: string; identity_id: string }>(
        "SELECT * FROM public.unibud_workforce_activate($1,$2,$3,$4,$5,$6,$7,$8)",
        [
          username, activationDigest, body.firstName.trim(), body.lastName.trim(),
          identityId, protectedEmail.ciphertext, protectedEmail.lookupDigest, passcodeHash
        ]
      );
      activated = result.rows[0] ?? null;
    } finally {
      client.release();
    }
    if (!activated) {
      return noStore({ ok: false, error: "The activation details were not accepted or have expired." }, 400);
    }

    const { verification } = createConfiguredIdentityServices();
    const challenge = await verification.issue({
      accountId: activated.account_id,
      identityId: activated.identity_id,
      channel: "email",
      purpose: "email_verification",
      destination: email
    });
    return noStore({
      ok: true,
      state: "email_verification_required",
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt
    }, 202);
  } catch (error) {
    return routeError(error);
  }
}
