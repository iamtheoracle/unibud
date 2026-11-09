"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Channel = "email" | "phone";

async function postJson(path:string,body:Record<string,unknown>) {
  const response=await fetch(path,{
    method:"POST",credentials:"same-origin",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(body)
  });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(typeof payload.error==="string"?payload.error:"The request could not be completed.");
  return payload as Record<string,unknown>;
}

function AuthLayout(props:{eyebrow:string;title:string;description:string;children:React.ReactNode;footer:React.ReactNode}) {
  return <main className="auth-shell">
    <header className="auth-header">
      <a className="wordmark" href="/">unibud<span>.</span></a>
      <span className="eyebrow">A connected ecosystem</span>
    </header>
    <section className="auth-card">
      <p className="eyebrow">{props.eyebrow}</p>
      <h1>{props.title}</h1>
      <p className="auth-description">{props.description}</p>
      {props.children}
      <div className="auth-footer">{props.footer}</div>
    </section>
    <footer className="auth-legal">UNIBUD · Your world, all connected.</footer>
  </main>;
}

function ChannelField(props:{channel:Channel;setChannel:(v:Channel)=>void;identifier:string;setIdentifier:(v:string)=>void}) {
  return <>
    <label className="form-label">Continue with</label>
    <select className="form-control" value={props.channel} onChange={e=>props.setChannel(e.target.value as Channel)}>
      <option value="email">Email address</option>
      <option value="phone">Phone number</option>
    </select>
    <label className="form-label" htmlFor="identifier">{props.channel==="email"?"Email address":"Phone number"}</label>
    <input id="identifier" className="form-control" type={props.channel==="email"?"email":"tel"}
      autoComplete={props.channel==="email"?"email":"tel"} required
      placeholder={props.channel==="email"?"you@example.com":"+234 801 234 5678"}
      value={props.identifier} onChange={e=>props.setIdentifier(e.target.value)}/>
  </>;
}

function Status(props:{error:string;message:string}) {
  return <>
    {props.error&&<p className="form-error" role="alert">{props.error}</p>}
    {props.message&&<p className="form-message" role="status">{props.message}</p>}
  </>;
}

export function SignupForm() {
  const router=useRouter();
  const [channel,setChannel]=useState<Channel>("email");
  const [identifier,setIdentifier]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");setMessage("");
    try{
      const result=await postJson("/api/auth/register",{channel,identifier,password});
      if(result.state==="verification_required"&&typeof result.challengeId==="string"){
        const purpose=channel==="email"?"email_verification":"phone_verification";
        router.push("/verify?challengeId="+encodeURIComponent(result.challengeId)+"&purpose="+purpose);
      }else{
        setMessage("If this address can be registered, verification instructions will be sent. Check your inbox or messages.");
      }
    }catch(e){setError(e instanceof Error?e.message:"Registration could not be completed.");}
    finally{setBusy(false);}
  }
  return <AuthLayout eyebrow="Create your account" title="Start with your own space." description="One account opens the door to your UNIBUD spaces. You can build your profiles and interests as you go."
    footer={<>Already have an account? <a href="/login">Log in</a></>}>
    <form className="auth-form" onSubmit={submit}>
      <ChannelField channel={channel} setChannel={setChannel} identifier={identifier} setIdentifier={setIdentifier}/>
      <label className="form-label" htmlFor="password">Create password</label>
      <input id="password" className="form-control" type="password" autoComplete="new-password"
        minLength={12} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}
        placeholder="At least 12 characters"/>
      <p className="form-hint">Use 12–128 characters. You can use a passphrase.</p>
      <Status error={error} message={message}/>
      <button className="auth-submit" type="submit" disabled={busy}>{busy?"Creating account…":"Create account"}</button>
      <p className="form-hint">By continuing, you agree to complete the account setup and review the current Terms and Privacy Notice.</p>
    </form>
  </AuthLayout>;
}

export function LoginForm() {
  const router=useRouter();
  const [channel,setChannel]=useState<Channel>("email");
  const [identifier,setIdentifier]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");
    try{
      await postJson("/api/auth/login",{channel,identifier,password});
      router.push("/home");
    }catch(e){setError(e instanceof Error?e.message:"The sign-in details were not accepted.");}
    finally{setBusy(false);}
  }
  return <AuthLayout eyebrow="Welcome back" title="Good to see you." description="Sign in with the email address or phone number connected to your UNIBUD account."
    footer={<>New to UNIBUD? <a href="/signup">Create an account</a></>}>
    <form className="auth-form" onSubmit={submit}>
      <ChannelField channel={channel} setChannel={setChannel} identifier={identifier} setIdentifier={setIdentifier}/>
      <label className="form-label" htmlFor="password">Password</label>
      <input id="password" className="form-control" type="password" autoComplete="current-password"
        required value={password} onChange={e=>setPassword(e.target.value)}/>
      <div className="auth-inline"><a href="/recover">Forgot password?</a></div>
      <Status error={error} message=""/>
      <button className="auth-submit" type="submit" disabled={busy}>{busy?"Signing in…":"Log in"}</button>
    </form>
  </AuthLayout>;
}

