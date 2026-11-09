"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileKind = "personal" | "creator" | "page_community";
type ProfileRecord = {
  accountId: string;
  relationship: "owner" | "delegated";
  role: string;
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
type IncomingInvitation = { id:string; profileId:string; profileName:string; profileHandle:string; ownerDisplayName:string; ownerHandle:string; role:string; canSwitchToProfile:boolean; createdAt:string; expiresAt:string };
type DelegateRole = "admin" | "moderator" | "editor" | "member" | "seller" | "provider" | "viewer";
type OutgoingInvitation = { id:string; profileId:string; inviteeHandle:string; role:DelegateRole; status:"pending"|"expired"; createdAt:string; expiresAt:string };

const roleOptions: DelegateRole[] = ["admin", "moderator", "editor", "member", "seller", "provider", "viewer"];

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
  const [inviteeHandle, setInviteeHandle] = useState("");
  const [incomingInvitations, setIncomingInvitations] = useState<IncomingInvitation[]>([]);
  const [outgoingInvitations, setOutgoingInvitations] = useState<OutgoingInvitation[]>([]);
  const [delegateRole, setDelegateRole] = useState<DelegateRole>("editor");
  const [canDelegateSwitch, setCanDelegateSwitch] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editVisibility, setEditVisibility] = useState<"private" | "limited" | "public">("private");

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

  useEffect(() => {
    const selected = ownedProfiles.find((item) => item.profile.id === editingProfileId);
    if (!selected) return;
    setEditDisplayName(selected.profile.displayName);
    setEditHandle(selected.profile.handle);
    setEditVisibility(selected.profile.visibility);
  }, [editingProfileId, ownedProfiles]);

  const loadIncomingInvitations = useCallback(async () => {
    try {
      const response = await fetch("/api/profile-invitations", { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      const body = await response.json() as { invitations: IncomingInvitation[] };
      setIncomingInvitations(body.invitations ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load invitations.");
    }
  }, []);

  useEffect(() => { void loadIncomingInvitations(); }, [loadIncomingInvitations]);

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

  const loadOutgoingInvitations = useCallback(async (profileId: string) => {
    if (!profileId) { setOutgoingInvitations([]); return; }
    try {
      const response = await fetch("/api/profile-invitations?profileId=" + encodeURIComponent(profileId), { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      const body = await response.json() as { invitations: OutgoingInvitation[] };
      setOutgoingInvitations(body.invitations ?? []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load outgoing invitations."); }
  }, []);
  useEffect(() => { void loadOutgoingInvitations(selectedDelegationProfile); }, [selectedDelegationProfile, loadOutgoingInvitations]);

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

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editingProfileId) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profiles/" + encodeURIComponent(editingProfileId), {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: editDisplayName, handle: editHandle, visibility: editVisibility })
      });
      if (!response.ok) throw new Error(await readError(response));
      setNotice("Profile details updated.");
      await loadProfiles();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update profile.");
    } finally { setBusy(false); }
  }

  async function grantDelegate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selectedDelegationProfile) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profiles/delegations", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profileId: selectedDelegationProfile, inviteeHandle: inviteeHandle.trim(),
          role: delegateRole, canSwitchToProfile: canDelegateSwitch
        })
      });
      if (!response.ok) throw new Error(await readError(response));
      setInviteeHandle(""); setNotice("Invitation sent. Access stays pending until the recipient accepts.");
      await loadDelegates(selectedDelegationProfile);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not grant access.");
    } finally { setBusy(false); }
  }


  async function respondToInvitation(invitationId:string, accept:boolean) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profile-invitations", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({invitationId,accept}) });
      if(!response.ok) throw new Error(await readError(response));
      setNotice(accept ? "Invitation accepted. The page is now available in your profile switcher." : "Invitation declined.");
      await Promise.all([loadIncomingInvitations(),loadProfiles()]);
    } catch(cause) { setError(cause instanceof Error ? cause.message : "Could not respond to invitation."); }
    finally { setBusy(false); }
  }

  async function manageDelegate(delegate: ProfileRecord, role: DelegateRole, status: "active"|"suspended") {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profiles/delegations", { method:"PATCH", headers:{"content-type":"application/json"}, body:JSON.stringify({profileId:selectedDelegationProfile,delegateAccountId:delegate.accountId,role,status}) });
      if(!response.ok) throw new Error(await readError(response));
      setNotice(status==="suspended" ? "Access suspended." : "Delegated access updated.");
      await loadDelegates(selectedDelegationProfile);
    } catch(cause) { setError(cause instanceof Error ? cause.message : "Could not update delegated access."); }
    finally { setBusy(false); }
  }

  async function cancelOutgoingInvitation(invitationId:string) {
    if(!window.confirm("Cancel this pending invitation?")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response=await fetch("/api/profile-invitations",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({invitationId})});
      if(!response.ok) throw new Error(await readError(response));
      setNotice("Invitation cancelled.");
      await loadOutgoingInvitations(selectedDelegationProfile);
    } catch(cause) { setError(cause instanceof Error ? cause.message : "Could not cancel invitation."); }
    finally { setBusy(false); }
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
        <div className="profile-section-heading"><div><p className="eyebrow">Profile identity</p><h2>Edit a creator or page profile</h2></div></div>
        <p className="profile-muted">Each profile keeps its own name, handle and visibility. Personal account identity and security details are managed separately.</p>
        <form className="profile-form" onSubmit={saveProfile}>
          <label>Profile to edit<select value={editingProfileId} onChange={(event) => setEditingProfileId(event.target.value)} required>
            <option value="">Choose a profile</option>
            {ownedProfiles.filter((item) => item.profile.kind === "creator" || item.profile.kind === "page_community").map((item) => <option key={item.profile.id} value={item.profile.id}>{item.profile.displayName} · {item.profile.kind === "creator" ? "Creator" : "Page / community"}</option>)}
          </select></label>
          <label>Display name<input value={editDisplayName} onChange={(event) => setEditDisplayName(event.target.value)} maxLength={80} required disabled={!editingProfileId} /></label>
          <label>Handle<input value={editHandle} onChange={(event) => setEditHandle(event.target.value)} minLength={3} maxLength={30} pattern="[A-Za-z0-9][A-Za-z0-9._-]{1,28}[A-Za-z0-9]" required disabled={!editingProfileId} /><small>Changing a handle may affect how people find this profile.</small></label>
          <label>Visibility<select value={editVisibility} onChange={(event) => setEditVisibility(event.target.value as typeof editVisibility)} disabled={!editingProfileId}><option value="private">Private — only approved access</option><option value="limited">Limited — selected information</option><option value="public">Public — discoverable</option></select></label>
          <button className="profile-primary" type="submit" disabled={busy || !editingProfileId}>{busy ? "Please wait…" : "Save profile changes"}</button>
        </form>
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><div><p className="eyebrow">Your invitations</p><h2>Page access requests</h2></div><span className="profile-count">{incomingInvitations.length} pending</span></div>
        {incomingInvitations.length===0 ? <p className="profile-muted">No pending page invitations.</p> : <div className="delegate-list">
          {incomingInvitations.map((invitation) => <article className="delegate-row" key={invitation.id}>
            <div><strong>{invitation.ownerDisplayName} (@{invitation.ownerHandle})</strong><small>Invited you to manage {invitation.profileName} (@{invitation.profileHandle}) as {invitation.role}. Expires {new Date(invitation.expiresAt).toLocaleDateString()}.</small></div>
            <div className="profile-invitation-actions">
              <button className="profile-text-action" type="button" disabled={busy} onClick={() => void respondToInvitation(invitation.id,true)}>Accept</button>
              <button className="profile-text-action" type="button" disabled={busy} onClick={() => void respondToInvitation(invitation.id,false)}>Decline</button>
            </div>
          </article>)}
        </div>}
      </section>

      <section className="profile-section">
        <div className="profile-section-heading"><div><p className="eyebrow">Shared management</p><h2>Page administrators</h2></div></div>
        <p className="profile-muted">Grant access to a page or community without sharing your personal account. A delegate only receives the selected profile access.</p>
        {ownedProfiles.filter((item) => item.profile.kind === "page_community").length === 0 ? <p className="profile-empty">Create a page/community profile before adding administrators.</p> : <>
          <label className="profile-field">Choose a page or community<select value={selectedDelegationProfile} onChange={(event) => setSelectedDelegationProfile(event.target.value)}>{ownedProfiles.filter((item) => item.profile.kind === "page_community").map((item) => <option key={item.profile.id} value={item.profile.id}>{item.profile.displayName}</option>)}</select></label>
          <div className="delegate-list">
            {delegates.length === 0 ? <p className="profile-muted">No delegated members for this profile yet.</p> : delegates.map((delegate) => <article className="delegate-row" key={delegate.accountId}><div><strong>UNIBUD member</strong><small>Access to {delegate.profile.displayName} · {delegate.role} · {delegate.membershipStatus}</small><label className="profile-field">Role<select value={delegate.role} disabled={busy || delegate.membershipStatus==="revoked"} onChange={(event)=>void manageDelegate(delegate,event.target.value as DelegateRole,delegate.membershipStatus==="suspended"?"suspended":"active")}>{roleOptions.map((role)=><option key={role} value={role}>{role}</option>)}</select></label></div><div className="profile-invitation-actions">{delegate.membershipStatus==="active" && <button className="profile-text-action" type="button" disabled={busy} onClick={()=>void manageDelegate(delegate,delegate.role as DelegateRole,"suspended")}>Suspend</button>}{delegate.membershipStatus==="suspended" && <button className="profile-text-action" type="button" disabled={busy} onClick={()=>void manageDelegate(delegate,delegate.role as DelegateRole,"active")}>Restore</button>}{delegate.membershipStatus!=="revoked" && <button className="profile-text-action" type="button" disabled={busy} onClick={() => void revokeDelegate(delegate.accountId)}>Revoke</button>}</div></article>)}
          </div>
          <div className="delegate-list">
            {outgoingInvitations.length===0 ? <p className="profile-muted">No outstanding invitations.</p> : outgoingInvitations.map((invitation)=><article className="delegate-row" key={invitation.id}>
              <div><strong>@{invitation.inviteeHandle}</strong><small>{invitation.role} · {invitation.status} · expires {new Date(invitation.expiresAt).toLocaleDateString()}</small></div>
              {invitation.status==="pending" && <button className="profile-text-action" type="button" disabled={busy} onClick={()=>void cancelOutgoingInvitation(invitation.id)}>Cancel invitation</button>}
            </article>)}
          </div>
          <form className="profile-form delegate-form" onSubmit={grantDelegate}>
            <label>Find a UNIBUD identity<input value={inviteeHandle} onChange={(event) => setInviteeHandle(event.target.value)} required minLength={3} maxLength={31} placeholder="@username" /></label>
            <small>Use the person’s UNIBUD personal-profile handle. No account ID exchange is needed. They must accept before access is activated.</small>
            <label>Role<select value={delegateRole} onChange={(event) => setDelegateRole(event.target.value as DelegateRole)}>{roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
            <label className="profile-check"><input type="checkbox" checked={canDelegateSwitch} onChange={(event) => setCanDelegateSwitch(event.target.checked)} /> Allow this person to switch into this page profile after accepting</label>
            <button className="profile-secondary" type="submit" disabled={busy}>Send invitation</button>
          </form>
        </>}
      </section>
    </div>
  );
}
