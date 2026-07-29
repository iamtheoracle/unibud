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
    <div className="min-h-screen pb-28 safe-area-pt">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/15">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/campus" className="flex items-center gap-2 spring-tap">
              <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center">
                <GraduationCap className="w-4 h-4" strokeWidth={2.2} />
              </div>
              <span className="text-[17px] font-bold tracking-tight text-foreground" style={{ letterSpacing: "-0.02em" }}>
                Campus
              </span>
            </Link>
            <p className="text-[11px] text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
          <nav className="flex gap-1 pb-2 overflow-x-auto no-scrollbar">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.to || pathname.startsWith(n.to + "/");
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} /> {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 pt-4">{children}</div>
    </div>
  );
}