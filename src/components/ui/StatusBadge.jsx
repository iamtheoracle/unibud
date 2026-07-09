import React from "react";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  graded: "bg-emerald-50 text-emerald-700 border-emerald-200",
  late: "bg-red-50 text-red-700 border-red-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
  new: "bg-purple-50 text-purple-700 border-purple-200",
  sold: "bg-slate-100 text-slate-500 border-slate-200",
  reserved: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function StatusBadge({ status, className = "" }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[status] || "bg-muted text-muted-foreground border-border"} ${className}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}