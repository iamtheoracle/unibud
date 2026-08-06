import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

/**
 * RecastCard — home entry point to the Bud Recast demo.
 * Dashed border + subtle glow distinguishes it from standard home cards.
 */
export default function RecastCard() {
  const navigate = useNavigate();
  return (
    <div
      className="mt-4 rounded-[18px] p-5 spring-tap relative overflow-hidden"
      style={{
        background: "hsl(var(--primary) / 0.05)",
        border: "1px dashed hsl(var(--primary) / 0.55)",
        boxShadow: "0 0 24px hsl(var(--primary) / 0.12), inset 0 1px 0 hsl(var(--primary) / 0.10)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-semibold text-[16px] text-foreground">Bud Recast</h3>
      </div>
      <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-3">
        Bring any article, video, or link to life in UNIBUD style. Try an example below.
      </p>
      <button
        onClick={() => navigate("/recast")}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground font-heading font-semibold text-[14px] spring-tap ice-glow"
      >
        Recast Quantum Computing Article <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}