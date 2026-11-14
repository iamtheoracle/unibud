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
      if (active) setWorkforce(result.workforce as WorkforceSelf);
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : "Workforce dashboard is unavailable.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

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
