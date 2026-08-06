import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * SummaryRow — premium divider-based list row used across all editorial screens.
 * Icon + label + value + chevron. Renders as a Link if `to` is provided,
 * otherwise as a button with `onClick`.
 */
export default function SummaryRow({ to, icon: Icon, label, value, onClick }) {
  const content = (
    <>
      {Icon && <Icon className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.8} />}
      <span className="text-[15px] font-medium text-foreground flex-1">{label}</span>
      {value && <span className="text-[13px] text-muted-foreground">{value}</span>}
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
    </>
  );

  const className = "flex items-center gap-3 py-4 spring-tap group w-full text-left";

  if (to) return <Link to={to} className={className}>{content}</Link>;
  return <button onClick={onClick} className={className}>{content}</button>;
}