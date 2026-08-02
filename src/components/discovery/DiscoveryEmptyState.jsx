import React from "react";
import { Link } from "react-router-dom";
import { Compass, Sparkles } from "lucide-react";

export default function DiscoveryEmptyState({ query }) {
  if (query) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-6">
        <div className="w-16 h-16 rounded-full grid place-items-center mb-4 bg-muted/30">
          <Compass className="w-7 h-7 text-muted-foreground/40" strokeWidth={1.5} />
        </div>
        <p className="text-[14px] font-semibold text-foreground">No results for "{query}"</p>
        <p className="text-[12px] text-muted-foreground mt-1.5 max-w-[260px]">
          Try a different search term or browse a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-20 h-20 rounded-full grid place-items-center mb-4 bg-primary/10">
        <Sparkles className="w-9 h-9 text-primary/50" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-bold text-foreground">Nothing to discover yet</p>
      <p className="text-[12px] text-muted-foreground mt-1.5 max-w-[280px] leading-relaxed">
        Communities, events, and opportunities will appear here as students create them. Be the first to start something on your campus.
      </p>
      <Link to="/communities" className="mt-4 px-5 py-2.5 rounded-full bg-foreground text-background text-[13px] font-semibold spring-tap">
        Explore Communities
      </Link>
    </div>
  );
}