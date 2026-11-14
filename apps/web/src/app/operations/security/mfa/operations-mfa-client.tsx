"use client";

import Link from "next/link";
import QRCode from "qrcode";
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
  const [reauthMode, setReauthMode] = useState<"account" | "workforce">("account");
  const [workforceUsername, setWorkforceUsername] = useState("");
  const [workforcePasscode, setWorkforcePasscode] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");
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

  useEffect(() => {
    let active = true;
    setQrDataUrl("");
    setQrError("");
    if (!provisioningUri) return () => { active = false; };
    // Generate the QR locally. The provisioning URI and seed never leave this
    // browser session through a third-party QR service or remote image request.
    QRCode.toDataURL(provisioningUri, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 240
    }).then(dataUrl => {
      if (active) setQrDataUrl(dataUrl);
    }).catch(() => {
      if (active) setQrError("The QR image could not be generated. Use the manual setup key below.");
    });
    return () => { active = false; };
  }, [provisioningUri]);

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

  function reauthenticationBody(): Record<string, string> {
    return reauthMode === "workforce"
      ? { username: workforceUsername.trim().toLowerCase(), passcode: workforcePasscode }
      : { channel, identifier, password };
  }

  function reauthenticationFields() {
    return <>
      <label>Credential type
        <select value={reauthMode} onChange={event => setReauthMode(event.target.value as "account" | "workforce")}>
          <option value="account">Personal account password</option>
          <option value="workforce">Workforce username and passcode</option>
        </select>
      </label>
      {reauthMode === "workforce" ? <>
        <label>System-issued username
          <input autoComplete="username" value={workforceUsername} onChange={event => setWorkforceUsername(event.target.value.trim().toLowerCase())} required maxLength={32} pattern="ub-(staff|operator|admin)-[a-f0-9]{16}" />
        </label>
        <label>Six-digit workforce passcode
          <input type="password" inputMode="numeric" autoComplete="current-password" pattern="[0-9]{6}" maxLength={6} value={workforcePasscode} onChange={event => setWorkforcePasscode(event.target.value.replace(/\D/g, "").slice(0, 6))} required />
        </label>
      </> : <>
        <label>Account identifier type
          <select value={channel} onChange={event => setChannel(event.target.value as "email" | "phone")}>
            <option value="email">Email</option><option value="phone">Phone</option>
          </select>
        </label>
        <label>{channel === "email" ? "Email address" : "Phone number"}
          <input autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} required maxLength={254} />
        </label>
        <label>Current account password
          <input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required maxLength={128} />
        </label>
      </>}
    </>;
  }

  async function startEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await post("/api/internal/operations/mfa/enrollment/start", reauthenticationBody());
      setProvisioningUri(data.provisioningUri || "");
      setPassword(""); setWorkforcePasscode("");
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
      const data = await post("/api/internal/operations/mfa/enrollment/resume", reauthenticationBody());
      setProvisioningUri(data.provisioningUri || "");
      setPassword(""); setWorkforcePasscode("");
      setNotice("Your pending setup has been securely retrieved after reauthentication.");
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
      const data = await post("/api/internal/operations/mfa/recovery/regenerate", reauthenticationBody());
      if (data.recoveryCodesShownOnce !== true || !Array.isArray(data.recoveryCodes) || data.recoveryCodes.length < 8) {
        throw new Error("The replacement recovery codes were not returned. Do not continue without saving them.");
      }
      setRecoveryCodes(data.recoveryCodes);
      setAcknowledged(false);
      setPassword(""); setWorkforcePasscode("");
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
        <p className="mfa-muted">Reauthenticate with your personal password or workforce passcode. A new authenticator seed is generated and stored encrypted on the server.</p>
        <form className="mfa-form" onSubmit={startEnrollment}>
          {reauthenticationFields()}
          <button className="mfa-button" type="submit" disabled={busy}>{busy ? "Please wait…" : "Begin authenticator setup"}</button>
        </form>
      </section>}

      {status.credentialState === "pending" && !provisioningUri && !status.locked && <section className="mfa-card">
        <p className="eyebrow">Resume setup</p><h2>Continue your pending enrollment</h2>
        <p className="mfa-muted">If you closed the original setup screen, reauthenticate to retrieve the pending authenticator setup. This does not create a new seed.</p>
        <form className="mfa-form" onSubmit={resumeEnrollment}>
          {reauthenticationFields()}
          <button className="mfa-button" type="submit" disabled={busy}>{busy ? "Please wait…" : "Resume pending setup"}</button>
        </form>
      </section>}

      {provisioningUri && <section className="mfa-card">
        <p className="eyebrow">Step 2</p><h2>Add the authenticator</h2>
        <p className="mfa-muted">Open the authenticator link on this device or enter the setup key manually in your authenticator app. This key is sensitive; do not share it or save it in an unprotected place.</p>
        <a className="mfa-button mfa-link-button" href={provisioningUri}>Open authenticator app</a>
        {qrDataUrl ? <div className="mfa-qr-wrap"><img src={qrDataUrl} alt="Authenticator setup QR code" width={240} height={240} /></div> : <p className="mfa-small" role={qrError ? "status" : undefined}>{qrError || "Preparing your secure setup QR code…"}</p>}
        <div className="mfa-secret-label"><span>Manual setup key</span><code className="mfa-secret">{setupSecret}</code></div>
        <p className="mfa-small">If you cannot scan the QR code, enter the manual setup key in your authenticator app instead.</p>
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
        <p className="mfa-muted">This replaces every existing recovery code. It requires your account password or workforce passcode and a fresh authenticator challenge in this exact session.</p>
        <form className="mfa-form" onSubmit={regenerateRecovery}>
          {reauthenticationFields()}
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
    {status?.operator && <OperationsMfaRequestsPanel />}
    <footer className="mfa-footer"><Link href="/home">Return to UNIBUD</Link><span>Security changes are enforced by the server and database, not this screen.</span></footer>
  </main>;
}


