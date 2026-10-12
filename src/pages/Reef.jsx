import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Waves, ShieldAlert, UserRound } from "lucide-react";

export default function Reef() {
  const navigate = useNavigate();

  return (
    <main className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/welcome")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60"
            aria-label="Back to welcome"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Waves className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">REEF</h1>
              <p className="text-xs text-muted-foreground">The open conversation space</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-6 w-6" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Public access</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Talk about what’s happening.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            REEF is designed as an open discussion space. You can visit without creating a UNIBUD account.
            Keep posts respectful, protect people’s private information, and don’t publish accusations as facts.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Public posting is not connected yet</h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                This build has no persistent public REEF posting service or moderation pipeline connected.
                I’m not showing invented conversations or pretending a post has been published.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-border p-5 text-center">
            <MessageCircle className="mx-auto h-7 w-7 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">No public conversations to show</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Real discussions will appear here once the public feed is backed by shared storage and basic safety controls.
            </p>
            <button
              type="button"
              disabled
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground opacity-50"
            >
              <MessageCircle className="h-4 w-4" />
              Start a conversation
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
              <UserRound className="h-4 w-4" />
              Create a UNIBUD account
            </Link>
            <Link to="/welcome" className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold">
              Back to welcome
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
