import React from "react";
import { motion } from "framer-motion";

/**
 * Cinematic welcome background.
 *
 * Renders the session's chosen campus photograph with:
 *  • A dark base colour so there is never a blank/white flash while loading.
 *  • A slow Ken Burns zoom (disabled under reduced-motion).
 *  • A layered cinematic gradient + vignette for excellent text readability.
 *  • A subtle film grain for a premium, tactile feel.
 *
 * `background` — { url, tone } from useWelcomeBackground
 * `loaded`     — whether the image has finished preloading
 * `reduceMotion` — disables the zoom animation
 */
const BASE_BG = "#0A0E0E";

export default function WelcomeBackground({ background, loaded, reduceMotion = false }) {
  const tone = background?.tone || "dark";

  // Overlay gradients tuned per tone for maximum text contrast.
  const overlay =
    tone === "light"
      ? "linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.20) 38%, rgba(255,255,255,0.35) 68%, rgba(255,255,255,0.78) 100%)"
      : "linear-gradient(to bottom, rgba(10,14,14,0.55) 0%, rgba(10,14,14,0.22) 38%, rgba(10,14,14,0.45) 70%, rgba(10,14,14,0.88) 100%)";

  const vignette =
    tone === "light"
      ? "radial-gradient(120% 80% at 50% 40%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.25) 100%)"
      : "radial-gradient(120% 80% at 50% 40%, rgba(10,14,14,0) 40%, rgba(10,14,14,0.35) 100%)";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base colour — never a white flash */}
      <div className="absolute inset-0" style={{ background: BASE_BG }} />

      {/* Photograph */}
      {background?.url && (
        <motion.img
          src={background.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.06 }}
          animate={{
            opacity: loaded ? 1 : 0,
            scale: reduceMotion ? 1 : loaded ? 1.12 : 1.06,
          }}
          transition={{
            opacity: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: reduceMotion ? 0 : 22, ease: "easeInOut", repeat: reduceMotion ? 0 : Infinity, repeatType: "reverse" },
          }}
          draggable={false}
        />
      )}

      {/* Cinematic gradient overlay for readability */}
      <div className="absolute inset-0" style={{ background: overlay }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: vignette }} />

      {/* Subtle film grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}