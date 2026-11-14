import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { hasSameOrigin, readJsonObject, routeError, setSessionCookie } from "@/lib/server/identity/http";
import {
  consumeWorkforceLoginRateLimit,
  lookupWorkforceLogin,
  recordWorkforceLogin,
  verifyWorkforcePasscode
} from "@/lib/server/workforce/workforce-credentials-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DUMMY_VERIFIER = "scrypt$ln=17,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function noStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" }
  });
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return noStore({ ok: false, error: "Forbidden." }, 403);
  const body = await readJsonObject(request);
  if (!body || typeof body.username !== "string" || body.username.length > 100
      || typeof body.passcode !== "string" || !/^\d{6}$/.test(body.passcode)) {
    return noStore({ ok: false, error: "The sign-in details were not accepted." }, 401);
  }
  const username = body.username.trim().toLowerCase();
  if (!/^ub-(staff|operator|admin)-[a-f0-9]{16}$/.test(username)) {
    return noStore({ ok: false, error: "The sign-in details were not accepted." }, 401);
  }
  const requestId = randomUUID();

  try {
    const authPool = getAuthDatabasePool();
    if (!await consumeWorkforceLoginRateLimit(authPool, username)) {
      return noStore({ ok: false, error: "Too many attempts. Please wait before trying again." }, 429);
    }
    const workforce = await lookupWorkforceLogin(authPool, username);
    const verifier = workforce?.passcodeHash ?? DUMMY_VERIFIER;
    const passcodeValid = await verifyWorkforcePasscode(username, body.passcode, verifier);
    if (!workforce || workforce.accountStatus !== "active"
        || !["mfa_enrollment_required", "active"].includes(workforce.workforceStatus)
        || !passcodeValid) {
      await recordWorkforceLogin(authPool, username, "failure", requestId);
      return noStore({ ok: false, error: "The sign-in details were not accepted." }, 401);
    }

    const { sessions } = createConfiguredIdentityServices();
    const issued = await sessions.issue({ id: workforce.accountId, status: "active" });
    try {
      await recordWorkforceLogin(authPool, username, "success", requestId);
    } catch (error) {
      await sessions.revoke(issued.token, new Date(), "workforce_login_audit_failure");
      throw error;
    }

    const nextStep = workforce.workforceStatus === "mfa_enrollment_required"
      ? "mfa_enrollment_required"
      : "mfa_verification_required";
    const response = noStore({
      ok: true,
      state: nextStep,
      role: username.split("-")[1],
      nextPath: "/operations/security/mfa"
    });
    setSessionCookie(response, issued.token, issued.session.absoluteExpiresAt);
    return response;
  } catch (error) {
    return routeError(error);
  }
}
