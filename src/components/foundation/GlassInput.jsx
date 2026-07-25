import React from "react";

/**
 * GlassInput — the canonical frosted-glass input for UNIBUD auth flows.
 * Leading icon, optional trailing node (e.g. password toggle), label.
 * Adapts to light/dark via tokens.
 */
export default function GlassInput({
  label,
  icon: Icon,
  trailing,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/70 pointer-events-none" />
        )}
        <input
          className={`w-full h-[52px] ${Icon ? "pl-11" : "pl-4"} ${
            trailing ? "pr-12" : "pr-4"
          } rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 backdrop-blur-xl focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25 transition-all ${inputClassName} ${className}`}
          {...props}
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
}