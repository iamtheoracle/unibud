import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useGpa } from "@/lib/academic/useAcademicData";

export default function GPACard() {
  const { data: gpa } = useGpa();

  if (!gpa) {
    return (
      <div className="flex items-center gap-2 py-2">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">GPA data will appear once grades are available.</p>
      </div>
    );
  }

  const pct = gpa.scale ? Math.min((gpa.current / gpa.scale) * 100, 100) : 0;

  return (
    <Link to="/academics/results" className="block spring-tap">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--foreground) / 0.08)" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--foreground))" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-[16px] font-bold text-foreground">{gpa.current?.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Current GPA</p>
          <p className="text-[13px] text-foreground mt-0.5">Out of {gpa.scale?.toFixed(1)}</p>
          {gpa.trend && (
            <p className={`text-[11px] mt-1 font-medium ${gpa.trend >= 0 ? "text-success" : "text-destructive"}`}>
              {gpa.trend >= 0 ? "↑" : "↓"} {Math.abs(gpa.trend).toFixed(2)} from last semester
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}