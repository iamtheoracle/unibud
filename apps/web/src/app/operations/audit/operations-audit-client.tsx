"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AuditEvent = {
  event_id: string;
  actor_account_id: string | null;
  session_id: string | null;
  permission: string;
  outcome: "allowed" | "denied" | "unauthenticated" | "error";
  request_id: string;
  occurred_at: string;
};
type ApiResult = { ok?: boolean; error?: string; events?: AuditEvent[]; nextCursor?: { beforeOccurredAt: string; beforeEventId: string } | null };

function dateInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
function toIso(value: string) {
  return new Date(value).toISOString();
}

export default function OperationsAuditClient() {
  const [from, setFrom] = useState(() => dateInput(new Date(Date.now() - 30 * 86400000)));
  const [to, setTo] = useState(() => dateInput(new Date()));
  const [permission, setPermission] = useState("");
  const [outcome, setOutcome] = useState("");
  const [actor, setActor] = useState("");
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [cursor, setCursor] = useState<ApiResult["nextCursor"]>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ from: from ? toIso(from) : "", to: to ? toIso(to) : "", limit: "100" });
    if (permission.trim()) params.set("permission", permission.trim());
    if (outcome) params.set("outcome", outcome);
    if (actor.trim()) params.set("actorAccountId", actor.trim());
    return params;
  }, [from, to, permission, outcome, actor]);

  async function search(append = false) {
    setLoading(true); setError("");
    try {
      if (!from || !to || !Number.isFinite(Date.parse(from)) || !Number.isFinite(Date.parse(to))) {
        throw new Error("Choose a valid start and end time before searching.");
      }
      const params = new URLSearchParams(query);
      if (append && cursor) {
        params.set("beforeOccurredAt", cursor.beforeOccurredAt);
        params.set("beforeEventId", cursor.beforeEventId);
      }
      const response = await fetch("/api/internal/operations/audit?" + params.toString(), {
        credentials: "same-origin", cache: "no-store"
      });
      const data = await response.json() as ApiResult;
      if (!response.ok || !data.ok || !Array.isArray(data.events)) {
        throw new Error(data.error || "Audit events could not be loaded.");
      }
      setEvents(current => append ? [...current, ...data.events!] : data.events!);
      setCursor(data.nextCursor ?? null);
      setSearched(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Audit events could not be loaded.");
    } finally { setLoading(false); }
  }

  const exportUrl = "/api/internal/operations/audit?" + new URLSearchParams({
    from: from ? toIso(from) : "", to: to ? toIso(to) : "", format: "csv", limit: "1000",
    ...(permission.trim() ? { permission: permission.trim() } : {}),
    ...(outcome ? { outcome } : {}),
    ...(actor.trim() ? { actorAccountId: actor.trim() } : {})
  }).toString();

  return <main className="mfa-shell">
    <header className="mfa-header">
      <Link className="wordmark" href="/home">unibud<span>.</span></Link>
      <p className="eyebrow">Operations · Governance</p>
    </header>
    <section className="mfa-intro">
      <p className="eyebrow">Privileged access review</p>
      <h1>Audit trail</h1>
      <p>Search append-only Operations access events. Every query requires the current account&apos;s audit permission and a live MFA step-up for this exact session.</p>
    </section>
    <section className="mfa-card" aria-label="Audit search filters">
      <div className="mfa-card-head"><div><p className="eyebrow">Search</p><h2>Event filters</h2></div><span className="mfa-state">90-day maximum</span></div>
      <div className="mfa-form-grid">
        <label>From<input type="datetime-local" value={from} onChange={event => setFrom(event.target.value)} /></label>
        <label>To<input type="datetime-local" value={to} onChange={event => setTo(event.target.value)} /></label>
        <label>Permission<input value={permission} onChange={event => setPermission(event.target.value)} placeholder="operations.audit.read" maxLength={101} /></label>
        <label>Outcome<select value={outcome} onChange={event => setOutcome(event.target.value)}><option value="">All outcomes</option><option value="allowed">Allowed</option><option value="denied">Denied</option><option value="unauthenticated">Unauthenticated</option><option value="error">Error</option></select></label>
        <label className="mfa-wide">Actor account ID<input value={actor} onChange={event => setActor(event.target.value)} placeholder="Optional account UUID" maxLength={36} /></label>
      </div>
      <div className="mfa-actions">
        <button className="mfa-button mfa-primary" type="button" disabled={loading} onClick={() => void search(false)}>{loading ? "Searching…" : "Search audit events"}</button>
        <a className="mfa-button" href={exportUrl}>Export CSV (up to 1,000)</a>
      </div>
      <p className="mfa-muted">Searches are limited to 90 days. CSV exports are capped at 1,000 events. Exports contain audit metadata only, not request bodies, credentials or personal contact details.</p>
    </section>
    {error && <p className="mfa-alert mfa-error" role="alert">{error}</p>}
    <section className="mfa-card" aria-label="Audit results">
      <div className="mfa-card-head"><div><p className="eyebrow">Immutable record</p><h2>Events</h2></div><span className="mfa-state">{events.length} loaded</span></div>
      {!searched ? <p className="mfa-small">Choose a time range and search to view events.</p>
        : events.length === 0 ? <p className="mfa-small">No events match these filters.</p>
        : <div className="mfa-table-wrap"><table className="mfa-audit-table"><thead><tr><th>Time</th><th>Permission</th><th>Outcome</th><th>Actor</th><th>Session</th><th>Request ID</th></tr></thead>
          <tbody>{events.map(item => <tr key={item.event_id}><td><time dateTime={item.occurred_at}>{new Date(item.occurred_at).toLocaleString()}</time></td><td>{item.permission}</td><td>{item.outcome}</td><td>{item.actor_account_id ?? "—"}</td><td>{item.session_id ?? "—"}</td><td>{item.request_id}</td></tr>)}</tbody></table></div>}
      {cursor && <button className="mfa-button" type="button" disabled={loading} onClick={() => void search(true)}>{loading ? "Loading…" : "Load more"}</button>}
    </section>
    <p className="mfa-small"><Link href="/operations/security/mfa">Authenticator security</Link> · <Link href="/operations/grants">Operator grants</Link></p>
  </main>;
}
