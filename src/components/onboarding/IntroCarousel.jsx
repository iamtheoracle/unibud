import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Building2, BookOpen, Users, Sparkles, Compass,
  ArrowRight, ChevronLeft,
} from "lucide-react";
import UnibudMark from "@/components/brand/UnibudMark";
import { hapticImpact } from "@/lib/haptics";

const ease = [0.16, 1, 0.3, 1];

const SLIDES = [
  {
    icon: Globe,
    title: "A Global Education\nOperating System",
    subtitle: "One platform for every learner, every institution, every journey — worldwide.",
    accent: "text-primary",
    bg: "bg-primary/8",
  },
  {
    icon: Building2,
    title: "Campus Life,\nPerfectly Organized",
    subtitle: "Courses, timetable, assignments, results, library, and campus services — all in one place.",
    accent: "text-info",
    bg: "bg-info/8",
  },
  {
    icon: BookOpen,
    title: "Learn Smarter,\nNot Harder",
    subtitle: "Live classes, study groups, research tools, and a digital library built for academic excellence.",
    accent: "text-success",
    bg: "bg-success/8",
  },
  {
    icon: Users,
    title: "Connect, Collaborate,\nGrow Together",
    subtitle: "Quad, communities, clubs, study circles, and messaging that bring campus to life.",
    accent: "text-purple",
    bg: "bg-purple/8",
  },
  {
    icon: Sparkles,
    title: "Meet Bud,\nYour Trusted Companion",
    subtitle: "Bud guides you through every step — study help, planning, research, and wellbeing.",
    accent: "text-primary",
    bg: "bg-primary/8",
  },
  {
    icon: Compass,
    title: "Global Opportunities\nAwait You",
    subtitle: "Scholarships, internships, careers, and competitions — discovered and matched to you.",
    accent: "text-warning",
    bg: "bg-warning/8",
  },
];

export default function IntroCarousel({ onComplete }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const goNext = () => {
    hapticImpact();
    if (isLast) {
      onComplete?.();
      return;
    }
    setDirection(1);
    setIndex((i) => i + 1);
  };

  const goBack = () => {
    if (index === 0) return;
    hapticImpact();
    setDirection(-1);
    setIndex((i) => i - 1);
  };

  const Icon = slide.icon;

  return (
    <div className="flex-1 flex flex-col px-6 relative z-10">
      {/* Logo at top */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="flex items-center justify-center gap-2 pt-4"
        style={{ paddingTop: "max(env(safe-area-inset-top), 2rem)" }}
      >
        <span className="text-foreground">
          <UnibudMark className="w-6 h-6" />
        </span>
        <span className="font-heading font-extrabold text-[16px] text-foreground tracking-tight">UNIBUD</span>
      </motion.div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.5, ease }}
            className="flex flex-col items-center text-center max-w-[340px]"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
              className={`w-24 h-24 rounded-[28px] ${slide.bg} flex items-center justify-center mb-8`}
            >
              <Icon className={`w-11 h-11 ${slide.accent}`} strokeWidth={1.5} />
            </motion.div>

            {/* Title */}
            <h2 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground leading-[1.15] whitespace-pre-line">
              {slide.title}
            </h2>

            {/* Subtitle */}
            <p className="text-[14px] text-muted-foreground mt-3 leading-relaxed max-w-[300px]">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + Controls */}
      <div
        className="pb-2"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
      >
        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                hapticImpact();
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className="spring-tap"
              aria-label={`Go to slide ${i + 1}`}
            >
              <motion.div
                animate={{ width: i === index ? 24 : 6, opacity: i === index ? 1 : 0.3 }}
                transition={{ duration: 0.3, ease }}
                className="h-1.5 rounded-full bg-primary"
              />
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          {index > 0 && (
            <button
              onClick={goBack}
              className="w-12 h-12 rounded-full bg-card border border-border/40 flex items-center justify-center spring-tap flex-shrink-0"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={2} />
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goNext}
            className="flex-1 h-[52px] rounded-full bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap shadow-[0_6px_24px_hsl(var(--primary)/0.3)]"
          >
            {isLast ? "Get Started" : "Continue"}
            <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}