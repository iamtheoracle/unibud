"use client";

import { useState, type FormEvent } from "react";

type SearchProfile = {
  handle: string;
  displayName: string;
  kind: "personal" | "creator" | "page_community";
};

type BlockedProfile = {
  handle: string;
  displayName: string;
  blockedAt: string;
};

type SearchSpace = "connect" | "quad" | "bud_board" | "square" | "soullync" | "riff" | "wayward" | "quarter" | "flow";

type SearchResponse = {
  ok: boolean;
  intent?: "academic" | "general_discovery" | "adult_dating" | "space_scoped";
  route?: { kind: string; space?: string; parentSpace?: string; applicationId?: SearchSpace; requiresAdultEligibility?: boolean; requiresIndependentConsent?: boolean };
  category?: "people" | "communities" | "creators" | "institutions" | "opportunities" | "services" | "food" | "events" | "trips";
  discoveryState?: "ready" | "age_assurance_required" | "category_not_available";
  results?: SearchProfile[];
  error?: string;
};

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"global" | SearchSpace>("global");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [blockedProfiles, setBlockedProfiles] = useState<BlockedProfile[] | null>(null);
  const [pendingBlockHandle, setPendingBlockHandle] = useState<string | null>(null);
  const [blockBusy, setBlockBusy] = useState(false);
  const [blockNotice, setBlockNotice] = useState("");

  async function loadBlockedProfiles() {
    setBlockBusy(true);
    setBlockNotice("");
    try {
      const result = await fetch("/api/blocks", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "same-origin"
      });
      const payload = await result.json() as { ok: boolean; blockedProfiles?: BlockedProfile[]; error?: string };
      if (!result.ok || !payload.ok) {
        setError(payload.error ?? "Blocked profiles could not be loaded.");
        return;
      }
      setBlockedProfiles(payload.blockedProfiles ?? []);
    } catch {
      setError("Blocked profiles could not be loaded. Try again.");
    } finally {
      setBlockBusy(false);
    }
  }

  async function changeBlock(method: "POST" | "DELETE", profile: { handle: string; displayName: string }) {
    setBlockBusy(true);
    setError("");
    setBlockNotice("");
    try {
      const result = await fetch("/api/blocks", {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ handle: profile.handle })
      });
      const payload = await result.json() as { ok: boolean; error?: string };
      if (!result.ok || !payload.ok) {
        setError(payload.error ?? "The block setting could not be changed.");
        return;
      }
      if (method === "POST") {
        setResponse(current => current ? {
          ...current,
          results: current.results?.filter(item => item.handle !== profile.handle)
        } : current);
        // The block API does not return an authoritative server timestamp.
        // Invalidate the cached list instead of inventing one in the browser.
        setBlockedProfiles(null);
        setBlockNotice(`@${profile.handle} is blocked across your UNIBUD account.`);
      } else {
        setBlockedProfiles(current => current?.filter(item => item.handle !== profile.handle) ?? []);
        setBlockNotice(`@${profile.handle} is unblocked.`);
      }
      setPendingBlockHandle(null);
    } catch {
      setError("The block setting could not be changed. Try again.");
    } finally {
      setBlockBusy(false);
    }
  }

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
      const params = new URLSearchParams({ q: normalized });
      if (scope !== "global") params.set("scope", scope);
      const result = await fetch(`/api/search?${params.toString()}`, {
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
        people, creator and community profiles belong in Connect. Other Connect categories only return results when their own searchable, permission-checked source is ready; SouLync remains separate.
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
        <label htmlFor="unibud-search-scope">Search in</label>
        <select
          id="unibud-search-scope"
          name="scope"
          value={scope}
          onChange={event => setScope(event.target.value as "global" | SearchSpace)}
        >
          <option value="global">All relevant spaces</option>
          <option value="bud_board">Board · inside Bud</option>
          <option value="connect">Connect</option>
          <option value="quad">Quad</option>
          <option value="square">Square</option>
          <option value="soullync">SouLync · separate adult space</option>
          <option value="riff">Riff</option>
          <option value="wayward">Wayward</option>
          <option value="quarter">The Quarter</option>
          <option value="flow">Flow</option>
        </select>
        <p id="search-hint" className="search-hint">2–40 characters. Global search routes academic intent to Board and broad discovery to Connect. An explicit space selection preserves that boundary; it does not bypass that space’s permissions or imply its search service is live.</p>
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

        {!loading && response?.intent === "space_scoped" && response.route?.applicationId === "soullync" ? (
          <section className="search-message">
            <p className="eyebrow">SouLync · separate space</p>
            <h2>SouLync keeps its own safety gates.</h2>
            <p>The search scope is preserved, but no dating records are queried. SouLync requires verified adult eligibility, independent consent and its own moderation controls.</p>
          </section>
        ) : null}

        {!loading && response?.intent === "space_scoped" && response.route?.applicationId !== "soullync" ? (
          <section className="search-message">
            <p className="eyebrow">Space-scoped search</p>
            <h2>{({
              connect: "Connect",
              quad: "Quad",
              bud_board: "Board · inside Bud",
              square: "Square",
              riff: "Riff",
              wayward: "Wayward",
              quarter: "The Quarter",
              flow: "Flow"
            } as Record<string, string>)[response.route?.applicationId ?? ""] ?? "Selected space"}</h2>
            <p>The selected space boundary is preserved. Its dedicated searchable records and authorization adapter must be available before results can be returned; no cross-space results are substituted.</p>
          </section>
        ) : null}

        {!loading && response?.intent === "adult_dating" ? (
          <section className="search-message">
            <p className="eyebrow">SouLync · separate space</p>
            <h2>SouLync has its own safety gates.</h2>
            <p>This search has not opened dating records. SouLync requires verified adult eligibility, independent consent and its own moderation controls before it can be available.</p>
          </section>
        ) : null}

        {!loading && response?.intent === "general_discovery" && response.discoveryState === "category_not_available" ? (
          <section className="search-message">
            <p className="eyebrow">Connect · {response.category ?? "discovery"}</p>
            <h2>This category is not searchable yet.</h2>
            <p>Its dedicated data source and access rules are still being built. UNIBUD will not substitute unrelated people profiles or fabricate results.</p>
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
                  <div className="search-result-actions">
                    {pendingBlockHandle === profile.handle ? (
                      <>
                        <span>Block this account across all profiles?</span>
                        <button type="button" disabled={blockBusy} onClick={() => void changeBlock("POST", profile)}>Confirm</button>
                        <button type="button" disabled={blockBusy} onClick={() => setPendingBlockHandle(null)}>Cancel</button>
                      </>
                    ) : (
                      <button type="button" disabled={blockBusy} onClick={() => setPendingBlockHandle(profile.handle)}>Block</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {blockNotice ? <p className="search-message" role="status">{blockNotice}</p> : null}
      <section className="blocked-management" aria-labelledby="blocked-title">
        <div className="blocked-heading">
          <div>
            <p className="eyebrow">Account safety</p>
            <h2 id="blocked-title">Blocked accounts</h2>
          </div>
          <button type="button" className="blocked-load" disabled={blockBusy} onClick={() => void loadBlockedProfiles()}>
            {blockBusy ? "Loading…" : blockedProfiles === null ? "View blocked accounts" : "Refresh"}
          </button>
        </div>
        {blockedProfiles !== null ? (
          blockedProfiles.length === 0
            ? <p className="search-message">You have no active account blocks.</p>
            : <ul className="search-result-list">
                {blockedProfiles.map(profile => (
                  <li className="search-result" key={profile.handle}>
                    <div className="search-result-copy">
                      <strong>{profile.displayName}</strong>
                      <span>@{profile.handle}</span>
                    </div>
                    <button type="button" className="blocked-unblock" disabled={blockBusy} onClick={() => void changeBlock("DELETE", profile)}>Unblock</button>
                  </li>
                ))}
              </ul>
        ) : (
          <p className="search-hint">Blocks apply at account level across the person’s profiles. You can review or reverse your own blocks here.</p>
        )}
      </section>
    </section>
  );
}
