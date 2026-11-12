import { NextRequest, NextResponse } from "next/server";
import { createSignedAccountContextFromEnvironment, withSignedAccountTransaction } from "../../../lib/server/database/account-context";
import { getAppDatabasePool } from "../../../lib/server/database/postgres-pool";
import { readSessionCookie, routeError } from "../../../lib/server/identity/http";
import { createConfiguredIdentityServices } from "../../../lib/server/identity/identity-runtime";
import { normalizePeopleSearchTerm, routeGlobalSearch, searchPublicProfiles } from "../../../lib/server/search/search-core";

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
    if (classification.intent.kind !== "general_discovery") {
      // Board and SouLync destination services enforce their own authorization.
      // No records are queried or returned by this global routing endpoint.
      return NextResponse.json({
        ok: true,
        intent: classification.intent.kind,
        route: classification.route
      });
    }

    const context = createSignedAccountContextFromEnvironment(validation.account.id);
    const results = await withSignedAccountTransaction(
      getAppDatabasePool(),
      context,
      client => searchPublicProfiles(client, term)
    );

    return NextResponse.json({
      ok: true,
      intent: classification.intent.kind,
      route: classification.route,
      results
    });
  } catch (error) {
    return routeError(error);
  }
}
