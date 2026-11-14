"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WorkforceActivationPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (passcode !== confirmPasscode) throw new Error("The passcodes do not match.");
      const response = await fetch("/api/workforce/activate", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          activationCode,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          passcode,
          confirmPasscode
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok || result.state !== "email_verification_required") {
        throw new Error(result.error ?? "The activation could not be completed.");
      }
      const query = new URLSearchParams({
        challengeId: result.challengeId,
        purpose: "email_verification",
        next: "/operations/security/mfa"
      });
      router.replace("/verify?" + query.toString());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Activation is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <Link className="wordmark auth-wordmark" href="/">unibud<span>.</span></Link>
    <section className="auth-card">
      <p className="eyebrow">Workforce account activation</p>
      <h1>Set up your access</h1>
      <p className="auth-copy">Use the username and one-time code issued by your company. Enter your names and email, verify the email, and choose your own six-digit passcode. An authenticator is required before dashboard access.</p>
      <form onSubmit={submit} className="auth-form">
        <label>System-issued username</label>
        <input required autoComplete="username" value={username} onChange={event => setUsername(event.target.value.trim().toLowerCase())} maxLength={32} pattern="ub-(staff|operator|admin)-[a-f0-9]{16}" />
        <label>One-time activation code</label>
        <input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={activationCode} onChange={event => setActivationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
        <label>First name</label>
        <input required autoComplete="given-name" maxLength={80} value={firstName} onChange={event => setFirstName(event.target.value)} />
        <label>Last name</label>
        <input required autoComplete="family-name" maxLength={80} value={lastName} onChange={event => setLastName(event.target.value)} />
        <label>Personal work email</label>
        <input required type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
        <label>Choose your six-digit passcode</label>
        <input required type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{6}" maxLength={6} value={passcode} onChange={event => setPasscode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
        <label>Confirm your passcode</label>
        <input required type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{6}" maxLength={6} value={confirmPasscode} onChange={event => setConfirmPasscode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
        <button className="auth-submit" disabled={busy || passcode.length !== 6 || confirmPasscode.length !== 6}>{busy ? "Securing your account…" : "Activate and verify email"}</button>
      </form>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
    </section>
  </main>;
}
