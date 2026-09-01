import React from "react";

const statusStyles = {
  pending: "bg-warning/10 text-warning border-warning/20",
  submitted: "bg-info/10 text-info border-info/20",
  graded: "bg-success/10 text-success border-success/20",
  late: "bg-destructive/10 text-destructive border-destructive/20",
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground border-border",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-info/10 text-info border-info/20",
  new: "bg-purple/10 text-purple border-purple/20",
  sold: "bg-muted text-muted-foreground border-border",
  reserved: "bg-warning/10 text-warning border-warning/20",
};

export default function StatusBadge({ status, className = "" }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyles[status] || "bg-muted text-muted-foreground border-border"} ${className}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}