import React from "react";
import EntityModule from "@/components/management/EntityModule";
import { LifeBuoy, UserPlus, ArrowUp, CheckCircle2 } from "lucide-react";

export default function SupportDesk({ institutionId, user }) {
  const me = user?.full_name;
  return (
    <EntityModule
      entityName="SupportTicket"
      title="Support Desk"
      description="Student and staff tickets, issue assignment, escalation, resolution tracking and satisfaction rating."
      icon={LifeBuoy}
      institutionId={institutionId}
      rowActions={[
        { label: "Assign to Me", icon: UserPlus, patch: { assigned_to: me }, audit: (r) => ({ action: "Assigned ticket", target: r.subject || r.id, target_type: "operator", description: `Assigned ${r.subject || r.id} to ${me}` }) },
        { label: "Start", icon: UserPlus, patch: { status: "in_progress" }, audit: (r) => ({ action: "Started ticket", target: r.subject || r.id, target_type: "operator" }) },
        { label: "Escalate", icon: ArrowUp, patch: { status: "escalated" }, audit: (r) => ({ action: "Escalated ticket", target: r.subject || r.id, target_type: "operator" }) },
        { label: "Resolve", icon: CheckCircle2, patch: { status: "resolved" }, audit: (r) => ({ action: "Resolved ticket", target: r.subject || r.id, target_type: "operator" }) },
      ]}
    />
  );
}