import React from "react";
import ScreenShell from "@/components/layout/ScreenShell";
import CompanyFooter from "@/components/foundation/CompanyFooter";

/**
 * Terms — standalone public route.
 * Plain-language, fair, and honest about what UNIBUD is and is not
 * (Bud supports learning but never replaces a lecturer's academic judgement).
 */
export default function Terms() {
  return (
    <ScreenShell
      title="Terms of Service"
      subtitle="The agreement between you and UNIBUD"
      back
    >
      <div className="space-y-7 text-body text-foreground/90 leading-relaxed pt-2">
        <Section title="Welcome">
          By using UNIBUD you agree to these terms. They are written to be fair
          and readable, not to trap you. If something is unclear, ask us before
          you rely on it.
        </Section>

        <Section title="Who can use UNIBUD">
          You must be a genuine member of your academic community — a student,
          lecturer, or administrator — and you must be honest about your role.
          One account per person. You are responsible for keeping your login
          safe.
        </Section>

        <Section title="What UNIBUD is">
          UNIBUD is an operating system for university life: your campus,
          academics, social world, and tools in one calm place. Bud is a
          trusted university friend who helps you study, plan, and stay on
          track.
        </Section>

        <Section title="What Bud is not">
          Bud supports your learning but is not a substitute for your
          lecturer's academic judgement, your institution's regulations, or
          professional advice. Always confirm important academic decisions
          with the right authority at your university.
        </Section>

        <Section title="Your account & conduct">
          <List items={[
            "Use your real identity. Impersonation is not tolerated.",
            "Respect others — no harassment, hate, threats, or bullying.",
            "Don't cheat. UNIBUD helps you learn; using it to misrepresent your work undermines that mission.",
            "Keep it lawful. Don't use UNIBUD to break any law or university regulation.",
            "Don't attack, scrape, or overload the service or try to access others' data.",
          ]} />
        </Section>

        <Section title="Your content">
          You own what you create — your posts, notes, and portfolio. You give
          UNIBUD a limited license to display it within the service (for
          example, to show your post to your campus). You are responsible for
          having the rights to anything you upload.
        </Section>

        <Section title="Payments, fees & wallet">
          Where UNIBUD processes fees, scholarships, or wallet top-ups, a
          third-party payment provider handles the transaction. Refunds follow
          your institution's policy and the provider's rules. UNIBUD does not
          hold customer funds itself.
        </Section>

        <Section title="Institutions & roles">
          Your university may administer parts of UNIBUD for its community.
          Where your institution sets policy (deadlines, grading, conduct),
          that policy applies within the platform.
        </Section>

        <Section title="Service availability">
          We work hard to keep UNIBUD fast and stable, but no service is up
          100% of the time. We may update, pause, or change features. Where a
          change affects your data or access, we will tell you in advance.
        </Section>

        <Section title="Disclaimers">
          UNIBUD is provided "as is" to the extent the law allows. We don't
          guarantee that every feature will be error-free or uninterrupted.
        </Section>

        <Section title="Limitation">
          To the extent the law allows, UNIBUD is not liable for indirect or
          accidental losses arising from use of the service. Nothing here
          removes rights the law gives you that can't be excluded.
        </Section>

        <Section title="Governing law">
          These terms are governed by the laws applicable where the company
          operates. Disputes will be resolved in the competent courts of that
          jurisdiction unless we agree otherwise.
        </Section>

        <Section title="Changes">
          We may update these terms. When we do, we tell you in the app. If a
          change is significant, continued use after it takes effect means you
          accept the updated terms.
        </Section>

        <Section title="Contact">
          Questions about these terms? Reach out from the Help section in the
          Me tab.
        </Section>

        <p className="text-caption text-muted-foreground pt-2">
          Last updated: July 2026
        </p>
      </div>

      <div className="mt-10">
        <CompanyFooter />
      </div>
    </ScreenShell>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-heading font-bold text-[16px] text-foreground mb-2">{title}</h2>
      <div className="text-[14px] text-foreground/85 leading-relaxed">{children}</div>
    </section>
  );
}

function List({ items }) {
  return (
    <ul className="space-y-2 mt-1">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5 text-[14px] text-foreground/85 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}