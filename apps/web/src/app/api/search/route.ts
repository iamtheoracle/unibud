import { NextRequest, NextResponse } from "next/server";
import { createSignedAccountContextFromEnvironment, withSignedAccountTransaction } from "../../../lib/server/database/account-context";
import { getAppDatabasePool } from "../../../lib/server/database/postgres-pool";
import { readSessionCookie, routeError } from "../../../lib/server/identity/http";
import { createConfiguredIdentityServices } from "../../../lib/server/identity/identity-runtime";
import { consumeSearchRateLimit, isSearchDiscoveryReady, normalizePeopleSearchTerm, routeGlobalSearch, searchPublicProfiles } from "../../../lib/server/search/search-core";

export async function GET(request: NextRequest) {
  const token = readSessionCookie(request);
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const term = normalizePeopleSearchTerm(request.nextUrl.searchParams.get("q"));
  if (!term) {
    return NextResponse.json({ ok: false, error: "Enter 2–40 characters to search." }, { status: 400 });
  }

  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return NextResponse.json({ ok: false }, { status: 401 });

    const classification = routeGlobalSearch(term);
    const context = createSignedAccountContextFromEnvironment(validation.account.id);
    const results = await withSignedAccountTransaction(
      getAppDatabasePool(),
      context,
      async client => {
        await consumeSearchRateLimit(client);
        if (classification.intent.kind !== "general_discovery") return null;
        if (!(await isSearchDiscoveryReady(client))) return { state: "age_assurance_required" as const, profiles: [] };
        return { state: "ready" as const, profiles: await searchPublicProfiles(client, term) };
      }
    );

    return NextResponse.json({
      ok: true,
      intent: classification.intent.kind,
      route: classification.route,
      ...(results === null ? {} : { discoveryState: results.state, results: results.profiles })
    });
  } catch (error) {
    return routeError(error);
  }
}
