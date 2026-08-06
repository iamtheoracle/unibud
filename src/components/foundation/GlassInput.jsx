import React from "react";

/**
 * GlassInput — frosted-glass input with label and optional trailing node.
 * (Leading icon removed — to be re-added with the real icon set.)
 */
export default function GlassInput({ label, icon: Icon, trailing, className = "", inputClassName = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full h-[52px] pl-4 ${
            trailing ? "pr-16" : "pr-4"
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