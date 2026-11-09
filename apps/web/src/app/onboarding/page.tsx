"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage(){
 const router=useRouter();
 const [handle,setHandle]=useState(""),[displayName,setDisplayName]=useState("");
 const [acceptTerms,setAcceptTerms]=useState(false),[acceptPrivacy,setAcceptPrivacy]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  try{
   const response=await fetch("/api/onboarding/complete",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    handle,displayName,termsVersion:"terms-draft-2026-11",privacyVersion:"privacy-draft-2026-11",acceptTerms,acceptPrivacy
   })});
   const result=await response.json();if(!response.ok||!result.ok) throw new Error(result.error??"Profile setup could not be completed.");
   router.replace("/");
  }catch(e){setError(e instanceof Error?e.message:"Onboarding is temporarily unavailable.");}
  finally{setBusy(false);}
 }
 return <main className="auth-page"><Link className="wordmark auth-wordmark" href="/">unibud<span>.</span></Link>
  <section className="auth-card"><p className="eyebrow">Make it yours</p><h1>Set up your personal profile</h1>
   <p className="auth-copy">Your personal profile is the starting point. Creator and page/community profiles can be added separately later.</p>
   <form className="auth-form" onSubmit={submit}>
    <label>Display name</label><input required maxLength={80} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="How people will know you"/>
    <label>Username</label><input required minLength={3} maxLength={30} value={handle} onChange={e=>setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g,""))} placeholder="Choose a unique username"/>
    <p className="field-note">3–30 characters. Letters, numbers, dots, underscores and hyphens.</p>
    <label className="consent-row"><input type="checkbox" checked={acceptTerms} onChange={e=>setAcceptTerms(e.target.checked)}/> I agree to the <Link href="/legal/terms">Terms</Link>.</label>
    <label className="consent-row"><input type="checkbox" checked={acceptPrivacy} onChange={e=>setAcceptPrivacy(e.target.checked)}/> I acknowledge the <Link href="/legal/privacy">Privacy Notice</Link>.</label>
    <button className="auth-submit" disabled={busy||!acceptTerms||!acceptPrivacy}>{busy?"Saving profile…":"Continue to UNIBUD"}</button>
   </form>
   {error&&<p className="auth-error" role="alert">{error}</p>}
  </section>
 </main>;
}
