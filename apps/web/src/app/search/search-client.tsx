"use client";

import { FormEvent, useState } from "react";

type SearchProfile = {
  handle: string;
  displayName: string;
  kind: "personal" | "creator" | "page_community";
};

type SearchResponse = {
  ok: boolean;
  intent?: "academic" | "general_discovery" | "adult_dating" | "space_scoped";
  route?: { kind: string; space?: string; parentSpace?: string; requiresAdultEligibility?: boolean; requiresIndependentConsent?: boolean };
  discoveryState?: "ready" | "age_assurance_required";
  results?: SearchProfile[];
  error?: string;
};

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    if (normalized.length < 2 || normalized.length > 40) {
      setError("Enter between 2 and 40 characters.");
      setResponse(null);
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);
    try {
      const result = await fetch(`/api/search?q=${encodeURIComponent(normalized)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "same-origin"
      });
      const payload = (await result.json()) as SearchResponse;
      if (!result.ok || !payload.ok) {
        setError(payload.error ?? (result.status === 429
          ? "Search limit reached. Please wait a minute and try again."
          : "Search is temporarily unavailable."));
        return;
      }
      setResponse(payload);
    } catch {
      setError("Search could not connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="search-page" aria-labelledby="search-title">
      <p className="eyebrow">UNIBUD search</p>
      <h1 id="search-title">Find your place.</h1>
      <p className="search-intro">
        Search is routed to the right space. Academic discovery belongs in Board inside Bud;
        people and community discovery belongs in Connect; SouLync remains separate.
      </p>

      <form className="search-form" onSubmit={submit} role="search">
        <label htmlFor="unibud-search">What are you looking for?</label>
        <div className="search-input-row">
          <input
            id="unibud-search"
            name="q"
            type="search"
            autoComplete="off"
            maxLength={40}
            minLength={2}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="People, communities, a course, a tutor…"
            aria-describedby="search-hint"
          />
          <button className="search-submit" type="submit" disabled={loading || query.trim().length < 2}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
        <p id="search-hint" className="search-hint">2–40 characters. Results are limited by profile visibility, blocking and safety eligibility.</p>
      </form>

      {error ? <p className="search-message search-error" role="alert">{error}</p> : null}

      <div className="search-results" aria-live="polite" aria-busy={loading}>
        {loading ? <p className="search-message">Searching the permitted space…</p> : null}

        {!loading && response?.intent === "academic" ? (
          <section className="search-message">
            <p className="eyebrow">Board · inside Bud</p>
            <h2>Academic search belongs in Board.</h2>
            <p>The query was routed correctly. Board’s academic records and search service are not yet available, so no substitute results are shown.</p>
          </section>
        ) : null}

        {!loading && response?.intent === "adult_dating" ? (
          <section className="search-message">
            <p className="eyebrow">SouLync · separate space</p>
            <h2>SouLync has its own safety gates.</h2>
            <p>This search has not opened dating records. SouLync requires verified adult eligibility, independent consent and its own moderation controls before it can be available.</p>
          </section>
        ) : null}

        {!loading && response?.intent === "general_discovery" && response.discoveryState === "age_assurance_required" ? (
          <section className="search-message">
            <p className="eyebrow">Connect · safety gate</p>
            <h2>People discovery is not enabled yet.</h2>
            <p>UNIBUD is waiting for an approved age-assurance integration. Until then, people discovery stays closed rather than showing unverified profiles.</p>
          </section>
        ) : null}

        {!loading && response?.intent === "general_discovery" && response.discoveryState === "ready" && response.results?.length === 0 ? (
          <p className="search-message">No matching public profiles were found.</p>
        ) : null}

        {!loading && response?.intent === "general_discovery" && response.discoveryState === "ready" && response.results?.length ? (
          <section aria-label="Connect people results">
            <p className="eyebrow search-result-label">Connect · public profiles</p>
            <ul className="search-result-list">
              {response.results.map(profile => (
                <li className="search-result" key={profile.handle}>
                  <div className="search-result-avatar" aria-hidden="true">{profile.displayName.trim().slice(0, 1).toUpperCase()}</div>
                  <div className="search-result-copy">
                    <strong>{profile.displayName}</strong>
                    <span>@{profile.handle}</span>
                  </div>
                  <span className="search-result-kind">{profile.kind.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </section>
  );
}
