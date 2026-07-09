import React from "react";
import { Monitor, PenTool } from "lucide-react";
import VideoTile from "./VideoTile";

const PARTICIPANTS = [
  { id: 1, name: "Dr. Sarah", role: "lecturer", speaking: true, micOn: true, cameraOn: true, color: "from-amber-400 to-amber-600", initials: "DS" },
  { id: 2, name: "Blessing", role: "student", speaking: false, handRaised: true, micOn: false, cameraOn: true, color: "from-blue-400 to-blue-600", initials: "BA" },
  { id: 3, name: "Michael", role: "student", speaking: false, micOn: false, cameraOn: false, color: "from-purple-400 to-purple-600", initials: "MO" },
  { id: 4, name: "Grace", role: "student", speaking: true, micOn: true, cameraOn: true, color: "from-green-400 to-green-600", initials: "GE" },
  { id: 5, name: "David", role: "student", speaking: false, micOn: false, cameraOn: false, color: "from-red-400 to-red-600", initials: "DK" },
  { id: 6, name: "Faith", role: "student", speaking: false, micOn: false, cameraOn: true, color: "from-pink-400 to-pink-600", initials: "FN" },
];

export default function LiveVideoStage({ view = "speaker", whiteboard = false, screenSharing = false }) {
  if (whiteboard) {
    return (
      <div className="w-full h-full rounded-2xl bg-card border border-border/30 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-muted/30">
          <PenTool className="w-4 h-4 text-primary" />
          <span className="text-[12px] font-semibold text-foreground">Whiteboard</span>
          <div className="flex gap-1.5 ml-auto">
            {["#0D0D0D", "#DAAF37", "#2563EB", "#16A34A", "#DC2626"].map(c => (
              <div key={c} className="w-5 h-5 rounded-full border-2 border-card cursor-pointer" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="flex-1 relative bg-white">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[13px] text-muted-foreground">Draw, sketch, and annotate in real-time</p>
          </div>
        </div>
      </div>
    );
  }

  if (screenSharing) {
    return (
      <div className="w-full h-full rounded-2xl bg-card border border-border/30 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-muted/30">
          <Monitor className="w-4 h-4 text-primary" />
          <span className="text-[12px] font-semibold text-foreground">Screen Share — Dr. Sarah Okonkwo</span>
        </div>
        <div className="flex-1 bg-foreground/5 flex items-center justify-center">
          <div className="text-center">
            <Monitor className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[12px] text-muted-foreground">Shared screen content</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === "gallery") {
    return (
      <div className="grid grid-cols-2 gap-2 h-full content-start">
        {PARTICIPANTS.map(p => <VideoTile key={p.id} participant={p} size="gallery" />)}
      </div>
    );
  }

  const main = PARTICIPANTS.find(p => p.speaking) || PARTICIPANTS[0];
  const others = PARTICIPANTS.filter(p => p.id !== main.id);

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex-1 min-h-0">
        <VideoTile participant={main} size="main" />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {others.map(p => <VideoTile key={p.id} participant={p} size="thumb" />)}
      </div>
    </div>
  );
}