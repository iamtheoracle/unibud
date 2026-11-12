import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createConfiguredIdentityServices } from "../../lib/server/identity/identity-runtime";
import { sessionCookieName } from "../../lib/server/identity/http";

const spaces=[
 ["Connect","People, communities, institutions, creators, opportunities and services"],
 ["Quad","A distinct discovery space with its own identity and boundaries"],
 ["Bud","Academic companion and learning; Board is its digital campus"],
 ["Flow","Student financial services, subject to regulated-provider readiness"],
 ["Square","Entertainment, creators, podcasts and live media"],
 ["The Quarter","Marketplace, sellers, products, orders and fulfilment"],
 ["SouLync","Adults-only dating with age assurance, safety and consent controls"],
 ["Wayward","Trips, tours, meetups and shared experiences"],
 ["Riff","Open discussions and lightweight threads"],
 ["Lync","Purposeful connection, goals and streaks"],
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
   <Link className="small-link" href="/search">Search</Link>
   <Link className="small-link" href="/profiles">Manage profiles</Link>
   <form action="/api/auth/logout" method="post"><button className="small-link" type="submit">Log out</button></form>
  </header>
  <section className="intro">
   <p className="eyebrow">Your account is ready</p>
   <h1>Your world.<br/>All connected.</h1>
   <p className="lead">Your account and active profile are ready. The approved spaces are being built; these cards show where each experience belongs and are not yet interactive. Each space will keep its own purpose, data and permissions.</p>
  </section>
  <section className="spaces" aria-labelledby="spaces-title">
   <div className="section-heading"><div><p className="eyebrow">Your spaces</p><h2 id="spaces-title">A place for every part of life</h2></div></div>
   <div className="space-grid">
    {spaces.map(([name,description],index)=><article className="space" key={name}>
     <span className="space-number">{String(index+1).padStart(2,"0")}</span><span className="space-status">In development</span><h3>{name}</h3><p>{description}</p>
    </article>)}
   </div>
  </section>
  <footer>UNIBUD · Your account, your spaces, your boundaries.</footer>
 </main>;
}
