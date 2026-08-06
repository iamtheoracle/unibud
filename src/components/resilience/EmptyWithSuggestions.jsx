import React from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, ArrowRight } from "lucide-react";

/**
 * EmptyWithSuggestions — empty state that recommends next actions
 * instead of showing a dead-end "nothing here" message.
 */
export default function EmptyWithSuggestions({
  icon: Icon = Search,
  title = "Nothing here yet",
  message = "Try creating something, or explore these suggestions.",
  suggestions = [],
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
      <div className="w-12 h-12 rounded-[18px] bg-card border border-border/40 flex items-center justify-center mb-3 soft-shadow">
        <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <h3 className="font-heading font-semibold text-[15px] text-foreground mb-1">{title}</h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px] mb-5">{message}</p>
      {suggestions.length > 0 && (
        <div className="w-full max-w-[300px] space-y-2">
          {suggestions.map((s, i) => {
            const SIcon = s.icon || Sparkles;
            const content = (
              <div className="flex items-center gap-3 p-3 rounded-[16px] bg-card border border-border/40 spring-tap">
                <SIcon className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{s.label}</p>
                  {s.desc && <p className="text-[11px] text-muted-foreground truncate">{s.desc}</p>}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={1.8} />
              </div>
            );
            return s.to ? <Link key={i} to={s.to}>{content}</Link> : <button key={i} onClick={s.onClick} className="w-full">{content}</button>;
          })}
        </div>
      )}
    </div>
  );
}