import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

const HERO_IMAGE =
  "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/134aac576_generated_image.png";

/**
 * HeroSection6 — dark split hero adapted to UNIBUD's Midnight design system.
 * Left column: headline pinned top, body + CTA bottom. Right column: blue-toned
 * campus photo. Near-black background with a soft blue radial glow.
 * Static — no entrance animation; only hover feedback on the CTA.
 */
export default function HeroSection6() {
  return (
    <section
      aria-label="UNIBUD hero"
      className="relative w-full overflow-hidden bg-background text-foreground"
      style={{
        backgroundImage:
          "radial-gradient(86% 114% at 26% 42%, hsl(var(--information) / 0.32) 0%, hsl(var(--information) / 0.14) 34%, transparent 68%)",
      }}
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-7 px-5 py-10 sm:px-8 sm:py-12 md:grid md:items-stretch md:gap-0 md:px-[3.44cqw] md:py-[3.6cqw]"
          style={{ gridTemplateColumns: "1fr 47.03%", columnGap: "3.6cqw" }}
        >
          {/* ── Left: copy ── */}
          <div className="flex min-w-0 flex-col gap-7 md:justify-between md:gap-0">
            <h1 className="m-0 font-display font-bold leading-[0.95] tracking-tight text-foreground"
              style={{ fontSize: "clamp(2.25rem, 8.05cqw, 103px)" }}
            >
              Your Campus, Reimagined
            </h1>

            <div className="flex flex-col items-start gap-5 md:gap-4">
              <p className="m-0 max-w-[40ch] font-body text-[15px] leading-[1.55] text-muted-foreground sm:text-[16.7px] md:max-w-[30.6cqw]">
                UNIBUD is the intelligent operating system for university life —
                bringing your academic journey, social world, and professional
                growth into one seamless, premium experience.
              </p>

              <motion.a
                href="/home"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 rounded-full border border-foreground/55 bg-transparent px-8 py-[15px] font-body text-[13px] font-medium uppercase tracking-[0.14em] text-foreground no-underline transition-colors duration-300 hover:bg-foreground/8 hover:border-foreground"
              >
                Explore UNIBUD
                <ArrowRight
                  className="h-[22px] w-[22px] flex-none transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={1.5}
                />
              </motion.a>
            </div>
          </div>

          {/* ── Right: photo ── */}
          <figure
            className={cn(
              "relative w-full overflow-hidden rounded-2xl bg-secondary",
              "aspect-[4/3] md:aspect-[602/628] md:h-auto",
              "md:w-[calc(100%-38px)]"
            )}
          >
            <Image
              src={HERO_IMAGE}
              alt="Students walking past a modern university glass building at dusk."
              fittingType="fill"
              className="h-full w-full"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}