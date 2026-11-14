import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createConfiguredIdentityServices } from "../../lib/server/identity/identity-runtime";
import { sessionCookieName } from "../../lib/server/identity/http";
import { getWorkforceSessionGate } from "../../lib/server/workforce/workforce-session-gate";

const spaces=[
 ["Connect","People, communities, opportunities and services"],
 ["Bud","Academic companion, tutoring and campus resources"],
 ["Flow","Student financial services and money management"],
 ["Square","Entertainment, creators, podcasts and live media"],
 ["The Quarter","Marketplace, local services and fulfilment"],
 ["Wayward","Trips, tours, meetups and shared experiences"],
 ["Riff","Open discussions and lightweight threads"],
 ["Lync","Purposeful connection and shared goals"],
 ["Concierge","Personal services and ongoing arrangements"],
 ["The Fixer","Private support and trusted human connection"]
];

export default async function AuthenticatedHomePage(){
 const token=(await cookies()).get(sessionCookieName())?.value;
 if(!token) redirect("/login");
 let valid=false,activeProfile=false;
 try{
  const {sessions}=createConfiguredIdentityServices();
  const result=await sessions.validate(token);
  valid=result.valid;
  if (result.valid) {
   const workforceGate = await getWorkforceSessionGate(result.account.id,result.session.id);
   if (workforceGate === "mfa_enrollment_required" || workforceGate === "mfa_verification_required") redirect("/operations/security/mfa");
   if (workforceGate === "ready") redirect("/workforce/home");
   if (workforceGate === "blocked") redirect("/login");
  }
  activeProfile=result.valid&&Boolean(result.session.activeProfileId);
 }catch{
  redirect("/login");
 }
 if(!valid) redirect("/login");
 if(!activeProfile) redirect("/onboarding");
 return <main className="shell">
  <header className="topbar">
   <Link className="wordmark" href="/">unibud<span>.</span></Link>
   <span className="eyebrow">Your connected world</span>
   <Link className="small-link" href="/profiles">Manage profiles</Link>
   <form action="/api/auth/logout" method="post"><button className="small-link" type="submit">Log out</button></form>
  </header>
  <section className="intro">
   <p className="eyebrow">Your account is ready</p>
   <h1>Your world.<br/>All connected.</h1>
   <p className="lead">Choose a space to begin. Each part of UNIBUD has its own purpose, while your account and permissions remain connected underneath.</p>
  </section>
  <section className="spaces" aria-labelledby="spaces-title">
   <div className="section-heading"><div><p className="eyebrow">Your spaces</p><h2 id="spaces-title">A place for every part of life</h2></div></div>
   <div className="space-grid">
    {spaces.map(([name,description],index)=><article className="space" key={name}>
     <span className="space-number">0{index+1}</span><h3>{name}</h3><p>{description}</p>
    </article>)}
   </div>
  </section>
  <footer>UNIBUD · Your account, your spaces, your boundaries.</footer>
 </main>;
}
