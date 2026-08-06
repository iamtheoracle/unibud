import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap, BookOpen, ClipboardCheck, Compass, FlaskConical, Briefcase } from "lucide-react";

/**
 * CampusShell — the distinct academic layout chrome.
 * Calm, structured, document-first; does not resemble the social AppShell.
 * Solid panels (bg-card) over translucency to encourage focus and deep work.
 */
const NAV = [
  { label: "Learn", to: "/courses", icon: BookOpen },
  { label: "Assess", to: "/exams", icon: ClipboardCheck },
  { label: "Plan", to: "/agenda", icon: Compass },
  { label: "Research", to: "/research", icon: FlaskConical },
  { label: "Career", to: "/career", icon: Briefcase },
];

export default function CampusShell({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen pb-28 safe-area-pt relative">
      {/* Ambient crystal bloom behind the entire Campus surface */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="ambient-orb absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[360px]" style={{ background: "radial-gradient(50% 50% at 50% 50%, hsl(0 0% 100% / 0.06), transparent 70%)" }} />
      </div>
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/campus" className="flex items-center gap-2 spring-tap">
              <div className="w-8 h-8 rounded-[11px] crystal-card flex items-center justify-center edge-light">
                <GraduationCap className="w-4 h-4 text-foreground" strokeWidth={2.2} />
              </div>
              <span className="text-[17px] font-bold tracking-tight text-foreground" style={{ letterSpacing: "-0.02em" }}>
                Campus
              </span>
            </Link>
            <p className="text-[11px] font-medium text-muted-foreground/80">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
          <nav className="flex gap-1.5 pb-2.5 overflow-x-auto no-scrollbar">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.to || pathname.startsWith(n.to + "/");
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap transition-all duration-300 ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground bg-muted/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.2} /> {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-6 pt-6 relative z-10">{children}</div>
    </div>
  );
}