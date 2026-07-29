import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

// Literal class maps so Tailwind keeps them (no dynamic class names).
export const COLOR = {
  primary: { text: "text-primary", bg: "bg-primary/10" },
  success: { text: "text-success", bg: "bg-success/10" },
  warning: { text: "text-warning", bg: "bg-warning/10" },
  error: { text: "text-error", bg: "bg-error/10" },
  information: { text: "text-information", bg: "bg-information/10" },
  accent: { text: "text-accent", bg: "bg-accent/10" },
};

export function SectionTitle({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-3 px-5">
      <h3 className="font-heading font-bold text-[15px] text-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        {title}
      </h3>
      {action}
    </div>
  );
}

export function ChipRow({ chips, active, onPick }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 mb-4">
      {chips.map((c) => (
        <button
          key={c}
          onClick={() => onPick?.(c)}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
            active === c ? "bg-primary text-primary-foreground soft-shadow" : "bg-card text-muted-foreground border border-border/40"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function ItemCard({ icon: Icon, title, subtitle, tag, right, to, color = "primary", image }) {
  const c = COLOR[color] || COLOR.primary;
  const inner = (
    <div className="bg-card rounded-[16px] p-2.5 soft-shadow border border-border/40 flex items-center gap-2.5 card-hover">
      {image ? (
        <Image src={image} fittingType="fill" className="w-11 h-11 rounded-[12px] flex-shrink-0" />
      ) : (
        <div className={`w-9 h-9 rounded-[12px] ${c.bg} flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon className={`w-[18px] h-[18px] ${c.text}`} strokeWidth={2.1} />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground truncate">{title}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>}
        {tag && <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full ${c.bg} ${c.text} text-[9px] font-semibold`}>{tag}</span>}
      </div>
      {right && <span className="text-[11px] font-bold text-primary flex-shrink-0">{right}</span>}
    </div>
  );
  return to ? <Link to={to} className="block spring-tap">{inner}</Link> : inner;
}

export function EmptyHint({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-6">
      <div className="w-12 h-12 rounded-[18px] bg-primary/8 soft-shadow flex items-center justify-center mb-2.5">
        {Icon && <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />}
      </div>
      <p className="font-heading font-semibold text-[14px] text-foreground mb-1">{title}</p>
      {desc && <p className="text-[12px] text-muted-foreground max-w-[260px] leading-relaxed">{desc}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function PromptCard({ icon: Icon, title, desc, color = "primary" }) {
  const c = COLOR[color] || COLOR.primary;
  return (
    <div className="rounded-[16px] p-3 bg-primary/5 border border-primary/15 mx-5">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className={`w-[15px] h-[15px] ${c.text}`} />}
        <p className="font-heading font-semibold text-[12px] text-foreground">{title}</p>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}