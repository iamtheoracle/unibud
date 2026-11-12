import type { SqlClient } from "../database/account-context-core.ts";
import { routeSearchIntent, type ConnectSearchCategory, type SearchIntent, type SearchRoute, type SearchSpace } from "../../../../../../packages/contracts/src/search.ts";
import type { ApplicationId } from "../../../../../../packages/contracts/src/identity.ts";


/**
 * Server-owned global-search classifier. Client-supplied route names are never
 * accepted. Academic intent routes into Board within Bud; dating intent only
 * produces a gated SouLync destination; all other global discovery goes to
 * Connect. This classifier is navigation, never authorization.
 */
export function classifyGlobalSearchIntent(query: string): SearchIntent {
  const normalized = query.toLocaleLowerCase("en");
  if (/\b(dating|romantic|soulmate|relationship advice|find a date)\b/u.test(normalized)) {
    return { kind: "adult_dating" };
  }
  if (/\b(school|campus|university|universities|college|colleges|faculty|department|departments|course|courses|class|classes|exam|exams|assignment|assignments|tutor|tutors|lecturer|lecturers|study group|scholarship|scholarships|lecture|lectures|coursework)\b/u.test(normalized)) {
    return { kind: "academic" };
  }
  if (/\b(community|communities|groups|clubs)\b/u.test(normalized)) {
    return { kind: "general_discovery", category: "communities" };
  }
  if (/\b(creator|creators|influencer|influencers|content creator)\b/u.test(normalized)) {
    return { kind: "general_discovery", category: "creators" };
  }
  if (/\b(institution|institutions|organisation|organization|company|companies)\b/u.test(normalized)) {
    return { kind: "general_discovery", category: "institutions" };
  }
  if (/\b(job|jobs|career|careers|internship|internships|opportunity|opportunities)\b/u.test(normalized)) {
    return { kind: "general_discovery", category: "opportunities" };
  }
  if (/\b(service|services|photographer|photographers|plumber|plumbers|electrician|electricians|designer|designers)\b/u.test(normalized)) {
    return { kind: "general_discovery", category: "services" };
  }
  if (/\b(food|restaurant|restaurants|cafe|cafes|coffee|catering)\b/u.test(normalized)) {
    return { kind: "general_discovery", category: "food" };
  }
  if (/\b(event|events|meetup|meetups|concert|concerts|festival|festivals)\b/u.test(normalized)) {
    return { kind: "general_discovery", category: "events" };
  }
  if (/\b(trip|trips|travel|adventure|adventures|tour|tours)\b/u.test(normalized)) {
    return { kind: "general_discovery", category: "trips" };
  }
  return { kind: "general_discovery", category: "people" };
}

const EXPLICIT_SEARCH_SPACES: readonly SearchSpace[] = [
  "connect", "quad", "bud_board", "square", "soullync", "riff", "wayward", "quarter", "flow"
];

/** Explicit scope is accepted only as a navigation request, never as access proof. */
export function routeExplicitSearchScope(scope: unknown): {
  intent: SearchIntent;
  route: SearchRoute;
} | null {
  if (typeof scope !== "string" || !EXPLICIT_SEARCH_SPACES.includes(scope as SearchSpace)) return null;
  const intent: SearchIntent = { kind: "space_scoped", applicationId: scope as ApplicationId };
  return { intent, route: routeSearchIntent(intent) };
}

export function routeGlobalSearch(query: string): {
  intent: SearchIntent;
  route: SearchRoute;
} {
  const intent = classifyGlobalSearchIntent(query);
  return { intent, route: routeSearchIntent(intent) };
}

export class SearchProfileContextError extends Error {
  constructor() {
    super("The active profile is no longer authorized for Search.");
    this.name = "SearchProfileContextError";
  }
}

/** Re-check the session's persisted active profile against current DB membership. */
export async function assertSearchProfileContext(
  client: SqlClient,
  trustedActiveProfileId: string
): Promise<void> {
  const result = await client.query<{ allowed: boolean }>(
    "SELECT public.profile_authorize_action($1, unibud_private.current_account_id(), 'profile.read') AS allowed",
    [trustedActiveProfileId]
  );
  if (result.rows[0]?.allowed !== true) throw new SearchProfileContextError();
}

export class SearchRateLimitExceededError extends Error {
  constructor() {
    super("Search request limit exceeded.");
    this.name = "SearchRateLimitExceededError";
  }
}

/**
 * Account-bound Search budget. The database stores only an opaque HMAC digest,
 * not the account identifier. Uses the same server-only key already required
 * to sign trusted transaction context; never accepts a digest from a client.
 */
export async function consumeSearchRateLimit(client: SqlClient): Promise<void> {
  const result = await client.query<{ allowed: boolean }>(
    "SELECT public.search_consume_rate_limit() AS allowed"
  );
  if (result.rows[0]?.allowed !== true) throw new SearchRateLimitExceededError();
}

/** Returns a minimal self-read gate; no age or cohort details are exposed. */
export async function isSearchDiscoveryReady(client: SqlClient): Promise<boolean> {
  const result = await client.query<{ ready: boolean }>(
    "SELECT public.account_discovery_viewer_verified() AS ready"
  );
  return result.rows[0]?.ready === true;
}

export interface PublicProfileSearchResult {
  handle: string;
  displayName: string;
  kind: "personal" | "creator" | "page_community";
}

export function normalizePeopleSearchTerm(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFKC").replace(/\s+/gu, " ").trim();
  if (normalized.length < 2 || normalized.length > 40 || /[\u0000-\u001f\u007f]/u.test(normalized)) {
    return null;
  }
  return normalized;
}

/**
 * Connect public profile discovery for people, creators or communities only. The caller must establish a transaction with
 * a signed account context derived from a verified persisted session.
 * PostgreSQL RLS independently limits rows to active public profiles and
 * excludes accounts blocked in either direction. Never add IDs to this DTO.
 */
export async function searchPublicProfiles(
  client: SqlClient,
  normalizedTerm: string,
  category: Extract<ConnectSearchCategory, "people" | "communities" | "creators">
): Promise<PublicProfileSearchResult[]> {
  const profileKind = category === "people"
    ? "personal"
    : category === "creators"
      ? "creator"
      : "page_community";
  const result = await client.query<{
    handle: string;
    display_name: string;
    kind: "personal" | "creator" | "page_community";
  }>(
    `SELECT p.handle, p.display_name, p.kind
       FROM public.profiles p
      WHERE p.status = 'active'
        AND p.visibility = 'public'
        AND p.kind = $2
        AND p.owner_account_id <> unibud_private.current_account_id()
        AND (
          position(lower($1) in lower(p.handle)) > 0
          OR position(lower($1) in lower(p.display_name)) > 0
        )
        AND NOT public.account_interaction_blocked(p.owner_account_id)
      ORDER BY lower(p.handle), p.id
      LIMIT 20`,
    [normalizedTerm, profileKind]
  );

  return result.rows.map(row => ({
    handle: row.handle,
    displayName: row.display_name,
    kind: row.kind
  }));
}
