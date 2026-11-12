import { NextRequest, NextResponse } from "next/server";
import { createSignedAccountContextFromEnvironment, withSignedAccountTransaction } from "../../../lib/server/database/account-context";
import { getAppDatabasePool } from "../../../lib/server/database/postgres-pool";
import { readSessionCookie, routeError } from "../../../lib/server/identity/http";
import { createConfiguredIdentityServices } from "../../../lib/server/identity/identity-runtime";
import { assertSearchProfileContext, consumeSearchRateLimit, isSearchDiscoveryReady, normalizePeopleSearchTerm, routeGlobalSearch, searchPublicProfiles } from "../../../lib/server/search/search-core";

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
    if (!validation.session.activeProfileId) {
      return NextResponse.json({ ok: false, error: "Choose an active profile before searching." }, { status: 409 });
    }

    const classification = routeGlobalSearch(term);
    const context = createSignedAccountContextFromEnvironment(validation.account.id);
    const results = await withSignedAccountTransaction(
      getAppDatabasePool(),
      context,
      async client => {
        await assertSearchProfileContext(client, validation.session.activeProfileId!);
        await consumeSearchRateLimit(client);
        if (classification.intent.kind !== "general_discovery") return null;
        const category = classification.intent.category;
        if (category !== "people" && category !== "communities" && category !== "creators") {
          return { state: "category_not_available" as const, profiles: [] };
        }
        if (!(await isSearchDiscoveryReady(client))) return { state: "age_assurance_required" as const, profiles: [] };
        return { state: "ready" as const, profiles: await searchPublicProfiles(client, term, category) };
      }
    );

    return NextResponse.json({
      ok: true,
      intent: classification.intent.kind,
      route: classification.route,
      ...(classification.intent.kind === "general_discovery" ? { category: classification.intent.category } : {}),
      ...(results === null ? {} : { discoveryState: results.state, results: results.profiles })
    });
  } catch (error) {
    return routeError(error);
  }
}
