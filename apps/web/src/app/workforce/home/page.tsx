"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WorkforceActivity = {
  eventType: string;
  outcome: string;
  occurredAt: string;
  resourceType?: string | null;
  resourceId?: string | null;
};
type WorkforceDuty = {
  assignment_id: string; duty_code: string; title: string; description: string;
  due_at: string | null; status: string; assigned_at: string; submitted_at: string | null;
  completion_note: string | null; evidence_reference: string | null;
};
type WorkforceSelf = {
  username: string;
  role: "staff" | "operator" | "admin";
  firstName: string;
  lastName: string;
  emailVerifiedAt: string;
  mfaEnrolledAt: string;
  onboardingCompletedAt: string;
  recentActivity: WorkforceActivity[];
};

export default function WorkforceHomePage() {
  const [workforce, setWorkforce] = useState<WorkforceSelf | null>(null);
  const [duties, setDuties] = useState<WorkforceDuty[]>([]);
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
  const [evidenceReferences, setEvidenceReferences] = useState<Record<string, string>>({});
  const [busyDuty, setBusyDuty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/internal/workforce/me", {
      credentials: "same-origin",
      cache: "no-store"
    }).then(async response => {
      const result = await response.json();
      if (!response.ok || !result.ok || !result.workforce) {
        throw new Error(result.error ?? "Workforce access is not available.");
      }
      if (active) {
        setWorkforce(result.workforce as WorkforceSelf);
        setDuties(result.duties ?? []);
      }
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : "Workforce dashboard is unavailable.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function updateDuty(assignmentId: string, transition: "accepted" | "in_progress" | "submitted") {
    setBusyDuty(assignmentId); setError("");
    try {
      const response = await fetch("/api/internal/workforce/duties/" + assignmentId + "/transition", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transition,
          completionNote: completionNotes[assignmentId] ?? null,
          evidenceReference: evidenceReferences[assignmentId] ?? null
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Duty update failed.");
      const refresh = await fetch("/api/internal/workforce/me", { credentials: "same-origin", cache: "no-store" });
      const refreshed = await refresh.json();
      if (!refresh.ok || !refreshed.ok) throw new Error(refreshed.error ?? "Duty status refresh failed.");
      setWorkforce(refreshed.workforce as WorkforceSelf);
      setDuties(refreshed.duties ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Duty update failed.");
    } finally { setBusyDuty(""); }
  }

  return <main className="shell workforce-page">
    <header className="topbar">
      <Link className="wordmark" href="/home">unibud<span>.</span></Link>
      <nav className="workforce-nav" aria-label="Workforce navigation">
        <Link href="/operations/security/mfa">Security</Link>
        <Link href="/home">UNIBUD home</Link>
      </nav>
    </header>
    <section className="workforce-intro">
      <p className="eyebrow">Workforce workspace</p>
      <h1>{workforce ? `Welcome, ${workforce.firstName}` : "Your workforce access"}</h1>
      <p className="profile-muted">This workspace is tied to your assigned username, verified email, authenticated account and current session. Your activity history is recorded by the server.</p>
    </section>
    {loading && <p role="status">Loading your verified workforce record…</p>}
    {error && <section className="workforce-panel" role="alert">
      <h2>Access not ready</h2>
      <p>{error}</p>
      <Link className="profile-primary" href="/operations/security/mfa">Complete security verification</Link>
    </section>}
    {workforce && <>
      <section className="workforce-summary">
        <article className="workforce-panel">
          <p className="eyebrow">System-issued username</p>
          <h2>{workforce.username}</h2>
          <p>{workforce.firstName} {workforce.lastName}</p>
        </article>
        <article className="workforce-panel">
          <p className="eyebrow">Workforce designation</p>
          <h2>{workforce.role}</h2>
          <p>Designation does not grant permissions by itself. Access is controlled by separate, approved grants.</p>
        </article>
        <article className="workforce-panel">
          <p className="eyebrow">Security lifecycle</p>
          <h2>Verified</h2>
          <p>Email verified and authenticator enrollment completed.</p>
        </article>
      </section>
      <section className="workforce-panel workforce-activity">
        <div className="profile-section-heading"><div><p className="eyebrow">Assigned work</p><h2>Your duties</h2></div><span className="profile-count">{duties.length} assignments</span></div>
        {duties.length === 0 ? <p className="profile-empty">No duties have been assigned to this account.</p> : <div className="workforce-record-list">
          {duties.map(duty => <article className="workforce-record workforce-duty-card" key={duty.assignment_id}>
            <div><strong>{duty.title} · {duty.status.replaceAll("_", " ")}</strong><p>{duty.duty_code} · {duty.description}</p>
              {duty.due_at && <small>Due {new Date(duty.due_at).toLocaleString()}</small>}
              {duty.completion_note && <small>Submitted note: {duty.completion_note}</small>}
              {duty.status === "submitted" && <small>Submitted for independent manager review. It is not marked complete yet.</small>}
              {duty.status === "completed" && <small>Completion approved by an authorised reviewer.</small>}
              {duty.status === "rejected" && <small>Submission was rejected. Contact your manager for clarification.</small>}
            </div>
            {duty.status === "assigned" && <button className="profile-primary" type="button" disabled={busyDuty === duty.assignment_id} onClick={() => updateDuty(duty.assignment_id,"accepted")}>Accept duty</button>}
            {duty.status === "accepted" && <button className="profile-primary" type="button" disabled={busyDuty === duty.assignment_id} onClick={() => updateDuty(duty.assignment_id,"in_progress")}>Start duty</button>}
            {duty.status === "in_progress" && <div className="workforce-duty-submit">
              <label>Completion note (required)
                <textarea minLength={10} maxLength={2000} value={completionNotes[duty.assignment_id] ?? ""} onChange={event => setCompletionNotes(current => ({...current,[duty.assignment_id]:event.target.value}))} />
              </label>
              <label>Evidence reference (optional)
                <input maxLength={2048} value={evidenceReferences[duty.assignment_id] ?? ""} onChange={event => setEvidenceReferences(current => ({...current,[duty.assignment_id]:event.target.value}))} />
              </label>
              <button className="profile-primary" type="button" disabled={busyDuty === duty.assignment_id || (completionNotes[duty.assignment_id] ?? "").trim().length < 10} onClick={() => updateDuty(duty.assignment_id,"submitted")}>Submit for review</button>
            </div>}
          </article>)}
        </div>}
      </section>
      <section className="workforce-panel workforce-activity">
        <div className="profile-section-heading">
          <div><p className="eyebrow">Duty and access trace</p><h2>Recent activity</h2></div>
          <span className="profile-count">{workforce.recentActivity.length} records</span>
        </div>
        {workforce.recentActivity.length === 0
          ? <p className="profile-empty">No workforce activity has been recorded yet. Duty events will appear here when completed through approved workflows.</p>
          : <ol className="workforce-activity-list">
              {workforce.recentActivity.map((item, index) => <li key={item.eventType + item.occurredAt + index}>
                <div><strong>{item.eventType.replaceAll(".", " ")}</strong><span>{item.outcome}</span></div>
                <time dateTime={item.occurredAt}>{new Date(item.occurredAt).toLocaleString()}</time>
              </li>)}
            </ol>}
      </section>
    </>}
  </main>;
}
