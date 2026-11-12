import { createHmac } from "node:crypto";
import type { SqlClient } from "../database/account-context-core.ts";
import { routeSearchIntent, type SearchIntent, type SearchRoute } from "../../../../../../packages/contracts/src/search.ts";


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
  return { kind: "general_discovery" };
}

export function routeGlobalSearch(query: string): {
  intent: SearchIntent;
  route: SearchRoute;
} {
  const intent = classifyGlobalSearchIntent(query);
  return { intent, route: routeSearchIntent(intent) };
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
export async function consumeSearchRateLimit(
  client: SqlClient,
  trustedAccountId: string
): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(trustedAccountId)) {
    throw new Error("Search requires a trusted account identity.");
  }
  const keyHex = process.env.UNIBUD_DB_CONTEXT_HMAC_KEY?.trim() ?? "";
  if (!/^(?:[0-9a-f]{2}){32,}$/iu.test(keyHex)) {
    throw new Error("Search rate-limit signing key is not configured.");
  }
  const digest = createHmac("sha256", Buffer.from(keyHex, "hex"))
    .update(`unibud-search-rate-limit:v1:${trustedAccountId}`, "utf8")
    .digest();

  const result = await client.query<{ allowed: boolean }>(
    "SELECT public.search_consume_rate_limit($1) AS allowed",
    [digest]
  );
  if (result.rows[0]?.allowed !== true) throw new SearchRateLimitExceededError();
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
 * Connect people discovery only. The caller must establish a transaction with
 * a signed account context derived from a verified persisted session.
 * PostgreSQL RLS independently limits rows to active public profiles and
 * excludes accounts blocked in either direction. Never add IDs to this DTO.
 */
export async function searchPublicProfiles(
  client: SqlClient,
  normalizedTerm: string
): Promise<PublicProfileSearchResult[]> {
  const result = await client.query<{
    handle: string;
    display_name: string;
    kind: "personal" | "creator" | "page_community";
  }>(
    `SELECT p.handle, p.display_name, p.kind
       FROM public.profiles p
      WHERE p.status = 'active'
        AND p.visibility = 'public'
        AND p.owner_account_id <> unibud_private.current_account_id()
        AND (
          position(lower($1) in lower(p.handle)) > 0
          OR position(lower($1) in lower(p.display_name)) > 0
        )
        AND NOT public.account_interaction_blocked(p.owner_account_id)
      ORDER BY lower(p.handle), p.id
      LIMIT 20`,
    [normalizedTerm]
  );

  return result.rows.map(row => ({
    handle: row.handle,
    displayName: row.display_name,
    kind: row.kind
  }));
}
