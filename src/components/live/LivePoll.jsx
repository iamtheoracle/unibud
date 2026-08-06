import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, X, Clock } from "lucide-react";

export default function LivePoll({ poll, onClose }) {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);

  const handleVote = () => { if (selected !== null) setVoted(true); };

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute inset-0 z-50 bg-card flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
        <BarChart3 className="w-5 h-5 text-primary" />
        <p className="font-heading font-bold text-[14px] text-foreground flex-1">Live Poll</p>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="font-heading font-bold text-[15px] text-foreground mb-4">{poll.question}</p>
        <div className="space-y-2.5">
          {poll.options.map((opt, i) => {
            const pct = voted ? Math.round((opt.votes / poll.options.reduce((s, o) => s + o.votes, 0)) * 100) : 0;
            return (
              <button key={i} onClick={() => !voted && setSelected(i)} disabled={voted} className={`w-full p-3.5 rounded-2xl border text-left relative overflow-hidden transition-all ${selected === i ? "border-primary bg-primary/5" : "border-border/50 bg-muted/30"} ${voted ? "cursor-default" : ""}`}>
                {voted && <div className="absolute inset-0 bg-primary/8" style={{ width: `${pct}%` }} />}
                <div className="relative flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground">{opt.text}</span>
                  {voted ? <span className="text-[12px] font-bold text-primary">{pct}%</span> : selected === i ? <CheckCircle2 className="w-4 h-4 text-primary" /> : null}
                </div>
              </button>
            );
          })}
        </div>
        {!voted && <button onClick={handleVote} disabled={selected === null} className="mt-4 w-full h-[44px] rounded-2xl bg-primary text-primary-foreground font-semibold text-[13px] disabled:opacity-40">Submit Vote</button>}
        {voted && <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Poll closes in 2 minutes</p>}
      </div>
    </motion.div>
  );
}