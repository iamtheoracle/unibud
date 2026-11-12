import { NextRequest, NextResponse } from "next/server";
import { createSignedAccountContextFromEnvironment, withSignedAccountTransaction } from "../../../lib/server/database/account-context";
import { getAppDatabasePool } from "../../../lib/server/database/postgres-pool";
import { hasSameOrigin, readJsonObject, readSessionCookie, routeError } from "../../../lib/server/identity/http";
import { createConfiguredIdentityServices } from "../../../lib/server/identity/identity-runtime";

async function withVerifiedAccount<T>(request: NextRequest, work: (accountId: string) => Promise<T>) {
  const token = readSessionCookie(request);
  if (!token) return { response: NextResponse.json({ ok: false }, { status: 401 }) };
  const { sessions } = createConfiguredIdentityServices();
  const validation = await sessions.validate(token);
  if (!validation.valid) return { response: NextResponse.json({ ok: false }, { status: 401 }) };
  return { value: await work(validation.account.id) };
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const body = await readJsonObject(request);
  if (!body || typeof body.handle !== "string" || body.handle.length > 32) {
    return NextResponse.json({ ok: false, error: "A valid profile handle is required." }, { status: 400 });
  }

  try {
    const result = await withVerifiedAccount(request, async accountId => {
      const context = createSignedAccountContextFromEnvironment(accountId);
      return withSignedAccountTransaction(getAppDatabasePool(), context, async client => {
        await client.query("SELECT public.account_block_handle($1)", [body.handle]);
        return true;
      });
    });
    if ("response" in result) return result.response;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const body = await readJsonObject(request);
  if (!body || typeof body.handle !== "string" || body.handle.length > 32) {
    return NextResponse.json({ ok: false, error: "A valid profile handle is required." }, { status: 400 });
  }

  try {
    const result = await withVerifiedAccount(request, async accountId => {
      const context = createSignedAccountContextFromEnvironment(accountId);
      return withSignedAccountTransaction(getAppDatabasePool(), context, async client => {
        await client.query("SELECT public.account_unblock_handle($1)", [body.handle]);
        return true;
      });
    });
    if ("response" in result) return result.response;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}
