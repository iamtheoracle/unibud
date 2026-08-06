import React from "react";

/**
 * BrandLogo — temporary text-only wordmark.
 * The official UNIBUD logo will be added here once provided.
 */
export default function BrandLogo({ size = "md", showWord = true, className = "" }) {
  const text = {
    xs: "text-[14px]",
    sm: "text-[17px]",
    md: "text-[22px]",
    lg: "text-[28px]",
  }[size] || "text-[22px]";

  if (!showWord) return null;
  return (
    <span className={`font-heading font-bold tracking-tight text-foreground ${text} ${className}`}>
      UNIBUD
    </span>
  );
}

/** Mark-only variant — neutral placeholder until the official mark is added. */
export function BrandMark({ size = 40, className = "" }) {
  return (
    <div
      className={`rounded-[22%] glass flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="UNIBUD"
    />
  );
}