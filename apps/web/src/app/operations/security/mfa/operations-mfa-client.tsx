"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type MfaStatus = {
  operator: boolean;
  credentialState: "none" | "pending" | "active" | "expired";
  enrollmentExpiresAt?: string | null;
  locked: boolean;
  lockedUntil?: string | null;
  stepUpExpiresAt?: string | null;
};

type ApiResult = {
  ok?: boolean;
  error?: string;
  status?: MfaStatus;
  provisioningUri?: string;
  state?: string;
  recoveryCodes?: string[];
  recoveryCodesShownOnce?: boolean;
  message?: string;
  next?: string;
};

export default function OperationsMfaClient() {
  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [challengeCode, setChallengeCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);

  async function refreshStatus() {
    const response = await fetch("/api/internal/operations/mfa/status", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin"
    });
    const data = await response.json() as ApiResult;
    if (!response.ok || !data.ok || !data.status) {
      throw new Error(data.error || "MFA status is temporarily unavailable.");
    }
    setStatus(data.status);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/internal/operations/mfa/status", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin"
    }).then(async response => {
      const data = await response.json() as ApiResult;
      if (!response.ok || !data.ok || !data.status) {
        throw new Error(data.error || "MFA status is temporarily unavailable.");
      }
      if (active) setStatus(data.status);
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : "MFA status is unavailable.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function post(path: string, body: Record<string, string>): Promise<ApiResult> {
    const response = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json() as ApiResult;
    if (!response.ok || !data.ok) throw new Error(data.error || "The request could not be completed.");
    return data;
  }

  async function startEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await post("/api/internal/operations/mfa/enrollment/start", {
        channel, identifier, password
      });
      setProvisioningUri(data.provisioningUri || "");
      setPassword("");
      setNotice("Pending authenticator setup created. Add it to your authenticator, then enter its current code.");
      await refreshStatus();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Enrollment could not start.");
    } finally { setBusy(false); }
  }

  async function resumeEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await post("/api/internal/operations/mfa/enrollment/resume", {
        channel, identifier, password
      });
      setProvisioningUri(data.provisioningUri || "");
      setPassword("");
      setNotice("Your pending setup has been securely retrieved after password reauthentication.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Pending enrollment could not be resumed.");
    } finally { setBusy(false); }
  }

  async function confirmEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await post("/api/internal/operations/mfa/enrollment/confirm", { code: confirmationCode });
      if (data.recoveryCodesShownOnce !== true || !Array.isArray(data.recoveryCodes) || data.recoveryCodes.length < 8) {
        throw new Error("Recovery codes were not returned. Do not continue without saving them.");
      }
      setRecoveryCodes(data.recoveryCodes);
      setAcknowledged(false);
      setConfirmationCode("");
      setProvisioningUri("");
      setNotice(data.message || "Authenticator activated.");
      await refreshStatus();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authenticator confirmation failed.");
      try { await refreshStatus(); } catch { /* keep the original error visible */ }
    } finally { setBusy(false); }
  }

  async function challenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      await post("/api/internal/operations/mfa/challenge", { code: challengeCode });
      setChallengeCode("");
      setNotice("This session is verified for Operations for five minutes.");
      await refreshStatus();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The authenticator challenge failed.");
      try { await refreshStatus(); } catch { /* keep the original error visible */ }
    } finally { setBusy(false); }
  }

  async function regenerateRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await post("/api/internal/operations/mfa/recovery/regenerate", {
        channel, identifier, password
      });
      if (data.recoveryCodesShownOnce !== true || !Array.isArray(data.recoveryCodes) || data.recoveryCodes.length < 8) {
        throw new Error("The replacement recovery codes were not returned. Do not continue without saving them.");
      }
      setRecoveryCodes(data.recoveryCodes);
      setAcknowledged(false);
      setPassword("");
      setNotice(data.message || "Recovery codes regenerated. Save the new set now.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Recovery codes could not be regenerated.");
    } finally { setBusy(false); }
  }

  async function redeemRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await post("/api/internal/operations/mfa/recovery/redeem", { code: recoveryCode });
      setRecoveryCode("");
      setProvisioningUri("");
      setNotice(data.message || "Recovery accepted. Enroll a new authenticator.");
      await refreshStatus();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Recovery was not accepted.");
      try { await refreshStatus(); } catch { /* keep the original error visible */ }
    } finally { setBusy(false); }
  }

  const setupSecret = (() => {
    try { return new URL(provisioningUri).searchParams.get("secret") || ""; }
    catch { return ""; }
  })();

  if (loading) return <main className="mfa-shell"><p className="eyebrow">UNIBUD Operations</p><p role="status">Loading security status…</p></main>;

  return <main className="mfa-shell">
    <header className="mfa-header">
      <Link className="wordmark" href="/home">unibud<span>.</span></Link>
      <p className="eyebrow">Operations security</p>
    </header>
    <section className="mfa-intro">
      <p className="eyebrow">Account protection</p>
      <h1>Authenticator security</h1>
      <p>Protect privileged Operations access with a separate authenticator. Verification is tied to this exact sign-in session and expires after five minutes.</p>
    </section>

    {error && <p className="mfa-alert mfa-error" role="alert">{error}</p>}
    {notice && <p className="mfa-alert mfa-notice" role="status">{notice}</p>}

    {!status ? <section className="mfa-card">
      <h2>Security status unavailable</h2>
      <p>The server could not confirm this account&apos;s Operations status. No privileged access is granted by this screen.</p>
    </section> : !status.operator ? <section className="mfa-card">
      <h2>Operations access not assigned</h2>
      <p>This account does not have an active Operations grant. Student, tutor, institution, creator, page and community roles do not provide Operations access.</p>
    </section> : <>
      <section className="mfa-card">
        <div className="mfa-card-head"><div><p className="eyebrow">Current status</p><h2>{status.credentialState === "active" ? "Authenticator active" : status.credentialState === "pending" ? "Setup awaiting confirmation" : "Authenticator not enrolled"}</h2></div>
          <span className={status.locked ? "mfa-state is-locked" : "mfa-state"}>{status.locked ? "Locked" : status.stepUpExpiresAt ? "Session verified" : "Not stepped up"}</span>
        </div>
        <p className="mfa-muted">{status.locked ? "Authenticator attempts are temporarily locked. Wait until the lockout expires before trying again." : status.stepUpExpiresAt ? "This browser session currently has Operations MFA assurance." : "A valid authenticator is not enough by itself; each session must complete a fresh challenge."}</p>
        {status.lockedUntil && <p className="mfa-muted">Lockout ends: {new Date(status.lockedUntil).toLocaleString()}</p>}
        {status.stepUpExpiresAt && <p className="mfa-muted">Session assurance expires: {new Date(status.stepUpExpiresAt).toLocaleString()}</p>}
      </section>

      {(status.credentialState === "none" || status.credentialState === "expired") && !status.locked && <section className="mfa-card">
        <p className="eyebrow">Step 1</p><h2>Set up an authenticator</h2>
        <p className="mfa-muted">Re-enter the password for this account. A new authenticator seed is generated and stored encrypted on the server.</p>
        <form className="mfa-form" onSubmit={startEnrollment}>
          <label>Account identifier type<select value={channel} onChange={e => setChannel(e.target.value as "email" | "phone")}><option value="email">Email</option><option value="phone">Phone</option></select></label>
          <label>{channel === "email" ? "Email address" : "Phone number"}<input autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} required maxLength={254}/></label>
          <label>Current password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128}/></label>
          <button className="mfa-button" type="submit" disabled={busy}>{busy ? "Please wait…" : "Begin authenticator setup"}</button>
        </form>
      </section>}

      {status.credentialState === "pending" && !provisioningUri && !status.locked && <section className="mfa-card">
        <p className="eyebrow">Resume setup</p><h2>Continue your pending enrollment</h2>
        <p className="mfa-muted">If you closed the original setup screen, re-enter your password to retrieve the pending authenticator setup. This does not create a new seed.</p>
        <form className="mfa-form" onSubmit={resumeEnrollment}>
          <label>Account identifier type<select value={channel} onChange={e => setChannel(e.target.value as "email" | "phone")}><option value="email">Email</option><option value="phone">Phone</option></select></label>
          <label>{channel === "email" ? "Email address" : "Phone number"}<input autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} required maxLength={254}/></label>
          <label>Current password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128}/></label>
          <button className="mfa-button" type="submit" disabled={busy}>{busy ? "Please wait…" : "Resume pending setup"}</button>
        </form>
      </section>}

      {provisioningUri && <section className="mfa-card">
        <p className="eyebrow">Step 2</p><h2>Add the authenticator</h2>
        <p className="mfa-muted">Open the authenticator link on this device or enter the setup key manually in your authenticator app. This key is sensitive; do not share it or save it in an unprotected place.</p>
        <a className="mfa-button mfa-link-button" href={provisioningUri}>Open authenticator app</a>
        <div className="mfa-secret-label"><span>Manual setup key</span><code className="mfa-secret">{setupSecret}</code></div>
        <p className="mfa-small">QR scanning is not available in this build. Manual setup is provided as a temporary fallback.</p>
        <form className="mfa-form" onSubmit={confirmEnrollment}>
          <label>Six-digit authenticator code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={confirmationCode} onChange={e => setConfirmationCode(e.target.value.replace(/\D/g, "").slice(0,6))} required/></label>
          <button className="mfa-button" type="submit" disabled={busy || confirmationCode.length !== 6}>{busy ? "Verifying…" : "Confirm and activate"}</button>
        </form>
      </section>}

      {recoveryCodes.length > 0 && <section className="mfa-card">
        <p className="eyebrow">Save once</p><h2>Your recovery codes</h2>
        <p className="mfa-muted">Each code works once. These are shown only now and cannot be retrieved later. Store them somewhere secure and separate from your authenticator device.</p>
        <ol className="mfa-recovery-list">{recoveryCodes.map(code => <li key={code}><code>{code}</code></li>)}</ol>
        <label className="mfa-ack"><input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)}/> I have saved these recovery codes somewhere secure.</label>
        <button className="mfa-button" type="button" disabled={!acknowledged} onClick={() => { setRecoveryCodes([]); setNotice("Recovery codes acknowledged. Complete a fresh challenge to verify this session."); }}>I have saved my codes</button>
      </section>}

      {status.credentialState === "active" && !status.stepUpExpiresAt && !status.locked && recoveryCodes.length === 0 && <section className="mfa-card">
        <p className="eyebrow">Step 3</p><h2>Verify this session</h2>
        <p className="mfa-muted">Enter the current six-digit code from your authenticator. A successful challenge grants five minutes of assurance to this session only.</p>
        <form className="mfa-form" onSubmit={challenge}>
          <label>Six-digit authenticator code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={challengeCode} onChange={e => setChallengeCode(e.target.value.replace(/\D/g, "").slice(0,6))} required/></label>
          <button className="mfa-button" type="submit" disabled={busy || challengeCode.length !== 6}>{busy ? "Verifying…" : "Verify this session"}</button>
        </form>
      </section>}

      {status.credentialState === "active" && status.stepUpExpiresAt && !status.locked && recoveryCodes.length === 0 && <section className="mfa-card">
        <p className="eyebrow">Recovery maintenance</p><h2>Regenerate recovery codes</h2>
        <p className="mfa-muted">This replaces every existing recovery code. It requires your password and a fresh authenticator challenge in this exact session.</p>
        <form className="mfa-form" onSubmit={regenerateRecovery}>
          <label>Account identifier type<select value={channel} onChange={e => setChannel(e.target.value as "email" | "phone")}><option value="email">Email</option><option value="phone">Phone</option></select></label>
          <label>{channel === "email" ? "Email address" : "Phone number"}<input autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} required maxLength={254}/></label>
          <label>Current password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128}/></label>
          <button className="mfa-secondary" type="submit" disabled={busy}>{busy ? "Please wait…" : "Replace recovery codes"}</button>
        </form>
      </section>}

      {status.credentialState === "active" && !status.locked && recoveryCodes.length === 0 && <section className="mfa-card">
        <p className="eyebrow">Lost authenticator</p><h2>Use a recovery code</h2>
        <p className="mfa-muted">A recovery code can be used once. Redeeming it invalidates the old authenticator and every Operations step-up session. You must reauthenticate with your password and enroll a new authenticator.</p>
        <form className="mfa-form" onSubmit={redeemRecovery}>
          <label>Recovery code<input autoComplete="off" value={recoveryCode} onChange={e => setRecoveryCode(e.target.value.toUpperCase().slice(0,23))} placeholder="XXXXX-XXXXX-XXXXX-XXXXX" required/></label>
          <button className="mfa-secondary" type="submit" disabled={busy || recoveryCode.length !== 23}>{busy ? "Checking…" : "Redeem recovery code"}</button>
        </form>
      </section>}
    </>}
    <footer className="mfa-footer"><Link href="/home">Return to UNIBUD</Link><span>Security changes are enforced by the server and database, not this screen.</span></footer>
  </main>;
}
