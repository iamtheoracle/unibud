import React from "react";
import { ShieldCheck, HeartHandshake, Compass, Sparkles } from "lucide-react";
import ScreenShell from "@/components/layout/ScreenShell";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import { COMPANY_IDENTITY } from "@/lib/companyIdentity";

/**
 * About — standalone public route.
 * The honest story of UNIBUD: what it is, the mission, Bud, the worlds,
 * and the company behind it. No hype, no AI jargon.
 */
export default function About() {
  return (
    <ScreenShell
      title="About UNIBUD"
      subtitle="The operating system for university life"
      back
    >
      <div className="space-y-8 pt-2">
        <div className="crystal-card p-5 light-bloom">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Compass className="w-5 h-5" />
            <span className="text-label uppercase tracking-wide">The Future Starts Together</span>
          </div>
          <p className="text-[15px] text-foreground/90 leading-relaxed">
            UNIBUD is the calm, intelligent home for everything that makes
            university life work — your campus, your academics, your people,
            and the tools you reach for every day. One place, designed to make
            you feel more organized, more connected, and closer to your goals.
          </p>
        </div>

        <Section title="The mission">
          Every choice in UNIBUD exists to help a student succeed. We remove
          friction from the things that drain your time — scattered portals,
          lost deadlines, siloed notes — so your energy goes where it matters:
          learning, growing, and building the future you came to university for.
        </Section>

        <Section title="Meet Bud">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0 border border-primary/15">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-[14px] text-foreground/85 leading-relaxed">
              Bud is a trusted university friend — patient, encouraging, and
              always in your corner. Bud helps you plan your week, untangle a
              tough concept, find the right opportunity, and remember what
              matters. Bud is never a label or a machine in the interface; Bud
              is simply the friend who's there when you need a hand.
            </p>
          </div>
        </Section>

        <Section title="Your worlds">
          <div className="grid grid-cols-2 gap-3 mt-2">
            <WorldCard label="Campus" hint="Your academic home — courses, timetable, grades, and guidance." />
            <WorldCard label="Quad" hint="The campus conversation — posts, stories, and what's happening now." />
            <WorldCard label="Connect" hint="Your people — messages, mentors, friends, and communities." />
            <WorldCard label="Me" hint="Your identity — profile, achievements, wallet, and settings." />
          </div>
        </Section>

        <Section title="How we build">
          <List items={[
            "Calm by default — generous space, soft glass, no clutter, no noise.",
            "Private by design — institution-scoped data, encryption for sensitive fields.",
            "Accessible to everyone — WCAG 2.2 AA, reduced motion, and readable type.",
            "Honest — empty states with guidance instead of fake activity; Bud is a friend, not a buzzword.",
          ]} />
        </Section>

        <div className="crystal-card p-5 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-foreground">Built by {COMPANY_IDENTITY.companyName}</p>
            <p className="text-[11px] text-muted-foreground">RC {COMPANY_IDENTITY.rcNumber}</p>
          </div>
        </div>

        <Section title="What's next">
          UNIBUD grows with you — from your first day on campus to graduation
          and beyond. We add features as they earn their place, always asking
          one question: does this help a student succeed?
        </Section>

        <div className="flex items-center justify-center gap-2 text-primary/80 pt-1">
          <HeartHandshake className="w-4 h-4" />
          <span className="text-[12px] font-semibold">The Future Starts Together.</span>
        </div>

        <div className="mt-6">
          <CompanyFooter />
        </div>
      </div>
    </ScreenShell>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-heading font-bold text-[16px] text-foreground mb-2.5">{title}</h2>
      <div className="text-[14px] text-foreground/85 leading-relaxed">{children}</div>
    </section>
  );
}

function WorldCard({ label, hint }) {
  return (
    <div className="glass-card p-3.5">
      <p className="font-heading font-bold text-[14px] text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{hint}</p>
    </div>
  );
}

function List({ items }) {
  return (
    <ul className="space-y-2.5 mt-1">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5 text-[14px] text-foreground/85 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}