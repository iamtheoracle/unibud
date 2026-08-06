import React from "react";
import { Settings2 } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function NewsSubcategoryBar({ active, onSelect, visibleSubcategories, onManage }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      <button
        onClick={() => onSelect("all")}
        className={"px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap transition-all " + (active === "all" ? "bg-foreground text-background" : "glass text-muted-foreground")}
      >
        All
      </button>
      {visibleSubcategories.map((sub) => (
        <button
          key={sub.id}
          onClick={() => onSelect(sub.id)}
          className={"px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap transition-all " + (active === sub.id ? "bg-foreground text-background" : "glass text-muted-foreground")}
        >
          {sub.label}
        </button>
      ))}
      <button
        onClick={onManage}
        className="flex items-center justify-center w-8 h-8 rounded-full glass text-muted-foreground spring-tap shrink-0"
        aria-label="Manage categories"
      >
        <Settings2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}