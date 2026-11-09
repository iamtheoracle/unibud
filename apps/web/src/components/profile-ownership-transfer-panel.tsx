"use client";

import {useCallback,useEffect,useState} from "react";

type TransferProfile={profile:{id:string;displayName:string;kind:"personal"|"creator"|"page_community";status:string};relationship:"owner"|"delegated"};
type Incoming={transferId:string;profileId:string;profileName:string;profileHandle:string;ownerHandle:string;createdAt:string;expiresAt:string};
type Outgoing={transferId:string;recipientHandle:string;status:"pending_recipient"|"recipient_accepted";createdAt:string;expiresAt:string};

async function errorText(response:Response){try{return (await response.json() as {error?:string}).error??"The request could not be completed.";}catch{return "The request could not be completed.";}}
export function ProfileOwnershipTransferPanel({profiles}:{profiles:TransferProfile[]}){
 const eligible=profiles.filter(p=>p.relationship==="owner"&&(p.profile.kind==="creator"||p.profile.kind==="page_community")&&p.profile.status==="active");
 const [profileId,setProfileId]=useState(eligible[0]?.profile.id??"");
 const eligibleIds=eligible.map(p=>p.profile.id).join("|");
 const firstEligibleId=eligible[0]?.profile.id??"";
 useEffect(()=>{if(!eligibleIds.split("|").includes(profileId))setProfileId(firstEligibleId);},[eligibleIds,firstEligibleId,profileId]);
 const [recipientHandle,setRecipientHandle]=useState("");
 const [channel,setChannel]=useState<"email"|"phone">("email");
 const [identifier,setIdentifier]=useState("");
 const [password,setPassword]=useState("");
 const [incoming,setIncoming]=useState<Incoming[]>([]);
 const [outgoing,setOutgoing]=useState<Outgoing[]>([]);
 const [preflight,setPreflight]=useState<{canTransfer:boolean;activeOwnedProfiles:number;activeDelegatedRelationships:number;pendingInvitations:number;openTransferRequests:number;personalIdentityAvailable:boolean;verifiedIdentityAvailable:boolean}|null>(null);
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [notice,setNotice]=useState("");
 const loadIncoming=useCallback(async()=>{const r=await fetch("/api/profile-ownership-transfers",{cache:"no-store"});if(!r.ok)throw new Error(await errorText(r));const b=await r.json() as {transfers:Incoming[]};setIncoming(b.transfers??[]);},[]);
 const loadOwner=useCallback(async()=>{if(!profileId){setPreflight(null);setOutgoing([]);return;}const r=await fetch("/api/profiles/"+encodeURIComponent(profileId)+"/ownership-transfer",{cache:"no-store"});if(!r.ok)throw new Error(await errorText(r));const b=await r.json() as {preflight:typeof preflight;transfers:Outgoing[]};setPreflight(b.preflight);setOutgoing(b.transfers??[]);},[profileId]);
 const refresh=useCallback(async()=>{try{await Promise.all([loadIncoming(),loadOwner()]);}catch(e){setError(e instanceof Error?e.message:"Could not load ownership transfer status.");}},[loadIncoming,loadOwner]);
 useEffect(()=>{void refresh();},[refresh]);
 async function createTransfer(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(!profileId)return;const selected=eligible.find(p=>p.profile.id===profileId);if(!window.confirm("Request transfer of "+(selected?.profile.displayName??"this profile")+" to @"+recipientHandle+"? Ownership will not change until the recipient accepts and you finalize."))return;setBusy(true);setError("");setNotice("");try{
  const r=await fetch("/api/profiles/"+encodeURIComponent(profileId)+"/ownership-transfer",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({recipientHandle,channel,identifier,password})});
  if(!r.ok)throw new Error(await errorText(r));setPassword("");setRecipientHandle("");setNotice("Transfer request sent. Ownership has not changed; the recipient must accept and you must finalize it.");await refresh();
 }catch(e){setError(e instanceof Error?e.message:"Could not request ownership transfer.");}finally{setBusy(false);}}
 async function respond(transfer:Incoming,accept:boolean){if(accept&&!window.confirm("Accept ownership of "+transfer.profileName+" (@"+transfer.profileHandle+") from @"+transfer.ownerHandle+"? This does not complete the transfer until the current owner finalizes it."))return;
 setBusy(true);setError("");setNotice("");try{const r=await fetch("/api/profile-ownership-transfers",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({transferId:transfer.transferId,accept,channel,identifier,password})});if(!r.ok)throw new Error(await errorText(r));setPassword("");setNotice(accept?"Acceptance recorded. The current owner must now finalize the transfer.":"Transfer declined.");await refresh();}catch(e){setError(e instanceof Error?e.message:"Could not respond to transfer.");}finally{setBusy(false);}}
 async function complete(transfer:Outgoing){if(!window.confirm("Finalize transfer of this profile to @"+transfer.recipientHandle+"? Ownership will change, the previous owner's profile access will end, and existing delegated grants will not carry over."))return;
 setBusy(true);setError("");setNotice("");try{const r=await fetch("/api/profile-ownership-transfers/"+encodeURIComponent(transfer.transferId)+"/complete",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({channel,identifier,password})});if(!r.ok)throw new Error(await errorText(r));setPassword("");setNotice("Ownership transferred. The new owner now controls this profile.");window.location.reload();}catch(e){setError(e instanceof Error?e.message:"Could not complete transfer.");}finally{setBusy(false);}}
 async function cancel(transfer:Outgoing){if(!window.confirm("Cancel this ownership transfer request?"))return;setBusy(true);setError("");setNotice("");try{const r=await fetch("/api/profiles/"+encodeURIComponent(profileId)+"/ownership-transfer",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({transferId:transfer.transferId,channel,identifier,password})});if(!r.ok)throw new Error(await errorText(r));setPassword("");setNotice("Transfer request cancelled.");await refresh();}catch(e){setError(e instanceof Error?e.message:"Could not cancel transfer.");}finally{setBusy(false);}}
 return <section className="profile-section">
  <div className="profile-section-heading"><div><p className="eyebrow">Ownership and recovery</p><h2>Transfer profile ownership</h2></div></div>
  <p className="profile-muted">Creator and Page/Community profiles can be transferred with both parties&apos; consent. Personal profiles cannot be transferred. Each sensitive step requires the account password again.</p>
  {eligible.length===0?<p className="profile-muted">You do not currently own an active creator or page/community profile eligible for transfer.</p>:<>
   <form className="profile-form" onSubmit={createTransfer}>
    <label>Profile to transfer<select value={profileId} onChange={e=>setProfileId(e.target.value)}>{eligible.map(p=><option key={p.profile.id} value={p.profile.id}>{p.profile.displayName} · {p.profile.kind==="creator"?"Creator":"Page / community"}</option>)}</select></label>
    {preflight&&<div className="profile-transfer-preflight"><strong>{preflight.canTransfer?"Eligible to request transfer":"Transfer currently blocked"}</strong><small>{preflight.activeOwnedProfiles} active owned profiles · {preflight.activeDelegatedRelationships} active/suspended delegates · {preflight.pendingInvitations} pending invitations · {preflight.openTransferRequests} open transfers</small>{!preflight.personalIdentityAvailable&&<small>Your active personal identity must remain available.</small>}{!preflight.verifiedIdentityAvailable&&<small>A verified email or phone identity is required to reauthenticate.</small>}</div>}
    <label>Recipient&apos;s UNIBUD username<input value={recipientHandle} onChange={e=>setRecipientHandle(e.target.value)} required minLength={3} maxLength={31} placeholder="@username"/></label>
    <button className="profile-primary" type="submit" disabled={busy||!preflight?.canTransfer}>{busy?"Please wait…":"Request ownership transfer"}</button>
   </form>
  </>}
  <div className="profile-form profile-transfer-reauth">
    <p className="eyebrow">Fresh account verification</p>
    <label>Verify account with<select value={channel} onChange={e=>setChannel(e.target.value as "email"|"phone")}><option value="email">Email and password</option><option value="phone">Phone and password</option></select></label>
    <label>{channel==="email"?"Account email":"Phone number in international format"}<input value={identifier} onChange={e=>setIdentifier(e.target.value)} required autoComplete="username" placeholder={channel==="email"?"you@example.com":"+234…"} /></label>
    <label>Account password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label>
  </div>
  <div className="profile-transfer-columns">
   <div><h3>Requests sent by you</h3>{outgoing.length===0?<p className="profile-muted">No open transfer requests for this profile.</p>:outgoing.map(t=><article className="delegate-row" key={t.transferId}><div><strong>@{t.recipientHandle}</strong><small>{t.status==="recipient_accepted"?"Recipient accepted — your final confirmation is required":"Waiting for recipient"} · expires {new Date(t.expiresAt).toLocaleDateString()}</small></div><div className="profile-invitation-actions">{t.status==="recipient_accepted"?<button className="profile-text-action" disabled={busy} onClick={()=>void complete(t)}>Finalize</button>:null}<button className="profile-text-action" disabled={busy} onClick={()=>void cancel(t)}>Cancel</button></div></article>)}</div>
   <div><h3>Requests sent to you</h3>{incoming.length===0?<p className="profile-muted">No pending ownership transfer requests.</p>:incoming.map(t=><article className="delegate-row" key={t.transferId}><div><strong>{t.profileName} (@{t.profileHandle})</strong><small>Current owner: @{t.ownerHandle} · expires {new Date(t.expiresAt).toLocaleDateString()}</small></div><div className="profile-invitation-actions"><button className="profile-text-action" disabled={busy} onClick={()=>void respond(t,true)}>Accept</button><button className="profile-text-action" disabled={busy} onClick={()=>void respond(t,false)}>Decline</button></div></article>)}</div>
  </div>
  <p className="profile-muted">Delegated access and pending invitations must be resolved before a transfer request. At finalization, stale profile-scoped grants and active session profile contexts are revoked. Content, profile ID and handle remain with the profile.</p>
  {error&&<p className="profile-alert profile-error" role="alert">{error}</p>}{notice&&<p className="profile-alert profile-notice" role="status">{notice}</p>}
 </section>;
}
