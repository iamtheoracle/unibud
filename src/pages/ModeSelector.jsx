import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, ArrowRight, Loader2, Check } from "lucide-react";
import BrandLogo from "@/components/foundation/BrandLogo";
import SparkField from "@/components/foundation/SparkField";
import { useExperience } from "@/lib/ExperienceContext";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ModeSelector — the first screen after authentication.
 * The student chooses Academic or Social before entering UNIBUD.
 * UNIBUD remains one app; this only sets the active content context.
 */
export default function ModeSelector() {
  const navigate = useNavigate();
  const { mode, setMode } = useExperience();
  const [picked, setPicked] = useState(mode || "academic");
  const [going, setGoing] = useState(false);

  useEffect(() => { setPicked(mode || "academic"); }, [mode]);

  const confirm = (m) => {
    setPicked(m);
    setMode(m);
    setGoing(true);
    setTimeout(() => navigate("/home", { replace: true }), 320);
  };

  const cards = [
    {
      id: "academic",
      title: "Academic",
      desc: "Courses, exams, grades, study tools and academic guidance from Bud.",
      icon: GraduationCap,
    },
    {
      id: "social",
      title: "Social",
      desc: "Campus life, friends, communities, stories and creator content.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <SparkField count={14} />
      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-6 safe-area-pt">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="pt-6"
        >
          <BrandLogo size="sm" />
        </motion.div>

        <div className="flex-1 flex flex-col justify-center py-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className="mb-2">
            <h2 className="font-heading font-bold text-[26px] tracking-tight">Choose your space</h2>
            <p className="text-[14px] text-muted-foreground mt-1.5">
              You can switch anytime. UNIBUD stays one app — only the content changes.
            </p>
          </motion.div>

          <div className="space-y-3 mt-5">
            {cards.map((c, i) => {
              const active = picked === c.id;
              return (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, ease: EASE }}
                  onClick={() => setPicked(c.id)}
                  className={`w-full text-left crystal-card radius-xl p-5 spring-tap relative overflow-hidden ${
                    active ? "ring-2 ring-primary ice-glow" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl grid place-items-center ${
                        active ? "bg-primary text-primary-foreground" : "glass-strong text-foreground"
                      }`}
                    >
                      <c.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-[18px]">{c.title}</h3>
                      <p className="text-[12.5px] text-muted-foreground mt-0.5">{c.desc}</p>
                    </div>
                    {active && (
                      <div className="w-6 h-6 rounded-full bg-primary grid place-items-center">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, ease: EASE }}
            onClick={() => confirm(picked)}
            disabled={going}
            className="mt-7 w-full h-[54px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2.5 spring-tap ice-glow disabled:opacity-60"
          >
            {going ? (
              <>
                <Loader2 className="w-[18px] h-[18px] animate-spin" /> Entering…
              </>
            ) : (
              <>
                Continue as {picked === "academic" ? "Academic" : "Social"}
                <ArrowRight className="w-[18px] h-[18px]" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}