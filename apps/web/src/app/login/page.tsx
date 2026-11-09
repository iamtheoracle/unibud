"use client";

import Link from "next/link";
import { useRouter,useSearchParams } from "next/navigation";
import { Suspense,useState } from "react";

function LoginForm(){
 const router=useRouter(),search=useSearchParams();
 const [channel,setChannel]=useState<"email"|"phone">("email");
 const [identifier,setIdentifier]=useState("");
 const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  try{
   const response=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({channel,identifier,password})});
   const result=await response.json();
   if(!response.ok||result.state!=="authenticated") throw new Error(result.error??"Sign-in failed.");
   const next=search.get("next");
   router.replace(next&&next.startsWith("/")&&!next.startsWith("//")?next:"/");
  }catch(e){setError(e instanceof Error?e.message:"Sign-in is temporarily unavailable.");}
  finally{setBusy(false);}
 }
 return <section className="auth-card">
  <p className="eyebrow">Welcome back</p><h1>Sign in to UNIBUD</h1>
  <p className="auth-copy">Continue with the email address or phone number linked to your account.</p>
  <div className="auth-tabs" role="group" aria-label="Sign-in method">
   <button type="button" className={channel==="email"?"active":""} onClick={()=>setChannel("email")}>Email</button>
   <button type="button" className={channel==="phone"?"active":""} onClick={()=>setChannel("phone")}>Phone</button>
  </div>
  <form onSubmit={submit} className="auth-form">
   <label>{channel==="email"?"Email address":"Phone number"}</label>
   <input required autoComplete={channel==="email"?"email":"tel"} type={channel==="email"?"email":"tel"} value={identifier} onChange={e=>setIdentifier(e.target.value)}/>
   <label>Password</label><input required autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
   <div className="auth-inline"><Link href="/recovery">Forgot password?</Link></div>
   <button className="auth-submit" disabled={busy}>{busy?"Signing in…":"Sign in"}</button>
  </form>
  {error&&<p className="auth-error" role="alert">{error}</p>}
  <p className="auth-switch">New to UNIBUD? <Link href="/signup">Create an account</Link></p>
 </section>;
}
export default function LoginPage(){return <main className="auth-page"><Link className="wordmark auth-wordmark" href="/">unibud<span>.</span></Link><Suspense fallback={<div className="auth-card">Loading…</div>}><LoginForm/></Suspense></main>}
