import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import MeetBudOrb from "@/components/bud/MeetBudOrb";

const EASE = [0.16, 1, 0.3, 1];

const KEY_POINTS = [
  {
    title: "Qubits",
    body: "can be 0, 1, or both at the same time – that's called superposition. Imagine spinning a coin; while it's spinning, it's neither heads nor tails.",
  },
  {
    title: "Entanglement",
    body: "links qubits so that changing one instantly affects the other, no matter the distance. It's like having two magic dice that always show the same number.",
  },
  {
    title: "Quantum speedup",
    body: "means certain problems that would take years on a classical computer could be solved in minutes. This could revolutionize medicine, cryptography, and AI.",
  },
];

export default function Recast() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="relative z-10 w-full max-w-[520px] mx-auto px-5 pt-6 pb-28 safe-area-pt">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate("/home")}
            className="w-9 h-9 rounded-full grid place-items-center glass border border-border text-foreground spring-tap"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <h2 className="font-heading font-semibold text-[17px] text-foreground">Recast by Bud</h2>
          <span className="w-9" />
        </div>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="crystal-card p-6"
        >
          {/* Source line */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="scale-50 -my-2 -mx-1">
              <MeetBudOrb />
            </div>
            <span className="text-primary font-medium text-[13px]">Bud recast this from quantamagazine.org</span>
          </div>

          <h2 className="font-heading font-semibold text-[22px] text-foreground mb-3 leading-tight">
            Quantum Computing for Beginners
          </h2>

          {/* Bud's take */}
          <div
            className="rounded-r-lg pl-4 pr-4 py-3 mb-6 text-[14px] text-muted-foreground leading-relaxed"
            style={{ background: "hsl(var(--primary) / 0.10)", borderLeft: "3px solid hsl(var(--primary))" }}
          >
            <strong className="text-foreground">Bud's take:</strong> Quantum computers are like super-smart calculators
            that can explore many answers at once, unlike regular computers that work step by step.
          </div>

          {/* Key points */}
          <div className="space-y-3 mb-6">
            {KEY_POINTS.map((p) => (
              <div key={p.title} className="flex items-start gap-2 text-[14px] text-muted-foreground leading-relaxed">
                <span className="text-primary font-bold flex-shrink-0">•</span>
                <span>
                  <strong className="text-foreground">{p.title}</strong> {p.body}
                </span>
              </div>
            ))}
          </div>

          {/* Media placeholder */}
          <div
            className="rounded-2xl p-5 text-center mb-2"
            style={{
              background: "linear-gradient(135deg, hsl(var(--surface-elevated)), hsl(var(--surface-secondary)))",
              border: "1px dashed hsl(var(--border))",
            }}
          >
            <p className="text-[14px] text-muted-foreground">
              🎬 <strong className="text-foreground">Generated Video: Quantum Coin Flip</strong>
            </p>
            <p className="text-[12px] text-muted-foreground/70 mt-1">
              (Bud would create a short animation here based on your interests – e.g., Spider-Man flipping a quantum coin.)
            </p>
            <div className="mt-3 w-12 h-12 rounded-full bg-primary/80 grid place-items-center mx-auto spring-tap">
              <Play className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            </div>
          </div>

          <p className="text-[13px] text-muted-foreground/70 mt-5">
            Recast from original source:{" "}
            <span className="text-primary">quantamagazine.org/quantum-computing-for-beginners</span>
          </p>
        </motion.article>

        <p className="text-[14px] text-muted-foreground mt-5 leading-relaxed">
          Want to recast a different link? Just paste it into a conversation with Bud and say "Recast this".
        </p>
      </div>
    </div>
  );
}