function OperationsMfaRequestsPanel() {
  type SecurityRequest = {
    request_id: string;
    target_account_id: string;
    requested_action: "disable" | "reset";
    state: "pending" | "completed" | "rejected" | "cancelled" | "expired";
    requester_account_id: string;
    approver_account_id: string | null;
    reason_code: string;
    created_at: string;
    expires_at: string;
    decided_at: string | null;
    completed_at: string | null;
  };
  const [requests, setRequests] = useState<SecurityRequest[]>([]);
  const [viewerAccountId, setViewerAccountId] = useState("");
  const [targetAccountId, setTargetAccountId] = useState("");
  const [action, setAction] = useState<"disable" | "reset">("reset");
  const [reasonCode, setReasonCode] = useState("lost_device");
  const [decisionReason, setDecisionReason] = useState("reviewed_and_verified");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRequest, setSelectedRequest] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    const response = await fetch("/api/internal/operations/mfa/requests?limit=50", {
      method: "GET", credentials: "same-origin", cache: "no-store"
    });
    const data = await response.json() as { ok?: boolean; error?: string; viewerAccountId?: string; requests?: SecurityRequest[] };
    if (!response.ok || !data.ok) throw new Error(data.error || "The approval queue is unavailable.");
    setViewerAccountId(data.viewerAccountId || "");
    setRequests(Array.isArray(data.requests) ? data.requests : []);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/internal/operations/mfa/requests?limit=50", {
      method: "GET", credentials: "same-origin", cache: "no-store"
    }).then(async response => {
      const data = await response.json() as { ok?: boolean; error?: string; viewerAccountId?: string; requests?: SecurityRequest[] };
      if (!response.ok || !data.ok) throw new Error(data.error || "The approval queue is unavailable.");
      if (active) {
        setViewerAccountId(data.viewerAccountId || "");
        setRequests(Array.isArray(data.requests) ? data.requests : []);
      }
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : "The approval queue is unavailable.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submit(path: string, body: Record<string, string>) {
    const response = await fetch(path, {
      method: "POST", credentials: "same-origin", cache: "no-store",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    const data = await response.json() as { ok?: boolean; error?: string };
    if (!response.ok || !data.ok) throw new Error(data.error || "The request could not be completed.");
    return data;
  }

  async function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await submit("/api/internal/operations/mfa/requests", {
        targetAccountId, action, reasonCode, channel, identifier, password
      });
      setPassword(""); setTargetAccountId("");
      setNotice("Security-change request submitted. It requires a separate authorised approver.");
      await loadRequests();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Request submission failed.");
    } finally { setBusy(false); }
  }

  async function decide(requestId: string, decision: "approve" | "reject") {
    setBusy(true); setError(""); setNotice("");
    try {
      await submit(`/api/internal/operations/mfa/requests/${requestId}/decision`, {
        decision, reasonCode: decisionReason, channel, identifier, password
      });
      setPassword("");
      setNotice(decision === "approve" ? "The approved security change was completed." : "The request was rejected.");
      setSelectedRequest("");
      await loadRequests();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The decision could not be recorded.");
    } finally { setBusy(false); }
  }

  async function cancel(requestId: string) {
    setBusy(true); setError(""); setNotice("");
    try {
      await submit(`/api/internal/operations/mfa/requests/${requestId}/cancel`, { reasonCode: "requester_cancelled" });
      setNotice("Your pending request was cancelled.");
      await loadRequests();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The request could not be cancelled.");
    } finally { setBusy(false); }
  }

  return <section className="mfa-card" aria-labelledby="mfa-dual-control-heading">
    <p className="eyebrow">Operations · dual control</p>
    <h2 id="mfa-dual-control-heading">Authenticator security requests</h2>
    <p className="mfa-muted">Disable and reset actions require a separate authorised operator. Request and decision permissions are checked again by the database; this interface does not grant access.</p>
    {error && <p className="mfa-alert mfa-error" role="alert">{error}</p>}
    {notice && <p className="mfa-alert mfa-notice" role="status">{notice}</p>}
    <div className="mfa-card-head"><h3>Submit a security request</h3></div>
    <form className="mfa-form" onSubmit={createRequest}>
      <label>Target account ID<input value={targetAccountId} onChange={e => setTargetAccountId(e.target.value.trim())} required maxLength={36} pattern="[0-9a-fA-F-]{36}" aria-describedby="mfa-target-help"/></label>
      <p className="mfa-small" id="mfa-target-help">Use the account identifier from the authorised Operations account record. The server and database verify target eligibility.</p>
      <label>Requested action<select value={action} onChange={e => setAction(e.target.value as "disable" | "reset")}><option value="reset">Reset authenticator</option><option value="disable">Disable authenticator</option></select></label>
      <label>Reason code<input value={reasonCode} onChange={e => setReasonCode(e.target.value)} required minLength={3} maxLength={48} pattern="[a-z][a-z0-9_]{2,47}"/></label>
      <label>Account identifier type<select value={channel} onChange={e => setChannel(e.target.value as "email" | "phone")}><option value="email">Email</option><option value="phone">Phone</option></select></label>
      <label>{channel === "email" ? "Your account email" : "Your account phone"}<input value={identifier} onChange={e => setIdentifier(e.target.value)} required maxLength={254} autoComplete="username"/></label>
      <label>Current password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128} autoComplete="current-password"/></label>
      <button className="mfa-button" type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit for independent approval"}</button>
    </form>
    <div className="mfa-card-head"><h3>Pending approval queue</h3><button className="mfa-secondary" type="button" disabled={busy} onClick={() => { setError(""); void loadRequests().catch(e => setError(e instanceof Error ? e.message : "Refresh failed.")); }}>Refresh queue</button></div>
    {loading ? <p role="status">Loading requests…</p> : requests.length === 0 ? <p className="mfa-muted">No pending requests are available to this account. The server returns requests only to operators with the required approval permission and current session MFA.</p> :
      <ul className="mfa-recovery-list">{requests.map(item => <li key={item.request_id}>
        <div><strong>{item.requested_action === "reset" ? "Authenticator reset" : "Authenticator disable"}</strong> · <span>{item.state}</span></div>
        <p className="mfa-small">Target: <code>{item.target_account_id}</code></p>
        <p className="mfa-small">Requester: <code>{item.requester_account_id}</code></p>
        <p className="mfa-small">Reason: {item.reason_code} · Expires: {new Date(item.expires_at).toLocaleString()}</p>
        {item.state === "pending" && <>
          {item.requester_account_id !== viewerAccountId && <button className="mfa-secondary" type="button" disabled={busy} onClick={() => setSelectedRequest(selectedRequest === item.request_id ? "" : item.request_id)}>Review decision</button>}
          {item.requester_account_id === viewerAccountId && <button className="mfa-secondary" type="button" disabled={busy} onClick={() => void cancel(item.request_id)}>Cancel my request</button>}
          {selectedRequest === item.request_id && item.requester_account_id !== viewerAccountId && <div className="mfa-form">
            <label>Decision reason code<input value={decisionReason} onChange={e => setDecisionReason(e.target.value)} required minLength={3} maxLength={48} pattern="[a-z][a-z0-9_]{2,47}"/></label>
            <label>Approver account identifier type<select value={channel} onChange={e => setChannel(e.target.value as "email" | "phone")}><option value="email">Email</option><option value="phone">Phone</option></select></label>
            <label>{channel === "email" ? "Approver account email" : "Approver account phone"}<input value={identifier} onChange={e => setIdentifier(e.target.value)} required maxLength={254} autoComplete="username"/></label>
            <label>Approver current password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128} autoComplete="current-password"/></label>
            <div className="mfa-card-head"><button className="mfa-button" type="button" disabled={busy} onClick={() => void decide(item.request_id, "approve")}>Approve and complete</button><button className="mfa-secondary" type="button" disabled={busy} onClick={() => void decide(item.request_id, "reject")}>Reject request</button></div>
          </div>}
        </>}
      </li>)}</ul>}
    <p className="mfa-small">The queue is refreshed from authenticated server data. Session identifiers, MFA secrets and recovery digests are never displayed.</p>
  </section>;
}
