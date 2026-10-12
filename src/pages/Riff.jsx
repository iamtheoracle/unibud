import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Flame, ShieldCheck, Sparkles, ArrowUpRight } from "lucide-react";

const topics = ["Trending", "Campus tea", "Relationships", "Confessions", "Culture"];

export default function Riff() {
  return (
    <main className="min-h-[100dvh] bg-[#090B10] text-white">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#090B10]/85 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link to="/welcome" aria-label="Back to welcome" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/[0.06]">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/20 to-fuchsia-400/20 text-amber-200">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-[17px] font-bold tracking-tight">Riff</h1>
            <p className="text-[11px] text-white/40">The open conversation</p>
          </div>
          <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2.5 py-1 text-[10px] font-medium text-emerald-200/80">Public space</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-12">
        <section className="relative mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#1B1825] via-[#12141D] to-[#17131A] p-6 sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60">
              <Flame className="h-3.5 w-3.5 text-amber-300" /> Say what you mean
            </span>
            <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              What’s the conversation today?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
              Hot takes, honest questions, campus stories, pop culture and the things everyone’s talking about. Join in without creating a UNIBUD account.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {topics.map((topic, index) => (
                <span key={topic} className={`rounded-full border px-3 py-1.5 text-[11px] ${index === 0 ? "border-amber-200/20 bg-amber-200/10 text-amber-100" : "border-white/10 bg-white/[0.035] text-white/55"}`}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">The floor is yours</h3>
              <p className="mt-1 text-sm leading-6 text-white/50">
                Riff is intended to be open to everyone, including people visiting without an account. Public publishing is not active yet because shared post storage and moderation controls still need to be connected.
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white/50">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="mt-3 text-sm font-semibold">The feed is waiting for real conversations</h4>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-white/40">
              No sample gossip or invented posts. Once the public feed is connected, visitors can post and reply here without signing in.
            </p>
            <button type="button" disabled className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-semibold text-black opacity-45">
              Start a Riff <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
          <p className="text-[11px] leading-5 text-white/40">
            Keep it lively, not harmful. Don’t post private details, threats, or unverified accusations about identifiable people.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/30">
          <Link to="/register" className="text-white/55 underline underline-offset-4">Create an account</Link>
          {" "}to unlock the rest of UNIBUD, or{" "}
          <Link to="/welcome" className="text-white/55 underline underline-offset-4">return to welcome</Link>.
        </p>
      </div>
    </main>
  );
}
