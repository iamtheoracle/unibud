"use client";

import Link from "next/link";
import { useState } from "react";

export default function RecoveryPage(){
 const [channel,setChannel]=useState<"email"|"phone">("email");
 const [identifier,setIdentifier]=useState(""),[challengeId,setChallengeId]=useState(""),[code,setCode]=useState(""),[password,setPassword]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 async function requestCode(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");setNotice("");
  try{
   const response=await fetch("/api/auth/recovery",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({channel,identifier})});
   const result=await response.json();if(!response.ok) throw new Error(result.error??"Request failed.");
   setChallengeId(result.challengeId);setNotice("If this identity exists, a recovery code has been sent. Continue with the code below.");
  }catch(e){setError(e instanceof Error?e.message:"Recovery is temporarily unavailable.");}
  finally{setBusy(false);}
 }
 async function complete(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  try{
   const response=await fetch("/api/auth/recovery/complete",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({challengeId,code,newPassword:password})});
   const result=await response.json();if(!response.ok||!result.ok) throw new Error(result.error??"Recovery could not be completed.");
   setNotice("Your password has been changed. Sign in with your new password.");
   setChallengeId("");
  }catch(e){setError(e instanceof Error?e.message:"Recovery is temporarily unavailable.");}
  finally{setBusy(false);}
 }
 return <main className="auth-page"><Link className="wordmark auth-wordmark" href="/">unibud<span>.</span></Link>
  <section className="auth-card"><p className="eyebrow">Account recovery</p><h1>Reset your password</h1>
   {!challengeId?<form className="auth-form" onSubmit={requestCode}>
    <p className="auth-copy">Enter your registered email or phone. We use the same response whether or not an account matches.</p>
    <div className="auth-tabs"><button type="button" className={channel==="email"?"active":""} onClick={()=>setChannel("email")}>Email</button><button type="button" className={channel==="phone"?"active":""} onClick={()=>setChannel("phone")}>Phone</button></div>
    <label>{channel==="email"?"Email address":"Phone number"}</label><input required type={channel==="email"?"email":"tel"} value={identifier} onChange={e=>setIdentifier(e.target.value)}/>
    <button className="auth-submit" disabled={busy}>{busy?"Requesting…":"Send recovery code"}</button>
   </form>:<form className="auth-form" onSubmit={complete}>
    <p className="auth-copy">Enter the code you received and choose a new password.</p>
    <label>Six-digit code</label><input required inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/>
    <label>New password</label><input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <button className="auth-submit" disabled={busy}>{busy?"Updating…":"Update password"}</button>
   </form>}
   {error&&<p className="auth-error" role="alert">{error}</p>}{notice&&<p className="auth-notice" role="status">{notice}</p>}
   <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
  </section>
 </main>;
}
