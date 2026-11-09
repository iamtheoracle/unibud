"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Channel="email"|"phone";
export default function SignupPage(){
 const router=useRouter();
 const [channel,setChannel]=useState<Channel>("email");
 const [identifier,setIdentifier]=useState("");
 const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [resending,setResending]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 async function resend(){
  setResending(true);setError("");
  try{
   const response=await fetch("/api/auth/verification/resend",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({channel,identifier})});
   const result=await response.json();if(!response.ok) throw new Error(result.error??"Verification resend failed.");
   if(typeof result.challengeId==="string"){
    router.push("/verify?challengeId="+encodeURIComponent(result.challengeId)+"&purpose="+(channel==="email"?"email_verification":"phone_verification"));
   }
  }catch(e){setError(e instanceof Error?e.message:"Verification resend is temporarily unavailable.");}
  finally{setResending(false);}
 }
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");setNotice("");
  try{
   const response=await fetch("/api/auth/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({channel,identifier,password})});
   const result=await response.json();
   if(!response.ok) throw new Error(result.error??"Registration could not be completed.");
   if(result.state==="verification_required"&&result.challengeId){
    router.push("/verify?challengeId="+encodeURIComponent(result.challengeId)+"&purpose="+(channel==="email"?"email_verification":"phone_verification"));
    return;
   }
   setNotice("If an unverified account matches, fresh verification instructions will be sent. Account existence is not disclosed.");
  }catch(e){setError(e instanceof Error?e.message:"Registration is temporarily unavailable.");}
  finally{setBusy(false);}
 }
 return <main className="auth-page"><Link className="wordmark auth-wordmark" href="/">unibud<span>.</span></Link>
  <section className="auth-card">
   <p className="eyebrow">Your account starts here</p><h1>Create your UNIBUD account</h1>
   <p className="auth-copy">One account. Distinct spaces for everything you do. Start with an email address or phone number.</p>
   <div className="auth-tabs" role="group" aria-label="Registration method">
    <button type="button" className={channel==="email"?"active":""} onClick={()=>setChannel("email")}>Email</button>
    <button type="button" className={channel==="phone"?"active":""} onClick={()=>setChannel("phone")}>Phone</button>
   </div>
   <form onSubmit={submit} className="auth-form">
    <label>{channel==="email"?"Email address":"Phone number"}</label>
    <input required autoComplete={channel==="email"?"email":"tel"} type={channel==="email"?"email":"tel"} value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder={channel==="email"?"you@example.com":"+234 800 000 0000"}/>
    <label>Password</label>
    <input required minLength={12} maxLength={128} autoComplete="new-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 12 characters"/>
    <p className="field-note">Use 12–128 characters. Your password is never stored as plain text.</p>
    <button className="auth-submit" disabled={busy}>{busy?"Creating account…":"Create account"}</button>
   </form>
   {error&&<p className="auth-error" role="alert">{error}</p>}
   {notice&&<><p className="auth-notice" role="status">{notice}</p><button type="button" className="auth-submit" onClick={resend} disabled={resending}>{resending?"Requesting…":"Resend verification instructions"}</button></>}
   <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
   <p className="auth-legal">By continuing, you will review and accept the current Terms and Privacy Notice during profile setup.</p>
  </section>
 </main>;
}
