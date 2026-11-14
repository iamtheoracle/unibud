"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type WorkforceRow = {
  workforce_id: string;
  username: string;
  workforce_role: "staff" | "operator" | "admin";
  status: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  onboarding_completed_at: string | null;
};
type InvitationRequest = {
  request_id: string;
  requested_role: "staff" | "operator" | "admin";
  state: string;
  requester_account_id: string;
  created_at: string;
  expires_at: string;
};
type ActivityRow = {
  event_id: string;
  occurred_at: string;
  actor_account_id: string | null;
  actor_session_id: string | null;
  event_type: string;
  outcome: string;
  request_id: string;
  resource_type: string | null;
  resource_id: string | null;
};

export default function WorkforceOperationsPage() {
  const [directory, setDirectory] = useState<WorkforceRow[]>([]);
  const [requests, setRequests] = useState<InvitationRequest[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [selected, setSelected] = useState("");
  const [role, setRole] = useState<"staff" | "operator" | "admin">("staff");
  const [reasonCode, setReasonCode] = useState("new_team_member");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [issued, setIssued] = useState<{ username: string; activationCode: string } | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/internal/operations/workforce", {
      credentials: "same-origin", cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error ?? "Workforce records are unavailable.");
    setDirectory(result.directory ?? []);
    setRequests(result.pendingInvitations ?? []);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/internal/operations/workforce", {
      credentials: "same-origin", cache: "no-store"
    }).then(async response => {
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Workforce records are unavailable.");
      if (active) {
        setDirectory(result.directory ?? []);
        setRequests(result.pendingInvitations ?? []);
      }
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : "Workforce records are unavailable.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function createInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice(""); setIssued(null);
    try {
      const response = await fetch("/api/internal/operations/workforce/invitations", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, reasonCode })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Invitation request failed.");
      setNotice("A two-person invitation request was recorded. A different authorised approver must review it.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invitation request failed.");
    } finally { setBusy(false); }
  }

  async function decide(requestId: string, decision: "approve" | "reject") {
    setBusy(true); setError(""); setNotice(""); setIssued(null);
    try {
      const response = await fetch(`/api/internal/operations/workforce/invitations/${requestId}/decision`, {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decision,
          reasonCode: decision === "approve" ? "approved_after_review" : "rejected_after_review"
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Invitation decision failed.");
      if (decision === "approve") {
        setIssued({ username: result.username, activationCode: result.activationCode });
        setNotice("The username and one-time activation code are shown once. Deliver them through a verified, separate company-controlled channel.");
      } else {
        setNotice("The invitation request was rejected and recorded.");
      }
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invitation decision failed.");
    } finally { setBusy(false); }
  }

  async function viewActivity(workforceId: string) {
    setSelected(workforceId); setActivity([]); setError("");
    try {
      const response = await fetch(`/api/internal/operations/workforce?workforceId=${encodeURIComponent(workforceId)}&limit=50`, {
        credentials: "same-origin", cache: "no-store"
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "The activity record is unavailable.");
      setActivity(result.activity ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The activity record is unavailable.");
    }
  }

  const activeCount = directory.filter(item => item.status === "active").length;
  const onboardingCount = directory.filter(item => ["invited", "email_verification_pending", "mfa_enrollment_required"].includes(item.status)).length;

  return <main className="shell workforce-page">
    <header className="topbar">
      <Link className="wordmark" href="/home">unibud<span>.</span></Link>
      <nav className="workforce-nav" aria-label="Operations navigation">
        <Link href="/operations/security/mfa">Security</Link>
        <Link href="/operations/grants">Access grants</Link>
        <Link href="/home">UNIBUD home</Link>
      </nav>
    </header>
    <section className="workforce-intro">
      <p className="eyebrow">Operations · workforce governance</p>
      <h1>People and duties</h1>
      <p className="profile-muted">System-issued usernames, two-person onboarding approval, role-separated access and an auditable workforce activity trail. A workforce designation never grants privileged permissions by itself.</p>
    </section>

    {error && <p className="profile-alert profile-error" role="alert">{error}</p>}
    {notice && <p className="profile-alert profile-notice" role="status">{notice}</p>}
    {issued && <section className="workforce-panel workforce-issued" aria-live="polite">
      <p className="eyebrow">Issued once · protect this information</p>
      <h2>{issued.username}</h2>
      <p>Temporary six-digit activation code</p>
      <code className="workforce-activation-code">{issued.activationCode}</code>
      <p>It expires in 15 minutes. Give this code only to the intended person through a verified separate channel. It cannot be retrieved again from the dashboard.</p>
    </section>}

    <section className="workforce-summary">
      <article className="workforce-panel"><p className="eyebrow">Registered workforce</p><h2>{loading ? "…" : directory.length}</h2><p>Current roster records returned by the database.</p></article>
      <article className="workforce-panel"><p className="eyebrow">Active</p><h2>{loading ? "…" : activeCount}</h2><p>Email verified and authenticator onboarding completed.</p></article>
      <article className="workforce-panel"><p className="eyebrow">Onboarding / invitation</p><h2>{loading ? "…" : onboardingCount}</h2><p>Invited, verifying email or required to enrol MFA.</p></article>
    </section>

    <section className="workforce-panel">
      <p className="eyebrow">Invite-only issuance</p><h2>Request a workforce account</h2>
      <p className="profile-muted">A different authorised approver must approve the request. Admin invitations require a platform administrator. No open staff registration is available.</p>
      <form className="workforce-request-form" onSubmit={createInvitation}>
        <label>Workforce designation
          <select value={role} onChange={event => setRole(event.target.value as "staff" | "operator" | "admin")}>
            <option value="staff">Staff</option><option value="operator">Operator</option><option value="admin">Administrator</option>
          </select>
        </label>
        <label>Reason code
          <input value={reasonCode} onChange={event => setReasonCode(event.target.value.trim().toLowerCase())} pattern="[a-z][a-z0-9_]{2,47}" maxLength={48} required />
        </label>
        <button className="profile-primary" type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit for independent approval"}</button>
      </form>
    </section>

    <section className="workforce-panel workforce-activity">
      <div className="profile-section-heading"><div><p className="eyebrow">Pending requests</p><h2>Two-person review queue</h2></div><span className="profile-count">{requests.length} pending</span></div>
      {requests.length === 0 ? <p className="profile-empty">No pending workforce invitations.</p> : <div className="workforce-record-list">
        {requests.map(item => <article className="workforce-record" key={item.request_id}>
          <div><strong>{item.requested_role}</strong><p>Requested {new Date(item.created_at).toLocaleString()}</p><small>Expires {new Date(item.expires_at).toLocaleString()}</small></div>
          <div className="workforce-record-actions">
            <button className="profile-primary" type="button" disabled={busy} onClick={() => decide(item.request_id, "approve")}>Approve and issue</button>
            <button className="profile-secondary" type="button" disabled={busy} onClick={() => decide(item.request_id, "reject")}>Reject</button>
          </div>
        </article>)}
      </div>}
    </section>

    <section className="workforce-panel workforce-activity">
      <div className="profile-section-heading"><div><p className="eyebrow">Workforce directory</p><h2>Accounts and status</h2></div><span className="profile-count">{directory.length} records</span></div>
      {directory.length === 0 ? <p className="profile-empty">No workforce accounts are visible to this permission set.</p> : <div className="workforce-record-list">
        {directory.map(item => <article className="workforce-record" key={item.workforce_id}>
          <div><strong>{item.first_name || "Pending activation"} {item.last_name || ""}</strong><p>{item.username} · {item.workforce_role}</p><small>Status: {item.status.replaceAll("_", " ")}</small></div>
          <button className="profile-action" type="button" disabled={busy} onClick={() => viewActivity(item.workforce_id)}>View audit trail</button>
        </article>)}
      </div>}
    </section>

    {selected && <section className="workforce-panel workforce-activity">
      <div className="profile-section-heading"><div><p className="eyebrow">Immutable activity record</p><h2>Duty and access history</h2></div><button className="profile-action" type="button" onClick={() => { setSelected(""); setActivity([]); }}>Close</button></div>
      {activity.length === 0 ? <p className="profile-empty">No activity events were returned for this account.</p> : <ol className="workforce-activity-list">
        {activity.map(item => <li key={item.event_id}>
          <div><strong>{item.event_type.replaceAll(".", " ")}</strong><span>{item.outcome} · request {item.request_id}</span></div>
          <time dateTime={item.occurred_at}>{new Date(item.occurred_at).toLocaleString()}</time>
        </li>)}
      </ol>}
    </section>}
  </main>;
}
