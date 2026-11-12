import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { consumeOperationsMfaApiRateLimit } from "@/lib/server/operations/operations-mfa-rate-limit";
import { createSignedSessionContextFromEnvironment, withSignedSessionTransaction } from "@/lib/server/database/session-context";
import { getAppDatabasePool } from "@/lib/server/database/postgres-pool";
import { createConfiguredIdentityServices } from "@/lib/server/identity/identity-runtime";
import { readSessionCookie, routeError } from "@/lib/server/identity/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuditRow = {
  event_id: string;
  actor_account_id: string | null;
  session_id: string | null;
  permission: string;
  outcome: "allowed" | "denied" | "unauthenticated" | "error";
  request_id: string;
  occurred_at: Date | string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENT_ID = /^[1-9][0-9]{0,18}$/;
const PERMISSION = /^[a-z][a-z0-9_.]{2,100}$/;
const OUTCOMES = new Set(["allowed", "denied", "unauthenticated", "error"]);

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
}
function csvCell(value: unknown): string {
  const raw = value === null || value === undefined ? "" : value instanceof Date ? value.toISOString() : String(value);
  return '"' + raw.replace(/"/g, '""') + '"';
}
function csv(rows: AuditRow[]): string {
  const columns: (keyof AuditRow)[] = ["event_id", "actor_account_id", "session_id", "permission", "outcome", "request_id", "occurred_at"];
  return [columns.join(","), ...rows.map(row => columns.map(column => csvCell(row[column])).join(","))].join("\r\n") + "\r\n";
}
function validIso(value: string | null): value is string {
  return value !== null && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

export async function GET(request: NextRequest) {
  const requestId = randomUUID();
  const params = request.nextUrl.searchParams;
  const now = Date.now();
  const fromRaw = params.get("from");
  const toRaw = params.get("to");
  const from = fromRaw === null ? new Date(now - 30 * 86400000).toISOString() : fromRaw;
  const to = toRaw === null ? new Date(now).toISOString() : toRaw;
  const permission = params.get("permission");
  const outcome = params.get("outcome");
  const actor = params.get("actorAccountId");
  const format = params.get("format") ?? "json";
  const limitRaw = params.get("limit");
  const limit = limitRaw === null ? (format === "csv" ? 1000 : 100) : Number(limitRaw);
  const beforeAt = params.get("beforeOccurredAt");
  const beforeId = params.get("beforeEventId");

  if (!validIso(from) || !validIso(to) || Date.parse(from) >= Date.parse(to)
      || Date.parse(to) > now + 60000 || Date.parse(from) < Date.parse(to) - 90 * 86400000
      || (permission !== null && !PERMISSION.test(permission))
      || (outcome !== null && !OUTCOMES.has(outcome))
      || (actor !== null && !UUID.test(actor))
      || (format !== "json" && format !== "csv")
      || !Number.isInteger(limit) || limit < 1 || limit > (format === "csv" ? 1000 : 100)
      || ((beforeAt === null) !== (beforeId === null))
      || (beforeAt !== null && (!validIso(beforeAt) || !beforeId || !EVENT_ID.test(beforeId)))) {
    return json({ ok: false, error: "Invalid audit search filters. Search windows are limited to 90 days; JSON pages to 100 records and CSV exports to 1,000." }, 400);
  }

  const token = readSessionCookie(request);
  if (!token) return json({ ok: false, error: "Authentication is required." }, 401);
  let accountId: string | null = null;
  let sessionId: string | null = null;
  try {
    const { sessions } = createConfiguredIdentityServices();
    const validation = await sessions.validate(token);
    if (!validation.valid) return json({ ok: false, error: "Authentication is required." }, 401);
    accountId = validation.account.id;
    sessionId = validation.session.id;
    if (!await consumeOperationsMfaApiRateLimit(accountId, sessionId, "audit_read")) {
      const context = createSignedSessionContextFromEnvironment(accountId, sessionId);
      await withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
        await client.query("SELECT public.unibud_operator_record_access($1,$2,$3)", ["operations.audit.read", "denied", requestId]);
      });
      return json({ ok: false, error: "Audit access is unavailable or rate-limited. Verify your Operations audit permission and current MFA step-up." }, 403);
    }
    const context = createSignedSessionContextFromEnvironment(accountId, sessionId);
    const rows = await withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
      const result = await client.query<AuditRow>(
        "SELECT * FROM public.unibud_operator_search_audit_events($1,$2,$3,$4,$5,$6,$7,$8)",
        [from, to, permission, outcome, actor, limit, beforeAt, beforeId]
      );
      await client.query(
        "SELECT public.unibud_operator_record_access($1,$2,$3)",
        ["operations.audit.read", "allowed", requestId]
      );
      return result.rows;
    });
    if (format === "csv") {
      return new NextResponse(csv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="unibud-operations-audit.csv"',
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }
    const last = rows[rows.length - 1];
    return json({
      ok: true,
      events: rows,
      filters: { from, to, permission, outcome, actorAccountId: actor, format },
      nextCursor: rows.length === limit && last
        ? { beforeOccurredAt: last.occurred_at instanceof Date ? last.occurred_at.toISOString() : new Date(last.occurred_at).toISOString(), beforeEventId: last.event_id }
        : null
    });
  } catch (error) {
    if (accountId && sessionId) {
      try {
        const context = createSignedSessionContextFromEnvironment(accountId, sessionId);
        await withSignedSessionTransaction(getAppDatabasePool(), context, async client => {
          await client.query("SELECT public.unibud_operator_record_access($1,$2,$3)", ["operations.audit.read", "error", requestId]);
        });
      } catch {
        // Preserve the original failure and never weaken the authorization boundary.
      }
    }
    return routeError(error);
  }
}
