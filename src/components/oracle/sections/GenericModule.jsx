import React from "react";
import { Boxes } from "lucide-react";

export default function GenericModule({ module }) {
  const Icon = module.icon;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/15 grid place-items-center"><Icon className="w-5 h-5 text-primary" /></div>
        <div><h1 className="text-[20px] font-heading font-bold">{module.label}</h1><p className="text-[13px] text-muted-foreground">{module.desc}</p></div>
      </div>
      <div className="glass-card radius-lg p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted/50 grid place-items-center mx-auto mb-3"><Boxes className="w-7 h-7 text-muted-foreground" /></div>
        <p className="font-heading font-semibold text-[15px]">{module.label} is coming online</p>
        <p className="text-[13px] text-muted-foreground mt-1 max-w-[420px] mx-auto">This module is part of Oracle's operating center. Controls, analytics, and workflows for {module.label.toLowerCase()} will be configured here.</p>
      </div>
    </div>
  );
}