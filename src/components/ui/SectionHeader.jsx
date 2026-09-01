import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SectionHeader({ title, subtitle, action, actionLink, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
          </div>
        )}
        <div>
          <h3 className="font-heading font-semibold text-[15px] text-foreground">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && actionLink && (
        <Link to={actionLink} className="text-[12px] font-medium text-primary flex items-center gap-0.5 hover:opacity-80 transition-opacity">
          {action}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}