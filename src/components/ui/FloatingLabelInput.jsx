import React, { useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * FloatingLabelInput — premium glass input with a floating label,
 * elegant focus glow, and soft depth. Unmistakably premium.
 */
export default function FloatingLabelInput({
  label,
  className = "",
  type = "text",
  value: controlledValue,
  defaultValue = "",
  onChange,
  icon: Icon,
  ...props
}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internal;
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const [focused, setFocused] = useState(false);

  const handleChange = (e) => {
    if (controlledValue === undefined) setInternal(e.target.value);
    onChange?.(e);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center rounded-2xl border transition-all duration-200 ease-unibud",
          focused
            ? "border-ring/50 bg-card/60 shadow-soft"
            : "border-border/40 bg-card/40"
        )}
        style={focused ? { boxShadow: "0 0 0 3px hsl(var(--ring) / 0.12), var(--shadow-soft)" } : undefined}
      >
        {Icon && (
          <Icon className={cn("w-4 h-4 ml-3.5 transition-colors", focused ? "text-primary" : "text-muted-foreground")} strokeWidth={2} />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          placeholder=" "
          className={cn(
            "peer w-full bg-transparent text-[15px] text-foreground placeholder:text-transparent transition-colors",
            "h-12 md:h-11 px-4 pt-3.5 focus:outline-none",
            Icon && "pl-3"
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "absolute pointer-events-none transition-all duration-200 ease-unibud text-muted-foreground",
            Icon ? "left-11" : "left-4",
            focused || hasValue
              ? "top-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
              : "top-1/2 -translate-y-1/2 text-[14px]"
          )}
        >
          {label}
        </label>
      </div>
    </div>
  );
}