import React from "react";
import ScreenShell from "@/components/layout/ScreenShell";
import CompanyFooter from "@/components/foundation/CompanyFooter";

/**
 * Privacy — standalone public route.
 * Calm, on-brand, plain-language. No fake promises; reflects what the
 * platform actually does (institution-scoped data, encryption at rest for
 * sensitive fields, Bud as a companion — never surveillance).
 */
export default function Privacy() {
  return (
    <ScreenShell
      title="Privacy Policy"
      subtitle="How UNIBUD handles your data"
      back
    >
      <div className="space-y-7 text-body text-foreground/90 leading-relaxed pt-2">
        <Section title="Our promise">
          UNIBUD is built to help you succeed at university — not to harvest you.
          We collect only what we need to make campus life calmer, more
          organized, and more connected, and we treat everything you share as
          yours. This page explains, in plain language, what we keep, why, and
          the control you always have.
        </Section>

        <Section title="Information we hold">
          <List items={[
            "Account details — your name, email, institution, and role within the university.",
            "Academic context — courses, timetable, assignments, and progress you choose to track.",
            "Conversations with Bud — so Bud can remember what helps you and stay consistent.",
            "Social activity — posts, messages, and connections you create within your campus.",
            "Activity data — what helps us keep the app fast, stable, and secure.",
          ]} />
        </Section>

        <Section title="How we use it">
          To show your schedule, surface deadlines, connect you with peers and
          mentors, and let Bud offer guidance tuned to your courses and goals.
          We never sell your data, and we never use it to build profiles for
          advertisers.
        </Section>

        <Section title="Institution scope">
          Your academic data is scoped to your institution. A student at one
          university cannot see the records, posts, or grades of a student at
          another. Access within your university follows your role — students,
          lecturers, and administrators each see what their role requires.
        </Section>

        <Section title="Security at rest">
          Sensitive fields — starting with private message content — are
          encrypted on the device before they are stored, so even at rest they
          are unreadable without your session. We extend this protection to
          additional sensitive records over time.
        </Section>

        <Section title="Bud is a companion, not surveillance">
          Bud remembers your study context to be a better friend and tutor.
          That memory is yours — you can review and clear it from your Bud
          settings at any time. Bud never watches you to rank or judge you.
        </Section>

        <Section title="Sharing">
          We share data only to deliver the service (for example, the payment
          provider that processes fees and wallet top-ups) or where we are
          legally required to. Providers are bound by contract and only
          receive what is necessary for the task.
        </Section>

        <Section title="Your control">
          <List items={[
            "See your data — your profile, memory, and activity are available in the Me tab.",
            "Edit your data — update your profile, preferences, and notification choices anytime.",
            "Clear Bud's memory — reset what Bud remembers from the Bud settings.",
            "Delete your account — request full removal; we erase what we hold on your behalf.",
          ]} />
        </Section>

        <Section title="Retention">
          We keep your data while your account is active. When you delete your
          account, we remove your personal records, retaining only what we must
          for legal or institutional-records obligations.
        </Section>

        <Section title="Children">
          UNIBUD is designed for students in higher education. We do not
          knowingly collect data from anyone under the applicable age of
          digital consent.
        </Section>

        <Section title="Changes to this policy">
          When this policy meaningfully changes, we will tell you inside the
          app before it takes effect. Continued use after that means you accept
          the updated terms.
        </Section>

        <Section title="Contact">
          Questions about your data? Reach out from the Help section in the Me
          tab and we will respond as quickly as we can.
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