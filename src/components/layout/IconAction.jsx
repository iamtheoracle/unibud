import React from "react";
import { Link } from "react-router-dom";
import { hapticTap } from "@/lib/haptics";

/**
 * IconAction — the unified round action button used inside ScreenHeader
 * action slots and standalone toolbars. Two variants:
 *   • glass  — frosted secondary action (search, filters, more)
 *   • primary — solid midnight primary with ice glow (compose, add)
 */
export default function IconAction({ icon: Icon, onClick, to, label, variant = "glass", className = "" }) {
  const base = "w-10 h-10 rounded-full flex items-center justify-center spring-tap flex-shrink-0 border";
  const styles = {
    glass: "glass border-border/30 text-foreground",
    primary: "bg-primary text-primary-foreground border-transparent ice-glow",
  };
  const cls = `${base} ${styles[variant] || styles.glass} ${className}`;
  const content = <Icon className="w-[18px] h-[18px]" strokeWidth={variant === "primary" ? 2 : 1.8} />;
  if (to) {
    return (
      <Link to={to} aria-label={label} className={cls} onClick={() => hapticTap()}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={(e) => { hapticTap(); onClick?.(e); }} aria-label={label} className={cls}>
      {content}
    </button>
  );
}