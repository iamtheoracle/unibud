import React from "react";
import { ShieldCheck, RefreshCw, Globe, User, MessageSquare } from "lucide-react";
import { getDataSource } from "@/lib/institutionConfig";

const ICONS = {
  verified_institution: ShieldCheck,
  official_sync: RefreshCw,
  public_info: Globe,
  student_contributions: User,
  community_reports: MessageSquare,
};

export default function DataSourceLabel({ source, className = "" }) {
  const config = getDataSource(source);
  if (!config) return null;
  const Icon = ICONS[source] || Globe;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] text-muted-foreground ${className}`}>
      <Icon className="w-3 h-3" strokeWidth={1.8} />
      {config.label}
    </span>
  );
}