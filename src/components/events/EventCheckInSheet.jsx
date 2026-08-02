import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { X, QrCode, CheckCircle2, Circle, Users, Download } from "lucide-react";

export default function EventCheckInSheet({ event, user, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: freshEvent } = useQuery({
    queryKey: ["eventForCheckIn", event.id],
    queryFn: () => base44.entities.CampusEvent.get(event.id),
  });

  const current = freshEvent || event;
  const rsvpList = current.rsvp_list || [];
  const checkedIn = current.checked_in || [];
  const checkinRate = rsvpList.length > 0 ? Math.round((checkedIn.length / rsvpList.length) * 100) : 0;

  const checkinUrl = `${window.location.origin}/events?checkin=${event.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=10&color=74-44-29&bgcolor=255-255-255&data=${encodeURIComponent(checkinUrl)}`;

  const toggleCheckIn = async (userId) => {
    const ischeckedIn = checkedIn.includes(userId);
    const next = ischeckedIn ? checkedIn.filter((id) => id !== userId) : [...checkedIn, userId];
    try {
      await base44.entities.CampusEvent.update(event.id, { checked_in: next });
      qc.invalidateQueries({ queryKey: ["eventForCheckIn", event.id] });
      qc.invalidateQueries({ queryKey: ["campusEvents"] });
    } catch {
      toast({ title: "Couldn't update", variant: "destructive" });
    }
  };

  const downloadQR = async () => {
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `checkin-${event.title.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch {
      window.open(qrUrl, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 360, damping: 36 }}
      className="fixed inset-0 z-[2000] flex items-end"
    >
      <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: "blur(6px)" }} onClick={onClose} />
      <div className="relative w-full max-w-[520px] mx-auto rounded-t-[28px] p-5 pb-8 glass-strong no-scrollbar" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-4 bg-border" />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center spring-tap">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-primary" />
          <h2 className="text-[17px] font-bold text-foreground">Check-in Management</h2>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-5">
          <div className="p-3 rounded-[22px] bg-white ice-glow">
            <img src={qrUrl} alt="Event check-in QR" width={220} height={220} className="rounded-[14px] block" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center max-w-[260px]">
            Display this QR code at the entrance. Students scan it to check in automatically.
          </p>
          <button onClick={downloadQR} className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded-[10px] glass-card text-[11px] font-semibold text-foreground spring-tap">
            <Download className="w-3 h-3" /> Download QR
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="glass-card p-2.5 text-center">
            <p className="text-[16px] font-bold text-foreground tabular-nums">{checkedIn.length}</p>
            <p className="text-[8px] text-muted-foreground uppercase">Checked In</p>
          </div>
          <div className="glass-card p-2.5 text-center">
            <p className="text-[16px] font-bold text-foreground tabular-nums">{rsvpList.length}</p>
            <p className="text-[8px] text-muted-foreground uppercase">RSVP'd</p>
          </div>
          <div className="glass-card p-2.5 text-center">
            <p className="text-[16px] font-bold text-primary tabular-nums">{checkinRate}%</p>
            <p className="text-[8px] text-muted-foreground uppercase">Rate</p>
          </div>
        </div>

        {/* Attendee list */}
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
          <Users className="w-3 h-3" /> Attendees
        </p>
        {rsvpList.length === 0 ? (
          <p className="text-[11px] text-muted-foreground text-center py-4">No one has RSVP'd yet.</p>
        ) : (
          <div className="space-y-1.5">
            {rsvpList.map((rsvp) => {
              const isCheckedIn = checkedIn.includes(rsvp.user_id);
              return (
                <div key={rsvp.user_id} className="glass-card p-2.5 rounded-[12px] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">{(rsvp.name || "?").charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{rsvp.name}</p>
                    <p className="text-[9px] text-muted-foreground capitalize">{rsvp.status}</p>
                  </div>
                  <button onClick={() => toggleCheckIn(rsvp.user_id)} className="spring-tap">
                    {isCheckedIn ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}