import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createConfiguredIdentityServices } from "../lib/server/identity/identity-runtime";
import { sessionCookieName } from "../lib/server/identity/http";

const spaces = [
  { name: "Connect", description: "People, communities, institutions, creators, opportunities and services" },
  { name: "Quad", description: "A distinct discovery space with its own identity and boundaries" },
  { name: "Bud", description: "Academic learning and support, with Board as its digital campus" },
  { name: "Flow", description: "Student financial services, subject to regulated-provider readiness" },
  { name: "Square", description: "Entertainment, creators, podcasts and live media" },
  { name: "The Quarter", description: "Marketplace, sellers, products, orders and fulfilment" },
  { name: "SouLync", description: "Adults-only dating with age assurance, safety and consent controls" },
  { name: "Wayward", description: "Discover, organise and join experiences" },
  { name: "Riff", description: "Open discussions and lightweight threads" },
  { name: "Lync", description: "Purposeful connection, goals and streaks" },
  { name: "Concierge", description: "Conversational service discovery and authorised actions" },
  { name: "The Fixer", description: "Private support and appropriate human pathways" }
];

export default async function HomePage() {
  const token=(await cookies()).get(sessionCookieName())?.value;
  if(token){
    let destination:string|undefined;
    try{
      const {sessions}=createConfiguredIdentityServices();
      const validation=await sessions.validate(token);
      if(validation.valid) destination=validation.session.activeProfileId?"/home":"/onboarding";
    }catch{}
    if(destination) redirect(destination);
  }
  return (
    <main className="shell">
      <header className="topbar">
        <Link className="wordmark" href="/" aria-label="UNIBUD home">unibud<span>.</span></Link>
        <div className="home-actions"><Link href="/login">Sign in</Link><Link href="/signup">Create account</Link></div>
      </header>

      <section className="intro" aria-labelledby="welcome-title">
        <p className="eyebrow">A new kind of everyday platform</p>
        <h1 id="welcome-title">Your world.<br />All connected.</h1>
        <p className="lead">
          Different parts of life deserve spaces of their own. UNIBUD brings
          them together without making them all feel the same. The spaces below
          describe the approved ecosystem; they are not interactive product features yet.
        </p>
        <p className="status">Foundation build · Space experiences are in development and are not yet available</p>
      </section>

      <section className="spaces" aria-labelledby="spaces-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explore the ecosystem</p>
            <h2 id="spaces-title">Spaces with a purpose</h2>
          </div>
          <span className="count">01 — 12</span>
        </div>
        <div className="space-grid">
          {spaces.map((space, index) => (
            <article className="space" key={space.name}>
              <span className="space-number">0{String(index + 1).padStart(2, "0")}</span><span className="space-status">In development</span>
              <h3>{space.name}</h3>
              <p>{space.description}</p>
            </article>
          ))}
        </div>
      </section>
      <footer>UNIBUD · Built around the way life connects.</footer>
    </main>
  );
}
