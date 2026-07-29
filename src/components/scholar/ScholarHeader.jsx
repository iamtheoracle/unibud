import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Briefcase } from "lucide-react";

/**
 * ScholarHeader — LinkedIn-style top bar for the academic professional feed.
 * Wordmark on the left, search + opportunities + profile on the right.
 */
export default function ScholarHeader({ user }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/20">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
        <h1
          className="text-[20px] font-extrabold tracking-tight text-foreground select-none flex items-center gap-1.5"
          style={{ letterSpacing: "-0.03em" }}
        >
          <span>scholar</span>
        </h1>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/discover")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/60 spring-tap"
            aria-label="Search scholars"
          >
            <Search className="w-[20px] h-[20px] text-foreground" strokeWidth={2} />
          </button>
          <button
            onClick={() => navigate("/opportunities")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/60 spring-tap"
            aria-label="Opportunities"
          >
            <Briefcase className="w-[20px] h-[20px] text-foreground" strokeWidth={2} />
          </button>
          <button
            onClick={() => navigate("/me")}
            className="ml-1 spring-tap"
            aria-label="Your profile"
          >
            {user?.avatar_url || user?.image ? (
              <img src={user.avatar_url || user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-[12px] font-bold text-foreground">
                {(user?.full_name || "U").charAt(0)}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}