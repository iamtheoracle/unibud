const spaces = [
  { name: "Connect", description: "People, communities, opportunities and services" },
  { name: "Bud", description: "Your academic companion and digital campus" },
  { name: "Flow", description: "Student financial services" },
  { name: "Square", description: "Entertainment, creators and live media" },
  { name: "The Quarter", description: "Marketplace and fulfilment" },
  { name: "Wayward", description: "Discover, organise and join experiences" }
];

export default function HomePage() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="UNIBUD home">unibud<span>.</span></a>
        <span className="eyebrow">A connected ecosystem</span>
      </header>

      <section className="intro" aria-labelledby="welcome-title">
        <p className="eyebrow">A new kind of everyday platform</p>
        <h1 id="welcome-title">Your world.<br />All connected.</h1>
        <p className="lead">
          Different parts of life deserve spaces of their own. UNIBUD brings
          them together without making them all feel the same.
        </p>
        <p className="status">Foundation build · Product experience in development</p>
      </section>

      <section className="spaces" aria-labelledby="spaces-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explore the ecosystem</p>
            <h2 id="spaces-title">Spaces with a purpose</h2>
          </div>
          <span className="count">01 — 06</span>
        </div>
        <div className="space-grid">
          {spaces.map((space, index) => (
            <article className="space" key={space.name}>
              <span className="space-number">0{index + 1}</span>
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