export function VerifyForm(props:{challengeId:string;purpose:"email_verification"|"phone_verification"}) {
  const router=useRouter();
  const [code,setCode]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");
    try{
      await postJson("/api/auth/verify",{challengeId:props.challengeId,purpose:props.purpose,code});
      router.push("/login?verified=1");
    }catch(e){setError(e instanceof Error?e.message:"That code could not be verified.");}
    finally{setBusy(false);}
  }
  return <AuthLayout eyebrow="Verify your contact" title="One quick check." description="Enter the six-digit code sent to the email address or phone number you used to register."
    footer={<>Need to start again? <a href="/signup">Create an account</a></>}>
    <form className="auth-form" onSubmit={submit}>
      <label className="form-label" htmlFor="code">Verification code</label>
      <input id="code" className="form-control code-input" inputMode="numeric" autoComplete="one-time-code"
        pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/>
      <p className="form-hint">Challenge reference: {props.challengeId}</p>
      <Status error={error} message=""/>
      <button className="auth-submit" type="submit" disabled={busy}>{busy?"Checking…":"Verify and continue"}</button>
    </form>
  </AuthLayout>;
}

export function RecoveryForm() {
  const [channel,setChannel]=useState<Channel>("email");
  const [identifier,setIdentifier]=useState("");
  const [challengeId,setChallengeId]=useState("");
  const [code,setCode]=useState("");
  const [newPassword,setNewPassword]=useState("");
  const [step,setStep]=useState<"request"|"complete">("request");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  async function request(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");setMessage("");
    try{
      await postJson("/api/auth/recovery",{channel,identifier});
      setStep("complete");
      setMessage("If an eligible account exists, recovery instructions will be sent. Use the challenge reference and code from that message.");
    }catch(e){setError(e instanceof Error?e.message:"Recovery could not be started.");}
    finally{setBusy(false);}
  }
  async function complete(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");
    try{
      await postJson("/api/auth/recovery/complete",{challengeId,code,newPassword});
      setMessage("Your password has been updated. You can now log in.");
      setStep("request");setPasswordResetFields();
    }catch(e){setError(e instanceof Error?e.message:"Recovery could not be completed.");}
    finally{setBusy(false);}
  }
  function setPasswordResetFields(){setChallengeId("");setCode("");setNewPassword("");}
  return <AuthLayout eyebrow="Account recovery" title="Let's get you back in." description="Request a one-time recovery code, then use the challenge reference and code delivered to your verified contact."
    footer={<>Remembered your password? <a href="/login">Log in</a></>}>
    {step==="request"?<form className="auth-form" onSubmit={request}>
      <ChannelField channel={channel} setChannel={setChannel} identifier={identifier} setIdentifier={setIdentifier}/>
      <Status error={error} message={message}/>
      <button className="auth-submit" type="submit" disabled={busy}>{busy?"Sending…":"Send recovery instructions"}</button>
    </form>:<form className="auth-form" onSubmit={complete}>
      <label className="form-label" htmlFor="challenge">Challenge reference</label>
      <input id="challenge" className="form-control" required value={challengeId} onChange={e=>setChallengeId(e.target.value)}/>
      <label className="form-label" htmlFor="code">Six-digit code</label>
      <input id="code" className="form-control code-input" inputMode="numeric" autoComplete="one-time-code"
        pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/>
      <label className="form-label" htmlFor="new-password">New password</label>
      <input id="new-password" className="form-control" type="password" autoComplete="new-password"
        minLength={12} maxLength={128} required value={newPassword} onChange={e=>setNewPassword(e.target.value)}/>
      <Status error={error} message={message}/>
      <button className="auth-submit" type="submit" disabled={busy}>{busy?"Updating…":"Update password"}</button>
    </form>}
  </AuthLayout>;
}

export function OnboardingForm() {
  const router=useRouter();
  const [handle,setHandle]=useState("");
  const [displayName,setDisplayName]=useState("");
  const [terms,setTerms]=useState(false);
  const [privacy,setPrivacy]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");
    try{
      await postJson("/api/onboarding/complete",{
        handle,displayName,termsVersion:"terms-2026-11-09",
        privacyVersion:"privacy-2026-11-09",acceptTerms:terms,acceptPrivacy:privacy
      });
      router.push("/home");
    }catch(e){setError(e instanceof Error?e.message:"Your setup could not be completed.");}
    finally{setBusy(false);}
  }
  return <AuthLayout eyebrow="Your personal profile" title="Make this space yours." description="Choose the name people will recognise and a unique handle. You can add creator and community profiles later."
    footer={<>Already set this up? <a href="/home">Continue to UNIBUD</a></>}>
    <form className="auth-form" onSubmit={submit}>
      <label className="form-label" htmlFor="display-name">Display name</label>
      <input id="display-name" className="form-control" required maxLength={80} value={displayName} onChange={e=>setDisplayName(e.target.value)}/>
      <label className="form-label" htmlFor="handle">Username</label>
      <input id="handle" className="form-control" required minLength={3} maxLength={30} autoCapitalize="none"
        placeholder="your.handle" value={handle} onChange={e=>setHandle(e.target.value)}/>
      <label className="check-row"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/> I agree to the current Terms.</label>
      <label className="check-row"><input type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)}/> I acknowledge the Privacy Notice.</label>
      <Status error={error} message=""/>
      <button className="auth-submit" type="submit" disabled={busy||!terms||!privacy}>{busy?"Setting up…":"Create my space"}</button>
    </form>
  </AuthLayout>;
}
