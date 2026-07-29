import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];
const LOGO_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/7de0fdf43_6C287179-9048-4978-AA9F-F2B45C76A69A.png";
const BG_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/73b30d148_generated_image.png";

/**
 * Splash — Screen 1.
 * Wordmark + tagline. The official logo and Bud visual will be added
 * here once provided.
 */
export default function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let active = true;
    const resolve = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        await wait(1600);
        if (!active) return;
        setLeaving(true);
        await wait(450);
        if (!active) return;
        navigate(authed ? "/academics" : "/welcome", { replace: true });
      } catch {
        await wait(1600);
        if (!active) return;
        navigate("/welcome", { replace: true });
      }
    };
    resolve();
    return () => { active = false; };
  }, [navigate]);

  return (
    <div className="fixed inset-0 w-full overflow-hidden flex flex-col items-center justify-center" style={{ backgroundColor: "#05080d" }}>
      {/* Campus sunset background */}
      <div className="absolute inset-0 z-0">
        <Image src={BG_URL} alt="" fittingType="fill" className="w-full h-full object-cover" />
      </div>
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(5,8,13,0.6) 0%, rgba(5,8,13,0.3) 50%, rgba(5,8,13,0.8) 100%)" }} />
      <SparkField count={24} />

      <motion.div
        animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 0.96 : 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative z-10 flex flex-col items-center px-8 text-center w-full max-w-[420px]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
          animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 0.96 : 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: EASE }}
          className="w-full crystal-bloom"
        >
          <Image src={LOGO_URL} alt="UNIBUD — The Future Starts Together." fittingType="fit" className="w-full h-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-9 flex items-center gap-1.5"
        >
          <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 safe-area-pb px-8 pb-8 z-10"
      >
        <CompanyFooter />
      </motion.div>
    </div>
  );
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));