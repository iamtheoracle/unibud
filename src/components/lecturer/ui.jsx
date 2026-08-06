import React from "react";

export const inputCls = "w-full h-10 px-3 rounded-xl bg-muted/40 border border-border text-[14px] focus:outline-none focus:border-primary/60";
export const textareaCls = "w-full p-3 rounded-xl bg-muted/40 border border-border text-[14px] focus:outline-none focus:border-primary/60";

export const Field = ({ label, children }) => (
  <div>
    <p className="text-[12px] font-semibold text-muted-foreground mb-1.5 ml-0.5">{label}</p>
    {children}
  </div>
);

export const Select = ({ label, value, onChange, options }) => (
  <div>
    {label && <p className="text-[12px] font-semibold text-muted-foreground mb-1.5 ml-0.5">{label}</p>}
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls + " capitalize"}>
      {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
    </select>
  </div>
);

export const Empty = ({ label }) => <div className="glass-card radius-lg p-8 text-center text-muted-foreground text-[14px]">{label}</div>;

export const SectionTitle = ({ title, action }) => (
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-[15px] font-heading font-semibold">{title}</h3>
    {action}
  </div>
);