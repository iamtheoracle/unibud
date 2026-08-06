import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PremiumInput — unified glass input with floating label, icon, and clear button.
 *
 * Props:
 *  - label: floating label text
 *  - icon: Lucide icon for left side
 *  - type: "text" | "email" | "password" | "search" | "number" | "tel" | "url"
 *  - value, onChange, placeholder
 *  - error: string — shows error state
 *  - clearable: boolean — shows clear (X) button
 *  - className: extra
 */
export default function PremiumInput({
  label,
  icon: Icon,
  type = "text",
  value = "",
  onChange,
  placeholder,
  error,
  clearable = false,
  className = "",
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isSearch = type === "search";
  const actualType = type === "password" && showPassword ? "text" : type;
  const SearchIcon = isSearch ? Search : Icon;
  const hasValue = typeof value === "string" ? value.length > 0 : value != null;
  const showFloatingLabel = label && (focused || hasValue);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center gap-2 h-12 px-3.5 rounded-[16px] glass transition-all",
          focused && "ring-2 ring-primary/30",
          error && "ring-2 ring-destructive/30"
        )}
      >
        {SearchIcon && (
          <SearchIcon
            className={cn("w-4 h-4 flex-shrink-0", error ? "text-destructive" : focused ? "text-primary" : "text-muted-foreground")}
            strokeWidth={2.2}
          />
        )}

        <div className="flex-1 relative">
          {showFloatingLabel && (
            <motion.label
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-1.5 left-0 text-[9px] font-bold uppercase tracking-wider text-muted-foreground pointer-events-none bg-transparent"
            >
              {label}
            </motion.label>
          )}
          <input
            type={actualType}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={showFloatingLabel ? "" : placeholder || label}
            className="w-full bg-transparent text-[14px] text-foreground outline-none h-full pt-1"
            {...props}
          />
        </div>

        {/* Password toggle */}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="w-6 h-6 flex items-center justify-center flex-shrink-0 spring-tap"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
            )}
          </button>
        )}

        {/* Clear button */}
        {clearable && hasValue && (
          <button
            type="button"
            onClick={() => onChange?.({ target: { value: "" } })}
            className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center flex-shrink-0 spring-tap"
          >
            <X className="w-3 h-3 text-foreground" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-destructive font-medium mt-1.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * PremiumTextarea — glass textarea with floating label and auto-resize option.
 */
export function PremiumTextarea({ label, value = "", onChange, placeholder, rows = 3, className = "", ...props }) {
  const [focused, setFocused] = useState(false);
  const hasValue = typeof value === "string" ? value.length > 0 : value != null;
  const showFloatingLabel = label && (focused || hasValue);

  return (
    <div className={cn("relative", className)}>
      <div className={cn("relative rounded-[16px] glass p-3.5 transition-all", focused && "ring-2 ring-primary/30")}>
        {showFloatingLabel && (
          <motion.label
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-1"
          >
            {label}
          </motion.label>
        )}
        <textarea
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={showFloatingLabel ? "" : placeholder || label}
          rows={rows}
          className="w-full bg-transparent text-[14px] text-foreground outline-none resize-none leading-relaxed"
          {...props}
        />
      </div>
    </div>
  );
}