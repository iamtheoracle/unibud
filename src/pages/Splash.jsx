import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SparkField from "@/components/foundation/SparkField";
import CompanyFooter from "@/components/foundation/CompanyFooter";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];
const LOGO_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/7de0fdf43_6C287179-9048-4978-AA9F-F2B45C76A69A.png";

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
        await wait(2600);
        if (!active) return;
        setLeaving(true);
        await wait(450);
        if (!active) return;
        navigate(authed ? "/home" : "/welcome", { replace: true });
      } catch {
        await wait(2600);
        if (!active) return;
        navigate("/welcome", { replace: true });
      }
    };
    resolve();
    return () => { active = false; };
  }, [navigate]);

  return (
    <div className="fixed inset-0 w-full overflow-hidden flex flex-col items-center justify-center" style={{ backgroundColor: "#08122A" }}>
      <motion.div
        className="absolute top-[-20%] left-[8%] w-[70%] h-[50%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.16), transparent 70%)" }}
        animate={{ x: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-5%] w-[60%] h-[45%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)" }}
        animate={{ x: [0, -25, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <SparkField count={24} />

      <motion.div
        animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 0.96 : 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative z-10 flex flex-col items-center px-8 text-center w-full max-w-[420px]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 0.96 : 1 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="w-full"
        >
          <Image src={LOGO_URL} alt="UNIBUD — The Future Starts Together." fittingType="fit" className="w-full h-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-9 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: "0.4s" }} />
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