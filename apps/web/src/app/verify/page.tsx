"use client";

import Link from "next/link";
import { useRouter,useSearchParams } from "next/navigation";
import { Suspense,useState } from "react";

function VerifyForm(){
 const router=useRouter(),search=useSearchParams();
 const challengeId=search.get("challengeId")??"",purpose=search.get("purpose")??"",requestedNext=search.get("next")??"";
 const [code,setCode]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[done,setDone]=useState(false);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  try{
   const response=await fetch("/api/auth/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({challengeId,purpose,code})});
   const result=await response.json();
   if(!response.ok||!result.ok) throw new Error(result.error??"The code could not be verified.");
   setDone(true);const next=requestedNext.startsWith("/")&&!requestedNext.startsWith("//")?requestedNext:"/onboarding";setTimeout(()=>router.replace("/login?next="+encodeURIComponent(next)),900);
  }catch(e){setError(e instanceof Error?e.message:"Verification is temporarily unavailable.");}
  finally{setBusy(false);}
 }
 if(!challengeId||!["email_verification","phone_verification"].includes(purpose)) return <section className="auth-card"><h1>Verification link is incomplete</h1><p>Return to registration and request a new code.</p><Link href="/signup">Create account</Link></section>;
 return <section className="auth-card">
  <p className="eyebrow">One more step</p><h1>Verify your identity</h1>
  <p className="auth-copy">Enter the six-digit code sent to the email address or phone number you registered.</p>
  <form className="auth-form" onSubmit={submit}>
   <label>Verification code</label><input required inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="000000"/>
   <button className="auth-submit" disabled={busy||done}>{busy?"Checking…":done?"Verified":"Verify account"}</button>
  </form>
  {error&&<p className="auth-error" role="alert">{error}</p>}
  {done&&<p className="auth-notice" role="status">Identity verified. Continue to sign in.</p>}
  <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
 </section>;
}
export default function VerifyPage(){return <main className="auth-page"><Link className="wordmark auth-wordmark" href="/">unibud<span>.</span></Link><Suspense fallback={<div className="auth-card">Loading…</div>}><VerifyForm/></Suspense></main>}
