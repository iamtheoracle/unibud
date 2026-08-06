import React from "react";
import { Link } from "react-router-dom";

export default function StatisticRow({ to, icon: Icon, label, value, sub, onClick }) {
  const content = (
    <>
      <div className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon className="w-3 h-3 text-primary" strokeWidth={2.2} />}
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <p className="text-[18px] font-bold text-foreground leading-tight tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground truncate mt-0.5">{sub}</p>}
    </>
  );

  const className = "flex-1 px-4 first:pl-0 last:pr-0 spring-tap text-left";
  if (to) return <Link to={to} className={className}>{content}</Link>;
  return <button onClick={onClick} className={className}>{content}</button>;
}