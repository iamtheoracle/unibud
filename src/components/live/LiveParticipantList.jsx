import React from "react";
import { motion } from "framer-motion";
import { Users, X, Mic, MicOff, Hand, Crown, Volume2 } from "lucide-react";

const PARTICIPANTS = [
  { id: 1, name: "Dr. Sarah Okonkwo", role: "lecturer", micOn: true, handRaised: false, speaking: true },
  { id: 2, name: "Blessing Adebayo", role: "student", micOn: false, handRaised: true, speaking: false },
  { id: 3, name: "Michael Okafor", role: "student", micOn: false, handRaised: false, speaking: false },
  { id: 4, name: "Grace Eze", role: "student", micOn: true, handRaised: false, speaking: true },
  { id: 5, name: "David Kim", role: "student", micOn: false, handRaised: false, speaking: false },
  { id: 6, name: "Faith Nwosu", role: "student", micOn: false, handRaised: false, speaking: false },
];

export default function LiveParticipantList({ onClose }) {
  const lecturer = PARTICIPANTS.filter(p => p.role === "lecturer");
  const students = PARTICIPANTS.filter(p => p.role === "student");
  const handsRaised = students.filter(p => p.handRaised).length;

  const renderItem = (p) => (
    <div key={p.id} className="flex items-center gap-3 py-2.5">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold ${p.role === "lecturer" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
        {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{p.name}</p>
        {p.role === "lecturer" && <p className="text-[10px] text-primary font-medium">Lecturer</p>}
      </div>
      {p.speaking && <Volume2 className="w-4 h-4 text-primary flex-shrink-0" />}
      {p.handRaised && <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><Hand className="w-3 h-3 text-primary" /></div>}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${p.micOn ? "bg-primary/10" : "bg-muted"}`}>
        {p.micOn ? <Mic className="w-3.5 h-3.5 text-primary" /> : <MicOff className="w-3.5 h-3.5 text-muted-foreground" />}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute inset-0 z-50 bg-card flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
        <Users className="w-5 h-5 text-primary" />
        <p className="font-heading font-bold text-[14px] text-foreground flex-1">Participants ({PARTICIPANTS.length})</p>
        {handsRaised > 0 && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{handsRaised} ✋</span>}
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mt-2 mb-1 flex items-center gap-1"><Crown className="w-3 h-3" /> Lecturer</p>
        {lecturer.map(renderItem)}
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mt-4 mb-1">Students ({students.length})</p>
        {students.map(renderItem)}
      </div>
    </motion.div>
  );
}