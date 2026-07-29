import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Send, Search } from "lucide-react";

/**
 * SquareHeader — Instagram-style top bar for the Square social feed.
 * Wordmark on the left, search + activity + messages on the right.
 */
export default function SquareHeader({ user }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/20">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
        <h1
          className="text-[22px] font-extrabold tracking-tight text-foreground select-none"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}
        >
          square
        </h1>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/discover")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/60 spring-tap"
            aria-label="Search"
          >
            <Search className="w-[21px] h-[21px] text-foreground" strokeWidth={2} />
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/60 spring-tap"
            aria-label="Activity"
          >
            <Heart className="w-[21px] h-[21px] text-foreground" strokeWidth={2} />
          </button>
          <button
            onClick={() => navigate("/messages")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/60 spring-tap"
            aria-label="Messages"
          >
            <Send className="w-[20px] h-[20px] text-foreground" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}