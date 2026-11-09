"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileKind = "personal" | "creator" | "page_community";
type ProfileRecord = {
  accountId: string;
  relationship: "owner" | "delegated";
  membershipStatus: "active" | "pending" | "suspended" | "revoked";
  canSwitchToProfile: boolean;
  profile: {
    id: string;
    ownerAccountId: string;
    kind: ProfileKind;
    handle: string;
    displayName: string;
    visibility: "private" | "limited" | "public";
    status: string;
  };
};
type DelegateRole = "admin" | "moderator" | "editor" | "member" | "seller" | "provider" | "professional" | "student" | "staff" | "operator" | "viewer";

const roleOptions: DelegateRole[] = ["admin", "moderator", "editor", "moderator", "viewer"];

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: string };
    return body.error ?? "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export function ProfileManager({ activeProfileId }: { activeProfileId: string | null }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [kind, setKind] = useState<"creator" | "page_community">("creator");
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [visibility, setVisibility] = useState<"private" | "limited" | "public">("private");
  const [selectedDelegationProfile, setSelectedDelegationProfile] = useState("");
  const [delegates, setDelegates] = useState<ProfileRecord[]>([]);
  const [delegateAccountId, setDelegateAccountId] = useState("");
  const [delegateRole, setDelegateRole] = useState<DelegateRole>("editor");
  const [canDelegateSwitch, setCanDelegateSwitch] = useState(false);

  const ownedProfiles = useMemo(() => profiles.filter((item) => item.relationship === "owner"), [profiles]);
  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/profiles", { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      const body = await response.json() as { profiles: ProfileRecord[] };
      setProfiles(body.profiles ?? []);
      setSelectedDelegationProfile((current) => current || (body.profiles ?? []).find((p) => p.relationship === "owner" && p.profile.kind === "page_community")?.profile.id || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProfiles(); }, [loadProfiles]);

  const loadDelegates = useCallback(async (profileId: string) => {
    if (!profileId) { setDelegates([]); return; }
    try {
      const response = await fetch("/api/profiles/delegations?profileId=" + encodeURIComponent(profileId), { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      const body = await response.json() as { delegatedAccess: ProfileRecord[] };
      setDelegates(body.delegatedAccess ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load delegated access.");
    }
  }, []);

  useEffect(() => { void loadDelegates(selectedDelegationProfile); }, [selectedDelegationProfile, loadDelegates]);

  async function switchProfile(profileId: string) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profiles/switch", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileId })
      });
      if (!response.ok) throw new Error(await readError(response));
      setNotice("Profile switched. Refreshing your workspace…");
      router.refresh();
      window.location.assign("/home");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not switch profile.");
    } finally { setBusy(false); }
  }

  async function createProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profiles", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, handle, displayName, visibility })
      });
      if (!response.ok) throw new Error(await readError(response));
      setHandle(""); setDisplayName("");
      setNotice("Your new profile has been created.");
      await loadProfiles();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create profile.");
    } finally { setBusy(false); }
  }

  async function grantDelegate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selectedDelegationProfile) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profiles/delegations", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profileId: selectedDelegationProfile, delegateAccountId: delegateAccountId.trim(),
          role: delegateRole, canSwitchToProfile: canDelegateSwitch
        })
      });
      if (!response.ok) throw new Error(await readError(response));
      setDelegateAccountId(""); setNotice("Delegated access granted.");
      await loadDelegates(selectedDelegationProfile);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not grant access.");
    } finally { setBusy(false); }
  }

  async function revokeDelegate(delegateId: string) {
    if (!selectedDelegationProfile || !window.confirm("Revoke this person's access to the selected profile?")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profiles/delegations", {
        method: "DELETE", headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId: selectedDelegationProfile, delegateAccountId: delegateId })
      });
      if (!response.ok) throw new Error(await readError(response));
      setNotice("Delegated access revoked.");
      await loadDelegates(selectedDelegationProfile);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not revoke access.");
    } finally { setBusy(false); }
  }

  return (
    <div className="profile-page">
      <section className="profile-intro">
        <p className="eyebrow">Your identities</p>
        <h1>One account.<br />Different sides of you.</h1>
        <p className="lead">Keep your personal identity, creator work and communities distinct. Switch context without creating another account.</p>
      </section>

      {error && <p className="profile-alert profile-error" role="alert">{error}</p>}
      {notice && <p className="profile-alert profile-notice" role="status">{notice}</p>}

      <section className="profile-section">
        <div className="profile-section-heading"><div><p className="eyebrow">Your profiles</p><h2>Switch identity</h2></div><span className="profile-count">{profiles.length} available</span></div>
        {loading ? <p className="profile-muted">Loading your profiles…</p> : profiles.length === 0 ? <p className="profile-muted">No profiles are available yet. Complete onboarding to create your personal profile.</p> : (
          <div className="profile-list">
            {profiles.map((item) => {
              const active = item.profile.id === activeProfileId;
              return <article className={"profile-card" + (active ? " is-active" : "")} key={item.profile.id}>
                <div className="profile-avatar" aria-hidden="true">{item.profile.displayName.slice(0, 1).toUpperCase()}</div>
                <div className="profile-card-copy">
                  <div className="profile-card-title"><h3>{item.profile.displayName}</h3>{active && <span className="profile-active-tag">Current</span>}</div>
                  <p>@{item.profile.handle} · {item.profile.kind === "page_community" ? "Page / community" : item.profile.kind === "creator" ? "Creator" : "Personal"}</p>
                  <small>{item.relationship === "owner" ? "Owned by you" : "Delegated access"} · {item.membershipStatus}</small>
                </div>
                <button className="profile-action" type="button" disabled={busy || active || !item.canSwitchToProfile || item.membershipStatus !== "active"} onClick={() => void switchProfile(item.profile.id)}>
                  {active ? "Active" : "Switch"}
                </button>
              </article>;
            })}
          </div>
        )}
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><div><p className="eyebrow">Grow your presence</p><h2>Create another profile</h2></div></div>
        <p className="profile-muted">Create a separate creator identity or a page/community. Your personal profile and account remain separate.</p>
        <form className="profile-form" onSubmit={createProfile}>
          <label>Profile type<select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="creator">Creator profile</option><option value="page_community">Page / community</option></select></label>
          <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} required placeholder={kind === "creator" ? "Your creator name" : "Community or page name"} /></label>
          <label>Unique handle<input value={handle} onChange={(event) => setHandle(event.target.value)} minLength={3} maxLength={30} pattern="[A-Za-z0-9][A-Za-z0-9._-]{1,28}[A-Za-z0-9]" required placeholder="your.handle" /><small>3–30 characters. Letters, numbers, dots, underscores and hyphens.</small></label>
          <label>Initial visibility<select value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)}><option value="private">Private — only approved access</option><option value="limited">Limited — selected information</option><option value="public">Public — discoverable</option></select></label>
          <button className="profile-primary" type="submit" disabled={busy}>{busy ? "Please wait…" : "Create profile"}</button>
        </form>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><div><p className="eyebrow">Shared management</p><h2>Page administrators</h2></div></div>
        <p className="profile-muted">Grant access to a page or community without sharing your personal account. A delegate only receives the selected profile access.</p>
        {ownedProfiles.filter((item) => item.profile.kind === "page_community").length === 0 ? <p className="profile-empty">Create a page/community profile before adding administrators.</p> : <>
          <label className="profile-field">Choose a page or community<select value={selectedDelegationProfile} onChange={(event) => setSelectedDelegationProfile(event.target.value)}>{ownedProfiles.filter((item) => item.profile.kind === "page_community").map((item) => <option key={item.profile.id} value={item.profile.id}>{item.profile.displayName}</option>)}</select></label>
          <div className="delegate-list">
            {delegates.length === 0 ? <p className="profile-muted">No delegated members for this profile yet.</p> : delegates.map((delegate) => <article className="delegate-row" key={delegate.accountId}><div><strong>{delegate.profile.displayName}</strong><small>Account {delegate.accountId} · {delegate.membershipStatus}</small></div><button className="profile-text-action" type="button" disabled={busy} onClick={() => void revokeDelegate(delegate.accountId)}>Revoke</button></article>)}
          </div>
          <form className="profile-form delegate-form" onSubmit={grantDelegate}>
            <label>Delegate’s UNIBUD account ID<input value={delegateAccountId} onChange={(event) => setDelegateAccountId(event.target.value)} required placeholder="Account ID supplied by the person" /></label>
            <label>Role<select value={delegateRole} onChange={(event) => setDelegateRole(event.target.value as DelegateRole)}>{roleOptions.map((role, index) => <option key={role + index} value={role}>{role}</option>)}</select></label>
            <label className="profile-check"><input type="checkbox" checked={canDelegateSwitch} onChange={(event) => setCanDelegateSwitch(event.target.checked)} /> Allow this delegate to switch into this page profile</label>
            <button className="profile-secondary" type="submit" disabled={busy}>Grant page access</button>
          </form>
        </>}
      </section>
    </div>
  );
}
