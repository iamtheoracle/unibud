"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [mode, setMode] = useState<"personal" | "workforce">("personal");
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint = mode === "personal" ? "/api/auth/login" : "/api/workforce/login";
      const payload = mode === "personal"
        ? { channel, identifier, password }
        : { username: username.trim().toLowerCase(), passcode };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || (mode === "personal" && result.state !== "authenticated")
          || (mode === "workforce" && !["mfa_enrollment_required", "mfa_verification_required"].includes(result.state))) {
        throw new Error(result.error ?? "Sign-in failed.");
      }
      if (mode === "workforce") {
        router.replace("/operations/security/mfa");
        return;
      }
      const next = search.get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/home");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="auth-card">
    <p className="eyebrow">Welcome back</p>
    <h1>{mode === "personal" ? "Sign in to UNIBUD" : "Workforce access"}</h1>
    <p className="auth-copy">
      {mode === "personal"
        ? "Continue with the email address or phone number linked to your account."
        : "Use the username issued by UNIBUD. Workforce access is invite-only and requires authenticator verification before the dashboard."}
    </p>
    <div className="auth-tabs" role="group" aria-label="Account type">
      <button type="button" className={mode === "personal" ? "active" : ""} onClick={() => { setMode("personal"); setError(""); }}>Personal</button>
      <button type="button" className={mode === "workforce" ? "active" : ""} onClick={() => { setMode("workforce"); setError(""); }}>Staff / Operations</button>
    </div>
    <form onSubmit={submit} className="auth-form">
      {mode === "personal" ? <>
        <div className="auth-tabs" role="group" aria-label="Sign-in method">
          <button type="button" className={channel === "email" ? "active" : ""} onClick={() => setChannel("email")}>Email</button>
          <button type="button" className={channel === "phone" ? "active" : ""} onClick={() => setChannel("phone")}>Phone</button>
        </div>
        <label>{channel === "email" ? "Email address" : "Phone number"}</label>
        <input required autoComplete={channel === "email" ? "email" : "tel"} type={channel === "email" ? "email" : "tel"} value={identifier} onChange={event => setIdentifier(event.target.value)} />
        <label>Password</label>
        <input required autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} />
        <div className="auth-inline"><Link href="/recovery">Forgot password?</Link></div>
      </> : <>
        <label>System-issued username</label>
        <input required autoComplete="username" value={username} onChange={event => setUsername(event.target.value.trim().toLowerCase())} maxLength={32} pattern="ub-(staff|operator|admin)-[a-f0-9]{16}" />
        <label>Six-digit passcode</label>
        <input required inputMode="numeric" autoComplete="current-password" type="password" pattern="[0-9]{6}" maxLength={6} value={passcode} onChange={event => setPasscode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
        <p className="field-note">After sign-in, complete authenticator enrollment or verify your current authenticator before entering the workforce dashboard.</p>
      </>}
      <button className="auth-submit" disabled={busy}>
        {busy ? "Signing in…" : mode === "personal" ? "Sign in" : "Continue securely"}
      </button>
    </form>
    {error && <p className="auth-error" role="alert">{error}</p>}
    {mode === "personal"
      ? <p className="auth-switch">New to UNIBUD? <Link href="/signup">Create an account</Link></p>
      : <p className="auth-switch">Have an invitation? <Link href="/workforce/activate">Activate your workforce username</Link></p>}
  </section>;
}

export default function LoginPage() {
  return <main className="auth-page">
    <Link className="wordmark auth-wordmark" href="/">unibud<span>.</span></Link>
    <Suspense fallback={<div className="auth-card">Loading…</div>}>
      <LoginForm />
    </Suspense>
  </main>;
}
