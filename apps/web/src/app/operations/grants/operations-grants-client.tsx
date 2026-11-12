"use client";

import Link from "next/link";
import OperationsGrantNotifications from "./operations-grant-notifications";
import { useCallback, useEffect, useState, type FormEvent } from "react";

type Grant = {
  grant_id: string; account_id: string; operator_role: string; permissions: string[];
  granted_by: string | null; granted_at: string; expires_at: string | null;
};
type GrantRequest = {
  request_id: string; requested_action: "grant" | "revoke"; target_account_id: string;
  target_grant_id: string | null; requested_role: string | null; requested_permissions: string[] | null;
  requested_expires_at: string | null; state: string; requester_account_id: string;
  approver_account_id: string | null; reason_code: string; created_at: string; expires_at: string;
};
type ApiResult = { ok?: boolean; error?: string; grants?: Grant[]; requests?: GrantRequest[]; viewerAccountId?: string };
const ROLES = ["platform_admin", "operations_admin", "integration_operator", "support_readonly"];
const PERMISSIONS = [
  "integrations.verification_delivery.read", "integrations.oracle_arc.read", "dependencies.read",
  "operations.audit.read", "operations.accounts.support_read",
  "operations.mfa.security.request", "operations.mfa.security.approve"
];

export default function OperationsGrantsClient() {
  const [requests, setRequests] = useState<GrantRequest[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [viewer, setViewer] = useState("");
  const [action, setAction] = useState<"grant" | "revoke">("grant");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [targetGrantId, setTargetGrantId] = useState("");
  const [role, setRole] = useState("support_readonly");
  const [permissions, setPermissions] = useState<string[]>(["operations.audit.read"]);
  const [expiresAt, setExpiresAt] = useState(() => {
    const date = new Date(Date.now() + 30 * 86400000);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [reasonCode, setReasonCode] = useState("staff_access");
  const [decisionReason, setDecisionReason] = useState("reviewed_access");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [queueResponse, grantsResponse] = await Promise.all([
        fetch("/api/internal/operations/grants?limit=50", { credentials: "same-origin", cache: "no-store" }),
        fetch("/api/internal/operations/grants?view=active-grants&limit=100", { credentials: "same-origin", cache: "no-store" })
      ]);
      const [queue, inventory] = await Promise.all([queueResponse.json(), grantsResponse.json()]) as [ApiResult, ApiResult];
      if (!queueResponse.ok || !queue.ok || !Array.isArray(queue.requests)) throw new Error(queue.error || "Grant requests could not be loaded.");
      if (!grantsResponse.ok || !inventory.ok || !Array.isArray(inventory.grants)) throw new Error(inventory.error || "Active grants could not be loaded.");
      setRequests(queue.requests); setGrants(inventory.grants); setViewer(queue.viewerAccountId || "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Operations grants could not be loaded.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setNotice("");
    try {
      if (!identifier.trim() || !password) throw new Error("Enter your sign-in identifier and password for reauthentication.");
      if (action === "grant" && !permissions.length) throw new Error("Select at least one permission.");
      const body = {
        action, targetAccountId: targetAccountId.trim(), reasonCode,
        ...(action === "grant" ? {
          role, permissions,
          expiresAt: new Date(expiresAt).toISOString()
        } : { targetGrantId }),
        channel, identifier: identifier.trim(), password
      };
      const response = await fetch("/api/internal/operations/grants", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      const data = await response.json() as ApiResult & { requestId?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Grant change request was not accepted.");
      setPassword(""); setNotice("Request submitted for independent approval.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Grant change request failed.");
    } finally { setLoading(false); }
  }

  async function decide(requestId: string, decision: "approve" | "reject") {
    setLoading(true); setError(""); setNotice("");
    try {
      if (!identifier.trim() || !password) throw new Error("Enter your sign-in identifier and password for reauthentication.");
      const response = await fetch("/api/internal/operations/grants/" + requestId + "/decision", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reasonCode: decisionReason, channel, identifier: identifier.trim(), password })
      });
      const data = await response.json() as ApiResult;
      if (!response.ok || !data.ok) throw new Error(data.error || "Grant decision was not accepted.");
      setPassword(""); setNotice(decision === "approve" ? "Request approved." : "Request rejected.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Grant decision failed.");
    } finally { setLoading(false); }
  }

  async function cancelRequest(requestId: string) {
    setLoading(true); setError(""); setNotice("");
    try {
      if (!identifier.trim() || !password) throw new Error("Enter your sign-in identifier and password for reauthentication.");
      const response = await fetch("/api/internal/operations/grants/" + requestId + "/cancel", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasonCode: "requester_cancelled", channel, identifier: identifier.trim(), password })
      });
      const data = await response.json() as ApiResult;
      if (!response.ok || !data.ok) throw new Error(data.error || "The request could not be cancelled.");
      setPassword(""); setNotice("Your request was cancelled from this session.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Request cancellation failed.");
    } finally { setLoading(false); }
  }

  function beginRevocation(grant: Grant) {
    setAction("revoke"); setTargetAccountId(grant.account_id); setTargetGrantId(grant.grant_id);
    setReasonCode("staff_access_change");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <main className="mfa-shell">
    <header className="mfa-header"><Link className="wordmark" href="/home">unibud<span>.</span></Link><p className="eyebrow">Operations · Governance</p></header>
    <section className="mfa-intro">
      <p className="eyebrow">Privileged access administration</p><h1>Operator grants</h1>
      <p>Review active operator access and submit grant or revocation requests. Every change requires a separate eligible approver; the database enforces the decision.</p>
    </section>
    {error && <p className="mfa-alert mfa-error" role="alert">{error}</p>}
    {notice && <p className="mfa-alert" role="status">{notice}</p>}
    <OperationsGrantNotifications />
    <section className="mfa-card">
      <div className="mfa-card-head"><div><p className="eyebrow">Access request</p><h2>Request a grant change</h2></div><span className="mfa-state">Dual control</span></div>
      <form onSubmit={submitRequest}>
        <div className="mfa-form-grid">
          <label>Action<select value={action} onChange={e => setAction(e.target.value as "grant" | "revoke")}><option value="grant">Grant operator access</option><option value="revoke">Request grant revocation</option></select></label>
          <label>Target account UUID<input value={targetAccountId} onChange={e => setTargetAccountId(e.target.value)} required maxLength={36} /></label>
          {action === "grant" ? <>
            <label>Operator role<select value={role} onChange={e => setRole(e.target.value)}>{ROLES.map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Grant expiry<input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required /></label>
            <fieldset className="mfa-wide"><legend>Permissions</legend><div className="mfa-form-grid">{PERMISSIONS.map(item => <label key={item} className="mfa-check"><input type="checkbox" checked={permissions.includes(item)} onChange={e => setPermissions(current => e.target.checked ? [...current, item] : current.filter(value => value !== item))} />{item}</label>)}</div></fieldset>
          </> : <label>Target grant ID<input value={targetGrantId} onChange={e => setTargetGrantId(e.target.value)} required maxLength={36} /></label>}
          <label>Reason code<input value={reasonCode} onChange={e => setReasonCode(e.target.value)} pattern="[a-z][a-z0-9_]{2,47}" required maxLength={48} /></label>
        </div>
        <div className="mfa-card-head"><div><p className="eyebrow">Fresh authentication</p><h2>Confirm your identity</h2></div></div>
        <div className="mfa-form-grid">
          <label>Identifier type<select value={channel} onChange={e => setChannel(e.target.value as "email" | "phone")}><option value="email">Email</option><option value="phone">Phone</option></select></label>
          <label>Sign-in identifier<input value={identifier} onChange={e => setIdentifier(e.target.value)} autoComplete="username" required maxLength={254} /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required maxLength={128} /></label>
        </div>
        <div className="mfa-actions"><button className="mfa-button mfa-primary" disabled={loading} type="submit">{loading ? "Submitting…" : "Submit for independent approval"}</button><button className="mfa-button" type="button" disabled={loading} onClick={() => void load()}>Refresh</button></div>
      </form>
      <p className="mfa-muted">Bootstrap grant-management permissions are not assignable here. A DBA must provision request and approval authority separately. No requester can approve their own request or approve access for their own account.</p>
    </section>
    <section className="mfa-card">
      <div className="mfa-card-head"><div><p className="eyebrow">Review queue</p><h2>Pending requests</h2></div><span className="mfa-state">{requests.length} shown</span></div>
      {requests.length === 0 ? <p className="mfa-small">No pending requests are available to this reviewer.</p> : <div className="mfa-table-wrap" role="region" aria-label="Pending operator grant requests" tabIndex={0}><table className="mfa-audit-table"><caption>Pending operator grant requests</caption><thead><tr><th scope="col">Action</th><th scope="col">Target</th><th scope="col">Requested by</th><th scope="col">Role / grant</th><th scope="col">Reason</th><th scope="col">Expires</th><th scope="col">Decision</th></tr></thead><tbody>
        {requests.map(item => <tr key={item.request_id}><td>{item.requested_action}</td><td>{item.target_account_id}</td><td>{item.requester_account_id}</td><td>{item.requested_role ?? item.target_grant_id ?? "—"}{item.requested_permissions?.length ? <small>{item.requested_permissions.join(", ")}</small> : null}</td><td>{item.reason_code}</td><td><time dateTime={item.expires_at}>{new Date(item.expires_at).toLocaleString()}</time></td><td>{item.requester_account_id === viewer ? <button type="button" className="mfa-button" disabled={loading} onClick={() => void cancelRequest(item.request_id)}>Cancel my request</button> : item.target_account_id === viewer ? <span>Not eligible to approve</span> : <div className="mfa-actions"><button type="button" className="mfa-button mfa-primary" disabled={loading} onClick={() => void decide(item.request_id, "approve")}>Approve</button><button type="button" className="mfa-button" disabled={loading} onClick={() => void decide(item.request_id, "reject")}>Reject</button></div>}</td></tr>)}
      </tbody></table></div>}
      <label>Decision reason code<input value={decisionReason} onChange={e => setDecisionReason(e.target.value)} pattern="[a-z][a-z0-9_]{2,47}" maxLength={48} /></label>
      <p className="mfa-muted">Approval and rejection require the approver&apos;s own fresh password reauthentication, live MFA step-up and distinct operator authority.</p>
    </section>
    <section className="mfa-card">
      <div className="mfa-card-head"><div><p className="eyebrow">Current access</p><h2>Active operator grants</h2></div><span className="mfa-state">{grants.length} shown</span></div>
      {grants.length === 0 ? <p className="mfa-small">No active grants are visible to this reviewer.</p> : <div className="mfa-table-wrap" role="region" aria-label="Active operator grants" tabIndex={0}><table className="mfa-audit-table"><caption>Active operator grants</caption><thead><tr><th scope="col">Account</th><th scope="col">Role</th><th scope="col">Permissions</th><th scope="col">Granted</th><th scope="col">Expires</th><th scope="col">Action</th></tr></thead><tbody>
        {grants.map(grant => <tr key={grant.grant_id}><td>{grant.account_id}</td><td>{grant.operator_role}</td><td>{grant.permissions.join(", ")}</td><td>{new Date(grant.granted_at).toLocaleString()}</td><td>{grant.expires_at ? new Date(grant.expires_at).toLocaleString() : "No expiry"}</td><td><button type="button" className="mfa-button" disabled={loading} onClick={() => beginRevocation(grant)}>Request revocation</button></td></tr>)}
      </tbody></table></div>}
    </section>
    <p className="mfa-small"><Link href="/operations/audit">View Operations audit trail</Link> · <Link href="/operations/security/mfa">Authenticator security</Link></p>
  </main>;
}
