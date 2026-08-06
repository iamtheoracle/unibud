import React from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import EntityModule from "@/components/management/EntityModule";
import { Btn } from "@/components/management/management-ui";
import { Megaphone, AlertTriangle } from "lucide-react";

export default function Communication({ institutionId }) {
  const { toast } = useToast();
  const emergency = async () => {
    const msg = prompt("Emergency alert message (broadcast to all institution users):");
    if (!msg) return;
    try {
      await base44.entities.Notification.create({ title: "Emergency Alert", message: msg, type: "emergency", priority: "critical", category: "emergency", user_id: null });
      toast({ title: "Emergency alert broadcast" });
    } catch { toast({ title: "Failed to send alert", variant: "destructive" }); }
  };
  return (
    <EntityModule
      entityName="StaffAnnouncement"
      title="Communication"
      description="Announcements, circulars, broadcast messages, internal messaging and emergency alerts."
      icon={Megaphone}
      institutionId={institutionId}
      extraActions={<Btn variant="danger" onClick={emergency}><AlertTriangle className="w-3.5 h-3.5" />Emergency Alert</Btn>}
    />
  );
}