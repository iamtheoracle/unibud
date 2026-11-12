import { NextRequest, NextResponse } from "next/server";
import { createSignedAccountContextFromEnvironment, withSignedAccountTransaction } from "../../../lib/server/database/account-context";
import { getAppDatabasePool } from "../../../lib/server/database/postgres-pool";
import { hasSameOrigin, readJsonObject, readSessionCookie, routeError } from "../../../lib/server/identity/http";
import { createConfiguredIdentityServices } from "../../../lib/server/identity/identity-runtime";

async function withVerifiedAccount<T>(request: NextRequest, work: (accountId: string, activeProfileId: string) => Promise<T>) {
  const token = readSessionCookie(request);
  if (!token) return { response: NextResponse.json({ ok: false }, { status: 401 }) };
  const { sessions } = createConfiguredIdentityServices();
  const validation = await sessions.validate(token);
  if (!validation.valid) return { response: NextResponse.json({ ok: false }, { status: 401 }) };
  if (!validation.session.activeProfileId) {
    return { response: NextResponse.json({ ok: false, error: "Choose an active profile before changing block settings." }, { status: 409 }) };
  }
  return { value: await work(validation.account.id, validation.session.activeProfileId) };
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const body = await readJsonObject(request);
  if (!body || typeof body.handle !== "string" || body.handle.length > 32) {
    return NextResponse.json({ ok: false, error: "A valid profile handle is required." }, { status: 400 });
  }

  try {
    const result = await withVerifiedAccount(request, async (accountId, activeProfileId) => {
      const context = createSignedAccountContextFromEnvironment(accountId);
      return withSignedAccountTransaction(getAppDatabasePool(), context, async client => {
        const profile = await client.query<{ allowed: boolean }>(
          "SELECT public.profile_authorize_action($1, unibud_private.current_account_id(), 'profile.read') AS allowed",
          [activeProfileId]
        );
        if (profile.rows[0]?.allowed !== true) return { status: "profile_denied" as const };
        const budget = await client.query<{ allowed: boolean }>(
          "SELECT public.account_block_consume_rate_limit() AS allowed"
        );
        if (budget.rows[0]?.allowed !== true) return { status: "rate_limited" as const };
        const result = await client.query<{ changed: boolean }>(
          "SELECT public.account_block_handle($1) AS changed",
          [body.handle]
        );
        return { status: result.rows[0]?.changed === true ? "changed" as const : "not_changed" as const };
      });
    });
    if ("response" in result) return result.response;
    if (result.value.status === "rate_limited") {
      return NextResponse.json({ ok: false, error: "Too many block changes. Please wait a minute and try again." }, { status: 429 });
    }
    if (result.value.status !== "changed") {
      return NextResponse.json({ ok: false, error: "The block change could not be applied." }, { status: 409 });
    }
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
    const result = await withVerifiedAccount(request, async (accountId, activeProfileId) => {
      const context = createSignedAccountContextFromEnvironment(accountId);
      return withSignedAccountTransaction(getAppDatabasePool(), context, async client => {
        const profile = await client.query<{ allowed: boolean }>(
          "SELECT public.profile_authorize_action($1, unibud_private.current_account_id(), 'profile.read') AS allowed",
          [activeProfileId]
        );
        if (profile.rows[0]?.allowed !== true) return { status: "profile_denied" as const };
        const budget = await client.query<{ allowed: boolean }>(
          "SELECT public.account_block_consume_rate_limit() AS allowed"
        );
        if (budget.rows[0]?.allowed !== true) return { status: "rate_limited" as const };
        const result = await client.query<{ changed: boolean }>(
          "SELECT public.account_unblock_handle($1) AS changed",
          [body.handle]
        );
        return { status: result.rows[0]?.changed === true ? "changed" as const : "not_changed" as const };
      });
    });
    if ("response" in result) return result.response;
    if (result.value.status === "rate_limited") {
      return NextResponse.json({ ok: false, error: "Too many block changes. Please wait a minute and try again." }, { status: 429 });
    }
    if (result.value.status !== "changed") {
      return NextResponse.json({ ok: false, error: "The block change could not be applied." }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}


export async function GET(request: NextRequest) {
  try {
    const result = await withVerifiedAccount(request, async (accountId, activeProfileId) => {
      const context = createSignedAccountContextFromEnvironment(accountId);
      return withSignedAccountTransaction(getAppDatabasePool(), context, async client => {
        const profile = await client.query<{ allowed: boolean }>(
          "SELECT public.profile_authorize_action($1, unibud_private.current_account_id(), 'profile.read') AS allowed",
          [activeProfileId]
        );
        if (profile.rows[0]?.allowed !== true) return { status: "profile_denied" as const, profiles: [] };
        const budget = await client.query<{ allowed: boolean }>(
          "SELECT public.search_consume_rate_limit() AS allowed"
        );
        if (budget.rows[0]?.allowed !== true) return { status: "rate_limited" as const, profiles: [] };
        const blocked = await client.query<{
          handle: string;
          display_name: string;
          blocked_at: string;
        }>(
          "SELECT handle, display_name, blocked_at FROM public.account_list_blocked_profiles()"
        );
        return {
          status: "ready" as const,
          profiles: blocked.rows.map(profile => ({
            handle: profile.handle,
            displayName: profile.display_name,
            blockedAt: profile.blocked_at
          }))
        };
      });
    });
    if ("response" in result) return result.response;
    if (result.value.status === "rate_limited") {
      return NextResponse.json({ ok: false, error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
    }
    if (result.value.status !== "ready") {
      return NextResponse.json({ ok: false, error: "Your active profile is no longer available." }, { status: 403 });
    }
    return NextResponse.json({ ok: true, blockedProfiles: result.value.profiles });
  } catch (error) {
    return routeError(error);
  }
}
