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
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-5 h-14">
        <h1 className="text-[24px] font-bold tracking-tight text-foreground select-none">
          Square
        </h1>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => navigate("/discover")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
            aria-label="Search"
          >
            <Search className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
            aria-label="Activity"
          >
            <Heart className="w-[20px] h-[20px] text-foreground" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => navigate("/messages")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
            aria-label="Messages"
          >
            <Send className="w-[19px] h-[19px] text-foreground" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}