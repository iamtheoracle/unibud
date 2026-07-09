import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Award } from "lucide-react";

export default function GPASummaryCard() {
  const gpa = 4.2;
  const maxGpa = 5.0;
  const progress = (gpa / maxGpa) * 100;

  return (
    <GlassCard variant="solid" className="p-4" delay={0.15}>
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke="url(#gpaGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 1.508} 150.8`}
            />
            <defs>
              <linearGradient id="gpaGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--unibud-blue))" />
                <stop offset="100%" stopColor="hsl(var(--unibud-purple))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading font-bold text-sm">{gpa}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Award className="w-3.5 h-3.5 text-primary" />
            <p className="font-heading font-semibold text-[13px]">Current GPA</p>
          </div>
          <p className="text-[11px] text-muted-foreground">Out of {maxGpa} · 2nd Class Upper</p>
          <div className="flex gap-3 mt-2">
            <div className="text-center">
              <p className="font-heading font-bold text-[13px] text-success">A</p>
              <p className="text-[9px] text-muted-foreground">Best</p>
            </div>
            <div className="text-center">
              <p className="font-heading font-bold text-[13px]">24</p>
              <p className="text-[9px] text-muted-foreground">Credits</p>
            </div>
            <div className="text-center">
              <p className="font-heading font-bold text-[13px]">6</p>
              <p className="text-[9px] text-muted-foreground">Courses</p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}