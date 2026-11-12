import type { SqlClient } from "../database/account-context-core.ts";

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
        AND NOT EXISTS (
          SELECT 1
            FROM public.account_blocks b
           WHERE b.status = 'active'
             AND (
               (b.blocker_account_id = unibud_private.current_account_id()
                 AND b.blocked_account_id = p.owner_account_id)
               OR
               (b.blocker_account_id = p.owner_account_id
                 AND b.blocked_account_id = unibud_private.current_account_id())
             )
        )
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
